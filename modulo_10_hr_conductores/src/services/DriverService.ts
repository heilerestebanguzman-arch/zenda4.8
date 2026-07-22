import { pool } from '../config/database';
import { redisClient } from '../config/redis';

export const driverService = {
  // Obtener conductores con caché
  async getDrivers(tenantId: string) {
    const cacheKey = `drivers:list:${tenantId}`;

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
    console.log('📊 Ejecutando consulta SQL para conductores...');
    const result = await pool.query(
      `SELECT * FROM drivers WHERE tenant_id = $1`,
      [tenantId]
    );

    const data = result.rows;

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
  },

  // Registrar un nuevo conductor
  async register(driverData: any) {
    const { full_name, email, phone, identification_number, license_number, license_expiry_date, tenant_id = 'default' } = driverData;

    const result = await pool.query(
      `INSERT INTO drivers (full_name, email, phone, identification_number, license_number, license_expiry_date, tenant_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [full_name, email, phone, identification_number, license_number, license_expiry_date, tenant_id]
    );

    // Invalidar caché
    const cacheKey = `drivers:list:${tenant_id}`;
    try {
      if (redisClient.isReady) {
        await redisClient.del(cacheKey);
        console.log('🗑️ Cache invalidated:', cacheKey);
      }
    } catch (error) {
      console.warn('⚠️ Error invalidating cache:', error);
    }

    return result.rows[0];
  },

  // Obtener conductor por ID
  async getById(id: string) {
    const result = await pool.query(
      `SELECT * FROM drivers WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  // Verificar conductor
  async verify(id: string, status: string) {
    const result = await pool.query(
      `UPDATE drivers SET verification_status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );
    return result.rows[0] || null;
  },

  // Verificación facial
  async facialVerify(id: string, _selfie_photo: string) {
    // Simulación de verificación facial
    // En producción, aquí se integraría con un servicio de reconocimiento facial
    console.log('📸 Verificación facial para conductor:', id);
    console.log('📷 Selfie recibida (simulada)');

    const result = await pool.query(
      `UPDATE drivers SET facial_verified = true WHERE id = $1 RETURNING *`,
      [id]
    );
    return {
      verified: true,
      confidence: 95.5,
      driver: result.rows[0] || null
    };
  }
};
