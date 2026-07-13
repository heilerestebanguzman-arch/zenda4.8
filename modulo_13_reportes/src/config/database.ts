import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno desde la raíz
dotenv.config({ path: path.join(__dirname, '../../.env') });

console.log('📊 Conectando a PostgreSQL...');
console.log('   Host:', process.env.DB_HOST || 'localhost');
console.log('   Puerto:', process.env.DB_PORT || '5432');
console.log('   Usuario:', process.env.DB_USER || 'zenda_admin');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'zenda_admin',
  password: process.env.DB_PASSWORD || 'zenda_secure_pass_2026',
  database: process.env.DB_NAME || 'zenda',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('connect', () => {
  console.log('✅ PostgreSQL connected successfully');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL connection error:', err);
});

export { pool };
export default pool;
