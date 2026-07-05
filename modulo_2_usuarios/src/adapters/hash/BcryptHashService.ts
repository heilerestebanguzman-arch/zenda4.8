import bcrypt from 'bcrypt';

export class BcryptHashService {
  private readonly saltRounds = 12;

  async hash(password: string): Promise<string> {
    const hash = await bcrypt.hash(password, this.saltRounds);
    console.log('📝 Hash generado:', hash);
    return hash;
  }

  async compare(password: string, hash: string): Promise<boolean> {
    console.log('🔍 Comparando:');
    console.log('  Password:', password);
    console.log('  Hash:', hash);
    const result = await bcrypt.compare(password, hash);
    console.log('  Resultado:', result);
    return result;
  }
}
