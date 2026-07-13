import { Request, Response, NextFunction } from 'express';
import { AuthenticateUser } from '../../../core/use-cases/AuthenticateUser';
import { RefreshToken } from '../../../core/use-cases/RefreshToken';
import jwt from 'jsonwebtoken';

export class AuthController {
  constructor(
    private authenticateUser: AuthenticateUser,
    private refreshToken: RefreshToken
  ) {}

  async login(req: Request, res: Response): Promise<Response> {
    try {
      console.log('📥 [AuthController] Login iniciado');
      console.log('📦 Body:', req.body);
      
      const { email, password } = req.body;
      
      if (!email || !password) {
        console.log('❌ Email o password faltante');
        return res.status(400).json({ error: 'Email y password son requeridos' });
      }
      
      console.log(`🔍 Buscando usuario: ${email}`);
      const result = await this.authenticateUser.execute(email, password);
      
      if (!result) {
        console.log('❌ Credenciales inválidas');
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }
      
      console.log('✅ Login exitoso para:', email);
      return res.json({
        status: 'ok',
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        expiresIn: result.expiresIn,
        user: result.user
      });
    } catch (error: any) {
      console.error('❌ Error en login:', error);
      console.error('📚 Stack:', error.stack);
      return res.status(500).json({ 
        error: 'Error interno del servidor',
        details: error.message 
      });
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
