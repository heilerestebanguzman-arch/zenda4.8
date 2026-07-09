import { Request, Response } from 'express';
import { MFAService } from '../../../core/services/MFAService';

export class MFAController {
  async setup(req: Request, res: Response): Promise<Response> {
    try {
      const { email } = req.body;
      const { secret, otpauth_url } = MFAService.generateSecret(email);
      const qrCode = await MFAService.generateQRCode(otpauth_url);
      
      return res.json({
        secret,
        qrCode,
        message: 'Escanea el código QR con Google Authenticator o similar'
      });
    } catch (error) {
      return res.status(500).json({ error: 'Error al configurar MFA' });
    }
  }

  async verify(req: Request, res: Response): Promise<Response> {
    try {
      const { secret, token } = req.body;
      const isValid = MFAService.verifyToken(secret, token);
      
      return res.json({
        valid: isValid,
        message: isValid ? 'Código válido' : 'Código inválido'
      });
    } catch (error) {
      return res.status(500).json({ error: 'Error al verificar MFA' });
    }
  }
}
