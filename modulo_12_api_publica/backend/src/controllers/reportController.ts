import { Request, Response } from 'express';
import axios from 'axios';

export const reportController = {
  async getSummary(req: Request, res: Response) {
    try {
      const token = req.headers.authorization;
      const tenant = req.headers['x-tenant-id'] || 'default';

      const response = await axios.get('http://localhost:8094/api/v1/reports/summary', {
        headers: {
          Authorization: token,
          'x-tenant-id': tenant,
        },
      });

      res.json(response.data);
    } catch (error: any) {
      console.error('❌ Error en getSummary:', error.message);
      res.status(500).json({ error: 'Error al obtener el resumen' });
    }
  },

  async getOrdersByStatus(req: Request, res: Response) {
    try {
      const token = req.headers.authorization;
      const tenant = req.headers['x-tenant-id'] || 'default';

      const response = await axios.get('http://localhost:8094/api/v1/reports/orders-by-status', {
        headers: {
          Authorization: token,
          'x-tenant-id': tenant,
        },
      });

      res.json(response.data);
    } catch (error: any) {
      console.error('❌ Error en getOrdersByStatus:', error.message);
      res.status(500).json({ error: 'Error al obtener órdenes por estado' });
    }
  },

  async getTopDrivers(req: Request, res: Response) {
    try {
      const token = req.headers.authorization;
      const tenant = req.headers['x-tenant-id'] || 'default';

      const response = await axios.get('http://localhost:8094/api/v1/reports/top-drivers', {
        headers: {
          Authorization: token,
          'x-tenant-id': tenant,
        },
      });

      res.json(response.data);
    } catch (error: any) {
      console.error('❌ Error en getTopDrivers:', error.message);
      res.status(500).json({ error: 'Error al obtener top conductores' });
    }
  },

  async getMonthlyRevenue(req: Request, res: Response) {
    try {
      const token = req.headers.authorization;
      const tenant = req.headers['x-tenant-id'] || 'default';

      const response = await axios.get('http://localhost:8094/api/v1/reports/monthly-revenue', {
        headers: {
          Authorization: token,
          'x-tenant-id': tenant,
        },
      });

      res.json(response.data);
    } catch (error: any) {
      console.error('❌ Error en getMonthlyRevenue:', error.message);
      res.status(500).json({ error: 'Error al obtener ingresos mensuales' });
    }
  },

  async getMTTR(req: Request, res: Response) {
    try {
      const token = req.headers.authorization;
      const tenant = req.headers['x-tenant-id'] || 'default';

      const response = await axios.get('http://localhost:8094/api/v1/reports/mttr', {
        headers: {
          Authorization: token,
          'x-tenant-id': tenant,
        },
      });

      res.json(response.data);
    } catch (error: any) {
      console.error('❌ Error en getMTTR:', error.message);
      res.status(500).json({ error: 'Error al obtener MTTR' });
    }
  },
};
