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
    console.log('🔍 [AuthenticateUser] 1. Buscando usuario:', email);
    
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      console.log('❌ [AuthenticateUser] 2. Usuario NO encontrado');
      return null;
    }
    console.log('✅ [AuthenticateUser] 2. Usuario encontrado:', user.id);

    console.log('🔍 [AuthenticateUser] 3. Comparando contraseña...');
    const isValid = await this.hashService.compare(password, user.passwordHash);
    console.log('✅ [AuthenticateUser] 4. Contraseña válida:', isValid);
    
    if (!isValid) {
      console.log('❌ [AuthenticateUser] 5. Contraseña inválida');
      return null;
    }

    console.log('✅ [AuthenticateUser] 6. Generando tokens...');
    const accessToken = this.tokenService.generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    const refreshToken = this.tokenService.generateRefreshToken({
      userId: user.id,
      email: user.email
    });

    await this.tokenRepository.save(user.id, refreshToken, 7 * 24 * 3600);

    return {
      user,
      accessToken,
      refreshToken,
      expiresIn: 900
    };
  }
}
