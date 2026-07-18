import { Request, Response } from 'express';
import axios from 'axios';

export const driverController = {
  // Obtener todos los conductores
  async getDrivers(req: Request, res: Response) {
    try {
      const token = req.headers.authorization;
      const tenant = req.headers['x-tenant-id'] || 'default';

      // M10 es el servicio de conductores (HR)
      const response = await axios.get('http://localhost:8091/api/v1/drivers', {
        headers: {
          Authorization: token,
          'x-tenant-id': tenant,
        },
      });

      res.json(response.data);
    } catch (error: any) {
      console.error('❌ Error en getDrivers:', error.message);
      res.status(500).json({ error: 'Error al obtener conductores' });
    }
  },

  async registerDriver(req: Request, res: Response) {
    try {
      const token = req.headers.authorization;
      const tenant = req.headers['x-tenant-id'] || 'default';

      const response = await axios.post('http://localhost:8091/api/v1/drivers/register', req.body, {
        headers: {
          Authorization: token,
          'x-tenant-id': tenant,
        },
      });

      res.status(201).json(response.data);
    } catch (error: any) {
      console.error('❌ Error en registerDriver:', error.message);
      res.status(500).json({ error: 'Error al registrar conductor' });
    }
  },

  async getDriverById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const token = req.headers.authorization;
      const tenant = req.headers['x-tenant-id'] || 'default';

      const response = await axios.get(`http://localhost:8091/api/v1/drivers/${id}`, {
        headers: {
          Authorization: token,
          'x-tenant-id': tenant,
        },
      });

      res.json(response.data);
    } catch (error: any) {
      console.error(`❌ Error en getDriverById (${req.params.id}):`, error.message);
      res.status(500).json({ error: 'Error al obtener el conductor' });
    }
  },

  async updateDriver(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const token = req.headers.authorization;
      const tenant = req.headers['x-tenant-id'] || 'default';

      const response = await axios.put(`http://localhost:8091/api/v1/drivers/${id}`, req.body, {
        headers: {
          Authorization: token,
          'x-tenant-id': tenant,
        },
      });

      res.json(response.data);
    } catch (error: any) {
      console.error(`❌ Error en updateDriver (${req.params.id}):`, error.message);
      res.status(500).json({ error: 'Error al actualizar el conductor' });
    }
  },

  async deleteDriver(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const token = req.headers.authorization;
      const tenant = req.headers['x-tenant-id'] || 'default';

      await axios.delete(`http://localhost:8091/api/v1/drivers/${id}`, {
        headers: {
          Authorization: token,
          'x-tenant-id': tenant,
        },
      });

      res.status(204).send();
    } catch (error: any) {
      console.error(`❌ Error en deleteDriver (${req.params.id}):`, error.message);
      res.status(500).json({ error: 'Error al eliminar el conductor' });
    }
  },
};
