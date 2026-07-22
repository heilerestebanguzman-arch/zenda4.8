import { Pool } from 'pg';

const pool = new Pool({
    user: 'zenda_admin',
    password: 'zenda_secure_pass_2026',
    host: 'localhost',
    port: 5432,
    database: 'zenda',
    ssl: false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});

pool.on('connect', () => {
    console.log('✅ PostgreSQL connected successfully (M4)');
});

pool.on('error', (err) => {
    console.error('❌ PostgreSQL connection error (M4):', err);
});

export default pool;