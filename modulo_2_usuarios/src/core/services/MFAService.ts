import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

export class MFAService {
  static generateSecret(email: string): { secret: string; otpauth_url: string } {
    const secret = speakeasy.generateSecret({
      name: `ZENDA 4.8 (${email})`
    });
    return {
      secret: secret.base32,
      otpauth_url: secret.otpauth_url || ''
    };
  }

  static async generateQRCode(otpauth_url: string): Promise<string> {
    return QRCode.toDataURL(otpauth_url);
  }

  static verifyToken(secret: string, token: string): boolean {
    return speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 1
    });
  }
}
