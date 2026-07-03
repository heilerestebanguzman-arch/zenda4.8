import { Pool } from 'pg';
import { OfficialFare } from '../../core/entities/Fare';
import { OfficialFareRepositoryPort } from '../../core/ports/FareRepositoryPort';

export class PostgresOfficialFareRepository implements OfficialFareRepositoryPort {
  constructor(private pool: Pool) {}

  async findAllOfficial(): Promise<OfficialFare[]> {
    const result = await this.pool.query('SELECT * FROM official_fares ORDER BY effective_date DESC');
    return result.rows.map(this.mapRowToOfficialFare);
  }

  async createOfficial(fare: Omit<OfficialFare, 'id' | 'createdAt' | 'updatedAt'>): Promise<OfficialFare> {
    const result = await this.pool.query(
      `INSERT INTO official_fares (name, amount, currency, decree_number, effective_date)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [fare.name, fare.amount, fare.currency, fare.decreeNumber, fare.effectiveDate]
    );
    return this.mapRowToOfficialFare(result.rows[0]);
  }

  async updateOfficial(id: string, data: Partial<Omit<OfficialFare, 'id' | 'createdAt' | 'updatedAt'>>): Promise<OfficialFare> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) { fields.push(`name = $${paramIndex}`); values.push(data.name); paramIndex++; }
    if (data.amount !== undefined) { fields.push(`amount = $${paramIndex}`); values.push(data.amount); paramIndex++; }
    if (data.currency !== undefined) { fields.push(`currency = $${paramIndex}`); values.push(data.currency); paramIndex++; }
    if (data.decreeNumber !== undefined) { fields.push(`decree_number = $${paramIndex}`); values.push(data.decreeNumber); paramIndex++; }
    if (data.effectiveDate !== undefined) { fields.push(`effective_date = $${paramIndex}`); values.push(data.effectiveDate); paramIndex++; }

    values.push(id);
    const query = `UPDATE official_fares SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramIndex} RETURNING *`;
    const result = await this.pool.query(query, values);
    if (result.rows.length === 0) throw new Error(`Official fare with id ${id} not found`);
    return this.mapRowToOfficialFare(result.rows[0]);
  }

  private mapRowToOfficialFare(row: any): OfficialFare {
    return {
      id: row.id,
      name: row.name,
      amount: row.amount,
      currency: row.currency,
      decreeNumber: row.decree_number,
      effectiveDate: row.effective_date,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
