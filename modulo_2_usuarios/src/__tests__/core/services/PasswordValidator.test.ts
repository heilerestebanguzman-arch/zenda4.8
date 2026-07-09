import { PasswordValidator } from '../../../core/services/PasswordValidator';

describe('PasswordValidator', () => {
  test('debe rechazar contraseña de 6 caracteres', () => {
    const result = PasswordValidator.validate('123456');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('La contraseña debe tener al menos 8 caracteres');
    expect(result.errors).toContain('La contraseña debe tener al menos una mayúscula');
  });

  test('debe aceptar contraseña fuerte', () => {
    const result = PasswordValidator.validate('Admin123!');
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('debe rechazar contraseña sin mayúscula', () => {
    const result = PasswordValidator.validate('admin123!');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('La contraseña debe tener al menos una mayúscula');
  });

  test('debe rechazar contraseña sin número', () => {
    const result = PasswordValidator.validate('Admin!');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('La contraseña debe tener al menos un número');
  });
});
