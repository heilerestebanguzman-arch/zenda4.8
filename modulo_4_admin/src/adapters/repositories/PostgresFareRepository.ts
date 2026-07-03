import { Pool } from 'pg';
import { Fare } from '../../core/entities/Fare';
import { FareRepositoryPort } from '../../core/ports/FareRepositoryPort';

export class PostgresFareRepository implements FareRepositoryPort {
  constructor(private pool: Pool) {}

  async findAll(): Promise<Fare[]> {
    const result = await this.pool.query('SELECT * FROM fares ORDER BY effective_date DESC');
    return result.rows.map(this.mapRowToFare);
  }

  async findByRouteId(routeId: string): Promise<Fare[]> {
    const result = await this.pool.query(
      'SELECT * FROM fares WHERE route_id = $1 ORDER BY effective_date DESC',
      [routeId]
    );
    return result.rows.map(this.mapRowToFare);
  }

  async create(fare: Omit<Fare, 'id' | 'createdAt' | 'updatedAt'>): Promise<Fare> {
    const result = await this.pool.query(
      `INSERT INTO fares (route_id, amount, currency, effective_date) VALUES ($1, $2, $3, $4) RETURNING *`,
      [fare.routeId, fare.amount, fare.currency, fare.effectiveDate]
    );
    return this.mapRowToFare(result.rows[0]);
  }

  async update(id: string, data: Partial<Omit<Fare, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Fare> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.amount !== undefined) { fields.push(`amount = $${paramIndex}`); values.push(data.amount); paramIndex++; }
    if (data.currency !== undefined) { fields.push(`currency = $${paramIndex}`); values.push(data.currency); paramIndex++; }
    if (data.effectiveDate !== undefined) { fields.push(`effective_date = $${paramIndex}`); values.push(data.effectiveDate); paramIndex++; }

    values.push(id);
    const query = `UPDATE fares SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramIndex} RETURNING *`;
    const result = await this.pool.query(query, values);
    if (result.rows.length === 0) throw new Error(`Fare with id ${id} not found`);
    return this.mapRowToFare(result.rows[0]);
  }

  async delete(id: string): Promise<void> {
    await this.pool.query('DELETE FROM fares WHERE id = $1', [id]);
  }

  private mapRowToFare(row: any): Fare {
    return {
      id: row.id,
      routeId: row.route_id,
      amount: row.amount,
      currency: row.currency,
      effectiveDate: row.effective_date,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
