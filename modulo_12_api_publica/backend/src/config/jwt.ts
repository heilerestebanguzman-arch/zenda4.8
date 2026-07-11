import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import path from 'path';

// Cargar .env desde la raíz
dotenv.config({ path: path.join(__dirname, '../../../.env') });

// Usar el mismo secret que M2 y M13
const JWT_SECRET = process.env.JWT_SECRET || 'nuevo_jwt_secret_muy_largo_y_seguro_2026';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export const verifyToken = (token: string): JwtPayload | null => {
  try {
    console.log('🔑 [M12] Verificando token con JWT_SECRET');
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    console.error('❌ [M12] Error verificando token:', error);
    return null;
  }
};

export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
};
