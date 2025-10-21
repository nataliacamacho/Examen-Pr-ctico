import express from 'express';
import db from '../config/db.js';

const router = express.Router();

// 📦 Obtener todos los productos
router.get('/productos', (req, res) => {
  const sql = 'SELECT * FROM productos';
  db.query(sql, (err, result) => {
    if (err) {
      console.error('Error al obtener productos:', err);
      return res.status(500).json({ error: 'Error en el servidor' });
    }
    res.json(result);
  });
});

export default router;
