import { Fare } from '../entities/Fare';
import { FareRepositoryPort } from '../ports/FareRepositoryPort';
import { RouteRepositoryPort } from '../ports/RouteRepositoryPort';
import { RouteNotFoundError } from '../errors/DomainErrors';

export interface AssignFareInput {
  routeId: string;
  amount: number;
  currency: string;
  effectiveDate: Date;
}

export class AssignFareToRouteUseCase {
  constructor(
    private fareRepo: FareRepositoryPort,
    private routeRepo: RouteRepositoryPort
  ) {}

  async execute(input: AssignFareInput): Promise<Fare> {
    // 1. Validar que la ruta existe
    const route = await this.routeRepo.findById(input.routeId);
    if (!route) {
      throw new RouteNotFoundError(input.routeId);
    }

    // 2. Crear la tarifa
    const fare = await this.fareRepo.create({
      routeId: input.routeId,
      amount: input.amount,
      currency: input.currency,
      effectiveDate: input.effectiveDate,
    });

    return fare;
  }
}
