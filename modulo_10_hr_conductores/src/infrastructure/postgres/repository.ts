import { v4 as uuidv4 } from 'uuid';
import { Driver, CreateDriverInput, UpdateDriverInput } from '../../domain/driver';
import { pool } from '../../config/database';

export class PostgresDriverRepository {
  async create(data: CreateDriverInput): Promise<Driver> {
    const id = uuidv4();
    const result = await pool.query(
      `INSERT INTO hr_drivers (id, first_name, last_name, email, phone, document_id,
       license_number, license_expiry, license_type, address, hire_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        id,
        data.first_name,
        data.last_name,
        data.email,
        data.phone || null,
        data.document_id,
        data.license_number,
        data.license_expiry || null,
        data.license_type || null,
        data.address || null,
        data.hire_date,
      ]
    );
    return this.mapDriver(result.rows[0]);
  }

  async findById(id: string): Promise<Driver | null> {
    const result = await pool.query('SELECT * FROM hr_drivers WHERE id = $1', [id]);
    if (result.rows.length === 0) return null;
    return this.mapDriver(result.rows[0]);
  }

  async findByEmail(email: string): Promise<Driver | null> {
    const result = await pool.query('SELECT * FROM hr_drivers WHERE email = $1', [email]);
    if (result.rows.length === 0) return null;
    return this.mapDriver(result.rows[0]);
  }

  async findByDocumentId(documentId: string): Promise<Driver | null> {
    const result = await pool.query('SELECT * FROM hr_drivers WHERE document_id = $1', [documentId]);
    if (result.rows.length === 0) return null;
    return this.mapDriver(result.rows[0]);
  }

  async list(status?: string): Promise<Driver[]> {
    let query = 'SELECT * FROM hr_drivers';
    const params: any[] = [];
    if (status) {
      query += ' WHERE status = $1';
      params.push(status);
    }
    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, params);
    return result.rows.map(this.mapDriver);
  }

  async update(id: string, data: UpdateDriverInput): Promise<Driver> {
    const fields: string[] = [];
    const values: any[] = [];
    let index = 1;

    if (data.first_name) { fields.push(`first_name = $${index++}`); values.push(data.first_name); }
    if (data.last_name) { fields.push(`last_name = $${index++}`); values.push(data.last_name); }
    if (data.email) { fields.push(`email = $${index++}`); values.push(data.email); }
    if (data.phone) { fields.push(`phone = $${index++}`); values.push(data.phone); }
    if (data.document_id) { fields.push(`document_id = $${index++}`); values.push(data.document_id); }
    if (data.license_number) { fields.push(`license_number = $${index++}`); values.push(data.license_number); }
    if (data.license_expiry) { fields.push(`license_expiry = $${index++}`); values.push(data.license_expiry); }
    if (data.license_type) { fields.push(`license_type = $${index++}`); values.push(data.license_type); }
    if (data.address) { fields.push(`address = $${index++}`); values.push(data.address); }
    if (data.status) { fields.push(`status = $${index++}`); values.push(data.status); }
    if (data.termination_date) { fields.push(`termination_date = $${index++}`); values.push(data.termination_date); }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const query = `UPDATE hr_drivers SET ${fields.join(', ')} WHERE id = $${index} RETURNING *`;
    const result = await pool.query(query, values);
    return this.mapDriver(result.rows[0]);
  }

  async delete(id: string): Promise<void> {
    await pool.query('DELETE FROM hr_drivers WHERE id = $1', [id]);
  }

  private mapDriver(row: any): Driver {
    return {
      id: row.id,
      first_name: row.first_name,
      last_name: row.last_name,
      email: row.email,
      phone: row.phone,
      document_id: row.document_id,
      license_number: row.license_number,
      license_expiry: row.license_expiry,
      license_type: row.license_type,
      address: row.address,
      status: row.status,
      hire_date: row.hire_date,
      termination_date: row.termination_date,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }
}
