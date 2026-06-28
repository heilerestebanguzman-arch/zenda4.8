export type UserRole = 'passenger' | 'driver' | 'admin' | 'owner';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  role: UserRole;
  phone?: string;
  documentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  email: string;
  password: string;
  fullName: string;
  role?: UserRole;
  phone?: string;
  documentId?: string;
}
