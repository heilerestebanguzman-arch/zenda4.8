import { pool } from './config/database';
import bcrypt from 'bcrypt';

export async function seedAdmin() {
  try {
    // Verificar si admin ya existe
    const check = await pool.query('SELECT id FROM users WHERE email = $1', ['admin@zenda.com']);
    
    if (check.rows.length === 0) {
      // Generar hash de admin123
      const hash = await bcrypt.hash('admin123', 10);
      
      // Insertar admin
      await pool.query(
        `INSERT INTO users (id, email, password_hash, full_name, role)
         VALUES (gen_random_uuid(), $1, $2, $3, $4)`,
        ['admin@zenda.com', hash, 'Admin Zenda', 'admin']
      );
      
      console.log('✅ Usuario admin creado automáticamente');
    } else {
      console.log('✅ Usuario admin ya existe');
    }
  } catch (error) {
    console.error('❌ Error al crear admin:', error);
  }
}
