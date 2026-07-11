const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'zenda_admin',
  password: 'zenda_secure_pass_2026',
  database: 'zenda',
});

async function test() {
  try {
    console.log('🔄 Probando conexión...');
    const result = await pool.query('SELECT NOW() as time');
    console.log('✅ Conexión exitosa:', result.rows[0]);
    
    console.log('\n🔄 Buscando usuario admin...');
    const users = await pool.query('SELECT email, password_hash FROM users WHERE email = $1', ['admin@zenda.com']);
    
    if (users.rows.length > 0) {
      console.log('✅ Usuario encontrado:', users.rows[0]);
      console.log('🔑 Hash:', users.rows[0].password_hash);
      
      // Probar bcrypt
      const bcrypt = require('bcrypt');
      const password = 'admin123';
      const isValid = await bcrypt.compare(password, users.rows[0].password_hash);
      console.log('🔐 Contraseña válida:', isValid);
    } else {
      console.log('❌ Usuario no encontrado');
    }
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

test();
