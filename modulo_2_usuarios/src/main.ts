import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import { createRoutes } from './adapters/http/routes';
import { PostgresUserRepository } from './adapters/repositories/PostgresUserRepository';
import { BcryptHashService } from './adapters/hash/BcryptHashService';
import { JwtTokenService } from './adapters/token/JwtTokenService';
import { TokenRepository } from './infrastructure/redis/TokenRepository';
import { AuthenticateUser } from './core/use-cases/AuthenticateUser';
import { RegisterUser } from './core/use-cases/RegisterUser';
import { RefreshToken } from './core/use-cases/RefreshToken';
import { AuthController } from './adapters/http/controllers/AuthController';
import { UserController } from './adapters/http/controllers/UserController';
import { MFAController } from './adapters/http/controllers/MFAController';
import { ProfileController } from './adapters/http/controllers/ProfileController';
import { RegisterUserController } from './adapters/http/controllers/RegisterUserController';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Base de datos
const pool = new Pool({
  user: process.env.DB_USER || 'zenda_admin',
  password: process.env.DB_PASSWORD || 'zenda_secure_pass_2026',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'zenda',
});

// Repositorios
const userRepository = new PostgresUserRepository(pool);
const tokenRepository = new TokenRepository();

// Servicios
const hashService = new BcryptHashService(10);
const tokenService = new JwtTokenService(
  process.env.JWT_SECRET || 'zenda_super_secret_jwt_key_2026',
  process.env.JWT_REFRESH_SECRET || 'zenda_super_secret_refresh_key_2026'
);

// ID Generator
const idGenerator = {
  generate: () => uuidv4(),
};

// Use Cases
const authenticateUser = new AuthenticateUser(
  userRepository,
  hashService,
  tokenService,
  tokenRepository
);

const registerUser = new RegisterUser(
  userRepository,
  hashService,
  idGenerator
);

const refreshToken = new RefreshToken(tokenRepository, tokenService);

// Controladores
const authController = new AuthController(authenticateUser, refreshToken);
const userController = new UserController(userRepository);
const mfaController = new MFAController();
const profileController = new ProfileController(userRepository);
const registerUserController = new RegisterUserController(registerUser);

// Rutas
app.use('/api/v1/auth', createRoutes(
  authController,
  userController,
  mfaController,
  profileController,
  registerUserController
));

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'modulo_2_usuarios', timestamp: new Date().toISOString() });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 M2 - Usuarios corriendo en http://localhost:${port}`);
  console.log(`📝 Health: http://localhost:${port}/health`);
});

export default app;
