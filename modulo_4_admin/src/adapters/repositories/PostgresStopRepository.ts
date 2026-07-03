import { Pool } from 'pg';
import { Stop } from '../../core/entities/Route';
import { StopRepositoryPort } from '../../core/ports/RouteRepositoryPort';

export class PostgresStopRepository implements StopRepositoryPort {
  constructor(private pool: Pool) {}

  async findByRouteId(routeId: string): Promise<Stop[]> {
    const result = await this.pool.query(
      'SELECT * FROM stops WHERE route_id = $1 ORDER BY "order"',
      [routeId]
    );
    return result.rows.map(this.mapRowToStop);
  }

  async create(stop: Omit<Stop, 'id' | 'createdAt' | 'updatedAt'>): Promise<Stop> {
    const result = await this.pool.query(
      `INSERT INTO stops (name, latitude, longitude, "order", route_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [stop.name, stop.latitude, stop.longitude, stop.order, stop.routeId]
    );
    return this.mapRowToStop(result.rows[0]);
  }

  async update(id: string, data: Partial<Omit<Stop, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Stop> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) { fields.push(`name = $${paramIndex}`); values.push(data.name); paramIndex++; }
    if (data.latitude !== undefined) { fields.push(`latitude = $${paramIndex}`); values.push(data.latitude); paramIndex++; }
    if (data.longitude !== undefined) { fields.push(`longitude = $${paramIndex}`); values.push(data.longitude); paramIndex++; }
    if (data.order !== undefined) { fields.push(`"order" = $${paramIndex}`); values.push(data.order); paramIndex++; }

    values.push(id);
    const query = `UPDATE stops SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramIndex} RETURNING *`;
    const result = await this.pool.query(query, values);
    if (result.rows.length === 0) throw new Error(`Stop with id ${id} not found`);
    return this.mapRowToStop(result.rows[0]);
  }

  async delete(id: string): Promise<void> {
    await this.pool.query('DELETE FROM stops WHERE id = $1', [id]);
  }

  private mapRowToStop(row: any): Stop {
    return {
      id: row.id,
      name: row.name,
      latitude: row.latitude,
      longitude: row.longitude,
      order: row.order,
      routeId: row.route_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
