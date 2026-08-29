const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'zenda_admin',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'zenda',
  password: process.env.DB_PASSWORD || 'zenda_secure_pass_2026',
  port: process.env.DB_PORT || 5432,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
  console.log('✅ Conectado a PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Error en PostgreSQL:', err);
});

module.exports = pool;
