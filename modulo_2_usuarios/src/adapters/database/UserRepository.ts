import { pool } from '../../config/database';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  role: string;
}

export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    try {
      const result = await pool.query(
        'SELECT id, email, password_hash, full_name, role FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        console.log('❌ Usuario no encontrado:', email);
        return null;
      }

      const row = result.rows[0];
      console.log('✅ Usuario encontrado:', row.email);
      console.log('🔑 Hash almacenado:', row.password_hash);

      return {
        id: row.id,
        email: row.email,
        passwordHash: row.password_hash,
        fullName: row.full_name,
        role: row.role
      };
    } catch (error) {
      console.error('❌ Error en findByEmail:', error);
      return null;
    }
  }
}
