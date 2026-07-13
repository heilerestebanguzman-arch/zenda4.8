import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { createRoutes } from './adapters/http/routes';
import { AuthController } from './adapters/http/controllers/AuthController';
import { UserController } from './adapters/http/controllers/UserController';
import { MFAController } from './adapters/http/controllers/MFAController';
import { ProfileController } from './adapters/http/controllers/ProfileController';
import { BcryptHashService } from './adapters/hash/BcryptHashService';
import { TokenService } from './adapters/jwt/TokenService';
import { TokenRepository } from './infrastructure/redis/TokenRepository';
import { UserRepository } from './adapters/database/UserRepository';
import { AuthenticateUser } from './core/use-cases/AuthenticateUser';
import { RefreshToken } from './core/use-cases/RefreshToken';
import { logger } from './infrastructure/logger';
import { seedAdmin } from './seed';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Repositorios
const userRepository = new UserRepository();
const tokenRepository = new TokenRepository();

// Servicios
const hashService = new BcryptHashService();
const tokenService = new TokenService();

// Casos de uso
const authenticateUser = new AuthenticateUser(
  userRepository,
  hashService,
  tokenService,
  tokenRepository
);

const refreshToken = new RefreshToken(
  tokenService,
  tokenRepository
);

// Controladores
const authController = new AuthController(authenticateUser, refreshToken);
const userController = new UserController();
const mfaController = new MFAController();
const profileController = new ProfileController();

// Rutas
app.use('/api/v1', createRoutes(authController, userController, mfaController, profileController));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'M2-Usuarios', timestamp: new Date().toISOString() });
});

app.listen(PORT, async () => {
  logger.info(`🚀 Servidor M2 (Usuarios) corriendo en http://localhost:${PORT}`);
  logger.info(`📝 Health check: http://localhost:${PORT}/health`);
  await seedAdmin();
});
