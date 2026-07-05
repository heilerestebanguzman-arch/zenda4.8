import { TokenServicePort } from '../ports/TokenServicePort';
import { TokenRepository } from '../../infrastructure/redis/TokenRepository';

export class RefreshToken {
  constructor(
    private tokenService: TokenServicePort,
    private tokenRepository: TokenRepository
  ) {}

  async execute(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  } | null> {
    // Verificar que el refresh token existe en Redis
    const userId = await this.tokenRepository.findUserIdByToken(refreshToken);
    if (!userId) {
      return null;
    }

    // Verificar que el refresh token es válido (JWT)
    const payload = this.tokenService.verifyRefreshToken(refreshToken);
    if (!payload) {
      await this.tokenRepository.delete(refreshToken);
      return null;
    }

    // Generar nuevo access token
    const accessToken = this.tokenService.generateAccessToken({
      userId: payload.userId,
      email: payload.email,
      role: 'user' // TODO: Obtener role del usuario
    });

    // Generar nuevo refresh token (rotación)
    const newRefreshToken = this.tokenService.generateRefreshToken({
      userId: payload.userId,
      email: payload.email
    });

    // Eliminar el refresh token viejo
    await this.tokenRepository.delete(refreshToken);

    // Guardar el nuevo refresh token
    await this.tokenRepository.save(payload.userId, newRefreshToken, 7 * 24 * 3600);

    return {
      accessToken,
      refreshToken: newRefreshToken,
      expiresIn: 900
    };
  }
}
