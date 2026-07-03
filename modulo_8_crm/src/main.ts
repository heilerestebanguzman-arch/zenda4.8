import express from 'express';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import cors from 'cors';

import { NatsEventSubscriber } from './adapters/events/NatsEventSubscriber';
import { TicketService } from './core/services/TicketService';
import { PostgresTicketRepository } from './adapters/repositories/PostgresTicketRepository';

dotenv.config();

const app = express();
const port = process.env.PORT || 3002;

// 🔥 Configurar CORS para permitir peticiones desde el Dashboard
app.use(cors({
  origin: ['http://localhost:3003', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'zenda',
  user: process.env.DB_USER || 'zenda_admin',
  password: process.env.DB_PASSWORD || 'zenda_secure_pass_2026',
});

const ticketRepo = new PostgresTicketRepository(pool);
const ticketService = new TicketService(ticketRepo);

const natsUrl = process.env.NATS_URL || 'nats://localhost:4222';
const subscriber = new NatsEventSubscriber(natsUrl, ticketService);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'modulo_8_crm' });
});

app.get('/api/v1/tickets', async (_req, res) => {
  try {
    const tickets = await ticketRepo.findAll();
    res.json({ status: 'ok', tickets });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

app.get('/api/v1/tickets/status/:status', async (req, res) => {
  try {
    const tickets = await ticketRepo.findByStatus(req.params.status);
    res.json({ status: 'ok', tickets });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

app.get('/api/v1/tickets/severity/:severity', async (req, res) => {
  try {
    const tickets = await ticketRepo.findBySeverity(req.params.severity);
    res.json({ status: 'ok', tickets });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

app.get('/api/v1/tickets/critical/open', async (_req, res) => {
  try {
    const tickets = await ticketRepo.findCriticalOpen();
    res.json({ status: 'ok', tickets });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

app.listen(port, async () => {
  console.log(`🚀 Módulo 8 - CRM corriendo en puerto ${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
  console.log(`🔗 CORS permitido para: http://localhost:3003, http://localhost:5173`);

  try {
    await subscriber.connect();
    await subscriber.subscribeToIncidents();
  } catch (error) {
    console.error('❌ Error al conectar a NATS:', error);
  }
});

process.on('SIGINT', async () => {
  console.log('🛑 Apagando CRM...');
  await subscriber.disconnect();
  process.exit(0);
});
