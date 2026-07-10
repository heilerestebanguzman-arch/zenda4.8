import { Router, Request, Response } from 'express';
import { ReportService } from '../services/reportService';
import { authenticateJWT } from '../middleware/auth';

const router = Router();
const service = new ReportService();

router.get('/dashboard', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const data = await service.getDashboard();
    res.json({ status: 'ok', data });
  } catch {
    res.status(500).json({ error: 'Error al obtener dashboard' });
  }
});

router.get('/trend', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const data = await service.getTrend(days);
    res.json({ status: 'ok', data });
  } catch {
    res.status(500).json({ error: 'Error al obtener tendencia' });
  }
});

export default router;
