// app.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './config/db.js';
import catalogoRoutes from './routes/catalogoRoutes.js';
import paypalRoutes from './routes/paypalRoutes.js'; // 🆕 Ruta de PayPal

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Rutas principales
app.use('/api', catalogoRoutes);
app.use('/api/paypal', paypalRoutes); // 🟢 Añadimos PayPal aquí

const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));
