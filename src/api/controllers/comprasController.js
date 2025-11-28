import db from "../config/db.js";

export const obtenerHistorialCompras = async (req, res) => {
  try {
    const { usuarioId } = req.params;

    if (!usuarioId) {
      return res.status(400).json({ error: 'usuarioId requerido' });
    }

    const [compras] = await db.query(
      `SELECT id, total, fecha FROM compras WHERE usuario_id = ? ORDER BY fecha DESC`,
      [usuarioId]
    );

    res.json({ compras });
  } catch (error) {
    console.error('Error al obtener historial de compras:', error);
    res.status(500).json({ error: 'Error al obtener historial de compras' });
  }
};

export const obtenerDetalleCompra = async (req, res) => {
  try {
    const { idCompra, usuarioId } = req.params;

    if (!idCompra || !usuarioId) {
      return res.status(400).json({ error: 'idCompra y usuarioId requeridos' });
    }

    const [compra] = await db.query(
      `SELECT id, total, fecha FROM compras WHERE id = ? AND usuario_id = ?`,
      [idCompra, usuarioId]
    );

    if (compra.length === 0) {
      return res.status(404).json({ error: 'Compra no encontrada' });
    }

    const [detalles] = await db.query(
      `SELECT dc.id_producto, dc.cantidad, dc.subtotal, p.nombre, p.precio, p.imagen
       FROM detalle_compra dc
       JOIN productos p ON dc.id_producto = p.id
       WHERE dc.id_compra = ?`,
      [idCompra]
    );

    res.json({
      compra: compra[0],
      detalles: detalles
    });
  } catch (error) {
    console.error('Error al obtener detalle de compra:', error);
    res.status(500).json({ error: 'Error al obtener detalle de compra' });
  }
};
