import { Pool } from 'pg';
import { createClient } from 'redis';
import { connect } from 'nats';
import dotenv from 'dotenv';

dotenv.config();

// PostgreSQL
export const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'zenda_admin',
  password: process.env.DB_PASSWORD || 'zenda_secure_pass_2026',
  database: process.env.DB_NAME || 'zenda',
});

// Redis
export const redis = createClient({
  url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || '6379'}`,
});

redis.on('error', (err) => console.error('Redis Client Error', err));

// NATS
let natsConnection: any = null;

export const getNatsConnection = async () => {
  if (!natsConnection) {
    natsConnection = await connect({
      servers: process.env.NATS_URL || 'nats://localhost:4222',
    });
    console.log('✅ Connected to NATS');
  }
  return natsConnection;
};
