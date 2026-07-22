import { Request, Response } from 'express';
import { redisClient } from '../config/redis';

export const routeController = {
  // Obtener todas las rutas (con caché)
  async getRoutes(req: Request, res: Response) {
    try {
      const tenantId = (req.headers['x-tenant-id'] as string) || 'default';
      const cacheKey = `routes:list:${tenantId}`;

      // 1. Verificar caché
      try {
        if (redisClient.isReady) {
          const cached = await redisClient.get(cacheKey);
          if (cached) {
            console.log('✅ Cache hit:', cacheKey);
            const data = JSON.parse(cached);
            return res.json({ status: 'ok', data });
          }
          console.log('⏳ Cache miss:', cacheKey);
        }
      } catch (error) {
        console.warn('⚠️ Error reading cache:', error);
      }

      // 2. Datos mock (o consulta a BD)
      console.log('📊 Ejecutando consulta para rutas...');
      const mockRoutes = [
        {
          id: 'route-001',
          name: 'Línea A - Zona Norte',
          description: 'Conexión Norte-Centro',
          color: '#3498db',
          status: 'ACTIVE',
          is_active_trip: true,
          stops: [
            { name: 'Parada 1', lat: -17.783, lng: -63.182 },
            { name: 'Parada 2', lat: -17.800, lng: -63.190 },
            { name: 'Parada 3', lat: -17.820, lng: -63.200 }
          ]
        },
        {
          id: 'route-002',
          name: 'Línea B - Zona Sur',
          description: 'Conexión Sur-Centro',
          color: '#2ecc71',
          status: 'ACTIVE',
          is_active_trip: false,
          stops: [
            { name: 'Parada 1', lat: -17.900, lng: -63.150 },
            { name: 'Parada 2', lat: -17.880, lng: -63.160 }
          ]
        }
      ];

      // 3. Guardar en caché (TTL: 5 minutos)
      try {
        if (redisClient.isReady) {
          await redisClient.set(cacheKey, JSON.stringify(mockRoutes), {
            EX: 300,
          });
          console.log('✅ Cache saved:', cacheKey);
        }
      } catch (error) {
        console.warn('⚠️ Error saving cache:', error);
      }

      return res.json({ status: 'ok', data: mockRoutes });
    } catch (error: any) {
      console.error('❌ Error en getRoutes:', error.message);
      return res.status(500).json({ error: 'Error al obtener rutas' });
    }
  },

  // Crear una nueva ruta
  async createRoute(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const tenantId = (req.headers['x-tenant-id'] as string) || 'default';

      const newRoute = {
        id: 'route-' + Date.now(),
        ...req.body,
        created_by: userId,
        tenant_id: tenantId,
        created_at: new Date().toISOString()
      };

      // Invalidar caché
      const cacheKey = `routes:list:${tenantId}`;
      try {
        if (redisClient.isReady) {
          await redisClient.del(cacheKey);
          console.log('🗑️ Cache invalidated:', cacheKey);
        }
      } catch (error) {
        console.warn('⚠️ Error invalidating cache:', error);
      }

      return res.status(201).json({
        status: 'ok',
        message: 'Ruta creada exitosamente',
        data: newRoute
      });
    } catch (error: any) {
      console.error('❌ Error en createRoute:', error.message);
      return res.status(500).json({ error: 'Error al crear ruta' });
    }
  },

  // Obtener una ruta por ID
  async getRouteById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const mockRoute = {
        id: id,
        name: 'Línea A - Zona Norte',
        description: 'Conexión Norte-Centro',
        color: '#3498db',
        status: 'ACTIVE',
        is_active_trip: true,
        stops: [
          { name: 'Parada 1', lat: -17.783, lng: -63.182 },
          { name: 'Parada 2', lat: -17.800, lng: -63.190 },
          { name: 'Parada 3', lat: -17.820, lng: -63.200 }
        ]
      };

      return res.json({
        status: 'ok',
        data: mockRoute
      });
    } catch (error: any) {
      console.error(`❌ Error en getRouteById (${req.params.id}):`, error.message);
      return res.status(500).json({ error: 'Error al obtener la ruta' });
    }
  },

  // Actualizar una ruta
  async updateRoute(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      const tenantId = (req.headers['x-tenant-id'] as string) || 'default';

      const updatedRoute = {
        id: id,
        ...req.body,
        last_updated_by: userId,
        updated_at: new Date().toISOString()
      };

      // Invalidar caché
      const cacheKey = `routes:list:${tenantId}`;
      try {
        if (redisClient.isReady) {
          await redisClient.del(cacheKey);
          console.log('🗑️ Cache invalidated:', cacheKey);
        }
      } catch (error) {
        console.warn('⚠️ Error invalidating cache:', error);
      }

      return res.json({
        status: 'ok',
        message: 'Ruta actualizada exitosamente',
        data: updatedRoute
      });
    } catch (error: any) {
      console.error(`❌ Error en updateRoute (${req.params.id}):`, error.message);
      return res.status(500).json({ error: 'Error al actualizar la ruta' });
    }
  },

  // Eliminar una ruta
  async deleteRoute(req: Request, res: Response) {
    try {
      const tenantId = (req.headers['x-tenant-id'] as string) || 'default';

      // Invalidar caché
      const cacheKey = `routes:list:${tenantId}`;
      try {
        if (redisClient.isReady) {
          await redisClient.del(cacheKey);
          console.log('🗑️ Cache invalidated:', cacheKey);
        }
      } catch (error) {
        console.warn('⚠️ Error invalidating cache:', error);
      }

      return res.status(204).send();
    } catch (error: any) {
      console.error('❌ Error en deleteRoute:', error.message);
      return res.status(500).json({ error: 'Error al eliminar la ruta' });
    }
  }
};
