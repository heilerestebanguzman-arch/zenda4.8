import { AuthService } from '../../src/services/auth.service';
import { UserRepository } from '../../src/repositories/user.repository';
import { JwtService } from '../../src/services/jwt.service';

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: jest.Mocked<UserRepository>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(() => {
    userRepository = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    } as any;

    jwtService = {
      generateToken: jest.fn(),
      verifyToken: jest.fn(),
      blacklistToken: jest.fn(),
    } as any;

    authService = new AuthService(userRepository, jwtService);
  });

  describe('login', () => {
    it('should return JWT token on successful login', async () => {
      const email = 'admin@zenda.com';
      const password = 'admin123';
      const user = {
        id: '123',
        email,
        passwordHash: '$2b$10$...',
        mfaSecret: null,
      };
      userRepository.findByEmail.mockResolvedValue(user);
      jwtService.generateToken.mockReturnValue('mock.jwt.token');

      const result = await authService.login(email, password);

      expect(result).toHaveProperty('token');
      expect(result.token).toBe('mock.jwt.token');
    });

    it('should throw error if user not found', async () => {
      userRepository.findByEmail.mockResolvedValue(null);

      await expect(authService.login('nonexistent@zenda.com', 'password'))
        .rejects.toThrow('Invalid credentials');
    });

    it('should require MFA code if MFA is enabled', async () => {
      const user = {
        id: '123',
        email: 'admin@zenda.com',
        passwordHash: '$2b$10$...',
        mfaSecret: 'JBSWY3DPEHPK3PXP',
      };
      userRepository.findByEmail.mockResolvedValue(user);

      await expect(authService.login('admin@zenda.com', 'admin123'))
        .rejects.toThrow('MFA required');
    });
  });
});
