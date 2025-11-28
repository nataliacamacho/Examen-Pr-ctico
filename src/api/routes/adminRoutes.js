import express from 'express';
import { getProductosAdmin, getProductoById, agregarProducto, modificarProducto, eliminarProducto } from '../controllers/adminController.js';

const router = express.Router();

router.get('/productos/:id', getProductoById);
router.get('/productos', getProductosAdmin);
router.post('/productos', agregarProducto);
router.put('/productos/:id', modificarProducto);
router.delete('/productos/:id', eliminarProducto);

export default router;
