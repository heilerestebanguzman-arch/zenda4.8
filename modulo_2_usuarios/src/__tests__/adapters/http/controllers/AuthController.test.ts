import { AuthController } from '../../../../adapters/http/controllers/AuthController';

describe('AuthController', () => {
  test('debe existir', () => {
    expect(AuthController).toBeDefined();
  });

  test('debe tener método login', () => {
    const controller = new AuthController(
      {} as any,
      {} as any
    );
    expect(controller.login).toBeDefined();
  });

  test('debe tener método refresh', () => {
    const controller = new AuthController(
      {} as any,
      {} as any
    );
    expect(controller.refresh).toBeDefined();
  });
});
