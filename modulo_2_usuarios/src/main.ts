import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createRoutes } from './adapters/http/routes';
import { AuthController } from './adapters/http/controllers/AuthController';
import { UserController } from './adapters/http/controllers/UserController';
import { TokenService } from './adapters/jwt/TokenService';
import { TokenRepository } from './infrastructure/redis/TokenRepository';
import { AuthenticateUser } from './core/use-cases/AuthenticateUser';
import { RefreshToken } from './core/use-cases/RefreshToken';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Dependencias
const tokenService = new TokenService();
const tokenRepository = new TokenRepository();

// Repositorio de usuarios (mock para pruebas)
const userRepository = {
  async findByEmail(_email: string) {
    // TODO: Conectar con PostgreSQL
    return null;
  }
};

// Servicio de hash (mock para pruebas)
const hashService = {
  async compare(password: string, hash: string) {
    // TODO: Implementar bcrypt
    return password === hash;
  }
};

// Casos de uso
const authenticateUser = new AuthenticateUser(
  userRepository,
  hashService,
  tokenService,
  tokenRepository
);

const refreshToken = new RefreshToken(tokenService, tokenRepository);

// Controladores
const authController = new AuthController(authenticateUser, refreshToken);
const userController = new UserController();

// Rutas
const router = createRoutes(authController, userController);
app.use('/api/v1', router);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'modulo_2_usuarios' });
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`🚀 Módulo 2 - Usuarios corriendo en puerto ${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
});
