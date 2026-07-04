import { connect, StringCodec, NatsConnection } from 'nats';

export class NatsPublisher {
  private connection: NatsConnection | null = null;
  private sc = StringCodec();

  async connect(url: string): Promise<void> {
    try {
      this.connection = await connect({ servers: url });
      console.log('✅ Módulo 10: Conectado a NATS');
    } catch (error) {
      console.error('❌ Error conectando a NATS:', error);
    }
  }

  async publishDriverCreated(driver: any): Promise<void> {
    if (!this.connection) return;
    const event = {
      event_type: 'DRIVER_CREATED',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      payload: driver,
    };
    const data = this.sc.encode(JSON.stringify(event));
    this.connection.publish('driver.created', data);
    console.log(`📤 Evento publicado: DRIVER_CREATED - ${driver.id}`);
  }

  async publishDriverUpdated(driver: any): Promise<void> {
    if (!this.connection) return;
    const event = {
      event_type: 'DRIVER_UPDATED',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      payload: driver,
    };
    const data = this.sc.encode(JSON.stringify(event));
    this.connection.publish('driver.updated', data);
    console.log(`📤 Evento publicado: DRIVER_UPDATED - ${driver.id}`);
  }

  async close(): Promise<void> {
    if (this.connection) {
      await this.connection.close();
      console.log('🛑 Módulo 10: Desconectado de NATS');
    }
  }
}
