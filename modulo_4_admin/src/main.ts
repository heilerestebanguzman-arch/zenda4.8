import express from 'express';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import cors from 'cors';

import { PostgresRouteRepository } from './adapters/repositories/PostgresRouteRepository';
import { PostgresStopRepository } from './adapters/repositories/PostgresStopRepository';
import { PostgresFareRepository } from './adapters/repositories/PostgresFareRepository';
import { RouteController } from './adapters/http/controllers/RouteController';
import { CreateRouteUseCase } from './core/use-cases/CreateRoute';
import { GetAllRoutesUseCase } from './core/use-cases/GetAllRoutes';
import { AssignFareToRouteUseCase } from './core/use-cases/AssignFareToRoute';
import { CalculateFareByDecree494UseCase } from './core/use-cases/CalculateFareByDecree494';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());

// ============================================
// CONEXIÓN A POSTGRESQL
// ============================================
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'zenda',
  user: process.env.DB_USER || 'zenda_admin',
  password: process.env.DB_PASSWORD || 'zenda_secure_pass_2026',
});

// ============================================
// REPOSITORIOS
// ============================================
const routeRepo = new PostgresRouteRepository(pool);
const stopRepo = new PostgresStopRepository(pool);
const fareRepo = new PostgresFareRepository(pool);

// ============================================
// CASOS DE USO
// ============================================
const createRouteUC = new CreateRouteUseCase(routeRepo, stopRepo);
const getAllRoutesUC = new GetAllRoutesUseCase(routeRepo);
const assignFareUC = new AssignFareToRouteUseCase(fareRepo, routeRepo);
const calculateFareUC = new CalculateFareByDecree494UseCase();

// ============================================
// CONTROLADORES
// ============================================
const routeController = new RouteController(
  createRouteUC,
  getAllRoutesUC,
  assignFareUC,
  calculateFareUC
);

// ============================================
// RUTAS HTTP
// ============================================
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'modulo_4_admin' });
});

app.post('/api/v1/routes', (req, res) => routeController.create(req, res));
app.get('/api/v1/routes', (req, res) => routeController.getAll(req, res));
app.post('/api/v1/fares', (req, res) => routeController.assignFare(req, res));
app.post('/api/v1/fares/calculate', (req, res) => routeController.calculateFare(req, res));

// ============================================
// INICIAR SERVIDOR
// ============================================
app.listen(port, () => {
  console.log(`🚀 Módulo 4 - Administración corriendo en puerto ${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
});
