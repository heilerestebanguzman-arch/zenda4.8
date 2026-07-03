import { Pool } from 'pg';

export interface Ticket {
  id: string;
  incidentId: string;
  busId: string;
  driverId?: string;
  type: string;
  severity: string;
  description: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export class PostgresTicketRepository {
  constructor(private pool: Pool) {}

  async create(ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>): Promise<Ticket> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const result = await client.query(
        `INSERT INTO tickets (incident_id, bus_id, driver_id, type, severity, description, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'OPEN')
         RETURNING *`,
        [ticket.incidentId, ticket.busId, ticket.driverId, ticket.type, ticket.severity, ticket.description]
      );
      
      await client.query('COMMIT');
      return this.mapRowToTicket(result.rows[0]);
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async findAll(): Promise<Ticket[]> {
    const result = await this.pool.query('SELECT * FROM tickets ORDER BY created_at DESC');
    return result.rows.map(this.mapRowToTicket);
  }

  async findById(id: string): Promise<Ticket | null> {
    const result = await this.pool.query('SELECT * FROM tickets WHERE id = $1', [id]);
    if (result.rows.length === 0) return null;
    return this.mapRowToTicket(result.rows[0]);
  }

  async updateStatus(id: string, status: string): Promise<Ticket> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const result = await client.query(
        'UPDATE tickets SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        [status, id]
      );
      
      if (result.rows.length === 0) {
        throw new Error(`Ticket with id ${id} not found`);
      }
      
      await client.query('COMMIT');
      return this.mapRowToTicket(result.rows[0]);
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // 🔥 NUEVOS MÉTODOS PARA FILTRADO
  async findByStatus(status: string): Promise<Ticket[]> {
    const result = await this.pool.query(
      'SELECT * FROM tickets WHERE status = $1 ORDER BY created_at DESC',
      [status]
    );
    return result.rows.map(this.mapRowToTicket);
  }

  async findBySeverity(severity: string): Promise<Ticket[]> {
    const result = await this.pool.query(
      'SELECT * FROM tickets WHERE severity = $1 ORDER BY created_at DESC',
      [severity]
    );
    return result.rows.map(this.mapRowToTicket);
  }

  async findCriticalOpen(): Promise<Ticket[]> {
    const result = await this.pool.query(
      `SELECT * FROM tickets
       WHERE severity = 'CRITICAL' AND status = 'OPEN'
       ORDER BY created_at DESC`
    );
    return result.rows.map(this.mapRowToTicket);
  }

  private mapRowToTicket(row: any): Ticket {
    return {
      id: row.id,
      incidentId: row.incident_id,
      busId: row.bus_id,
      driverId: row.driver_id,
      type: row.type,
      severity: row.severity,
      description: row.description,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
