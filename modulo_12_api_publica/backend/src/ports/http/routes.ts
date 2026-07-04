import { Router } from 'express';
import { PublicHandler } from './handlers';
import { rateLimiter, validateApiKey } from './middleware';
import { authenticateJWT, requireRole } from './middleware/auth';

const router = Router();
const handler = new PublicHandler();

// Rutas públicas (sin autenticación)
router.use(rateLimiter);
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'modulo_12_api_publica' });
});

// Rutas públicas (solo API Key)
router.get('/routes', validateApiKey, handler.getRoutes.bind(handler));
router.get('/buses', validateApiKey, handler.getBuses.bind(handler));

// Rutas protegidas con JWT
router.get(
  '/wallet/:walletId/balance',
  authenticateJWT,
  handler.getWalletBalance.bind(handler)
);

router.get(
  '/wallet/:walletId/transactions',
  authenticateJWT,
  handler.getTransactions.bind(handler)
);

// NUEVA RUTA: Crear orden (proxy NATS)
router.post(
  '/orders',
  authenticateJWT,
  handler.createOrder.bind(handler)
);

// Rutas solo para ADMIN
router.get(
  '/admin/stats',
  authenticateJWT,
  requireRole(['ADMIN']),
  (_req, res) => {
    res.json({ message: 'Estadísticas solo para ADMIN' });
  }
);

export default router;
