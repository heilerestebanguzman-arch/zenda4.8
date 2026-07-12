import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import driverRoutes from './routes/driverRoutes';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const app = express();
const PORT = process.env.HR_PORT || 8091;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Rutas
app.use('/api/v1/drivers', driverRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'M10-HR-Conductores' });
});

app.listen(PORT, () => {
  console.log(`🚀 M10 - HR Conductores corriendo en http://localhost:${PORT}`);
});
