import jwt from 'jsonwebtoken';
import { TokenServicePort } from '../../core/ports/TokenServicePort';

export class JwtTokenService implements TokenServicePort {
  constructor(private secret: string, private expiresIn: string = '7d') {}

  async generate(userId: string, email: string, role: string): Promise<string> {
    return jwt.sign({ userId, email, role }, this.secret, { expiresIn: this.expiresIn });
  }

  async verify(token: string): Promise<{ userId: string; email: string; role: string } | null> {
    try {
      const decoded = jwt.verify(token, this.secret) as { userId: string; email: string; role: string };
      return decoded;
    } catch {
      return null;
    }
  }
}
