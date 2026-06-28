import express from 'express';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import cors from 'cors';

import { PostgresUserRepository } from './adapters/repositories/PostgresUserRepository';
import { BcryptHashService } from './adapters/hash/BcryptHashService';
import { JwtTokenService } from './adapters/token/JwtTokenService';
import { RegisterUserUseCase } from './core/use-cases/RegisterUser';
import { AuthenticateUserUseCase } from './core/use-cases/AuthenticateUser';
import { AuthController } from './adapters/http/controllers/AuthController';

// Cargar variables de entorno
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Configuración de base de datos
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'zenda',
  user: process.env.DB_USER || 'zenda_admin',
  password: process.env.DB_PASSWORD || 'zenda_secure_pass_2026',
});

// Inicializar dependencias
const userRepo = new PostgresUserRepository(pool);
const hashService = new BcryptHashService();
const tokenService = new JwtTokenService(process.env.JWT_SECRET || 'secret');

// Casos de uso
const registerUC = new RegisterUserUseCase(userRepo, hashService);
const authUC = new AuthenticateUserUseCase(userRepo, hashService, tokenService);

// Controlador
const authController = new AuthController(registerUC, authUC);

// Rutas
app.post('/api/v1/auth/register', (req, res) => authController.register(req, res));
app.post('/api/v1/auth/login', (req, res) => authController.login(req, res));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'modulo_2_usuarios' });
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`🚀 Módulo 2 - Usuarios corriendo en puerto ${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
});
