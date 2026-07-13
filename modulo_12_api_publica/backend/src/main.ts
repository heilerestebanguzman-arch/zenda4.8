import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import routes from './ports/http/routes';
import { identifyTenant } from './middleware/tenant';

// Cargar .env
dotenv.config({ path: path.join(__dirname, '../../.env') });

console.log('🚀 [M12] Iniciando servidor...');

const app = express();
const PORT = process.env.PORT || 8093;

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

// ✅ Middleware para identificar tenant
app.use(identifyTenant);

// Rutas
app.use('/api/v1', routes);

// Health check
app.get('/health', (_req, res) => {
  console.log('📊 [M12] Health check llamado');
  res.json({ status: 'ok', service: 'M12-API-Publica', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 M12 - API Pública corriendo en http://localhost:${PORT}`);
  console.log(`📝 Health: http://localhost:${PORT}/health`);
});
