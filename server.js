// server.js
import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_API } = process.env;

async function generateAccessToken() {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");
  const response = await axios.post(
    `${PAYPAL_API}/v1/oauth2/token`,
    "grant_type=client_credentials",
    { headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" } }
  );
  return response.data.access_token;
}

app.post("/api/pago", async (req, res) => {
  try {
    const { total } = req.body;
    const accessToken = await generateAccessToken();

    const response = await axios.post(
      `${PAYPAL_API}/v2/checkout/orders`,
      {
        intent: "CAPTURE",
        purchase_units: [{ amount: { currency_code: "USD", value: total } }]
      },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    res.json({ id: response.data.id });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Error al crear la orden de PayPal");
  }
});

app.post("/api/capturar", async (req, res) => {
  try {
    const { orderID } = req.body;
    const accessToken = await generateAccessToken();

    const response = await axios.post(
      `${PAYPAL_API}/v2/checkout/orders/${orderID}/capture`,
      {},
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    res.json(response.data);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Error al capturar el pago");
  }
});

app.listen(3000, () => console.log("Servidor PayPal corriendo en http://localhost:3000"));
