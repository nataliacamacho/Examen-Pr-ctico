import express from 'express';
import paypal from '@paypal/checkout-server-sdk';
import paypalClient from '../config/paypal.js';

const router = express.Router();

router.post('/create-order', async (req, res) => {
  const { total } = req.body;
  const request = new paypal.orders.OrdersCreateRequest();

  request.prefer("return=representation");
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [{
      amount: {
        currency_code: 'MXN',
        value: total.toFixed(2),
      },
    }],
  });

  try {
    const order = await paypalClient.execute(request);
    res.json({ id: order.result.id });
  } catch (err) {
    console.error("Error al crear la orden:", err);
    res.status(500).send("Error al crear la orden de pago.");
  }
});

router.post('/capture-order', async (req, res) => {
  const { orderID } = req.body;
  const request = new paypal.orders.OrdersCaptureRequest(orderID);
  request.requestBody({});

  try {
    const capture = await paypalClient.execute(request);
    console.log('Pago capturado:', capture.result);
    res.json(capture.result);
  } catch (err) {
    console.error("Error al capturar la orden:", err);
    res.status(500).send("Error al confirmar el pago.");
  }
});

export default router;
