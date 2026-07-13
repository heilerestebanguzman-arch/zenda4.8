import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'nuevo_jwt_secret_muy_largo_y_seguro_2026';

export const authenticateJWT = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ error: 'Token no proporcionado' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    console.log('🔑 [M13] Verificando token');
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('✅ [M13] Token verificado correctamente');
    
    // Guardar usuario en request
    (req as any).user = decoded;
    
    // Extraer tenant del header o usar 'default'
    const tenant = req.headers['x-tenant-id'] as string || 'default';
    (req as any).tenantId = tenant;
    console.log(`🏢 [M13] Tenant: ${tenant}`);
    
    next();
  } catch (error: any) {
    console.error('❌ [M13] Error:', error.message || 'Error desconocido');
    res.status(403).json({ error: 'Token inválido' });
  }
};
