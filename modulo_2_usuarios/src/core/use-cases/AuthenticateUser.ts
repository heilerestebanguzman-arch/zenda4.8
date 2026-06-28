import { UserRepositoryPort } from '../ports/UserRepositoryPort';
import { HashServicePort } from '../ports/HashServicePort';
import { TokenServicePort } from '../ports/TokenServicePort';
import { InvalidCredentialsError } from '../errors/DomainErrors';

export class AuthenticateUserUseCase {
  constructor(
    private userRepository: UserRepositoryPort,
    private hashService: HashServicePort,
    private tokenService: TokenServicePort
  ) {}

  async execute(email: string, password: string): Promise<{ token: string; user: { id: string; email: string; fullName: string; role: string } }> {
    // Buscar usuario
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new InvalidCredentialsError();
    }

    // Verificar contraseña
    const isValid = await this.hashService.compare(password, user.passwordHash);
    if (!isValid) {
      throw new InvalidCredentialsError();
    }

    // Generar token JWT
    const token = await this.tokenService.generate(user.id, user.email, user.role);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }
}
