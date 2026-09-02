// Configuración OTP para verificación por SMS
export const otpConfig = {
  // Configuración de Twilio
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || '', // <--- Reemplazar con tu SID
    authToken: process.env.TWILIO_AUTH_TOKEN || '',   // <--- Reemplazar con tu Token
    serviceSid: process.env.TWILIO_SERVICE_SID || '', // <--- Reemplazar con tu Service SID
    fromNumber: process.env.TWILIO_FROM_NUMBER || '+1234567890', // <--- Reemplazar con tu número
  },
  
  // Configuración del OTP
  otp: {
    length: 6,
    expiresIn: 300, // 5 minutos en segundos
    maxAttempts: 3,
  },
};

export default otpConfig;
