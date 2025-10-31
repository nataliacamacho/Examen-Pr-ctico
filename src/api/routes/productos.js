const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const [productos] = await db.query('SELECT * FROM productos');
    res.json(productos);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener productos');
  }
});

router.post('/actualizar-stock', async (req, res) => {
  try {
    const { idProducto, cantidadComprada } = req.body;

    const [producto] = await db.query(
      'SELECT stock FROM productos WHERE id = ?',
      [idProducto]
    );

    if (!producto.length) {
      return res.status(404).send('Producto no encontrado');
    }

    if (producto[0].stock < cantidadComprada) {
      return res.status(400).send('Stock insuficiente');
    }

    await db.query(
      'UPDATE productos SET stock = stock - ? WHERE id = ?',
      [cantidadComprada, idProducto]
    );

    res.send('Stock actualizado correctamente');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al actualizar el stock');
  }
});

module.exports = router;
