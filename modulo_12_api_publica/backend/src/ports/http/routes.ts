import { Router } from 'express';
import { authenticateJWT, requireRole } from './middleware/auth';
import { createOrder, getOrderStatus, listOrders } from './handlers/OrderHandler';

const router = Router();

// Health check (público)
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'modulo_12_api_publica' });
});

// Rutas de órdenes (requieren autenticación y rol admin)
router.post('/orders', authenticateJWT, requireRole(['admin']), createOrder);
router.get('/orders', authenticateJWT, requireRole(['admin']), listOrders);
router.get('/orders/status/:requestId', authenticateJWT, requireRole(['admin']), getOrderStatus);

export default router;
