import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import driverRoutes from './routes/driverRoutes';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const app = express();
const PORT = process.env.HR_PORT || 8091;

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Para fotos grandes

app.use('/api/v1/drivers', driverRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'M10-HR-Conductores' });
});

app.listen(PORT, () => {
  console.log(`🚀 M10 - HR Conductores corriendo en http://localhost:${PORT}`);
});
