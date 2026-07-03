export class DomainError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class RouteNotFoundError extends DomainError {
  constructor(id: string) {
    super(`Ruta con ID "${id}" no encontrada`, 'ROUTE_NOT_FOUND');
  }
}

export class DuplicateRouteError extends DomainError {
  constructor(name: string) {
    super(`La ruta "${name}" ya existe`, 'DUPLICATE_ROUTE');
  }
}

export class OwnerNotFoundError extends DomainError {
  constructor(id: string) {
    super(`Propietario con ID "${id}" no encontrado`, 'OWNER_NOT_FOUND');
  }
}
