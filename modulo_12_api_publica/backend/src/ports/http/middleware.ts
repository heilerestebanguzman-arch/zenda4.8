import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

// Rate Limiting
export const rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '60000'),
  max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    return req.ip || req.headers['x-forwarded-for'] as string || 'unknown';
  },
});

// API Key validation (simplificada)
export const validateApiKey = (req: Request, res: Response, next: NextFunction): Response | void => {
  const apiKey = req.headers['x-api-key'];
  // Aquí implementar validación real con Redis o base de datos
  if (!apiKey) {
    return res.status(401).json({ error: 'API Key required' });
  }
  // Si la API key es válida, continuar
  next();
};

// Error handler
export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction): Response => {
  console.error('Error:', err);
  return res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
};
