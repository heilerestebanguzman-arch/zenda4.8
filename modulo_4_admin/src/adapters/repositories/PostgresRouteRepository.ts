import { Pool } from 'pg';
import { Route } from '../../core/entities/Route';
import { RouteRepositoryPort } from '../../core/ports/RouteRepositoryPort';

export class PostgresRouteRepository implements RouteRepositoryPort {
  constructor(private pool: Pool) {}

  async findAll(): Promise<Route[]> {
    const result = await this.pool.query(`
      SELECT r.*, 
        json_agg(json_build_object(
          'id', s.id,
          'name', s.name,
          'latitude', s.latitude,
          'longitude', s.longitude,
          'order', s.order,
          'routeId', s.route_id,
          'createdAt', s.created_at,
          'updatedAt', s.updated_at
        ) ORDER BY s.order) as stops
      FROM routes r
      LEFT JOIN stops s ON s.route_id = r.id
      GROUP BY r.id
      ORDER BY r.name
    `);
    return result.rows.map(this.mapRowToRoute);
  }

  async findById(id: string): Promise<Route | null> {
    const result = await this.pool.query(`
      SELECT r.*,
        json_agg(json_build_object(
          'id', s.id,
          'name', s.name,
          'latitude', s.latitude,
          'longitude', s.longitude,
          'order', s.order,
          'routeId', s.route_id,
          'createdAt', s.created_at,
          'updatedAt', s.updated_at
        ) ORDER BY s.order) as stops
      FROM routes r
      LEFT JOIN stops s ON s.route_id = r.id
      WHERE r.id = $1
      GROUP BY r.id
    `, [id]);
    if (result.rows.length === 0) return null;
    return this.mapRowToRoute(result.rows[0]);
  }

  async create(route: Omit<Route, 'id' | 'createdAt' | 'updatedAt'>): Promise<Route> {
    const result = await this.pool.query(
      'INSERT INTO routes (name, description) VALUES ($1, $2) RETURNING *',
      [route.name, route.description]
    );
    return this.mapRowToRoute(result.rows[0]);
  }

  async update(id: string, data: Partial<Omit<Route, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Route> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) { fields.push(`name = $${paramIndex}`); values.push(data.name); paramIndex++; }
    if (data.description !== undefined) { fields.push(`description = $${paramIndex}`); values.push(data.description); paramIndex++; }

    values.push(id);
    const query = `UPDATE routes SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramIndex} RETURNING *`;
    const result = await this.pool.query(query, values);
    if (result.rows.length === 0) throw new Error(`Route with id ${id} not found`);
    return this.mapRowToRoute(result.rows[0]);
  }

  async delete(id: string): Promise<void> {
    await this.pool.query('DELETE FROM routes WHERE id = $1', [id]);
  }

  private mapRowToRoute(row: any): Route {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      stops: row.stops || [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
