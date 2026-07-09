import express from 'express';
import https from 'https';
import cors from 'cors';
import helmet from 'helmet';
import { httpsOptions } from './config/https';
import routes from './ports/http/routes';
import { setupSwagger } from './config/swagger';

const app = express();
const PORT = process.env.PORT || 8093;

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

// Swagger
setupSwagger(app);

// Rutas
app.use('/api/v1', routes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'M12-API-Publica', timestamp: new Date().toISOString() });
});

// Iniciar servidor HTTPS
const server = https.createServer(httpsOptions, app);

server.listen(PORT, () => {
  console.log(`🔒 Servidor M12 (API Pública) corriendo en https://localhost:${PORT}`);
  console.log(`📝 Swagger: https://localhost:${PORT}/api/docs`);
  console.log(`📝 Health: https://localhost:${PORT}/health`);
});
