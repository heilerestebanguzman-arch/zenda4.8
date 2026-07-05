import { hash } from 'bcrypt';

const password = process.argv[2] || 'admin123';
const saltRounds = 12;

hash(password, saltRounds).then((hash) => {
  console.log(hash);
}).catch((err) => {
  console.error(err);
});
