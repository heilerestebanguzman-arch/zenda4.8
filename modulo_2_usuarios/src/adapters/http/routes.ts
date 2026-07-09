import { Router } from 'express';
import { AuthController } from './controllers/AuthController';
import { UserController } from './controllers/UserController';
import { MFAController } from './controllers/MFAController';
import { loginRateLimiter } from '../../ports/http/middleware/rateLimit';

export const createRoutes = (
  authController: AuthController,
  userController: UserController,
  mfaController: MFAController
): Router => {
  const router = Router();

  // Auth routes con rate limiting
  router.post('/auth/login', loginRateLimiter, authController.login.bind(authController));
  router.post('/auth/refresh', authController.refresh.bind(authController));
  router.post('/auth/logout', authController.logout.bind(authController));

  // User routes
  router.get('/users', userController.getAll.bind(userController));
  router.get('/users/:id', userController.getById.bind(userController));
  router.post('/users', userController.create.bind(userController));
  router.put('/users/:id', userController.update.bind(userController));
  router.delete('/users/:id', userController.delete.bind(userController));

  // MFA routes
  router.post('/mfa/setup', mfaController.setup.bind(mfaController));
  router.post('/mfa/verify', mfaController.verify.bind(mfaController));

  return router;
};
