import { Router } from 'express';
import { PublicHandler } from './handlers';
import { validateApiKey } from './middleware';
import { authenticateJWT, requireRole } from './middleware/auth';

const router = Router();
const handler = new PublicHandler();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Verifica el estado del servicio
 *     description: Health check de la API Pública
 *     responses:
 *       200:
 *         description: Servidor funcionando correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 */
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'modulo_12_api_publica' });
});

/**
 * @swagger
 * /routes:
 *   get:
 *     summary: Obtiene todas las rutas
 *     description: Lista de rutas disponibles
 *     security:
 *       - apiKey: []
 *     responses:
 *       200:
 *         description: Lista de rutas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 */
router.get('/routes', validateApiKey, handler.getRoutes.bind(handler));

/**
 * @swagger
 * /buses:
 *   get:
 *     summary: Obtiene todos los buses
 *     description: Lista de buses activos
 *     security:
 *       - apiKey: []
 *     responses:
 *       200:
 *         description: Lista de buses
 */
router.get('/buses', validateApiKey, handler.getBuses.bind(handler));

/**
 * @swagger
 * /wallet/{walletId}/balance:
 *   get:
 *     summary: Obtiene el saldo de una billetera
 *     description: Consulta el saldo actual de una billetera
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: walletId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la billetera
 *     responses:
 *       200:
 *         description: Saldo de la billetera
 *       404:
 *         description: Billetera no encontrada
 */
router.get(
  '/wallet/:walletId/balance',
  authenticateJWT,
  handler.getWalletBalance.bind(handler)
);

/**
 * @swagger
 * /wallet/{walletId}/transactions:
 *   get:
 *     summary: Obtiene el historial de transacciones
 *     description: Historial de transacciones de una billetera
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: walletId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la billetera
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Límite de resultados
 *     responses:
 *       200:
 *         description: Historial de transacciones
 */
router.get(
  '/wallet/:walletId/transactions',
  authenticateJWT,
  handler.getTransactions.bind(handler)
);

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Crea una orden de mantenimiento
 *     description: Publica una orden en el bus de eventos NATS
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - vehicle_id
 *               - type
 *               - priority
 *               - description
 *               - scheduled_date
 *             properties:
 *               vehicle_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID del vehículo
 *               type:
 *                 type: string
 *                 enum: [PREVENTIVE, CORRECTIVE, EMERGENCY]
 *                 description: Tipo de mantenimiento
 *               priority:
 *                 type: string
 *                 enum: [CRITICAL, HIGH, MEDIUM, LOW]
 *                 description: Prioridad de la orden
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 description: Descripción de la orden
 *               scheduled_date:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha programada
 *     responses:
 *       202:
 *         description: Orden aceptada y en procesamiento
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: accepted
 *                 request_id:
 *                   type: string
 *                   format: uuid
 *                 correlation_id:
 *                   type: string
 *                   format: uuid
 *                 message:
 *                   type: string
 *                 tracking_url:
 *                   type: string
 */
router.post(
  '/orders',
  authenticateJWT,
  handler.createOrder.bind(handler)
);

/**
 * @swagger
 * /admin/stats:
 *   get:
 *     summary: Estadísticas del sistema (solo ADMIN)
 *     description: Estadísticas generales del sistema
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas del sistema
 *       403:
 *         description: Permisos insuficientes
 */
router.get(
  '/admin/stats',
  authenticateJWT,
  requireRole(['ADMIN']),
  (_req, res) => {
    res.json({ message: 'Estadísticas solo para ADMIN' });
  }
);

export default router;
