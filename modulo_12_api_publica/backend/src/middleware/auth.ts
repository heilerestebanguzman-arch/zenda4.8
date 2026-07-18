import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Cargar .env explícitamente
dotenv.config();

// Usar el secreto de .env o el fallback
const JWT_SECRET = process.env.JWT_SECRET || 'zenda_super_secret_jwt_key_2026';

console.log('🔑 [M12] JWT_SECRET cargado (primeros 10 chars):', JWT_SECRET.substring(0, 10) + '...');

export const authenticateJWT = (req: Request, res: Response, next: NextFunction): void => {
  console.log('🔐 [M12] Middleware authenticateJWT ejecutado');

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    console.log('❌ [M12] No se proporcionó token');
    res.status(401).json({ error: 'Token no proporcionado' });
    return;
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    console.log('❌ [M12] Token mal formado');
    res.status(401).json({ error: 'Token mal formado' });
    return;
  }

  console.log('🔍 [M12] Token recibido (primeros 20 chars):', token.substring(0, 20) + '...');

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    (req as any).user = decoded;
    console.log('✅ [M12] Token válido para usuario:', (req as any).user);
    next();
  } catch (error) {
    console.log('❌ [M12] Token inválido:', error);
    res.status(401).json({ error: 'Token inválido' });
    return;
  }
};
