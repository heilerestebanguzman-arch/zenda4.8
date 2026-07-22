import { pool } from '../config/database';
import { redisClient } from '../config/redis';

export const reportService = {
  async getSummary(tenantId: string) {
    const cacheKey = `reports:summary:${tenantId}`;

    // 1. Verificar caché
    try {
      if (redisClient.isReady) {
        const cached = await redisClient.get(cacheKey);
        if (cached) {
          console.log('✅ Cache hit:', cacheKey);
          return JSON.parse(cached);
        }
        console.log('⏳ Cache miss:', cacheKey);
      }
    } catch (error) {
      console.warn('⚠️ Error reading cache:', error);
    }

    // 2. Consultar base de datos
    console.log('📊 Ejecutando consulta SQL...');
    const result = await pool.query(
      `SELECT
        COUNT(*)::int as total_orders,
        SUM(CASE WHEN o.status = 'PENDING' THEN 1 ELSE 0 END)::int as pending_orders,
        SUM(CASE WHEN o.status = 'IN_PROGRESS' THEN 1 ELSE 0 END)::int as in_progress_orders,
        SUM(CASE WHEN o.status = 'COMPLETED' THEN 1 ELSE 0 END)::int as completed_orders,
        COALESCE(SUM(r.amount), 0)::float as total_revenue
      FROM orders o
      LEFT JOIN revenue_events r ON r.order_id = o.id
      WHERE o.tenant_id = $1`,
      [tenantId]
    );

    const data = result.rows[0] || {
      total_orders: 0,
      pending_orders: 0,
      in_progress_orders: 0,
      completed_orders: 0,
      total_revenue: 0
    };

    // 3. Guardar en caché (TTL: 5 minutos)
    try {
      if (redisClient.isReady) {
        await redisClient.set(cacheKey, JSON.stringify(data), {
          EX: 300,
        });
        console.log('✅ Cache saved:', cacheKey);
      }
    } catch (error) {
      console.warn('⚠️ Error saving cache:', error);
    }

    return data;
  }
};
