import { CreateUserInput, User, UserRole } from '../entities/User';
import { UserRepositoryPort } from '../ports/UserRepositoryPort';
import { HashServicePort } from '../ports/HashServicePort';
import { EmailAlreadyRegisteredError, InvalidEmailError, WeakPasswordError } from '../errors/DomainErrors';

export class RegisterUserUseCase {
  constructor(
    private userRepository: UserRepositoryPort,
    private hashService: HashServicePort
  ) {}

  async execute(input: CreateUserInput): Promise<User> {
    // Validar email
    if (!this.isValidEmail(input.email)) {
      throw new InvalidEmailError(input.email);
    }

    // Validar contraseña
    if (input.password.length < 8) {
      throw new WeakPasswordError();
    }

    // Verificar si el email ya existe
    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new EmailAlreadyRegisteredError(input.email);
    }

    // Hash de la contraseña
    const passwordHash = await this.hashService.hash(input.password);

    // Crear usuario
    const newUser: Omit<User, 'createdAt' | 'updatedAt'> = {
      id: crypto.randomUUID(),
      email: input.email,
      passwordHash,
      fullName: input.fullName,
      role: (input.role || 'passenger') as UserRole,
      phone: input.phone,
      documentId: input.documentId,
    };

    return this.userRepository.create(newUser);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
