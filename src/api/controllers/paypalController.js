// src/api/controllers/paypalController.js
import paypal from '@paypal/checkout-server-sdk';
import paypalClient from '../config/paypal.js';
import db from '../config/db.js';

// 🧾 Crear orden de PayPal
export const createOrder = async (req, res) => {
  try {
    const { total } = req.body;
    if (!total || isNaN(total) || total <= 0) {
      return res.status(400).json({ error: 'Total inválido o carrito vacío' });
    }

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'MXN',
            value: total.toFixed(2),
          },
        },
      ],
    });

    const order = await paypalClient.execute(request);
    res.json({ id: order.result.id });
  } catch (err) {
    console.error('❌ Error al crear orden PayPal:', err);
    res.status(500).json({ error: 'Error al crear la orden de PayPal' });
  }
};

// 💰 Capturar orden y guardar compra en la BD
export const captureOrder = async (req, res) => {
  try {
    const { orderID, id_usuario, carrito } = req.body;

    if (!orderID) return res.status(400).json({ error: 'orderID requerido' });
    if (!id_usuario) return res.status(400).json({ error: 'Usuario no autenticado' });
    if (!carrito || carrito.length === 0) return res.status(400).json({ error: 'Carrito vacío' });

    // Capturamos el pago en PayPal
    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});
    const capture = await paypalClient.execute(request);

    // ✅ Guardar compra en base de datos
    const total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
    const sqlCompra = 'INSERT INTO compras (id_usuario, total, fecha) VALUES (?, ?, NOW())';

    db.query(sqlCompra, [id_usuario, total], (err, result) => {
      if (err) {
        console.error('❌ Error al guardar compra:', err);
        return res.status(500).json({ error: 'Error al registrar compra' });
      }

      const id_compra = result.insertId;

      // ✅ Guardar detalles de la compra y actualizar inventario
      carrito.forEach((item) => {
        const sqlDetalle =
          'INSERT INTO detalle_compra (id_compra, id_producto, cantidad, subtotal) VALUES (?, ?, ?, ?)';
        db.query(sqlDetalle, [
          id_compra,
          item.id,
          item.cantidad,
          item.precio * item.cantidad,
        ]);

        const sqlUpdate = 'UPDATE productos SET stock = stock - ? WHERE id = ?';
        db.query(sqlUpdate, [item.cantidad, item.id]);
      });

      console.log('✅ Compra registrada exitosamente');
      res.json({ message: 'Pago exitoso', compra: { id_compra, total }, paypal: capture.result });
    });
  } catch (err) {
    console.error('❌ Error al capturar orden PayPal:', err);
    res.status(500).json({ error: 'Error al capturar la orden' });
  }
};
