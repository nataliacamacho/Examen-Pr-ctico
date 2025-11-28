import db from "../config/db.js";

export const migrar = async () => {
  try {
    await db.query(`
      ALTER TABLE compras 
      ADD COLUMN usuario_id INT,
      ADD FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
    `);
    console.log("✅ Columna usuario_id agregada a compras");
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log("ℹ️ Columna usuario_id ya existe en compras");
    } else {
      console.error("❌ Error en migración:", err.message);
    }
  }

  try {
    await db.query(`
      ALTER TABLE detalle_compra 
      ADD COLUMN usuario_id INT,
      ADD FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
    `);
    console.log("✅ Columna usuario_id agregada a detalle_compra");
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log("ℹ️ Columna usuario_id ya existe en detalle_compra");
    } else {
      console.error("❌ Error en migración:", err.message);
    }
  }
};
