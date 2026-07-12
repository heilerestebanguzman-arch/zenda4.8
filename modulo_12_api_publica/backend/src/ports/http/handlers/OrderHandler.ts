import { Request, Response } from 'express';
import { publishOrderCreated } from '../../../nats/publisher';

const orderStatusStore: Record<string, any> = {};

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const orderData = req.body;
    
    if (!orderData.vehicle_id || !orderData.type || !orderData.description) {
      res.status(400).json({ error: 'Faltan campos requeridos' });
      return;
    }

    const result = await publishOrderCreated(orderData);
    
    orderStatusStore[result.request_id] = {
      status: 'PENDING',
      message: 'Orden recibida',
      created_at: new Date().toISOString(),
      order_data: orderData
    };
    
    res.status(202).json({
      status: 'accepted',
      request_id: result.request_id,
      correlation_id: result.correlation_id,
      message: 'Orden creada exitosamente',
      tracking_url: `/api/v1/orders/status/${result.request_id}`
    });
  } catch (error) {
    console.error('❌ Error al crear orden:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { requestId } = req.params;
    const orderStatus = orderStatusStore[requestId];
    
    if (!orderStatus) {
      res.status(404).json({ error: 'Orden no encontrada' });
      return;
    }
    
    res.json({
      status: 'ok',
      data: {
        request_id: requestId,
        order_status: orderStatus.status,
        message: orderStatus.message,
        created_at: orderStatus.created_at,
        completed_at: orderStatus.completed_at || null,
        order_data: orderStatus.order_data
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const listOrders = async (_req: Request, res: Response): Promise<void> => {
  try {
    const orders = Object.keys(orderStatusStore).map((requestId) => ({
      request_id: requestId,
      status: orderStatusStore[requestId].status,
      message: orderStatusStore[requestId].message,
      created_at: orderStatusStore[requestId].created_at,
      completed_at: orderStatusStore[requestId].completed_at || null,
      order_data: orderStatusStore[requestId].order_data
    }));
    
    res.json({
      status: 'ok',
      data: orders
    });
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
