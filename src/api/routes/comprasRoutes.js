import express from 'express';
import { obtenerHistorialCompras, obtenerDetalleCompra } from '../controllers/comprasController.js';

const router = express.Router();

router.get('/historial/:usuarioId', obtenerHistorialCompras);

router.get('/detalle/:usuarioId/:idCompra', obtenerDetalleCompra);

export default router;
