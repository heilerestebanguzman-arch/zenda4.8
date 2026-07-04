import { OfficialFare } from '../../adapters/repositories/PostgresOfficialFareRepository';

export interface OfficialFareRepositoryPort {
  findAll(): Promise<OfficialFare[]>;
  create(fare: Omit<OfficialFare, 'id' | 'created_at'>): Promise<void>;
  update(id: string, fare: Partial<OfficialFare>): Promise<void>;
  getActiveFare(): Promise<OfficialFare | null>;
}
