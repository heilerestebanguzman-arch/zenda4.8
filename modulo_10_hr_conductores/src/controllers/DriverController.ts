import { Request, Response } from 'express';
import { driverService } from '../services/DriverService';

export class DriverController {
  // Usar driverService sin instanciar (como módulo)
  async register(req: Request, res: Response): Promise<Response> {
    try {
      const driverData = req.body;

      const requiredFields = ['full_name', 'email', 'phone', 'identification_number', 'license_number', 'license_expiry_date'];
      for (const field of requiredFields) {
        if (!driverData[field]) {
          return res.status(400).json({ error: `Campo requerido: ${field}` });
        }
      }

      const driver = await driverService.register(driverData);
      return res.status(201).json({
        status: 'ok',
        message: 'Conductor registrado exitosamente',
        data: driver
      });
    } catch (error: any) {
      console.error('❌ Error al registrar conductor:', error);
      return res.status(500).json({ error: error.message || 'Error interno del servidor' });
    }
  }

  async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const tenantId = req.headers['x-tenant-id'] as string || 'default';
      const drivers = await driverService.getDrivers(tenantId);
      return res.json({
        status: 'ok',
        data: drivers
      });
    } catch (error: any) {
      console.error('❌ Error en getAll:', error);
      return res.status(500).json({ error: 'Error al obtener conductores' });
    }
  }

  async getById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const driver = await driverService.getById(id);
      if (!driver) {
        return res.status(404).json({ error: 'Conductor no encontrado' });
      }
      return res.json({
        status: 'ok',
        data: driver
      });
    } catch (error) {
      console.error('❌ Error en getById:', error);
      return res.status(500).json({ error: 'Error al obtener conductor' });
    }
  }

  async verify(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const driver = await driverService.verify(id, status);
      return res.json({
        status: 'ok',
        message: 'Estado de verificación actualizado',
        data: driver
      });
    } catch (error: any) {
      console.error('❌ Error en verify:', error);
      return res.status(500).json({ error: error.message || 'Error al verificar conductor' });
    }
  }

  async facialVerify(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { selfie_photo } = req.body;

      if (!selfie_photo) {
        return res.status(400).json({ error: 'Selfie photo is required' });
      }

      const result = await driverService.facialVerify(id, selfie_photo);
      return res.json({
        status: 'ok',
        message: 'Verificación facial completada',
        data: result
      });
    } catch (error: any) {
      console.error('❌ Error en facialVerify:', error);
      return res.status(500).json({ error: error.message || 'Error en verificación facial' });
    }
  }
}
