import { Route } from '../entities/Route';
import { RouteRepositoryPort } from '../ports/RouteRepositoryPort';

export class GetAllRoutesUseCase {
  constructor(private routeRepo: RouteRepositoryPort) {}

  async execute(): Promise<Route[]> {
    return this.routeRepo.findAll();
  }
}
