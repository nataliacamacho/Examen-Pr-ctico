import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import catalogoRoutes from './routes/catalogoRoutes.js';
import paypalRoutes from './routes/paypalRoutes.js';  // ✅ agrega esto

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Rutas
app.use('/api', catalogoRoutes);
app.use('/api/paypal', paypalRoutes);  // ✅ y esto también

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
