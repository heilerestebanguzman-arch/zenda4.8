import { Request, Response, NextFunction } from 'express';
import { AuthenticateUser } from '../../../core/use-cases/AuthenticateUser';
import { RefreshToken } from '../../../core/use-cases/RefreshToken';
import jwt from 'jsonwebtoken';

// Simulación de almacenamiento de 2FA (en producción usar PostgreSQL)
const mfaStore = new Map<string, { secret: string, enabled: boolean }>();

export class AuthController {
  constructor(
    private authenticateUser: AuthenticateUser,
    private refreshToken: RefreshToken
  ) {}

  async login(req: Request, res: Response): Promise<Response> {
    try {
      console.log('📥 [AuthController] Login iniciado');
      const { email, password, mfaCode } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email y password son requeridos' });
      }

      // 1. Autenticar usuario
      const result = await this.authenticateUser.execute(email, password);
      if (!result) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      // 2. Verificar 2FA si está activado
      const mfaData = mfaStore.get(email);
      if (mfaData?.enabled) {
        console.log(`🔐 [Auth] 2FA activado para: ${email}`);

        if (!mfaCode) {
          return res.status(401).json({
            error: 'Código 2FA requerido',
            requiresMFA: true,
            message: 'Ingresa el código de autenticación de dos factores'
          });
        }

        // Verificar código 2FA
        const speakeasy = require('speakeasy');
        const isValid = speakeasy.totp.verify({
          secret: mfaData.secret,
          encoding: 'base32',
          token: mfaCode,
          window: 1,
        });

        if (!isValid) {
          return res.status(401).json({ error: 'Código 2FA inválido' });
        }

        console.log(`✅ [Auth] 2FA verificado para: ${email}`);
      }

      // 3. Generar tokens
      return res.json({
        status: 'ok',
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        expiresIn: result.expiresIn,
        user: result.user,
        mfaEnabled: mfaData?.enabled || false
      });
    } catch (error) {
      console.error('❌ Error en login:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  async refresh(req: Request, res: Response): Promise<Response> {
    try {
      const { refreshToken } = req.body;
      const result = await this.refreshToken.execute(refreshToken);
      if (!result) {
        return res.status(401).json({ error: 'Refresh token inválido' });
      }
      return res.json({
        status: 'ok',
        accessToken: result.accessToken,
        refreshToken: result.refreshToken
      });
    } catch (error) {
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  async logout(req: Request, res: Response): Promise<Response> {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (token) {
        // TODO: Implementar blacklist de tokens
      }
      return res.json({ status: 'ok', message: 'Sesión cerrada' });
    } catch (error) {
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  authenticate(req: Request, res: Response, next: NextFunction): void {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        res.status(401).json({ error: 'Token no proporcionado' });
        return;
      }
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'zenda_super_secret_jwt_key_2026');
      (req as any).user = decoded;
      next();
    } catch (error) {
      res.status(403).json({ error: 'Token inválido' });
    }
  }
}
