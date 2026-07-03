import { Owner } from '../entities/Owner';

export interface OwnerRepositoryPort {
  findAll(): Promise<Owner[]>;
  findById(id: string): Promise<Owner | null>;
  create(owner: Omit<Owner, 'id' | 'createdAt' | 'updatedAt'>): Promise<Owner>;
  update(id: string, data: Partial<Omit<Owner, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Owner>;
  delete(id: string): Promise<void>;
}
