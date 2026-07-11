import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../../../config/jwt';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
      };
    }
  }
}

export const authenticateJWT = (req: Request, res: Response, next: NextFunction): Response | void => {
  console.log('🔐 [M12] Middleware authenticateJWT ejecutado');
  
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);

  if (!payload) {
    return res.status(403).json({ error: 'Token inválido o expirado' });
  }

  req.user = {
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
  };

  console.log('✅ Usuario autenticado:', req.user.email, 'Rol:', req.user.role);
  next();
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): Response | void => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    if (!roles.includes(req.user.role)) {
      console.log('❌ Rol insuficiente:', req.user.role);
      return res.status(403).json({ error: 'Permisos insuficientes' });
    }

    next();
  };
};
