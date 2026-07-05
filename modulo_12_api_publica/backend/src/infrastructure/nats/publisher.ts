import { getNatsConnection } from '../../config/database';

export class NatsPublisher {
  async publish(subject: string, data: any): Promise<void> {
    try {
      const nc = await getNatsConnection();
      const payload = JSON.stringify(data);
      nc.publish(subject, payload);
      console.log(`📡 Event published to ${subject}`);
    } catch (error) {
      console.error(`❌ Error publishing to ${subject}:`, error);
      throw error;
    }
  }

  async publishOrderCreated(orderData: any): Promise<void> {
    await this.publish('order.created', {
      ...orderData,
      timestamp: new Date().toISOString(),
    });
  }

  async publishPaymentProcessed(paymentData: any): Promise<void> {
    await this.publish('payment.processed', {
      ...paymentData,
      timestamp: new Date().toISOString(),
    });
  }
}
