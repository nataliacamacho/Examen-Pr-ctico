// src/api/app.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './config/db.js';
import catalogoRoutes from './routes/catalogoRoutes.js';
import { createOrder, captureOrder } from './controllers/paypalController.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Rutas principales
app.use('/api', catalogoRoutes);

// Rutas de PayPal
app.post('/api/paypal/create-order', createOrder);
app.post('/api/paypal/capture-order', captureOrder);

const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));
