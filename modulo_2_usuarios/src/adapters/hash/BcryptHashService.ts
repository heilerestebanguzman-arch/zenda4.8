import bcrypt from 'bcrypt';
import { HashServicePort } from '../../core/ports/HashServicePort';

export class BcryptHashService implements HashServicePort {
  private saltRounds = 10;

  async hash(password: string): Promise<string> {
    const hash = await bcrypt.hash(password, this.saltRounds);
    console.log('📝 Hash generado:', hash);
    return hash;
  }

  async compare(password: string, hash: string): Promise<boolean> {
    console.log('🔍 [BcryptHashService] Comparando:');
    console.log('  📝 Password:', password);
    console.log('  🔑 Hash:', hash);
    console.log('  🔧 SaltRounds:', this.saltRounds);
    
    try {
      const result = await bcrypt.compare(password, hash);
      console.log('  ✅ Resultado:', result);
      return result;
    } catch (error) {
      console.error('❌ Error en bcrypt.compare:', error);
      return false;
    }
  }
}
