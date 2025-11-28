import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { transporter } from "./config/transporter.js";

import catalogoRoutes from "./routes/catalogoRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import comprasRoutes from "./routes/comprasRoutes.js";

import paypalRoutes from "./routes/paypalRoutes.js";
import { migrar } from "./migrations/01_add_usuario_to_compras.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:4200",
      "https://www.sandbox.paypal.com",
      "https://www.paypal.com",
      "https://extensions-stores-admin.onrender.com"              
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  })
);

app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

migrar();

app.use("/api/catalogo", catalogoRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/compras", comprasRoutes);

app.use("/api/paypal", paypalRoutes);

app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Servidor corriendo en puerto ${PORT}`)
);
