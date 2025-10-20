// api/config/paypal.js
import paypal from '@paypal/checkout-server-sdk';
import dotenv from 'dotenv';

// Cargar variables de entorno (.env)
dotenv.config();

// === 1️⃣ Configurar entorno Sandbox (modo de pruebas) ===
// Usa tus credenciales del archivo .env
const environment = new paypal.core.SandboxEnvironment(
  process.env.PAYPAL_CLIENT_ID,      // Tu Client ID
  process.env.PAYPAL_CLIENT_SECRET   // Tu Client Secret
);

// === 2️⃣ Crear cliente de PayPal ===
const paypalClient = new paypal.core.PayPalHttpClient(environment);

// === 3️⃣ Exportar cliente para usarlo en las rutas ===
export default paypalClient;
