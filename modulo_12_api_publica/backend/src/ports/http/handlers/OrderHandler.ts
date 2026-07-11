import { Request, Response } from 'express';
import { publishOrderCreated } from '../../../nats/publisher';

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('📥 [M12] Recibida solicitud de orden');
    console.log('📦 Datos:', req.body);
    
    const orderData = req.body;
    
    // Validar datos básicos
    if (!orderData.vehicle_id || !orderData.type || !orderData.description) {
      console.log('❌ Validación fallida');
      res.status(400).json({ error: 'Faltan campos requeridos: vehicle_id, type, description' });
      return;
    }

    console.log('✅ Validación exitosa');
    console.log('📤 Publicando en NATS...');
    
    // Publicar evento en NATS
    const result = await publishOrderCreated(orderData);
    
    console.log('✅ Publicación exitosa:', result);
    
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
    res.json({ 
      status: 'processing', 
      requestId,
      message: 'Estado de la orden en procesamiento'
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener estado' });
  }
};
