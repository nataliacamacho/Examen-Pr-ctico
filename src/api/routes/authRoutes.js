import { Router } from "express";
import { registrar, login, recuperarPassword, resetPassword, actualizarPerfil, obtenerPerfil, verifyIdentity, resetPasswordDirect } from "../controllers/authController.js";
import rateLimitResetMiddleware from "../middleware/rateLimit.js";

const router = Router();

router.post("/register", registrar);
router.post("/login", login);
router.post("/recover", recuperarPassword);
router.post("/reset-password", resetPassword);
router.put('/profile', actualizarPerfil);
router.get('/profile/:id', obtenerPerfil);
router.post('/verify-identity', verifyIdentity);
router.post('/reset-password-direct', rateLimitResetMiddleware, resetPasswordDirect);

export default router;
