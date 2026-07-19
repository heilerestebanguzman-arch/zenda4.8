import { Request, Response } from 'express';

export const routeController = {
  // Obtener todas las rutas
  async getRoutes(_req: Request, res: Response) {
    try {
      // Datos mock de rutas
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

      res.json({
        status: 'ok',
        data: mockRoutes
      });
    } catch (error: any) {
      console.error('❌ Error en getRoutes:', error.message);
      res.status(500).json({ error: 'Error al obtener rutas' });
    }
  },

  // Crear una nueva ruta
  async createRoute(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;

      res.status(201).json({
        status: 'ok',
        message: 'Ruta creada exitosamente',
        data: {
          ...req.body,
          id: 'route-' + Date.now(),
          created_by: userId,
          created_at: new Date().toISOString()
        }
      });
    } catch (error: any) {
      console.error('❌ Error en createRoute:', error.message);
      res.status(500).json({ error: 'Error al crear ruta' });
    }
  },

  // Obtener una ruta por ID
  async getRouteById(req: Request, res: Response) {
    try {
      const mockRoute = {
        id: req.params.id,
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

      res.json({
        status: 'ok',
        data: mockRoute
      });
    } catch (error: any) {
      console.error(`❌ Error en getRouteById (${req.params.id}):`, error.message);
      res.status(500).json({ error: 'Error al obtener la ruta' });
    }
  },

  // Actualizar una ruta
  async updateRoute(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;

      res.json({
        status: 'ok',
        message: 'Ruta actualizada exitosamente',
        data: {
          ...req.body,
          id: req.params.id,
          last_updated_by: userId,
          updated_at: new Date().toISOString()
        }
      });
    } catch (error: any) {
      console.error(`❌ Error en updateRoute (${req.params.id}):`, error.message);
      res.status(500).json({ error: 'Error al actualizar la ruta' });
    }
  },

  // Eliminar una ruta
  async deleteRoute(req: Request, res: Response) {
    try {
      res.status(204).send();
    } catch (error: any) {
      console.error(`❌ Error en deleteRoute (${req.params.id}):`, error.message);
      res.status(500).json({ error: 'Error al eliminar la ruta' });
    }
  }
};
