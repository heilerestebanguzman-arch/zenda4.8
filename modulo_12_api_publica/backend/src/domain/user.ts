export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'USER' | 'OPERATOR';
  created_at: Date;
}
