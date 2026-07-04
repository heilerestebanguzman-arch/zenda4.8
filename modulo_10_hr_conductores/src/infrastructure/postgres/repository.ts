import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import {
  Driver,
  CreateDriverInput,
  UpdateDriverInput,
  DriverRepository,
} from '../../domain/driver';
import {
  Contract,
  CreateContractInput,
  ContractRepository,
} from '../../domain/contract';
import {
  Evaluation,
  CreateEvaluationInput,
  EvaluationRepository,
} from '../../domain/evaluation';
import { pool } from '../../config/database';

export class PostgresDriverRepository implements DriverRepository {
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

export class PostgresContractRepository implements ContractRepository {
  async create(data: CreateContractInput): Promise<Contract> {
    const id = uuidv4();
    const contractNumber = `CTR-${Date.now().toString().slice(-6)}-${data.driver_id.slice(0, 8)}`;
    const result = await pool.query(
      `INSERT INTO hr_contracts (id, driver_id, contract_number, contract_type,
       start_date, end_date, salary, benefits, signed_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        id,
        data.driver_id,
        contractNumber,
        data.contract_type,
        data.start_date,
        data.end_date || null,
        data.salary,
        JSON.stringify(data.benefits || {}),
        data.signed_date || null,
      ]
    );
    return this.mapContract(result.rows[0]);
  }

  async findByDriverId(driverId: string): Promise<Contract[]> {
    const result = await pool.query(
      'SELECT * FROM hr_contracts WHERE driver_id = $1 ORDER BY start_date DESC',
      [driverId]
    );
    return result.rows.map(this.mapContract);
  }

  async findActiveByDriverId(driverId: string): Promise<Contract | null> {
    const result = await pool.query(
      `SELECT * FROM hr_contracts WHERE driver_id = $1
       AND status = 'ACTIVE' AND (end_date IS NULL OR end_date > NOW())
       ORDER BY start_date DESC LIMIT 1`,
      [driverId]
    );
    if (result.rows.length === 0) return null;
    return this.mapContract(result.rows[0]);
  }

  async updateStatus(id: string, status: string): Promise<Contract> {
    const result = await pool.query(
      'UPDATE hr_contracts SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );
    return this.mapContract(result.rows[0]);
  }

  private mapContract(row: any): Contract {
    return {
      id: row.id,
      driver_id: row.driver_id,
      contract_number: row.contract_number,
      contract_type: row.contract_type,
      start_date: row.start_date,
      end_date: row.end_date,
      salary: parseFloat(row.salary),
      benefits: row.benefits,
      status: row.status,
      signed_date: row.signed_date,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }
}

export class PostgresEvaluationRepository implements EvaluationRepository {
  async create(data: CreateEvaluationInput): Promise<Evaluation> {
    const id = uuidv4();
    const result = await pool.query(
      `INSERT INTO hr_evaluations (id, driver_id, evaluation_date, type,
       score, comments, evaluator, next_evaluation_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        id,
        data.driver_id,
        data.evaluation_date,
        data.type,
        data.score,
        data.comments || null,
        data.evaluator || null,
        data.next_evaluation_date || null,
      ]
    );
    return this.mapEvaluation(result.rows[0]);
  }

  async findByDriverId(driverId: string): Promise<Evaluation[]> {
    const result = await pool.query(
      'SELECT * FROM hr_evaluations WHERE driver_id = $1 ORDER BY evaluation_date DESC',
      [driverId]
    );
    return result.rows.map(this.mapEvaluation);
  }

  async findLatestByDriverId(driverId: string): Promise<Evaluation | null> {
    const result = await pool.query(
      `SELECT * FROM hr_evaluations WHERE driver_id = $1
       ORDER BY evaluation_date DESC LIMIT 1`,
      [driverId]
    );
    if (result.rows.length === 0) return null;
    return this.mapEvaluation(result.rows[0]);
  }

  private mapEvaluation(row: any): Evaluation {
    return {
      id: row.id,
      driver_id: row.driver_id,
      evaluation_date: row.evaluation_date,
      type: row.type,
      score: parseFloat(row.score),
      comments: row.comments,
      evaluator: row.evaluator,
      next_evaluation_date: row.next_evaluation_date,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }
}
