import { connect, StringCodec } from 'nats';
import { v4 as uuidv4 } from 'uuid';

const NATS_URL = process.env.NATS_URL || 'nats://localhost:4222';
const sc = StringCodec();

// ✅ Conexión persistente a NATS
let nc: any = null;
let connectionPromise: Promise<any> | null = null;

async function getConnection() {
  if (nc) return nc;
  
  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = connect({ servers: NATS_URL });
  nc = await connectionPromise;
  connectionPromise = null;
  
  console.log('📤 Conexión NATS establecida');
  return nc;
}

export const publishOrderCreated = async (orderData: any) => {
  try {
    const conn = await getConnection();
    
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
    
    conn.publish('order.created', sc.encode(JSON.stringify(event)));
    
    return { request_id, correlation_id };
  } catch (error) {
    console.error('❌ Error publicando en NATS:', error);
    throw error;
  }
};
