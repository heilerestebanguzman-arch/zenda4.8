import { Request, Response, NextFunction } from 'express';

export const identifyTenant = (req: Request, _res: Response, next: NextFunction) => {
  // Obtener tenant del header o subdominio
  const tenant = req.headers['x-tenant-id'] as string || 'default';

  console.log(`🏢 Tenant: ${tenant}`);

  (req as any).tenantId = tenant;
  next();
};
