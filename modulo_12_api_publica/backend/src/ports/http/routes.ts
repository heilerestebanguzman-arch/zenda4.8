import { Router } from 'express';
import { authenticateJWT } from './middleware/auth';
import { createOrder, getOrderStatus, listOrders } from './handlers/OrderHandler';

const router = Router();

// Health check (público)
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'modulo_12_api_publica' });
});

// Rutas de órdenes (requieren autenticación)
router.post('/orders', authenticateJWT, createOrder);
router.get('/orders', authenticateJWT, listOrders);
router.get('/orders/status/:requestId', authenticateJWT, getOrderStatus);

export default router;
