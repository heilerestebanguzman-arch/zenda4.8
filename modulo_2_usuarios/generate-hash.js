const bcrypt = require('bcrypt');

const password = 'admin123';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  console.log('Hash para admin123:');
  console.log(hash);
  console.log('\nCopia este hash y úsalo en la base de datos.');
});
