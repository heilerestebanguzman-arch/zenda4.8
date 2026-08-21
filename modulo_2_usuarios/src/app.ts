import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import { Pool } from 'pg';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER || 'zenda_admin',
  password: process.env.DB_PASSWORD || 'zenda_secure_pass_2026',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'zenda',
});

// Health
app.get('/health', (_req, res) => {
  res.json({ status: 'OK', service: 'modulo_2_usuarios', timestamp: new Date().toISOString() });
});

// REGISTRO (con gen_random_uuid() para el ID)
app.post('/api/v1/auth/register', async (req, res) => {
  try {
    const { email, password, fullName, role } = req.body;

    if (!email || !password || !fullName || !role) {
      return res.status(400).json({ success: false, error: 'Faltan campos obligatorios' });
    }

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, error: 'El email ya está registrado' });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // ✅ USAR gen_random_uuid() de PostgreSQL
    const result = await pool.query(
      `INSERT INTO users (id, email, password_hash, full_name, role, tenant_id, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, 'default', NOW(), NOW())
       RETURNING id, email, full_name, role, created_at`,
      [email, passwordHash, fullName, role]
    );

    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error('❌ Error en registro:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// LOGIN
app.post('/api/v1/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email y password son requeridos' });
    }

    const result = await pool.query(
      'SELECT id, email, password_hash, full_name, role FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Credenciales inválidas' });
    }

    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return res.status(401).json({ success: false, error: 'Credenciales inválidas' });
    }

    const { password_hash, ...userWithoutPassword } = user;

    return res.json({
      status: 'ok',
      accessToken: 'fake-jwt-token-' + Date.now(),
      refreshToken: 'fake-refresh-token-' + Date.now(),
      user: userWithoutPassword,
    });
  } catch (error: any) {
    console.error('❌ Error en login:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// VERIFY TOKEN (para Auto-Login)
app.get('/api/v1/auth/verify', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, error: 'Token no proporcionado' });
    }
    const token = authHeader.split(' ')[1];
    if (token && token.startsWith('fake-jwt-token')) {
      return res.json({ success: true, valid: true });
    }
    return res.status(401).json({ success: false, error: 'Token inválido' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 M2 - Usuarios corriendo en http://localhost:${port}`);
  console.log(`📝 Health: http://localhost:${port}/health`);
});

export default app;
