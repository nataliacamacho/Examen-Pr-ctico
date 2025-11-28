import db from '../config/db.js';

export const getProductosAdmin = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.*, v.estado AS vigencia FROM productos p
       LEFT JOIN vigencia v ON p.vigencia_id = v.id
       ORDER BY p.id DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener productos admin:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getProductoById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT p.*, v.estado AS vigencia FROM productos p
       LEFT JOIN vigencia v ON p.vigencia_id = v.id
       WHERE p.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({ error: error.message });
  }
};

export const agregarProducto = async (req, res) => {
  const { nombre, descripcion, precio, imagen, stock } = req.body;
  try {
    if (!nombre || precio <= 0) {
      return res.status(400).json({ error: 'Nombre y precio son requeridos' });
    }

    const [result] = await db.query(
      `INSERT INTO productos (nombre, descripcion, precio, imagen, stock, vigencia_id) VALUES (?, ?, ?, ?, ?, 1)`,
      [nombre, descripcion || '', precio, imagen || null, stock || 0]
    );
    res.status(201).json({ id: result.insertId, message: 'Producto creado exitosamente' });
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ error: error.message });
  }
};

export const modificarProducto = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, precio, imagen, stock, estado } = req.body;
  
  try {
    if (!nombre || precio <= 0) {
      return res.status(400).json({ error: 'Nombre y precio son requeridos' });
    }

    let vigencia_id = null;
    if (estado) {
      try {
        const [rows] = await db.query(
          `SELECT id FROM vigencia WHERE estado = ? LIMIT 1`,
          [estado]
        );
        if (rows.length > 0) {
          vigencia_id = rows[0].id;
        }
      } catch (err) {
        console.error('Error buscando vigencia:', err);
      }
    }

    const updates = [];
    const values = [];

    updates.push('nombre = ?');
    values.push(nombre);

    updates.push('descripcion = ?');
    values.push(descripcion || '');

    updates.push('precio = ?');
    values.push(precio);

    updates.push('imagen = ?');
    values.push(imagen || null);

    updates.push('stock = ?');
    values.push(stock || 0);

    if (vigencia_id !== null) {
      updates.push('vigencia_id = ?');
      values.push(vigencia_id);
    }

    values.push(id);

    const query = `UPDATE productos SET ${updates.join(', ')} WHERE id = ?`;
    const [result] = await db.query(query, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const [updated] = await db.query(
      `SELECT p.*, v.estado AS vigencia FROM productos p
       LEFT JOIN vigencia v ON p.vigencia_id = v.id
       WHERE p.id = ?`,
      [id]
    );

    res.json({ 
      producto: updated[0], 
      message: 'Producto actualizado exitosamente' 
    });
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ error: error.message });
  }
};

export const eliminarProducto = async (req, res) => {
  const { id } = req.params;
  const idNum = Number(id);
  console.log('[adminController] eliminarProducto called with id=', id, 'parsed=', idNum);
  if (!idNum || isNaN(idNum)) {
    return res.status(400).json({ error: 'ID de producto inválido' });
  }
  try {
    const [[vigencia]] = await db.query(`SELECT id FROM vigencia WHERE estado IN ('inactivo','no activo') LIMIT 1`);
    let noActivoId = vigencia ? vigencia.id : null;

    if (!noActivoId) {
      const [[byId]] = await db.query(`SELECT id FROM vigencia WHERE id = 2 LIMIT 1`);
      noActivoId = byId ? byId.id : null;
    }

    if (!noActivoId) {
      return res.status(500).json({ error: 'Estado inactivo no encontrado en la tabla vigencia' });
    }

    const [rows] = await db.query(`SELECT id, vigencia_id FROM productos WHERE id = ? LIMIT 1`, [idNum]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const producto = rows[0];
    if (Number(producto.vigencia_id) === Number(noActivoId)) {
      console.log('[adminController] producto ya inactivo id=', idNum);
      return res.json({ message: 'Producto ya estaba marcado como inactivo' });
    }

    const [result] = await db.query(
      `UPDATE productos SET vigencia_id = ? WHERE id = ?`,
      [noActivoId, idNum]
    );

    console.log('[adminController] update result:', result);

    if (result.affectedRows === 0) {
      return res.json({ message: 'Producto marcado como inactivo (sin cambios detectados)' });
    }

    res.json({ message: 'Producto eliminado exitosamente (marcado como inactivo)' });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ error: error.message });
  }
};
