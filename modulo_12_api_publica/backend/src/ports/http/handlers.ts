import { Request, Response } from 'express';
import { z } from 'zod';
import { PublicRepository } from '../../infrastructure/postgres/repository';
import { NatsPublisher } from '../../infrastructure/nats/publisher';

const repo = new PublicRepository();
const natsPublisher = new NatsPublisher();

export class PublicHandler {
  // ============ MÉTODOS EXISTENTES ============

  async getWalletBalance(req: Request, res: Response): Promise<Response> {
    try {
      const { walletId } = req.params;
      const balance = await repo.getWalletBalance(walletId);
      if (!balance) {
        return res.status(404).json({ error: 'Wallet not found' });
      }
      return res.json(balance);
    } catch (error) {
      console.error('Error getting wallet balance:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getTransactions(req: Request, res: Response): Promise<Response> {
    try {
      const { walletId } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;

      const transactions = await repo.getTransactionsByWalletId(walletId, limit, offset);
      return res.json({
        transactions,
        pagination: { limit, offset, count: transactions.length }
      });
    } catch (error) {
      console.error('Error getting transactions:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getRoutes(_req: Request, res: Response): Promise<Response> {
    try {
      const routes = await repo.getRoutes();
      return res.json(routes);
    } catch (error) {
      console.error('Error getting routes:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getBuses(_req: Request, res: Response): Promise<Response> {
    try {
      const buses = await repo.getBuses();
      return res.json(buses);
    } catch (error) {
      console.error('Error getting buses:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // ============ NUEVO MÉTODO - PROXY NATS ============

  async createOrder(req: Request, res: Response): Promise<Response> {
    try {
      // 1. Validar payload con Zod
      const schema = z.object({
        vehicle_id: z.string().uuid(),
        type: z.enum(['PREVENTIVE', 'CORRECTIVE', 'EMERGENCY']),
        priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
        description: z.string().max(500),
        scheduled_date: z.string().datetime(),
        assigned_mechanic_id: z.string().uuid().optional()
      });

      const data = schema.parse(req.body);

      // 2. Generar IDs de seguimiento
      const requestId = crypto.randomUUID();
      const correlationId = req.headers['x-correlation-id'] as string || crypto.randomUUID();

      // 3. Publicar evento en NATS
      await natsPublisher.publish('order.created', {
        request_id: requestId,
        correlation_id: correlationId,
        timestamp: new Date().toISOString(),
        source: 'api-publica',
        data: {
          order_id: crypto.randomUUID(),
          user_id: req.user?.userId || 'unknown',
          ...data
        }
      });

      // 4. Responder 202 Accepted
      return res.status(202).json({
        status: 'accepted',
        request_id: requestId,
        correlation_id: correlationId,
        message: 'Orden recibida, procesando en segundo plano',
        tracking_url: `/api/v1/orders/${requestId}/status`
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Invalid payload',
          details: error.issues // CORREGIDO: 'issues' en lugar de 'errors'
        });
      }
      console.error('Error creating order:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}
