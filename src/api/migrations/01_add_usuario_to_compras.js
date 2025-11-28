import db from "../config/db.js";

export const migrar = async () => {
  console.log("🔄 Ejecutando migraciones...");

  // Migración 1: compras
  try {
    await db.query(`
      ALTER TABLE compras 
      ADD COLUMN usuario_id INT NULL,
      ADD CONSTRAINT fk_compras_usuario
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
      ON DELETE CASCADE
    `);

    console.log("✅ Columna usuario_id agregada a compras");
  } catch (err) {
    if (
      err.code === "ER_DUP_FIELDNAME" ||
      err.code === "ER_CANT_CREATE_TABLE" ||
      err.code === "ER_DUP_KEYNAME"
    ) {
      console.log("ℹ️ La columna o llave ya existe en compras");
    } else {
      console.error("❌ Error en migración (compras):", err.message);
    }
  }

  // Migración 2: detalle_compra
  try {
    await db.query(`
      ALTER TABLE detalle_compra 
      ADD COLUMN usuario_id INT NULL,
      ADD CONSTRAINT fk_detalle_usuario
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
      ON DELETE CASCADE
    `);

    console.log("✅ Columna usuario_id agregada a detalle_compra");
  } catch (err) {
    if (
      err.code === "ER_DUP_FIELDNAME" ||
      err.code === "ER_CANT_CREATE_TABLE" ||
      err.code === "ER_DUP_KEYNAME"
    ) {
      console.log("ℹ️ La columna o llave ya existe en detalle_compra");
    } else {
      console.error("❌ Error en migración (detalle_compra):", err.message);
    }
  }
};
