const db = require('../config/db'); 

exports.obtenerProductosCliente = (req, res) => {
    const sql = "SELECT * FROM productos WHERE activo = 1";

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
};

exports.obtenerProductosAdmin = (req, res) => {
    const sql = "SELECT * FROM productos";

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
};

exports.crearProducto = (req, res) => {
    const { nombre, precio, descripcion, imagen } = req.body;

    const sql = `
        INSERT INTO productos (nombre, precio, descripcion, imagen)
        VALUES (?, ?, ?, ?)
    `;

    db.query(sql, [nombre, precio, descripcion, imagen], (err) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ mensaje: "Producto creado correctamente" });
    });
};

exports.actualizarProducto = (req, res) => {
    const id = req.params.id;
    const { nombre, precio, descripcion, imagen } = req.body;

    const sql = `
        UPDATE productos
        SET nombre = ?, precio = ?, descripcion = ?, imagen = ?
        WHERE id = ?
    `;

    db.query(sql, [nombre, precio, descripcion, imagen, id], (err) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ mensaje: "Producto actualizado" });
    });
};

exports.desactivarProducto = (req, res) => {
    const id = req.params.id;

    const sql = "UPDATE productos SET activo = 0 WHERE id = ?";

    db.query(sql, [id], (err) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ mensaje: "Producto desactivado" });
    });
};

exports.reactivarProducto = (req, res) => {
    const id = req.params.id;

    const sql = "UPDATE productos SET activo = 1 WHERE id = ?";

    db.query(sql, [id], (err) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ mensaje: "Producto reactivado" });
    });
};
