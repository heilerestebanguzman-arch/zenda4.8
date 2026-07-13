import { Router, Request, Response } from 'express';
import { ReportService } from '../services/ReportService';
import { authenticateJWT } from '../middleware/auth';

const router = Router();
const reportService = new ReportService();

// 1. Resumen General
router.get('/summary', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId || 'default';
    const data = await reportService.getSummary(tenantId);
    res.json({ status: 'ok', data });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener resumen' });
  }
});

// 2. Órdenes por Estado
router.get('/orders-by-status', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId || 'default';
    const data = await reportService.getOrdersByStatus(tenantId);
    res.json({ status: 'ok', data });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener órdenes por estado' });
  }
});

// 3. Top Conductores
router.get('/top-drivers', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId || 'default';
    const limit = parseInt(req.query.limit as string) || 5;
    const data = await reportService.getTopDrivers(tenantId, limit);
    res.json({ status: 'ok', data });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener top conductores' });
  }
});

// 4. Ingresos Mensuales
router.get('/monthly-revenue', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId || 'default';
    const months = parseInt(req.query.months as string) || 6;
    const data = await reportService.getMonthlyRevenue(tenantId, months);
    res.json({ status: 'ok', data });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener ingresos mensuales' });
  }
});

// 5. Tiempo de Respuesta (MTTR)
router.get('/mttr', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId || 'default';
    const data = await reportService.getMTTR(tenantId);
    res.json({ status: 'ok', data });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener MTTR' });
  }
});

export default router;
