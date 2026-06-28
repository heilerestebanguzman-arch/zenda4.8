import bcrypt from 'bcrypt';
import { HashServicePort } from '../../core/ports/HashServicePort';

export class BcryptHashService implements HashServicePort {
  private saltRounds = 10;

  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
