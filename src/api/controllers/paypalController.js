import { paypal, paypalClient } from "../config/paypal.js";
import db from "../config/db.js";
import fs from "fs";

export const createOrder = async (req, res) => {
  try {
    const { total } = req.body;

    if (!total || isNaN(total) || total <= 0) {
      return res.status(400).json({ error: "Total inválido o carrito vacío" });
    }

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: { currency_code: "MXN", value: Number(total).toFixed(2) },
        },
      ],
    });

    const order = await paypalClient.execute(request);

    return res.json({ id: order.result.id });
  } catch (err) {
    return res.status(500).json({
      error: "Error al crear la orden de PayPal",
      details: err.message,
    });
  }
};

export const captureOrder = async (req, res) => {
  try {
    const { orderID, carrito, usuarioId } = req.body;

    if (!orderID) {
      return res.status(400).json({ error: "orderID requerido" });
    }

    if (!carrito || carrito.length === 0) {
      return res.status(400).json({ error: "Carrito vacío" });
    }

    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});

    const capture = await paypalClient.execute(request);

    if (capture.result.status !== "COMPLETED") {
      return res.status(400).json({
        error: "La captura no se completó",
        status: capture.result.status
      });
    }

    const total = carrito.reduce(
      (acc, item) => acc + item.precio * item.cantidad,
      0
    );

    const [compraResult] = await db.query(
      "INSERT INTO compras (usuario_id, total, fecha) VALUES (?, ?, NOW())",
      [usuarioId ?? null, total]
    );

    const id_compra = compraResult.insertId;

    const detallesPromises = carrito.map(item => {
      const cantidad = Number(item.cantidad ?? 1);
      const subtotal = item.precio * cantidad;

      return db.query(
        `INSERT INTO detalle_compra (id_compra, usuario_id, id_producto, cantidad, subtotal)
         VALUES (?, ?, ?, ?, ?)`,
        [id_compra, usuarioId ?? null, item.id, cantidad, subtotal]
      );
    });

    const stockPromises = carrito.map(item => {
      const cantidad = Number(item.cantidad ?? 1);
      return db.query(
        `UPDATE productos SET stock = GREATEST(stock - ?, 0) WHERE id = ?`,
        [cantidad, item.id]
      );
    });

    await Promise.all([...detallesPromises, ...stockPromises]);

    return res.json({
      ok: true,
      message: "Pago exitoso y compra registrada",
      compra: { id_compra, total },
      paypal: capture.result,
    });
  } catch (err) {
    return res.status(500).json({
      error: "Error al capturar la orden",
      details: err.message,
    });
  }
};
