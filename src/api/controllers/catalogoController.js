import db from '../config/db.js';

export const getProductos = (req, res) => {
  db.query('SELECT * FROM productos', (err, results) => {
    if (err) {
      console.error('Error al obtener productos:', err);
      return res.status(500).json('Error al obtener productos');
    }
    res.json(results);
  });
};
