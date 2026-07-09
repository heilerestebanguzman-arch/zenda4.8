export class PasswordValidator {
  static validate(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('La contraseña debe tener al menos 8 caracteres');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('La contraseña debe tener al menos una mayúscula');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('La contraseña debe tener al menos una minúscula');
    }

    if (!/[0-9]/.test(password)) {
      errors.push('La contraseña debe tener al menos un número');
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('La contraseña debe tener al menos un símbolo');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
