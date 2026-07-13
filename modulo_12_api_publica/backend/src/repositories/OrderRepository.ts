import { pool } from '../config/database';

export class OrderRepository {
  async getOrders(tenantId: string) {
    const result = await pool.query(
      'SELECT * FROM orders WHERE tenant_id = $1 ORDER BY created_at DESC',
      [tenantId]
    );
    return result.rows;
  }

  async createOrder(orderData: any, tenantId: string) {
    const result = await pool.query(
      `INSERT INTO orders (vehicle_id, type, priority, description, scheduled_date, tenant_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [orderData.vehicle_id, orderData.type, orderData.priority, orderData.description, orderData.scheduled_date, tenantId]
    );
    return result.rows[0];
  }
}
