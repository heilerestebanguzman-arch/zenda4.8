import { TokenServicePort } from '../ports/TokenServicePort';
import { TokenRepository } from '../../infrastructure/redis/TokenRepository';

interface User {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  role: string;
}

interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
}

interface HashService {
  compare(password: string, hash: string): Promise<boolean>;
}

export class AuthenticateUser {
  constructor(
    private userRepository: UserRepository,
    private hashService: HashService,
    private tokenService: TokenServicePort,
    private tokenRepository: TokenRepository
  ) {}

  async execute(email: string, password: string): Promise<{
    user: User;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  } | null> {
    // Buscar usuario
    const user = await this.userRepository.findByEmail(email);
    if (!user) return null;

    // Validar contraseña
    const isValid = await this.hashService.compare(password, user.passwordHash);
    if (!isValid) return null;

    // Generar tokens
    const accessToken = this.tokenService.generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    const refreshToken = this.tokenService.generateRefreshToken({
      userId: user.id,
      email: user.email
    });

    // Guardar refresh token en Redis (7 días)
    await this.tokenRepository.save(user.id, refreshToken, 7 * 24 * 3600);

    return {
      user,
      accessToken,
      refreshToken,
      expiresIn: 900 // 15 minutos
    };
  }
}
