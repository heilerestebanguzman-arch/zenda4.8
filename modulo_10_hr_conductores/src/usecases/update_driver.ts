import { Driver, UpdateDriverInput } from '../domain/driver';
import { DriverRepository } from '../domain/repository';
import { NatsPublisher } from '../infrastructure/nats/publisher';

export class UpdateDriverUseCase {
  constructor(
    private driverRepo: DriverRepository,
    private natsPublisher: NatsPublisher
  ) {}

  async execute(id: string, input: UpdateDriverInput): Promise<Driver> {
    const existing = await this.driverRepo.findById(id);
    if (!existing) {
      throw new Error('Driver not found');
    }

    const driver = await this.driverRepo.update(id, input);

    await this.natsPublisher.publishDriverUpdated(driver);

    return driver;
  }
}
