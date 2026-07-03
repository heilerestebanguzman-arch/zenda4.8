import { Fare, OfficialFare } from '../entities/Fare';

export interface FareRepositoryPort {
  findAll(): Promise<Fare[]>;
  findByRouteId(routeId: string): Promise<Fare[]>;
  create(fare: Omit<Fare, 'id' | 'createdAt' | 'updatedAt'>): Promise<Fare>;
  update(id: string, data: Partial<Omit<Fare, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Fare>;
  delete(id: string): Promise<void>;
}

export interface OfficialFareRepositoryPort {
  findAll(): Promise<OfficialFare[]>;
  create(fare: Omit<OfficialFare, 'id' | 'createdAt' | 'updatedAt'>): Promise<OfficialFare>;
  update(id: string, data: Partial<Omit<OfficialFare, 'id' | 'createdAt' | 'updatedAt'>>): Promise<OfficialFare>;
}
