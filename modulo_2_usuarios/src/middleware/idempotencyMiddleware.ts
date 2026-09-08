import { Request, Response, NextFunction } from 'express';

// Almacén de llaves de idempotencia (en producción usar Redis)
const idempotencyStore = new Map<string, { result: any; timestamp: number }>();

export const idempotencyMiddleware = (ttlSeconds: number = 300) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const idempotencyKey = req.headers['idempotency-key'] as string;

    if (!idempotencyKey) {
      return next();
    }

    const key = `${req.path}-${idempotencyKey}`;
    const existing = idempotencyStore.get(key);

    // Si la llave existe y no ha expirado, devolver el resultado anterior
    if (existing) {
      const isExpired = (Date.now() - existing.timestamp) > (ttlSeconds * 1000);
      
      if (!isExpired) {
        console.log(`🔄 Idempotencia: Devolviendo resultado previo para ${key}`);
        return res.status(200).json(existing.result);
      } else {
        // Eliminar llave expirada
        idempotencyStore.delete(key);
      }
    }

    // Guardar el resultado después de la ejecución
    const originalJson = res.json.bind(res);
    res.json = function(body) {
      idempotencyStore.set(key, {
        result: body,
        timestamp: Date.now(),
      });
      
      // Limpiar llaves viejas (cada 50 inserciones)
      if (idempotencyStore.size > 1000) {
        const now = Date.now();
        for (const [k, v] of idempotencyStore) {
          if ((now - v.timestamp) > (ttlSeconds * 1000)) {
            idempotencyStore.delete(k);
          }
        }
      }
      
      return originalJson(body);
    };

    next();
  };
};

// Limpiar llaves expiradas periódicamente
setInterval(() => {
  const now = Date.now();
  const ttlSeconds = 300;
  for (const [key, value] of idempotencyStore) {
    if ((now - value.timestamp) > (ttlSeconds * 1000)) {
      idempotencyStore.delete(key);
    }
  }
}, 60000); // Cada minuto

export default idempotencyMiddleware;
