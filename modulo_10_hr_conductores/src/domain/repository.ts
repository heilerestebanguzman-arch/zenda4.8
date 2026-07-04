import { Driver, CreateDriverInput, UpdateDriverInput } from './driver';
import { Contract, CreateContractInput } from './contract';
import { Evaluation, CreateEvaluationInput } from './evaluation';

export interface DriverRepository {
  create(data: CreateDriverInput): Promise<Driver>;
  findById(id: string): Promise<Driver | null>;
  findByEmail(email: string): Promise<Driver | null>;
  findByDocumentId(documentId: string): Promise<Driver | null>;
  list(status?: string): Promise<Driver[]>;
  update(id: string, data: UpdateDriverInput): Promise<Driver>;
  delete(id: string): Promise<void>;
}

export interface ContractRepository {
  create(data: CreateContractInput): Promise<Contract>;
  findByDriverId(driverId: string): Promise<Contract[]>;
  findActiveByDriverId(driverId: string): Promise<Contract | null>;
  updateStatus(id: string, status: string): Promise<Contract>;
}

export interface EvaluationRepository {
  create(data: CreateEvaluationInput): Promise<Evaluation>;
  findByDriverId(driverId: string): Promise<Evaluation[]>;
  findLatestByDriverId(driverId: string): Promise<Evaluation | null>;
}
