import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

export class TwoFactorAuthService {
  // 1. Generar secreto y QR
  static async generateSecret(email: string) {
    const secret = speakeasy.generateSecret({
      name: `ZENDA 4.8 (${email})`,
      length: 20,
    });

    const otpauthUrl = secret.otpauth_url || '';
    const qrCode = await QRCode.toDataURL(otpauthUrl);

    return {
      secret: secret.base32,
      otpauthUrl,
      qrCode,
    };
  }

  // 2. Verificar código TOTP
  static verifyToken(secret: string, token: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 1,
    });
  }

  // 3. Generar códigos de recuperación
  static generateRecoveryCodes(count: number = 10): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      codes.push(Math.random().toString(36).substring(2, 10).toUpperCase());
    }
    return codes;
  }
}
