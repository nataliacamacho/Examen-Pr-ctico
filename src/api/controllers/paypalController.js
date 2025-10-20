import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_API, PAYPAL_CURRENCY } = process.env;

export const createOrder = async (req, res) => {
  try {
    const { total } = req.body;

    const response = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(PAYPAL_CLIENT_ID + ':' + PAYPAL_CLIENT_SECRET).toString('base64')}`
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: PAYPAL_CURRENCY || 'MXN',
              value: total.toFixed(2)
            }
          }
        ]
      })
    });

    const data = await response.json();
    console.log('🪙 Orden creada en PayPal:', data);
    res.json({ id: data.id });
  } catch (err) {
    console.error('❌ Error al crear orden:', err);
    res.status(500).send('Error al crear la orden de PayPal');
  }
};

export const captureOrder = async (req, res) => {
  try {
    const { orderID } = req.params;

    const response = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderID}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(PAYPAL_CLIENT_ID + ':' + PAYPAL_CLIENT_SECRET).toString('base64')}`
      }
    });

    const data = await response.json();
    console.log('✅ Orden capturada:', data);
    res.json(data);
  } catch (err) {
    console.error('❌ Error al capturar orden:', err);
    res.status(500).send('Error al capturar el pago');
  }
};
