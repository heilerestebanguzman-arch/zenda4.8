import { OrderService } from '../../src/services/order.service';
import { NatsPublisher } from '../../src/services/nats.publisher';
import { OrderRepository } from '../../src/repositories/order.repository';

jest.mock('../../src/services/nats.publisher');
jest.mock('../../src/repositories/order.repository');

describe('OrderService', () => {
  let orderService: OrderService;
  let natsPublisher: jest.Mocked<NatsPublisher>;
  let orderRepository: jest.Mocked<OrderRepository>;

  beforeEach(() => {
    natsPublisher = new NatsPublisher({} as any) as jest.Mocked<NatsPublisher>;
    orderRepository = new OrderRepository() as jest.Mocked<OrderRepository>;

    orderService = new OrderService(natsPublisher, orderRepository);
  });

  describe('createOrder', () => {
    it('should publish order.created event to NATS', async () => {
      const orderData = {
        vehicleId: '123e4567-e89b-12d3-a456-426614174000',
        type: 'PREVENTIVE',
        priority: 'HIGH',
        description: 'Cambio de aceite',
        scheduledDate: '2026-07-10T10:00:00Z',
        userId: 'user-123',
      };

      const expectedOrder = {
        id: 'order-456',
        ...orderData,
        status: 'PENDING',
        createdAt: new Date(),
      };

      orderRepository.create.mockResolvedValue(expectedOrder);
      natsPublisher.publish.mockResolvedValue();

      const result = await orderService.createOrder(orderData);

      expect(result).toHaveProperty('id');
      expect(result.id).toBe('order-456');
      expect(natsPublisher.publish).toHaveBeenCalledWith(
        'order.created',
        expect.objectContaining({
          order_id: 'order-456',
          vehicle_id: '123e4567-e89b-12d3-a456-426614174000',
        })
      );
    });
  });
});
