// src/api/controllers/paypalController.js
import paypalClient from '../config/paypal.js';
import db from '../config/db.js'; // opcional: para guardar pedidos

export const createOrder = async (req, res) => {
  try {
    const { total } = req.body;
    if (!total || Number(total) <= 0) {
      return res.status(400).json({ error: 'Total inválido' });
    }

    const request = new (await import('@paypal/checkout-server-sdk')).orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'MXN',
            value: Number(total).toFixed(2)
          }
        }
      ]
    });

    const order = await paypalClient.execute(request);
    res.json({ id: order.result.id });
  } catch (err) {
    console.error('Error al crear orden PayPal:', err?.message || err);
    res.status(500).json({ error: 'Error al crear la orden de PayPal' });
  }
};

export const captureOrder = async (req, res) => {
  try {
    const { orderID } = req.body;
    if (!orderID) return res.status(400).json({ error: 'orderID requerido' });

    const request = new (await import('@paypal/checkout-server-sdk')).orders.OrdersCaptureRequest(orderID);
    request.requestBody({});

    const capture = await paypalClient.execute(request);

    // EJEMPLO: guardar pedido en BD (opcional)
    // const payer = capture.result.payer;
    // const purchaseUnit = capture.result.purchase_units?.[0];
    // db.query('INSERT INTO pedidos (order_id, amount, payer_email) VALUES (?, ?, ?)', [orderID, purchaseUnit.amount.value, payer.email_address]);

    res.json(capture.result);
  } catch (err) {
    console.error('Error al capturar orden PayPal:', err?.message || err);
    res.status(500).json({ error: 'Error al capturar la orden' });
  }
};
