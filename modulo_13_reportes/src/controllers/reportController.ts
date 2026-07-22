import { Request, Response } from 'express';
import { reportService } from '../services/reportService';

export const reportController = {
  async getSummary(req: Request, res: Response) {
    try {
      const tenantId = req.headers['x-tenant-id'] as string || 'default';
      const data = await reportService.getSummary(tenantId);

      res.json({
        status: 'ok',
        data
      });
    } catch (error: any) {
      console.error('❌ Error en getSummary:', error.message);
      res.status(500).json({ error: 'Error al obtener resumen' });
    }
  },
};
