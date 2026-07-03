import { Route, Stop } from '../entities/Route';
import { RouteRepositoryPort, StopRepositoryPort } from '../ports/RouteRepositoryPort';
import { DuplicateRouteError } from '../errors/DomainErrors';

export interface CreateRouteInput {
  name: string;
  description: string;
  stops: Omit<Stop, 'id' | 'routeId' | 'createdAt' | 'updatedAt'>[];
}

export class CreateRouteUseCase {
  constructor(
    private routeRepo: RouteRepositoryPort,
    private stopRepo: StopRepositoryPort
  ) {}

  async execute(input: CreateRouteInput): Promise<Route> {
    // 1. Validar que no exista una ruta con el mismo nombre
    const existingRoutes = await this.routeRepo.findAll();
    if (existingRoutes.some(r => r.name === input.name)) {
      throw new DuplicateRouteError(input.name);
    }

    // 2. Crear la ruta
    const route = await this.routeRepo.create({
      name: input.name,
      description: input.description,
      stops: [],
    });

    // 3. Crear las paradas
    for (const stop of input.stops) {
      await this.stopRepo.create({
        name: stop.name,
        latitude: stop.latitude,
        longitude: stop.longitude,
        order: stop.order,
        routeId: route.id,
      });
    }

    // 4. Obtener la ruta completa con sus paradas
    const fullRoute = await this.routeRepo.findById(route.id);
    return fullRoute!;
  }
}
