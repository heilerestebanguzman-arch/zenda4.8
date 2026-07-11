import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Usar el mismo secret que M2 (fijo para evitar problemas de carga)
const JWT_SECRET = 'nuevo_jwt_secret_muy_largo_y_seguro_2026';

export const authenticateJWT = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ error: 'Token no proporcionado' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    console.log('🔑 [M13] Verificando token con secret fijo');
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('✅ [M13] Token verificado correctamente');
    (req as any).user = decoded;
    next();
  } catch (error: any) {
    console.error('❌ [M13] Error:', error.message || 'Error desconocido');
    res.status(403).json({ error: 'Token inválido' });
  }
};
