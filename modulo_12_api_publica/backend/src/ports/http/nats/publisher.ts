import { connect, StringCodec } from 'nats';
import { v4 as uuidv4 } from 'uuid';

const NATS_URL = process.env.NATS_URL || 'nats://localhost:4222';
const sc = StringCodec();

export const publishOrderCreated = async (orderData: any) => {
  try {
    const nc = await connect({ servers: NATS_URL });
    
    const request_id = uuidv4();
    const correlation_id = uuidv4();
    
    const event = {
      request_id,
      correlation_id,
      timestamp: new Date().toISOString(),
      source: 'api-publica',
      data: {
        order_id: uuidv4(),
        ...orderData,
        status: 'PENDING',
        created_at: new Date().toISOString()
      }
    };
    
    // Publicar el evento en el sujeto 'order.created'
    nc.publish('order.created', sc.encode(JSON.stringify(event)));
    console.log('📤 Evento publicado en NATS:', event.request_id);
    
    await nc.drain();
    nc.close();
    
    return { request_id, correlation_id };
  } catch (error) {
    console.error('❌ Error publicando en NATS:', error);
    throw error;
  }
};
