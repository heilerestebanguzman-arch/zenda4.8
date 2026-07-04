import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool, redis, getNatsConnection } from './config/database';
import router from './ports/http/routes';
import { errorHandler } from './ports/http/middleware';

dotenv.config();

const app = express();
const port = process.env.PORT || 8093;

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/v1', router);

// Error handler
app.use(errorHandler);

// Iniciar servidor
app.listen(port, () => {
  console.log(`🚀 API Pública ZENDA 4.8 running on port ${port}`);
  console.log(`📡 Health: http://localhost:${port}/api/v1/health`);
});

// Conectar a servicios en segundo plano (sin bloquear)
(async () => {
  try {
    await pool.connect();
    console.log('✅ Connected to PostgreSQL');
  } catch (error: any) {
    console.error('❌ PostgreSQL connection error:', error.message);
  }

  try {
    await redis.connect();
    console.log('✅ Connected to Redis');
  } catch (error: any) {
    console.error('❌ Redis connection error:', error.message);
  }

  try {
    await getNatsConnection();
    console.log('✅ Connected to NATS');
  } catch (error: any) {
    console.error('❌ NATS connection error:', error.message);
  }
})();
