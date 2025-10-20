import express from 'express';
import { getProductos } from '../controllers/catalogoController.js';
const router = express.Router();

router.get('/productos', getProductos);

export default router;
