import otpGenerator from 'otp-generator';
import { otpConfig } from '../config/otp';

// En memoria para pruebas (producción usar Redis o base de datos)
const otpStore = new Map<string, { otp: string; expiresAt: number; attempts: number }>();

export const otpService = {
  // Generar y almacenar OTP
  generateOTP(phoneNumber: string): string {
    const otp = otpGenerator.generate(otpConfig.otp.length, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    const expiresAt = Date.now() + otpConfig.otp.expiresIn * 1000;
    otpStore.set(phoneNumber, { otp, expiresAt, attempts: 0 });

    console.log(`📱 OTP generado para ${phoneNumber}: ${otp}`);
    return otp;
  },

  // Verificar OTP
  verifyOTP(phoneNumber: string, userOTP: string): boolean {
    const record = otpStore.get(phoneNumber);
    if (!record) {
      return false;
    }

    // Verificar expiración
    if (Date.now() > record.expiresAt) {
      otpStore.delete(phoneNumber);
      return false;
    }

    // Verificar intentos
    if (record.attempts >= otpConfig.otp.maxAttempts) {
      otpStore.delete(phoneNumber);
      return false;
    }

    record.attempts += 1;

    if (record.otp === userOTP) {
      otpStore.delete(phoneNumber);
      return true;
    }

    return false;
  },

  // Enviar OTP por SMS (mock para pruebas)
  async sendOTP(phoneNumber: string, otp: string): Promise<boolean> {
    try {
      // En desarrollo, solo mostrar en consola
      if (process.env.NODE_ENV === 'development') {
        console.log(`📱 SMS enviado a ${phoneNumber}: Código ${otp}`);
        return true;
      }

      // En producción, usar Twilio
      // const twilio = require('twilio');
      // const client = twilio(otpConfig.twilio.accountSid, otpConfig.twilio.authToken);
      // await client.messages.create({
      //   body: `Tu código de verificación ZENDA es: ${otp}`,
      //   to: phoneNumber,
      //   from: otpConfig.twilio.fromNumber,
      // });
      
      return true;
    } catch (error) {
      console.error('Error enviando SMS:', error);
      return false;
    }
  },

  // Iniciar proceso de verificación
  async initiateVerification(phoneNumber: string): Promise<{ success: boolean; message: string }> {
    try {
      const otp = this.generateOTP(phoneNumber);
      const sent = await this.sendOTP(phoneNumber, otp);
      
      if (sent) {
        return { success: true, message: 'Código enviado correctamente' };
      } else {
        return { success: false, message: 'Error al enviar el código' };
      }
    } catch (error) {
      return { success: false, message: 'Error en el proceso de verificación' };
    }
  },

  // Completar verificación
  async completeVerification(phoneNumber: string, otp: string): Promise<{ success: boolean; message: string }> {
    const verified = this.verifyOTP(phoneNumber, otp);
    
    if (verified) {
      return { success: true, message: 'Número verificado correctamente' };
    } else {
      return { success: false, message: 'Código inválido o expirado' };
    }
  },
};

export default otpService;
