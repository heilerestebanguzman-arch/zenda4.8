import { pool } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export class DriverService {
  async register(driverData: any) {
    const {
      full_name,
      email,
      phone,
      identification_number,
      identification_photo_front,
      identification_photo_back,
      license_number,
      license_photo,
      license_expiry_date,
      selfie_photo
    } = driverData;

    // Verificar si el conductor ya existe
    const existing = await pool.query(
      'SELECT id FROM drivers WHERE email = $1 OR identification_number = $2 OR license_number = $3',
      [email, identification_number, license_number]
    );

    if (existing.rows.length > 0) {
      throw new Error('El conductor ya está registrado');
    }

    const id = uuidv4();
    const query = `
      INSERT INTO drivers (
        id, full_name, email, phone, identification_number,
        identification_photo_front, identification_photo_back,
        license_number, license_photo, license_expiry_date,
        selfie_photo, facial_verification_status, verification_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;

    const values = [
      id, full_name, email, phone, identification_number,
      identification_photo_front || null,
      identification_photo_back || null,
      license_number, license_photo || null,
      license_expiry_date,
      selfie_photo || null,
      'PENDING',
      'PENDING'
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async getAll() {
    const result = await pool.query(
      'SELECT id, full_name, email, phone, identification_number, verification_status, created_at FROM drivers ORDER BY created_at DESC'
    );
    return result.rows;
  }

  async getById(id: string) {
    const result = await pool.query(
      'SELECT * FROM drivers WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  async verify(id: string, status: string) {
    const validStatuses = ['PENDING', 'APPROVED', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Estado inválido. Debe ser: ${validStatuses.join(', ')}`);
    }

    const result = await pool.query(
      `UPDATE drivers 
       SET verification_status = $1, updated_at = NOW() 
       WHERE id = $2 
       RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      throw new Error('Conductor no encontrado');
    }

    return result.rows[0];
  }

  async facialVerify(id: string, selfie_photo: string) {
    const score = Math.random() * 0.3 + 0.7;
    const isMatch = score > 0.75;

    const result = await pool.query(
      `UPDATE drivers 
       SET selfie_photo = $1, 
           facial_verification_status = $2, 
           facial_verification_score = $3,
           verification_status = $4,
           updated_at = NOW()
       WHERE id = $5 
       RETURNING *`,
      [
        selfie_photo,
        isMatch ? 'VERIFIED' : 'FAILED',
        score,
        isMatch ? 'APPROVED' : 'REJECTED',
        id
      ]
    );

    if (result.rows.length === 0) {
      throw new Error('Conductor no encontrado');
    }

    return {
      verified: isMatch,
      score: score,
      status: isMatch ? 'VERIFIED' : 'FAILED'
    };
  }
}
