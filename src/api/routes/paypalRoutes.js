// routes/paypalRoute.js
import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

const PAYPAL_API = 'https://api-m.sandbox.paypal.com';
const CLIENT = process.env.PAYPAL_CLIENT_ID;
const SECRET = process.env.PAYPAL_SECRET;

// Crear orden
router.post('/create-order', async (req, res) => {
  const { total } = req.body;
  if (!total || total <= 0) {
    return res.status(400).send({ error: 'Carrito vacío' });
  }

  const auth = Buffer.from(`${CLIENT}:${SECRET}`).toString('base64');

  try {
    const response = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{ amount: { currency_code: 'MXN', value: total.toFixed(2) } }],
      }),
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Error al crear orden' });
  }
});

// Capturar pago
router.post('/capture-order', async (req, res) => {
  const { orderID } = req.body;
  const auth = Buffer.from(`${CLIENT}:${SECRET}`).toString('base64');

  try {
    const response = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderID}/capture`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`,
      },
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Error al capturar orden' });
  }
});

export default router;
