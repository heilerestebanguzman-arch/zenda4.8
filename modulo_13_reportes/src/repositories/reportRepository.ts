import { pool } from '../config/database';

export class ReportRepository {
  async getDashboard() {
    const result = await pool.query(`
      SELECT 
        COALESCE(SUM(total_revenue), 0) as total_revenue,
        COALESCE(SUM(total_orders), 0) as total_orders,
        COALESCE(AVG(avg_order_value), 0) as avg_order_value
      FROM revenue_daily_summary
      WHERE date >= NOW() - INTERVAL '30 days'
    `);
    return result.rows[0];
  }

  async getTrend(days: number = 30) {
    const result = await pool.query(`
      SELECT date, total_revenue, total_orders
      FROM revenue_daily_summary
      WHERE date >= NOW() - INTERVAL '${days} days'
      ORDER BY date ASC
    `);
    return result.rows;
  }
}
