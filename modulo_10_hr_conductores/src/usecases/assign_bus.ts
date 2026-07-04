import { Driver } from '../domain/driver';
import { DriverRepository } from '../domain/repository';
import { NatsPublisher } from '../infrastructure/nats/publisher';

export class AssignBusUseCase {
  constructor(
    private driverRepo: DriverRepository,
    private natsPublisher: NatsPublisher
  ) {}

  async execute(driverId: string, busId: string): Promise<Driver> {
    const driver = await this.driverRepo.findById(driverId);
    if (!driver) {
      throw new Error('Driver not found');
    }

    // Aquí iría la lógica de asignación de bus (M1)
    // Por ahora solo actualizamos el conductor
    const updated = await this.driverRepo.update(driverId, { status: 'ACTIVE' });

    // Publicar evento de asignación
    await this.natsPublisher.publishDriverUpdated({
      ...updated,
      assigned_bus_id: busId,
    });

    return updated;
  }
}
