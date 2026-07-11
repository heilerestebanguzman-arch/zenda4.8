const jwt = require('jsonwebtoken');

// Usar el token que generaste antes
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhMTY0NGRlMy05NDJjLTQ1ZDYtOGE3Ni0xMmU3OWRhYzhjOGUiLCJlbWFpbCI6ImFkbWluQHplbmRhLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MzcwNjA5MCwiZXhwIjoxNzgzNzA2OTkwfQ.3F3AiYhJ40zDaU1hfL6Fiel3W0TDwHlj2fBWky5bo7E';
const secret = 'nuevo_jwt_secret_muy_largo_y_seguro_2026';

console.log('🔍 Verificando token...');
console.log('📝 Token:', token);
console.log('🔑 Secret:', secret);

try {
  const decoded = jwt.verify(token, secret);
  console.log('✅ Token VÁLIDO:', decoded);
} catch (error) {
  console.error('❌ Token INVÁLIDO:', error.message);
}
