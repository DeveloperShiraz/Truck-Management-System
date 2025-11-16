export interface User {
  id: string;
  email: string;
  password: string;  // Hashed with bcrypt
  name: string;
  role: 'owner' | 'driver';
  createdAt: Date;
  updatedAt: Date;
  // Driver-specific
  fleetOwnerId?: string;
  // Owner-specific
  activeFleetCode?: string;
}

export type UserRole = 'owner' | 'driver';

export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}
