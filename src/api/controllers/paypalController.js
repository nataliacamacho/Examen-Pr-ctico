import paypal from '@paypal/checkout-server-sdk';
import paypalClient from '../config/paypal.js';
import db from '../config/db.js';

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
          amount: { currency_code: 'MXN', value: total.toFixed(2) },
        },
      ],
    });

    const order = await paypalClient.execute(request);
    res.json({ id: order.result.id });
  } catch (err) {
    console.error('Error al crear orden PayPal:', err);
    res.status(500).json({ error: 'Error al crear la orden de PayPal' });
  }
};


export const captureOrder = async (req, res) => {
  try {
      console.log("📦 BODY RECIBIDO EN captureOrder:", JSON.stringify(req.body, null, 2));
    const { orderID, carrito } = req.body;

    if (!orderID) return res.status(400).json({ error: 'orderID requerido' });
    if (!carrito || carrito.length === 0) return res.status(400).json({ error: 'Carrito vacío' });

    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});
    const capture = await paypalClient.execute(request);

    const total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

    const sqlCompra = 'INSERT INTO compras (total, fecha) VALUES (?, NOW())';
    db.query(sqlCompra, [total], (err, result) => {
      if (err) {
        console.error('Error al guardar compra:', err);
        return res.status(500).json({ error: 'Error al registrar compra' });
      }

      const id_compra = result.insertId;

      carrito.forEach((item) => {
        const cantidad = Number(item.cantidad ?? 1);
        const subtotal = item.precio * cantidad;

        const sqlDetalle = `
          INSERT INTO detalle_compra (id_compra, id_producto, cantidad, subtotal)
          VALUES (?, ?, ?, ?)
        `;
        db.query(sqlDetalle, [id_compra, item.id, cantidad, subtotal]);

        const sqlUpdate = `
          UPDATE productos
          SET stock = GREATEST(stock - ?, 0)
          WHERE id = ?
        `;
        db.query(sqlUpdate, [cantidad, item.id]);
      });

      console.log('Compra registrada y stock actualizado');
      res.json({
        message: 'Pago exitoso y stock actualizado',
        compra: { id_compra, total },
        paypal: capture.result,
      });
    });
  } catch (err) {
    console.error('Error al capturar orden PayPal:', err);
    res.status(500).json({ error: 'Error al capturar la orden' });
  }
};
