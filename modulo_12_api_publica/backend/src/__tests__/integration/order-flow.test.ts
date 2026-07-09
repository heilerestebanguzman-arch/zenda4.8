import { describe, test, expect, afterAll } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app, pool, redis, getNatsConnection } from '../../main';

describe('Flujo de Orden (Integración)', () => {
  afterAll(async () => {
    try {
      await pool?.end();
      await redis?.quit();
      const nc = await getNatsConnection();
      nc?.close();
    } catch (error) {
      console.log('Error cerrando conexiones:', error);
    }
  });

  test('debe publicar evento en NATS con autenticación', async () => {
    const token = jwt.sign(
      { userId: 'test-user-id', email: 'test@zenda.com', role: 'admin' },
      process.env.JWT_SECRET || 'zenda_super_secret_jwt_key_2026'
    );

    const response = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        vehicle_id: '123e4567-e89b-12d3-a456-426614174000',
        type: 'PREVENTIVE',
        priority: 'HIGH',
        description: 'Cambio de aceite',
        scheduled_date: '2026-07-10T10:00:00Z'
      });

    expect(response.status).toBe(202);
    expect(response.body).toHaveProperty('request_id');
    expect(response.body).toHaveProperty('status', 'accepted');
  });

  test('debe rechazar token inválido', async () => {
    const response = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', 'Bearer token-invalido')
      .send({
        vehicle_id: '123e4567-e89b-12d3-a456-426614174000',
        type: 'PREVENTIVE',
        priority: 'HIGH',
        description: 'Cambio de aceite',
        scheduled_date: '2026-07-10T10:00:00Z'
      });

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty('error');
  });
});
