import { Router } from 'express';
import { authenticateJWT } from './middleware/auth';
import { createOrder, getOrderStatus } from './handlers/OrderHandler';

const router = Router();

// Health check - usando _req para indicar que no se usa
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'modulo_12_api_publica' });
});

// Rutas de órdenes
router.post('/orders', authenticateJWT, createOrder);
router.get('/orders/status/:requestId', authenticateJWT, getOrderStatus);

export default router;
