import { Request, Response } from 'express';
import { DriverService } from '../services/DriverService';

export class DriverController {
  private driverService: DriverService;

  constructor() {
    this.driverService = new DriverService();
  }

  async register(req: Request, res: Response): Promise<Response> {
    try {
      const driverData = req.body;
      
      const requiredFields = ['full_name', 'email', 'phone', 'identification_number', 'license_number', 'license_expiry_date'];
      for (const field of requiredFields) {
        if (!driverData[field]) {
          return res.status(400).json({ error: `Campo requerido: ${field}` });
        }
      }

      const driver = await this.driverService.register(driverData);
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

  async getAll(_req: Request, res: Response): Promise<Response> {
    try {
      const drivers = await this.driverService.getAll();
      return res.json({
        status: 'ok',
        data: drivers
      });
    } catch (error: any) {
      return res.status(500).json({ error: 'Error al obtener conductores' });
    }
  }

  async getById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const driver = await this.driverService.getById(id);
      if (!driver) {
        return res.status(404).json({ error: 'Conductor no encontrado' });
      }
      return res.json({
        status: 'ok',
        data: driver
      });
    } catch (error) {
      return res.status(500).json({ error: 'Error al obtener conductor' });
    }
  }

  async verify(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const driver = await this.driverService.verify(id, status);
      return res.json({
        status: 'ok',
        message: 'Estado de verificación actualizado',
        data: driver
      });
    } catch (error: any) {
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

      const result = await this.driverService.facialVerify(id, selfie_photo);
      return res.json({
        status: 'ok',
        message: 'Verificación facial completada',
        data: result
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Error en verificación facial' });
    }
  }
}
