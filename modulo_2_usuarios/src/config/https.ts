import fs from 'fs';
import path from 'path';

export const httpsOptions = {
  key: fs.readFileSync(path.join(__dirname, '../../../certs/server.key')),
  cert: fs.readFileSync(path.join(__dirname, '../../../certs/server.crt')),
};
