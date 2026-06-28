import { Pool } from 'pg';
import { User } from '../../core/entities/User';
import { UserRepositoryPort } from '../../core/ports/UserRepositoryPort';

export class PostgresUserRepository implements UserRepositoryPort {
  constructor(private pool: Pool) {}

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.pool.query(
      'SELECT id, email, password_hash, full_name, role, phone, document_id, created_at, updated_at FROM users WHERE email = $1',
      [email]
    );
    if (result.rows.length === 0) return null;
    return this.mapRowToUser(result.rows[0]);
  }

  async findById(id: string): Promise<User | null> {
    const result = await this.pool.query(
      'SELECT id, email, password_hash, full_name, role, phone, document_id, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) return null;
    return this.mapRowToUser(result.rows[0]);
  }

  async create(user: Omit<User, 'createdAt' | 'updatedAt'>): Promise<User> {
    const result = await this.pool.query(
      `INSERT INTO users (id, email, password_hash, full_name, role, phone, document_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, email, password_hash, full_name, role, phone, document_id, created_at, updated_at`,
      [user.id, user.email, user.passwordHash, user.fullName, user.role, user.phone, user.documentId]
    );
    return this.mapRowToUser(result.rows[0]);
  }

  async update(id: string, data: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>): Promise<User> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.email !== undefined) { fields.push(`email = $${paramIndex}`); values.push(data.email); paramIndex++; }
    if (data.passwordHash !== undefined) { fields.push(`password_hash = $${paramIndex}`); values.push(data.passwordHash); paramIndex++; }
    if (data.fullName !== undefined) { fields.push(`full_name = $${paramIndex}`); values.push(data.fullName); paramIndex++; }
    if (data.role !== undefined) { fields.push(`role = $${paramIndex}`); values.push(data.role); paramIndex++; }
    if (data.phone !== undefined) { fields.push(`phone = $${paramIndex}`); values.push(data.phone); paramIndex++; }
    if (data.documentId !== undefined) { fields.push(`document_id = $${paramIndex}`); values.push(data.documentId); paramIndex++; }

    values.push(id);
    const query = `
      UPDATE users SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex}
      RETURNING id, email, password_hash, full_name, role, phone, document_id, created_at, updated_at
    `;

    const result = await this.pool.query(query, values);
    if (result.rows.length === 0) throw new Error(`User with id ${id} not found`);
    return this.mapRowToUser(result.rows[0]);
  }

  async delete(id: string): Promise<void> {
    await this.pool.query('DELETE FROM users WHERE id = $1', [id]);
  }

  private mapRowToUser(row: any): User {
    return {
      id: row.id,
      email: row.email,
      passwordHash: row.password_hash,
      fullName: row.full_name,
      role: row.role,
      phone: row.phone,
      documentId: row.document_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
