import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

// Formato personalizado para auditoría
const auditFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss.SSS UTC',
  }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return JSON.stringify({
      timestamp,
      level,
      message,
      ...meta,
      environment: process.env.NODE_ENV || 'development',
      version: process.env.APP_VERSION || '4.8.0',
    });
  })
);

// Rotación de logs diaria
const auditTransport = new DailyRotateFile({
  filename: 'logs/audit-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '90d',
  format: auditFormat,
});

// Transporte para consola (desarrollo)
const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  ),
});

// Crear logger de auditoría
export const auditLogger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  defaultMeta: {
    service: 'zenda-api',
    app: 'ZENDA 4.8',
  },
  transports: [
    auditTransport,
    consoleTransport,
  ],
});

// Helper para auditoría de transacciones financieras
export const logFinancialAudit = (
  action: string,
  userId: string,
  data: any,
  ip?: string,
  userAgent?: string
) => {
  auditLogger.info(`[FINANCIAL] ${action}`, {
    userId,
    data,
    ip: ip || 'unknown',
    userAgent: userAgent || 'unknown',
    eventType: 'financial_transaction',
  });
};

// Helper para auditoría de seguridad
export const logSecurityAudit = (
  action: string,
  userId: string,
  data: any,
  ip?: string
) => {
  auditLogger.warn(`[SECURITY] ${action}`, {
    userId,
    data,
    ip: ip || 'unknown',
    eventType: 'security_event',
  });
};

// Helper para auditoría de documentos
export const logDocumentAudit = (
  action: string,
  userId: string,
  documentType: string,
  data: any
) => {
  auditLogger.info(`[DOCUMENT] ${action}`, {
    userId,
    documentType,
    data,
    eventType: 'document_validation',
  });
};

export default auditLogger;
