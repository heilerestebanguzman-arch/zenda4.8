import { Driver } from '../domain/driver';
import { DriverRepository } from '../domain/repository';

export class ListDriversUseCase {
  constructor(private driverRepo: DriverRepository) {}

  async execute(status?: string): Promise<Driver[]> {
    return this.driverRepo.list(status);
  }
}
