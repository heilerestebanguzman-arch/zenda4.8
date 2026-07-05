import express from 'express';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import https from 'https';
import fs from 'fs';
import dotenv from 'dotenv';
import { pool, redis, getNatsConnection } from './config/database';
import router from './ports/http/routes';
import { errorHandler } from './ports/http/middleware';

dotenv.config();

const app = express();
const port = process.env.PORT || 8093;
const useHTTPS = process.env.USE_HTTPS === 'true';

// Middleware de seguridad
app.use(helmet());
app.use(compression({
  threshold: 1024,
  level: 6,
}));

// CORS configurado correctamente
app.use(cors({
  origin: ['https://dashboard.zenda.com', 'https://app.zenda.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

app.use(express.json());

// Rutas
app.use('/api/v1', router);
app.use(errorHandler);

// Iniciar servidor
if (useHTTPS) {
  try {
    const options = {
      key: fs.readFileSync('../../certs/key.pem'),
      cert: fs.readFileSync('../../certs/cert.pem'),
    };
    https.createServer(options, app).listen(port, () => {
      console.log(`🚀 API Pública ZENDA 4.8 running on https://localhost:${port}`);
      console.log(`📡 Health: https://localhost:${port}/api/v1/health`);
    });
  } catch (error) {
    console.error('❌ Error loading SSL certificates:', error);
    console.log('📌 Usando HTTP en su lugar');
    app.listen(port, () => {
      console.log(`🚀 API Pública ZENDA 4.8 running on http://localhost:${port}`);
      console.log(`📡 Health: http://localhost:${port}/api/v1/health`);
    });
  }
} else {
  app.listen(port, () => {
    console.log(`🚀 API Pública ZENDA 4.8 running on http://localhost:${port}`);
    console.log(`📡 Health: http://localhost:${port}/api/v1/health`);
  });
}

// Conectar a servicios
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
