import { Driver, CreateDriverInput } from '../domain/driver';
import { DriverRepository } from '../domain/repository';
import { NatsPublisher } from '../infrastructure/nats/publisher';

export class CreateDriverUseCase {
  constructor(
    private driverRepo: DriverRepository,
    private natsPublisher: NatsPublisher
  ) {}

  async execute(input: CreateDriverInput): Promise<Driver> {
    // Validar email único
    const existingEmail = await this.driverRepo.findByEmail(input.email);
    if (existingEmail) {
      throw new Error('Email already exists');
    }

    // Validar documento único
    const existingDocument = await this.driverRepo.findByDocumentId(input.document_id);
    if (existingDocument) {
      throw new Error('Document ID already exists');
    }

    const driver = await this.driverRepo.create(input);

    // Publicar evento
    await this.natsPublisher.publishDriverCreated(driver);

    return driver;
  }
}
