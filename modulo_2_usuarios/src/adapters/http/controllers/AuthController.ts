import { Request, Response } from 'express';
import { AuthenticateUser } from '../../../core/use-cases/AuthenticateUser';
import { RefreshToken } from '../../../core/use-cases/RefreshToken';

export class AuthController {
  constructor(
    private authenticateUser: AuthenticateUser,
    private refreshToken: RefreshToken
  ) {}

  async login(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          status: 'error',
          code: 'MISSING_FIELDS',
          message: 'Email y password son requeridos'
        });
      }

      const result = await this.authenticateUser.execute(email, password);

      if (!result) {
        return res.status(401).json({
          status: 'error',
          code: 'INVALID_CREDENTIALS',
          message: 'Credenciales inválidas'
        });
      }

      return res.json({
        status: 'ok',
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        expiresIn: result.expiresIn,
        user: {
          id: result.user.id,
          email: result.user.email,
          fullName: result.user.fullName,
          role: result.user.role
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({
        status: 'error',
        code: 'INTERNAL_ERROR',
        message: 'Error interno del servidor'
      });
    }
  }

  async refresh(req: Request, res: Response): Promise<Response> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          status: 'error',
          code: 'MISSING_TOKEN',
          message: 'Refresh token es requerido'
        });
      }

      const result = await this.refreshToken.execute(refreshToken);

      if (!result) {
        return res.status(401).json({
          status: 'error',
          code: 'INVALID_REFRESH_TOKEN',
          message: 'Refresh token inválido o expirado'
        });
      }

      return res.json({
        status: 'ok',
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        expiresIn: result.expiresIn
      });
    } catch (error) {
      console.error('Refresh error:', error);
      return res.status(500).json({
        status: 'error',
        code: 'INTERNAL_ERROR',
        message: 'Error interno del servidor'
      });
    }
  }

  async logout(req: Request, res: Response): Promise<Response> {
    try {
      const { refreshToken } = req.body;

      if (refreshToken) {
        // Eliminar refresh token de Redis
        await this.refreshToken['tokenRepository'].delete(refreshToken);
      }

      return res.json({
        status: 'ok',
        message: 'Logout exitoso'
      });
    } catch (error) {
      console.error('Logout error:', error);
      return res.status(500).json({
        status: 'error',
        code: 'INTERNAL_ERROR',
        message: 'Error interno del servidor'
      });
    }
  }
}
