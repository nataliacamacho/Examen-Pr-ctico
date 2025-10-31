import express from 'express';
import { getProductos, actualizarStock } from '../controllers/catalogoController.js';

const router = express.Router();

router.get('/productos', getProductos); 

router.post('/productos/actualizar-stock', actualizarStock);

export default router;
