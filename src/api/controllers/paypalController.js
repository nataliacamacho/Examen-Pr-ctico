import { paypal, paypalClient } from "../config/paypal.js";
import db from "../config/db.js";
import fs from "fs";

export const createOrder = async (req, res) => {
  try {
    console.log("createOrder BODY:", JSON.stringify(req.body, null, 2));

    const { total } = req.body;

    if (!total || isNaN(total) || total <= 0) {
      console.error("Total inválido:", total);
      return res.status(400).json({ error: "Total inválido o carrito vacío" });
    }

    console.log(`Creando orden por $${total} MXN`);

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

    console.log("Orden creada exitosamente:", order.result.id);

    try {
      const logPath = process.cwd() + "/paypal_create_orders.log";
      fs.appendFileSync(
        logPath,
        JSON.stringify({ time: new Date(), id: order.result.id, total, status: order.result.status }) + "\n"
      );
    } catch (e) {
      console.error("Error escribiendo log:", e);
    }

    return res.json({ id: order.result.id });
  } catch (err) {
    console.error("Error en createOrder:", err);
    return res.status(500).json({ error: "Error al crear la orden de PayPal", details: err.message });
  }
};

export const captureOrder = async (req, res) => {
  try {
    console.log("captureOrder BODY:", JSON.stringify(req.body, null, 2));

    const { orderID, carrito, usuarioId } = req.body;

    if (!orderID) {
      console.error("orderID no proporcionado");
      return res.status(400).json({ error: "orderID requerido" });
    }

    if (!carrito || carrito.length === 0) {
      console.error("Carrito vacío o no proporcionado");
      return res.status(400).json({ error: "Carrito vacío" });
    }

    console.log(`Capturando orden ${orderID} para usuario ${usuarioId}`);

    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});

    const capture = await paypalClient.execute(request);

    console.log("Resultado PayPal:", JSON.stringify(capture.result, null, 2));

    if (capture.result.status !== "COMPLETED") {
      console.error("La captura no se completó. Status:", capture.result.status);
      return res.status(400).json({
        error: "La captura no se completó",
        status: capture.result.status,
        details: capture.result,
      });
    }

    console.log("Captura completada. Procesando detalles de compra...");

    const total = carrito.reduce(
      (acc, item) => acc + item.precio * item.cantidad,
      0
    );

    db.query(
      "INSERT INTO compras (usuario_id, total, fecha) VALUES (?, ?, NOW())",
      [usuarioId ?? null, total],
      (err, result) => {
        if (err) {
          console.error("Error al registrar compra:", err);
          return res.status(500).json({ error: "Error al registrar compra", details: err.message });
        }

        const id_compra = result.insertId;
        console.log(`Compra registrada con ID: ${id_compra}`);

        const promises = carrito.map((item) => {
          const cantidad = Number(item.cantidad ?? 1);
          const subtotal = item.precio * cantidad;

          console.log(`Insertando detalle: Producto ${item.id}, Cantidad: ${cantidad}, Subtotal: ${subtotal}`);

          const detallePromise = new Promise((resolve, reject) => {
            db.query(
              `INSERT INTO detalle_compra (id_compra, usuario_id, id_producto, cantidad, subtotal)
               VALUES (?, ?, ?, ?, ?)`,
              [id_compra, usuarioId ?? null, item.id, cantidad, subtotal],
              (err) => {
                if (err) {
                  console.error(`Error al insertar detalle del producto ${item.id}:`, err);
                  return reject(err);
                }
                console.log(`Detalle del producto ${item.id} insertado`);
                resolve(true);
              }
            );
          });

          const stockPromise = new Promise((resolve, reject) => {
            db.query(
              `UPDATE productos SET stock = GREATEST(stock - ?, 0) WHERE id = ?`,
              [cantidad, item.id],
              (err) => {
                if (err) {
                  console.error(`Error al actualizar stock del producto ${item.id}:`, err);
                  return reject(err);
                }
                console.log(`Stock del producto ${item.id} actualizado`);
                resolve(true);
              }
            );
          });

          return Promise.all([detallePromise, stockPromise]);
        });

        Promise.all(promises)
          .then(() => {
            console.log("Compra completada exitosamente");
            return res.json({
              ok: true,
              message: "Pago exitoso y compra registrada",
              compra: { id_compra, total },
              paypal: capture.result,
            });
          })
          .catch((err) => {
            console.error("Error guardando detalles o stock:", err);
            return res
              .status(500)
              .json({ error: "Error al guardar detalles de la compra", details: err.message });
          });
      }
    );
  } catch (err) {
    console.error("Error en captureOrder:", err);
    return res.status(500).json({ error: "Error al capturar la orden", details: err.message });
  }
};
