import { pool } from '../config/database';

export class ReportRepository {
  async getSummary(tenantId: string) {
    try {
      console.log(`📊 [Repository] getSummary para tenant: ${tenantId}`);
      
      const query = `
        SELECT 
          COUNT(*) as total_orders,
          SUM(CASE WHEN o.status = 'PENDING' THEN 1 ELSE 0 END) as pending_orders,
          SUM(CASE WHEN o.status = 'IN_PROGRESS' THEN 1 ELSE 0 END) as in_progress_orders,
          SUM(CASE WHEN o.status = 'COMPLETED' THEN 1 ELSE 0 END) as completed_orders,
          COALESCE(SUM(r.amount), 0) as total_revenue
        FROM orders o
        LEFT JOIN revenue_events r ON r.order_id = o.id
        WHERE o.tenant_id = $1
      `;
      
      console.log('📝 Query:', query);
      console.log('📝 TenantId:', tenantId);
      
      const result = await pool.query(query, [tenantId]);
      console.log('✅ Resultado:', result.rows[0]);
      
      const row = result.rows[0];
      return {
        total_orders: parseInt(row.total_orders) || 0,
        pending_orders: parseInt(row.pending_orders) || 0,
        in_progress_orders: parseInt(row.in_progress_orders) || 0,
        completed_orders: parseInt(row.completed_orders) || 0,
        total_revenue: parseFloat(row.total_revenue) || 0
      };
    } catch (error) {
      console.error('❌ Error en getSummary:', error);
      throw error;
    }
  }

  async getOrdersByStatus(tenantId: string) {
    try {
      const result = await pool.query(`
        SELECT 
          o.status,
          COUNT(*) as count
        FROM orders o
        WHERE o.tenant_id = $1
        GROUP BY o.status
      `, [tenantId]);
      return result.rows;
    } catch (error) {
      console.error('❌ Error en getOrdersByStatus:', error);
      throw error;
    }
  }

  async getTopDrivers(tenantId: string, limit: number = 5) {
    try {
      const result = await pool.query(`
        SELECT 
          d.full_name,
          d.email,
          COUNT(o.id) as total_orders,
          COALESCE(SUM(r.amount), 0) as total_revenue
        FROM drivers d
        LEFT JOIN orders o ON o.user_id = d.id
        LEFT JOIN revenue_events r ON r.order_id = o.id
        WHERE d.tenant_id = $1
        GROUP BY d.id, d.full_name, d.email
        ORDER BY total_orders DESC
        LIMIT $2
      `, [tenantId, limit]);
      return result.rows;
    } catch (error) {
      console.error('❌ Error en getTopDrivers:', error);
      throw error;
    }
  }

  async getMonthlyRevenue(tenantId: string, months: number = 6) {
    try {
      const result = await pool.query(`
        SELECT 
          DATE_TRUNC('month', COALESCE(r.recorded_at, o.created_at)) as month,
          COUNT(o.id) as total_orders,
          COALESCE(SUM(r.amount), 0) as revenue
        FROM orders o
        LEFT JOIN revenue_events r ON r.order_id = o.id
        WHERE o.tenant_id = $1
          AND o.created_at >= NOW() - INTERVAL '${months} months'
        GROUP BY DATE_TRUNC('month', COALESCE(r.recorded_at, o.created_at))
        ORDER BY month DESC
      `, [tenantId]);
      return result.rows;
    } catch (error) {
      console.error('❌ Error en getMonthlyRevenue:', error);
      throw error;
    }
  }

  async getMTTR(tenantId: string) {
    try {
      const result = await pool.query(`
        SELECT 
          COALESCE(AVG(EXTRACT(EPOCH FROM (o.completed_at - o.created_at))), 0) as avg_seconds
        FROM orders o
        WHERE o.tenant_id = $1
          AND o.status = 'COMPLETED'
          AND o.completed_at IS NOT NULL
      `, [tenantId]);
      return result.rows[0] || { avg_seconds: 0 };
    } catch (error) {
      console.error('❌ Error en getMTTR:', error);
      throw error;
    }
  }
}
