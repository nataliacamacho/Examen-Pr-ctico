import db from '../config/db.js';

export const getProductos = async (req, res) => {
  try {
    const debug = req.query.debug === '1';
    const sql = debug
      ? `SELECT p.*, v.estado FROM productos p LEFT JOIN vigencia v ON p.vigencia_id = v.id`
      : `SELECT p.*, v.estado FROM productos p
           LEFT JOIN vigencia v ON p.vigencia_id = v.id
           WHERE LOWER(TRIM(COALESCE(v.estado, ''))) = 'activo' OR p.vigencia_id IS NULL`;

    const [results] = await db.query(sql);

    const [allProducts] = await db.query('SELECT id, nombre, vigencia_id FROM productos');
    console.log('TODOS los productos en BD:', allProducts);

    if (debug) {
      console.log('Productos obtenidos (DEBUG - todos):', results.map(r => ({ id: r.id, nombre: r.nombre, vigencia: r.estado, vigencia_id: r.vigencia_id })));
    } else {
      console.log('Productos obtenidos (activos):', results.map(r => ({ id: r.id, nombre: r.nombre, vigencia: r.estado, vigencia_id: r.vigencia_id })));
    }
    res.json(results);
  } catch (err) {
    console.error('Error real al obtener productos:', err);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};


export const actualizarStock = async (req, res) => {
  const { idProducto, cantidadComprada } = req.body;

  if (!idProducto || !cantidadComprada) {
    return res.status(400).json({ error: 'Faltan datos: idProducto o cantidadComprada' });
  }

  try {
    const [results] = await db.query('SELECT stock FROM productos WHERE id = ?', [idProducto]);

    if (!results || results.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const stockActual = results[0].stock;

    if (stockActual < cantidadComprada) {
      return res.status(400).json({ error: 'Stock insuficiente' });
    }

    await db.query(
      'UPDATE productos SET stock = stock - ? WHERE id = ?',
      [cantidadComprada, idProducto]
    );

    res.json({ message: 'Stock actualizado correctamente' });

  } catch (err) {
    console.error('Error al actualizar stock:', err.message);
    console.error(err); 
    res.status(500).json({ error: 'Error al actualizar stock' });
  }
};

export const restaurarStock = async (req, res) => {
  const { idProducto, cantidad } = req.body;

  if (!idProducto || cantidad == null) {
    return res.status(400).json({ error: 'Faltan datos: idProducto o cantidad' });
  }

  try {
    const [results] = await db.query('SELECT stock FROM productos WHERE id = ?', [idProducto]);

    if (!results || results.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    await db.query(
      'UPDATE productos SET stock = stock + ? WHERE id = ?',
      [cantidad, idProducto]
    );

    res.json({ message: 'Stock restaurado correctamente' });
  } catch (err) {
    console.error('Error al restaurar stock:', err.message);
    res.status(500).json({ error: 'Error al restaurar stock' });
  }
};

