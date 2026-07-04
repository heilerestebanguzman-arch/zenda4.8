import { Request, Response } from 'express';
import { CreateDriverUseCase } from '../../usecases/create_driver';
import { ListDriversUseCase } from '../../usecases/list_drivers';
import { UpdateDriverUseCase } from '../../usecases/update_driver';
import { AssignBusUseCase } from '../../usecases/assign_bus';

export class Handlers {
  constructor(
    private createDriverUC: CreateDriverUseCase,
    private listDriversUC: ListDriversUseCase,
    private updateDriverUC: UpdateDriverUseCase,
    private assignBusUC: AssignBusUseCase
  ) {}

  healthCheck = (_req: Request, res: Response): void => {
    res.json({
      status: 'ok',
      service: 'modulo_10_hr_conductores',
      timestamp: new Date().toISOString(),
    });
  };

  createDriver = async (req: Request, res: Response): Promise<void> => {
    try {
      const driver = await this.createDriverUC.execute(req.body);
      res.status(201).json({ status: 'ok', driver });
    } catch (error: any) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  };

  listDrivers = async (req: Request, res: Response): Promise<void> => {
    try {
      const drivers = await this.listDriversUC.execute(req.query.status as string);
      res.json({ status: 'ok', drivers });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  };

  updateDriver = async (req: Request, res: Response): Promise<void> => {
    try {
      const driver = await this.updateDriverUC.execute(req.params.id, req.body);
      res.json({ status: 'ok', driver });
    } catch (error: any) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  };

  assignBus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { driverId } = req.params;
      const { busId } = req.body;
      const driver = await this.assignBusUC.execute(driverId, busId);
      res.json({ status: 'ok', driver });
    } catch (error: any) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  };
}
