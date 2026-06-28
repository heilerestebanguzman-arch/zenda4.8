export class DomainError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class EmailAlreadyRegisteredError extends DomainError {
  constructor(email: string) {
    super(`El email "${email}" ya está registrado`, 'EMAIL_ALREADY_REGISTERED');
  }
}

export class InvalidCredentialsError extends DomainError {
  constructor() {
    super('Credenciales inválidas', 'INVALID_CREDENTIALS');
  }
}

export class UserNotFoundError extends DomainError {
  constructor(id: string) {
    super(`Usuario con ID "${id}" no encontrado`, 'USER_NOT_FOUND');
  }
}

export class InvalidEmailError extends DomainError {
  constructor(email: string) {
    super(`El email "${email}" no es válido`, 'INVALID_EMAIL');
  }
}

export class WeakPasswordError extends DomainError {
  constructor() {
    super('La contraseña debe tener al menos 8 caracteres', 'WEAK_PASSWORD');
  }
}
