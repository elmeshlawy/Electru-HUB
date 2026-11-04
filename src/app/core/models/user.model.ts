import { Address } from './address.model';
export type { Address };

export type UserRole = 'customer' | 'admin';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
  addresses: Address[];
  createdAt: string;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: number;
}
