import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { PostgresDriverRepository, PostgresContractRepository, PostgresEvaluationRepository } from './infrastructure/postgres/repository';
import { NatsPublisher } from './infrastructure/nats/publisher';
import { CreateDriverUseCase } from './usecases/create_driver';
import { ListDriversUseCase } from './usecases/list_drivers';
import { UpdateDriverUseCase } from './usecases/update_driver';
import { AssignBusUseCase } from './usecases/assign_bus';
import { Handlers } from './ports/http/handlers';
import { authenticate, adminOnly } from './middleware/auth';

dotenv.config();

const app = express();
const port = process.env.PORT || 8091;

app.use(cors({
  origin: ['http://localhost:3003', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// ============================================
// INICIALIZAR REPOSITORIOS
// ============================================
const driverRepo = new PostgresDriverRepository();
const contractRepo = new PostgresContractRepository();
const evaluationRepo = new PostgresEvaluationRepository();

// ============================================
// CONECTAR A NATS
// ============================================
const natsUrl = process.env.NATS_URL || 'nats://localhost:4222';
const natsPublisher = new NatsPublisher();
natsPublisher.connect(natsUrl);

// ============================================
// INICIALIZAR USECASES
// ============================================
const createDriverUC = new CreateDriverUseCase(driverRepo, natsPublisher);
const listDriversUC = new ListDriversUseCase(driverRepo);
const updateDriverUC = new UpdateDriverUseCase(driverRepo, natsPublisher);
const assignBusUC = new AssignBusUseCase(driverRepo, natsPublisher);

// ============================================
// INICIALIZAR HANDLERS
// ============================================
const handlers = new Handlers(
  createDriverUC,
  listDriversUC,
  updateDriverUC,
  assignBusUC
);

// ============================================
// RUTAS
// ============================================
// Públicas
app.get('/health', handlers.healthCheck);

// Protegidas
app.post('/api/v1/drivers', authenticate, adminOnly, handlers.createDriver);
app.get('/api/v1/drivers', authenticate, handlers.listDrivers);
app.put('/api/v1/drivers/:id', authenticate, adminOnly, handlers.updateDriver);
app.post('/api/v1/drivers/:driverId/assign-bus', authenticate, adminOnly, handlers.assignBus);

// ============================================
// INICIAR SERVIDOR
// ============================================
app.listen(port, () => {
  console.log(`🚀 Módulo 10 - HR Conductores corriendo en puerto ${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
  console.log(`🔐 Autenticación JWT activada`);
  console.log(`👑 Rutas ADMIN protegidas`);
});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================
process.on('SIGINT', async () => {
  console.log('🛑 Apagando HR Conductores...');
  await natsPublisher.close();
  process.exit(0);
});
