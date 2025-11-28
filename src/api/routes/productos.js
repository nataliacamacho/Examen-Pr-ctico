const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/activos', async (req, res) => {
  try {
    const [productos] = await db.query(
      'SELECT * FROM productos WHERE activo = 1'
    );
    res.json(productos);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener productos');
  }
});

router.get('/admin', async (req, res) => {
  try {
    const [productos] = await db.query('SELECT * FROM productos');
    res.json(productos);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener productos (admin)');
  }
});

router.post('/crear', async (req, res) => {
  try {
    const { nombre, precio, descripcion, imagen, stock } = req.body;

    await db.query(
      `INSERT INTO productos (nombre, precio, descripcion, imagen, stock, activo)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [nombre, precio, descripcion, imagen, stock]
    );

    res.send('Producto creado correctamente');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al crear el producto');
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { nombre, precio, descripcion, imagen, stock } = req.body;
    const id = req.params.id;

    await db.query(
      `UPDATE productos 
       SET nombre=?, precio=?, descripcion=?, imagen=?, stock=?
       WHERE id = ?`,
      [nombre, precio, descripcion, imagen, stock, id]
    );

    res.send('Producto actualizado correctamente');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al actualizar producto');
  }
});

router.put('/desactivar/:id', async (req, res) => {
  try {
    const id = req.params.id;

    await db.query(`UPDATE productos SET activo = 0 WHERE id = ?`, [id]);

    res.send('Producto desactivado');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al desactivar producto');
  }
});

router.put('/reactivar/:id', async (req, res) => {
  try {
    const id = req.params.id;

    await db.query(`UPDATE productos SET activo = 1 WHERE id = ?`, [id]);

    res.send('Producto reactivado');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al reactivar producto');
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
