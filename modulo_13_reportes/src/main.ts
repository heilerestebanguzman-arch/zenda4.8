import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { pool } from './config/database';
import { redisClient } from './config/redis';
import reportRoutes from './controllers/reportController';

const app = express();
const PORT = process.env.REPORT_PORT || 8094;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/v1/reports', reportRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'M13-Reportes' });
});

app.listen(PORT, async () => {
  await pool.connect();
  await redisClient.connect();
  console.log(`🚀 M13-Reportes en http://localhost:${PORT}`);
});
