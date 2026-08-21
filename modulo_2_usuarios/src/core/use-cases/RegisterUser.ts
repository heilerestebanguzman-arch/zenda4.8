import { User } from '../entities/User';
import { UserRepositoryPort } from '../ports/UserRepositoryPort';
import { HashService } from '../ports/HashServicePort';
import { IdGenerator } from '../ports/IdGeneratorPort';

export interface RegisterUserInput {
  email: string;
  password: string;
  fullName: string;
  role: string;
  phone?: string;
  documentId?: string;
}

export class RegisterUser {
  constructor(
    private userRepository: UserRepositoryPort,
    private hashService: HashService,
    private idGenerator: IdGenerator
  ) {}

  async execute(input: RegisterUserInput): Promise<User> {
    // 1. Verificar que el email no esté registrado
    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) {
      throw new Error('El email ya está registrado');
    }

    // 2. Hashear la contraseña
    const passwordHash = await this.hashService.hash(input.password);

    // 3. Crear el usuario con la contraseña hasheada
    const newUser: Omit<User, 'createdAt' | 'updatedAt'> = {
      id: this.idGenerator.generate(),
      email: input.email,
      passwordHash,
      fullName: input.fullName,
      role: input.role,
      phone: input.phone || null,
      documentId: input.documentId || null,
    };

    return this.userRepository.create(newUser);
  }
}
