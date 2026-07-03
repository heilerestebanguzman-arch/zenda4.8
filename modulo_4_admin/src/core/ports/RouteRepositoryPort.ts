import { Route, Stop } from '../entities/Route';

export interface RouteRepositoryPort {
  findAll(): Promise<Route[]>;
  findById(id: string): Promise<Route | null>;
  create(route: Omit<Route, 'id' | 'createdAt' | 'updatedAt'>): Promise<Route>;
  update(id: string, data: Partial<Omit<Route, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Route>;
  delete(id: string): Promise<void>;
}

export interface StopRepositoryPort {
  findByRouteId(routeId: string): Promise<Stop[]>;
  create(stop: Omit<Stop, 'id' | 'createdAt' | 'updatedAt'>): Promise<Stop>;
  update(id: string, data: Partial<Omit<Stop, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Stop>;
  delete(id: string): Promise<void>;
}
