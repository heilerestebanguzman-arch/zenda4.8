import { pool } from '../../config/database';

export interface User {
  id: string;
  email: string;
  passwordHash: string;      // camelCase
  fullName: string;         // camelCase
  role: string;
}

export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    try {
      const result = await pool.query(
        'SELECT id, email, password_hash, full_name, role FROM users WHERE email = $1',
        [email]
      );
      
      if (!result.rows[0]) {
        return null;
      }

      // Convertir snake_case a camelCase
      const row = result.rows[0];
      return {
        id: row.id,
        email: row.email,
        passwordHash: row.password_hash,
        fullName: row.full_name,
        role: row.role
      };
    } catch (error) {
      console.error('Error al buscar usuario por email:', error);
      return null;
    }
  }
}
