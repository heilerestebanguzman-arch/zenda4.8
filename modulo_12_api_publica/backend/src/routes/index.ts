import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth';
import { orderController } from '../controllers/orderController';
import { reportController } from '../controllers/reportController';
import { driverController } from '../controllers/driverController';

const router = Router();

// Health check (público)
router.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'M12-API-Gateway' });
});

// ==================== ÓRDENES ====================
router.get('/orders', authenticateJWT, orderController.getOrders);
router.post('/orders', authenticateJWT, orderController.createOrder);
router.get('/orders/:id', authenticateJWT, orderController.getOrderById);
router.put('/orders/:id', authenticateJWT, orderController.updateOrder);
router.delete('/orders/:id', authenticateJWT, orderController.deleteOrder);

// ==================== REPORTES ====================
router.get('/reports/summary', authenticateJWT, reportController.getSummary);
router.get('/reports/orders-by-status', authenticateJWT, reportController.getOrdersByStatus);
router.get('/reports/top-drivers', authenticateJWT, reportController.getTopDrivers);
router.get('/reports/monthly-revenue', authenticateJWT, reportController.getMonthlyRevenue);
router.get('/reports/mttr', authenticateJWT, reportController.getMTTR);

// ==================== CONDUCTORES ====================
router.get('/drivers', authenticateJWT, driverController.getDrivers);
router.post('/drivers/register', authenticateJWT, driverController.registerDriver);
router.get('/drivers/:id', authenticateJWT, driverController.getDriverById);
router.put('/drivers/:id', authenticateJWT, driverController.updateDriver);
router.delete('/drivers/:id', authenticateJWT, driverController.deleteDriver);

export default router;
