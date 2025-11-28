import db from "../config/db.js";
import crypto from "crypto";
import bcrypt from 'bcrypt';
import { transporter } from "../config/transporter.js";

export const registrar = async (req, res) => {
  const { nombre, correo, password, pregunta, respuesta } = req.body;

  try {
    const [existe] = await db.query("SELECT id FROM usuarios WHERE correo = ?", [correo]);
    if (existe.length > 0) {
      return res.status(400).json({ message: "El correo ya está registrado" });
    }

    const hashed = await bcrypt.hash(password, 10);
    try {
      const [cols] = await db.query(
        "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'usuarios' AND COLUMN_NAME IN ('pregunta_seguridad','respuesta_seguridad')"
      );
      const existing = (cols || []).map(r => r.COLUMN_NAME);
      if (!existing.includes('pregunta_seguridad')) {
        await db.query("ALTER TABLE usuarios ADD COLUMN pregunta_seguridad VARCHAR(255) NULL");
        console.log('Se creó columna pregunta_seguridad');
      }
      if (!existing.includes('respuesta_seguridad')) {
        await db.query("ALTER TABLE usuarios ADD COLUMN respuesta_seguridad VARCHAR(255) NULL");
        console.log('Se creó columna respuesta_seguridad');
      }
    } catch (e) {
      console.warn('No se pudo asegurar las columnas de seguridad mediante INFORMATION_SCHEMA (continuando):', e?.message || e);
    }

    let hashedRespuesta = null;
    if (respuesta) {
      hashedRespuesta = await bcrypt.hash(String(respuesta), 10);
    }

    await db.query(
      "INSERT INTO usuarios (nombre, correo, password, fecha_registro, rol, pregunta_seguridad, respuesta_seguridad) VALUES (?, ?, ?, NOW(), 'cliente', ?, ?)",
      [nombre, correo, hashed, pregunta || null, hashedRespuesta]
    );

    res.json({ message: "Registro exitoso" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en servidor" });
  }
};

export const login = async (req, res) => {
  const { correo, password } = req.body;

  try {
    const [rows] = await db.query(
      "SELECT id, nombre, rol, correo, password FROM usuarios WHERE correo = ?",
      [correo]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Credenciales incorrectas" });
    }

    const usuarioDB = rows[0];
    const stored = usuarioDB.password || '';
    let passwordMatch = false;

    if (stored.startsWith('$2')) {
      passwordMatch = await bcrypt.compare(password, stored);
    } else {
      if (password === stored) {
        passwordMatch = true;
        const rehash = await bcrypt.hash(password, 10);
        try {
          await db.query('UPDATE usuarios SET password = ? WHERE id = ?', [rehash, usuarioDB.id]);
        } catch (e) {
          console.error('Error re-hashing legacy password:', e);
        }
      }
    }

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    const usuarioRet = {
      id: usuarioDB.id,
      nombre: usuarioDB.nombre,
      rol: usuarioDB.rol,
      correo: usuarioDB.correo
    };

    res.json({ message: 'Inicio exitoso', usuario: usuarioRet });
  } catch (error) {
    res.status(500).json({ message: "Error en servidor" });
  }
};

export const recuperarPassword = async (req, res) => {
  const { correo } = req.body;

  try {
    const [existe] = await db.query(
      "SELECT id FROM usuarios WHERE correo = ?",
      [correo]
    );

    if (existe.length === 0) {
      return res.status(404).json({ message: "Correo no encontrado" });
    }

    const token = crypto.randomBytes(16).toString("hex");

    await db.query(
      "UPDATE usuarios SET token_recuperacion = ? WHERE correo = ?",
      [token, correo]
    );

    res.json({
      message: "Se generó un token de recuperación",
      token
    });
  } catch (error) {
    res.status(500).json({ message: "Error en servidor" });
  }
};

export const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  try {
    const [usuario] = await db.query(
      "SELECT id FROM usuarios WHERE token_recuperacion = ?",
      [token]
    );

    if (usuario.length === 0) {
      return res.status(400).json({ message: "Token inválido o expirado" });
    }

    const hashed = await bcrypt.hash(password, 10);
    await db.query(
      "UPDATE usuarios SET password = ?, token_recuperacion = NULL WHERE token_recuperacion = ?",
      [hashed, token]
    );

    res.json({ message: "Contraseña actualizada correctamente" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en servidor" });
  }
};

export const actualizarPerfil = async (req, res) => {
  const { id, nombre, correo, domicilio } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'ID requerido' });
  }

  try {
    const campos = [];
    const valores = [];
    
    if (nombre) { campos.push('nombre = ?'); valores.push(nombre); }
    if (correo) { campos.push('correo = ?'); valores.push(correo); }
    if (domicilio) { campos.push('domicilio = ?'); valores.push(domicilio); }

    if (campos.length === 0) {
      return res.status(400).json({ message: 'No hay campos' });
    }

    valores.push(id);
    const sql = `UPDATE usuarios SET ${campos.join(', ')} WHERE id = ?`;
    try {
      await db.query(sql, valores);
    } catch (e) {
      if (e && (e.code === 'ER_BAD_FIELD_ERROR' || e.errno === 1054)) {
        try {
          console.warn('Columna faltante detectada al actualizar perfil, intentando crear columna `domicilio`');
          await db.query('ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS domicilio VARCHAR(255) NULL');
          await db.query(sql, valores);
        } catch (inner) {
          console.error('Error al crear columna domicilio o reintentar UPDATE:', inner);
          throw inner;
        }
      } else {
        throw e;
      }
    }

    const [usuarioActualizado] = await db.query(
      'SELECT id, nombre, rol, correo, domicilio FROM usuarios WHERE id = ?',
      [id]
    );

    res.json({ usuario: usuarioActualizado[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en servidor' });
  }
};

export const obtenerPerfil = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: 'ID de usuario requerido' });
  }
  try {
    try {
      const [rows] = await db.query('SELECT id, nombre, rol, correo, domicilio FROM usuarios WHERE id = ?', [id]);
      if (rows.length === 0) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      return res.json({ usuario: rows[0] });
    } catch (inner) {
      if (inner && (inner.code === 'ER_BAD_FIELD_ERROR' || inner.errno === 1054)) {
        const [rows2] = await db.query('SELECT id, nombre, rol, correo FROM usuarios WHERE id = ?', [id]);
        if (rows2.length === 0) {
          return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        return res.json({ usuario: rows2[0] });
      }
      throw inner;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en servidor' });
  }
};

export const verifyIdentity = async (req, res) => {
  const { correo } = req.body;
  if (!correo) {
    return res.status(400).json({ message: 'Correo requerido' });
  }
  try {
    console.log('[verifyIdentity] request received for correo:', correo);
    try {
      const [rows] = await db.query('SELECT id, nombre, pregunta_seguridad FROM usuarios WHERE correo = ?', [correo]);
      if (rows.length === 0) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      const payload = { id: rows[0].id, nombre: rows[0].nombre, pregunta: rows[0].pregunta_seguridad || null };
      console.log('[verifyIdentity] responding with:', payload);
      return res.json(payload);
    } catch (e) {
      console.warn('[verifyIdentity] primary query failed, trying fallback without pregunta_seguridad:', e?.message || e);
      if (e && (e.code === 'ER_BAD_FIELD_ERROR' || e.errno === 1054)) {
        try {
          const [rows2] = await db.query('SELECT id, nombre FROM usuarios WHERE correo = ?', [correo]);
          if (rows2.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
          }
          const payload2 = { id: rows2[0].id, nombre: rows2[0].nombre, pregunta: null };
          console.log('[verifyIdentity] responding with fallback:', payload2);
          return res.json(payload2);
        } catch (inner) {
          console.error('[verifyIdentity] fallback query error', inner);
          return res.status(500).json({ message: 'Error en servidor' });
        }
      }
      console.error('[verifyIdentity] unexpected error', e);
      return res.status(500).json({ message: 'Error en servidor' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en servidor' });
  }
};

export const resetPasswordDirect = async (req, res) => {
  const { correo, nombre, password, pregunta, respuesta } = req.body;
  if (!correo || !password) {
    return res.status(400).json({ message: 'Correo y nueva contraseña requeridos' });
  }
  try {
    const [rows] = await db.query('SELECT id, nombre, pregunta_seguridad, respuesta_seguridad FROM usuarios WHERE correo = ?', [correo]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const usuario = rows[0];

    let verified = false;
    if (pregunta && respuesta) {
      const storedPregunta = usuario.pregunta_seguridad || '';
      const storedRespuestaHash = usuario.respuesta_seguridad || null;
      if (!storedRespuestaHash) {
        return res.status(400).json({ message: 'No hay pregunta de seguridad registrada para este usuario' });
      }
      if (String(storedPregunta).toLowerCase() === String(pregunta).toLowerCase()) {
        const match = await bcrypt.compare(String(respuesta), storedRespuestaHash);
        if (match) {
          verified = true;
          console.log('[resetPasswordDirect] pregunta+respuesta verification succeeded for:', correo);
        } else {
          console.warn('[resetPasswordDirect] respuesta does not match hash for:', correo);
        }
      } else {
        console.warn('[resetPasswordDirect] pregunta mismatch: submitted "' + pregunta + '" does not match stored "' + storedPregunta + '" for:', correo);
      }
    }

    if (!verified) {
      if (!nombre) {
        console.warn('[resetPasswordDirect] verificación fallida: no hay pregunta/respuesta y no se proporcionó nombre');
        return res.status(400).json({ message: 'Proporciona nombre o pregunta+respuesta para verificar identidad' });
      }
      if (String(usuario.nombre).toLowerCase() === String(nombre).toLowerCase()) {
        verified = true;
      }
    }

    if (!verified) {
      console.warn('[resetPasswordDirect] verificación de identidad fallida para correo:', correo);
      return res.status(400).json({ message: 'Verificación de identidad fallida' });
    }

    const hashed = await bcrypt.hash(password, 10);
    await db.query('UPDATE usuarios SET password = ? WHERE correo = ?', [hashed, correo]);
    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en servidor' });
  }
};

