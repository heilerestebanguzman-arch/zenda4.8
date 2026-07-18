import { Request, Response } from 'express';
import { TwoFactorAuthService } from '../../../core/services/TwoFactorAuthService';

// Simulación de almacenamiento de secretos (en producción usar PostgreSQL)
const mfaStore = new Map<string, { secret: string, enabled: boolean }>();

export class MFAController {
  // 1. Configurar 2FA
  async setup(req: Request, res: Response): Promise<Response> {
    try {
      const user = (req as any).user;
      const email = user?.email || req.body.email;

      if (!email) {
        return res.status(400).json({ error: 'Email es requerido' });
      }

      console.log(`🔐 [MFA] Configurando 2FA para: ${email}`);

      const { secret, qrCode, otpauthUrl } = await TwoFactorAuthService.generateSecret(email);
      const recoveryCodes = TwoFactorAuthService.generateRecoveryCodes();

      // Guardar secret temporalmente
      mfaStore.set(email, { secret, enabled: false });

      return res.json({
        status: 'ok',
        data: {
          secret,
          qrCode,
          otpauthUrl,
          recoveryCodes,
          message: 'Escanea el código QR con Google Authenticator o Authy'
        }
      });
    } catch (error) {
      console.error('❌ Error en setup 2FA:', error);
      return res.status(500).json({ error: 'Error al configurar 2FA' });
    }
  }

  // 2. Verificar y activar 2FA
  async verify(req: Request, res: Response): Promise<Response> {
    try {
      const { email, secret, token } = req.body;

      if (!email || !secret || !token) {
        return res.status(400).json({ error: 'Email, secret y token son requeridos' });
      }

      console.log(`🔐 [MFA] Verificando código para: ${email}`);

      const isValid = TwoFactorAuthService.verifyToken(secret, token);

      if (isValid) {
        // Activar 2FA para el usuario
        mfaStore.set(email, { secret, enabled: true });
        console.log(`✅ [MFA] 2FA activado para: ${email}`);
      }

      return res.json({
        status: 'ok',
        data: {
          valid: isValid,
          enabled: isValid,
          message: isValid ? '2FA activado exitosamente' : 'Código inválido'
        }
      });
    } catch (error) {
      console.error('❌ Error en verify 2FA:', error);
      return res.status(500).json({ error: 'Error al verificar 2FA' });
    }
  }

  // 3. Verificar código 2FA durante el login
  async verifyLogin(req: Request, res: Response): Promise<Response> {
    try {
      const { email, token } = req.body;

      if (!email || !token) {
        return res.status(400).json({ error: 'Email y token son requeridos' });
      }

      const mfaData = mfaStore.get(email);
      if (!mfaData || !mfaData.enabled) {
        return res.status(400).json({ error: '2FA no está activado para este usuario' });
      }

      const isValid = TwoFactorAuthService.verifyToken(mfaData.secret, token);

      return res.json({
        status: 'ok',
        data: {
          valid: isValid,
          message: isValid ? 'Código válido' : 'Código inválido'
        }
      });
    } catch (error) {
      console.error('❌ Error en verifyLogin 2FA:', error);
      return res.status(500).json({ error: 'Error al verificar 2FA' });
    }
  }

  // 4. Deshabilitar 2FA
  async disable(req: Request, res: Response): Promise<Response> {
    try {
      const user = (req as any).user;
      const email = user?.email;

      if (!email) {
        return res.status(400).json({ error: 'Email es requerido' });
      }

      mfaStore.delete(email);
      console.log(`🔓 [MFA] 2FA desactivado para: ${email}`);

      return res.json({
        status: 'ok',
        message: '2FA deshabilitado exitosamente'
      });
    } catch (error) {
      console.error('❌ Error en disable 2FA:', error);
      return res.status(500).json({ error: 'Error al deshabilitar 2FA' });
    }
  }

  // 5. Verificar estado de 2FA
  async status(req: Request, res: Response): Promise<Response> {
    try {
      const user = (req as any).user;
      const email = user?.email;

      if (!email) {
        return res.status(400).json({ error: 'Email es requerido' });
      }

      const mfaData = mfaStore.get(email);
      const enabled = mfaData?.enabled || false;

      return res.json({
        status: 'ok',
        data: {
          enabled,
          message: enabled ? '2FA activado' : '2FA no activado'
        }
      });
    } catch (error) {
      console.error('❌ Error en status 2FA:', error);
      return res.status(500).json({ error: 'Error al obtener estado de 2FA' });
    }
  }
}
