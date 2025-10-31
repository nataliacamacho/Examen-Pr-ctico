import db from '../config/db.js';

export const getProductos = (req, res) => {
  const sql = 'SELECT * FROM productos';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error al obtener productos:', err);
      return res.status(500).json({ error: 'Error al obtener productos' });
    }
    res.json(results);
  });
};

export const actualizarStock = (req, res) => {
  const { idProducto, cantidadComprada } = req.body;

  if (!idProducto || !cantidadComprada) {
    return res.status(400).json({ error: 'Faltan datos: idProducto o cantidadComprada' });
  }

  const selectSql = 'SELECT stock FROM productos WHERE id = ?';
  db.query(selectSql, [idProducto], (err, results) => {
    if (err) {
      console.error('Error al consultar stock:', err);
      return res.status(500).json({ error: 'Error al consultar stock' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const stockActual = results[0].stock;

    if (stockActual < cantidadComprada) {
      return res.status(400).json({ error: 'Stock insuficiente' });
    }

    const updateSql = 'UPDATE productos SET stock = stock - ? WHERE id = ?';
    db.query(updateSql, [cantidadComprada, idProducto], (err) => {
      if (err) {
        console.error('Error al actualizar stock:', err);
        return res.status(500).json({ error: 'Error al actualizar stock' });
      }
      res.json({ message: 'Stock actualizado correctamente' });
    });
  });
};
