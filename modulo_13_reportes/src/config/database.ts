import { Pool } from 'pg';

export const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'zenda_admin',
  password: process.env.DB_PASSWORD || 'zenda_secure_pass_2026',
  database: process.env.DB_NAME || 'zenda'
});
