import bcrypt from 'bcrypt';

const password = process.argv[2] || 'test123';
const saltRounds = 12;

const hash = bcrypt.hashSync(password, saltRounds);
console.log(hash);
