import jwt from 'jsonwebtoken';
import { TokenServicePort } from '../../core/ports/TokenServicePort';

interface AccessTokenPayload {
  userId: string;
  email: string;
  role: string;
}

interface RefreshTokenPayload {
  userId: string;
  email: string;
}

export class TokenService implements TokenServicePort {
  private readonly ACCESS_SECRET = process.env.JWT_SECRET || 'zenda_super_secret_jwt_key_2026';
  private readonly REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'zenda_refresh_secret_key_2026';
  private readonly ACCESS_EXPIRES = '15m';
  private readonly REFRESH_EXPIRES = '7d';

  generateAccessToken(payload: AccessTokenPayload): string {
    return jwt.sign(payload, this.ACCESS_SECRET, { expiresIn: this.ACCESS_EXPIRES });
  }

  generateRefreshToken(payload: RefreshTokenPayload): string {
    return jwt.sign(payload, this.REFRESH_SECRET, { expiresIn: this.REFRESH_EXPIRES });
  }

  verifyAccessToken(token: string): AccessTokenPayload | null {
    try {
      return jwt.verify(token, this.ACCESS_SECRET) as AccessTokenPayload;
    } catch {
      return null;
    }
  }

  verifyRefreshToken(token: string): RefreshTokenPayload | null {
    try {
      return jwt.verify(token, this.REFRESH_SECRET) as RefreshTokenPayload;
    } catch {
      return null;
    }
  }
}
