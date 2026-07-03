import { Request, Response } from 'express';
import { CreateRouteUseCase } from '../../../core/use-cases/CreateRoute';
import { GetAllRoutesUseCase } from '../../../core/use-cases/GetAllRoutes';
import { AssignFareToRouteUseCase } from '../../../core/use-cases/AssignFareToRoute';
import { CalculateFareByDecree494UseCase } from '../../../core/use-cases/CalculateFareByDecree494';

export class RouteController {
  constructor(
    private createRouteUseCase: CreateRouteUseCase,
    private getAllRoutesUseCase: GetAllRoutesUseCase,
    private assignFareUseCase: AssignFareToRouteUseCase,
    private calculateFareUseCase: CalculateFareByDecree494UseCase
  ) {}

  async create(req: Request, res: Response) {
    try {
      const route = await this.createRouteUseCase.execute(req.body);
      res.status(201).json({ status: 'ok', route });
    } catch (error: any) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }

  async getAll(_req: Request, res: Response) {
    try {
      const routes = await this.getAllRoutesUseCase.execute();
      res.status(200).json({ status: 'ok', routes });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  async assignFare(req: Request, res: Response) {
    try {
      const fare = await this.assignFareUseCase.execute(req.body);
      res.status(201).json({ status: 'ok', fare });
    } catch (error: any) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }

  async calculateFare(req: Request, res: Response) {
    try {
      const { amountCents } = req.body;
      const result = this.calculateFareUseCase.execute(amountCents);
      res.status(200).json({ status: 'ok', roundedFare: result });
    } catch (error: any) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }
}
