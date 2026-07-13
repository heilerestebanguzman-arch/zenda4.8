import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import http from 'http';
import { connect } from 'nats';
import routes from './ports/http/routes';
import { identifyTenant } from './middleware/tenant';
import { setupWebSocket } from './websocket/server';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const app = express();
const PORT = process.env.PORT || 8093;
const NATS_URL = process.env.NATS_URL || 'nats://localhost:4222';

app.use(helmet());
app.use(cors());
app.use(express.json());

// Middleware tenant
app.use(identifyTenant);

// Rutas
app.use('/api/v1', routes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'M12-API-Publica', timestamp: new Date().toISOString() });
});

// Crear servidor HTTP
const server = http.createServer(app);

// Conectar a NATS y configurar WebSockets
(async () => {
  try {
    const nc = await connect({ servers: NATS_URL });
    console.log('✅ Conectado a NATS');

    // Configurar WebSockets
    setupWebSocket(server, nc);
    console.log('🔌 WebSocket server configurado');

    server.listen(PORT, () => {
      console.log(`🚀 M12 - API Pública corriendo en http://localhost:${PORT}`);
      console.log(`📝 Health: http://localhost:${PORT}/health`);
      console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error al conectar a NATS:', error);
    process.exit(1);
  }
})();
