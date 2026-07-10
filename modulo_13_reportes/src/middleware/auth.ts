import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authenticateJWT = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ error: 'Token no proporcionado' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    // ✅ Usar variable de entorno (no hardcode)
    const secret = process.env.JWT_SECRET || 'fallback_secret_only_for_dev';
    
    if (!process.env.JWT_SECRET) {
      console.warn('⚠️ JWT_SECRET no está definido en .env, usando fallback de desarrollo');
    }
    
    console.log('🔑 [M13] Verificando token');
    const decoded = jwt.verify(token, secret);
    console.log('✅ [M13] Token verificado correctamente');
    (req as any).user = decoded;
    next();
  } catch (error: any) {
    console.error('❌ [M13] Error:', error.message || 'Error desconocido');
    res.status(403).json({ error: 'Token inválido' });
  }
};
