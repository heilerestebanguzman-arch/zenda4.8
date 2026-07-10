const jwt = require('jsonwebtoken');

// Usar el token que generaste
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhMTY0NGRlMy05NDJjLTQ1ZDYtOGE3Ni0xMmU3OWRhYzhjOGUiLCJlbWFpbCI6ImFkbWluQHplbmRhLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MzY5NzU1MCwiZXhwIjoxNzgzNjk4NDUwfQ.10bGHjc9_yEOoxbujI8hg9N30fB2vbUJGkiim1e1KlU';

const secret = 'zenda_super_secret_jwt_key_2026';

console.log('🔍 Verificando token...');
console.log('📝 Token:', token);
console.log('🔑 Secret:', secret);

try {
  const decoded = jwt.verify(token, secret);
  console.log('✅ Token VÁLIDO:', decoded);
} catch (error) {
  console.error('❌ Token INVÁLIDO:', error.message);
}
