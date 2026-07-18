import { Request, Response } from 'express';
import axios from 'axios';

export const orderController = {
  // Obtener todas las órdenes
  async getOrders(req: Request, res: Response) {
    try {
      const token = req.headers.authorization;
      const tenant = req.headers['x-tenant-id'] || 'default';

      // M6 es el servicio de gestión de órdenes (CMMS)
      const response = await axios.get('http://localhost:8087/api/v1/orders', {
        headers: {
          Authorization: token,
          'x-tenant-id': tenant,
        },
      });

      res.json(response.data);
    } catch (error: any) {
      console.error('❌ Error en getOrders:', error.message);
      res.status(500).json({ error: 'Error al obtener órdenes' });
    }
  },

  // Crear una nueva orden
  async createOrder(req: Request, res: Response) {
    try {
      const token = req.headers.authorization;
      const tenant = req.headers['x-tenant-id'] || 'default';

      // Publicar evento en NATS (lo hará M6)
      // Por ahora, simulamos la creación
      const response = await axios.post('http://localhost:8087/api/v1/orders', req.body, {
        headers: {
          Authorization: token,
          'x-tenant-id': tenant,
        },
      });

      res.status(201).json(response.data);
    } catch (error: any) {
      console.error('❌ Error en createOrder:', error.message);
      res.status(500).json({ error: 'Error al crear orden' });
    }
  },

  // Obtener una orden por ID
  async getOrderById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const token = req.headers.authorization;
      const tenant = req.headers['x-tenant-id'] || 'default';

      const response = await axios.get(`http://localhost:8087/api/v1/orders/${id}`, {
        headers: {
          Authorization: token,
          'x-tenant-id': tenant,
        },
      });

      res.json(response.data);
    } catch (error: any) {
      console.error(`❌ Error en getOrderById (${req.params.id}):`, error.message);
      res.status(500).json({ error: 'Error al obtener la orden' });
    }
  },

  // Actualizar una orden
  async updateOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const token = req.headers.authorization;
      const tenant = req.headers['x-tenant-id'] || 'default';

      const response = await axios.put(`http://localhost:8087/api/v1/orders/${id}`, req.body, {
        headers: {
          Authorization: token,
          'x-tenant-id': tenant,
        },
      });

      res.json(response.data);
    } catch (error: any) {
      console.error(`❌ Error en updateOrder (${req.params.id}):`, error.message);
      res.status(500).json({ error: 'Error al actualizar la orden' });
    }
  },

  // Eliminar una orden
  async deleteOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const token = req.headers.authorization;
      const tenant = req.headers['x-tenant-id'] || 'default';

      await axios.delete(`http://localhost:8087/api/v1/orders/${id}`, {
        headers: {
          Authorization: token,
          'x-tenant-id': tenant,
        },
      });

      res.status(204).send();
    } catch (error: any) {
      console.error(`❌ Error en deleteOrder (${req.params.id}):`, error.message);
      res.status(500).json({ error: 'Error al eliminar la orden' });
    }
  },
};
