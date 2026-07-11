const jwt = require('jsonwebtoken');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhMTY0NGRlMy05NDJjLTQ1ZDYtOGE3Ni0xMmU3OWRhYzhjOGUiLCJlbWFpbCI6ImFkbWluQHplbmRhLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MzczODc3NiwiZXhwIjoxNzgzNzM5Njc2fQ.qwDr9PA4__Zse9aXAcXmSy_SAOtnl1wNtnm6ibNhAQk';
const secret = 'nuevo_jwt_secret_muy_largo_y_seguro_2026';

try {
  const decoded = jwt.verify(token, secret);
  console.log('✅ Token VÁLIDO:', decoded);
} catch (error) {
  console.error('❌ Token INVÁLIDO:', error.message);
}
