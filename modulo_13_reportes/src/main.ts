import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { Router } from 'express';
import { reportController } from './controllers/reportController';
import { pool } from './config/database';
import { redisClient } from './config/redis';

dotenv.config({ path: path.join(__dirname, '../../.env') });

console.log('🔑 [M13] JWT_SECRET cargado:', process.env.JWT_SECRET ? '✅ Sí' : '❌ No');

const app = express();
const PORT = process.env.REPORT_PORT || 8094;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Crear router de reportes - SOLO LOS MÉTODOS QUE EXISTEN
const reportRouter = Router();
reportRouter.get('/summary', reportController.getSummary);

app.use('/api/v1/reports', reportRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'M13-Reportes' });
});

app.listen(PORT, async () => {
  await pool.connect();
  await redisClient.connect();
  console.log(`🚀 M13-Reportes en http://localhost:${PORT}`);
});
