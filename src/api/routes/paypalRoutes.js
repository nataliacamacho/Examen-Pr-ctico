// routes/paypalRoute.js
/*import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

const PAYPAL_API = 'https://api-m.sandbox.paypal.com'; // Cambia a producción si es necesario: https://api-m.paypal.com
const CLIENT = process.env.PAYPAL_CLIENT_ID;
const SECRET = process.env.PAYPAL_SECRET;

if (!CLIENT || !SECRET) {
  console.error('Faltan credenciales de PayPal en .env');
}

// Crear orden
router.post('/create-order', async (req, res) => {
  const { total } = req.body;
  if (!total || isNaN(total) || total <= 0) {
    return res.status(400).json({ error: 'Total inválido o carrito vacío' });
  }

  const auth = Buffer.from(`${CLIENT}:${SECRET}`).toString('base64');

  try {
    const response = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: 'MXN', // Cambia si necesitas otra moneda
            value: parseFloat(total).toFixed(2) // Asegura formato correcto
          }
        }],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error de PayPal:', errorData);
      return res.status(response.status).json({ error: 'Error al crear orden en PayPal' });
    }

    const data = await response.json();
    res.json(data); // Devuelve el objeto completo, incluyendo 'id'
  } catch (error) {
    console.error('Error interno:', error);
    res.status(500).json({ error: 'Error al crear orden' });
  }
});

// Capturar pago
router.post('/capture-order', async (req, res) => {
  const { orderID } = req.body;
  if (!orderID) {
    return res.status(400).json({ error: 'orderID requerido' });
  }

  const auth = Buffer.from(`${CLIENT}:${SECRET}`).toString('base64');

  try {
    const response = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderID}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error al capturar:', errorData);
      return res.status(response.status).json({ error: 'Error al capturar orden' });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error interno:', error);
    res.status(500).json({ error: 'Error al capturar orden' });
  }
});

export default router;
*/