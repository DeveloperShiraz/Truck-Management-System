/**
 * Hybrid storage system that works both locally and on Netlify
 * Uses localStorage for client-side operations and file system for server-side
 */

import bcrypt from 'bcryptjs';
import { User, CreateUserInput } from '@/lib/types/user';
import fs from 'fs';
import path from 'path';

const USERS_FILE_PATH = path.join(process.cwd(), 'data', 'users.json');
const SALT_ROUNDS = 10;

// Ensure data directory exists
function ensureDataDirectory() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Server-side: Read users from file
export function getAllUsersFromFile(): User[] {
  try {
    ensureDataDirectory();
    
    if (!fs.existsSync(USERS_FILE_PATH)) {
      console.log('[Storage] Users file not found, creating empty file');
      // Create empty users file if it doesn't exist
      fs.writeFileSync(USERS_FILE_PATH, JSON.stringify([], null, 2));
      return [];
    }
    
    const fileContent = fs.readFileSync(USERS_FILE_PATH, 'utf-8');
    const users = JSON.parse(fileContent);
    
    console.log(`[Storage] Loaded ${users.length} users from file`);
    
    // Convert date strings back to Date objects
    return users.map((user: any) => ({
      ...user,
      createdAt: new Date(user.createdAt),
      updatedAt: new Date(user.updatedAt),
    }));
  } catch (error) {
    console.error('[Storage] Error reading users from file:', error);
    return [];
  }
}

// Server-side: Save users to file
export function saveUsersToFile(users: User[]): void {
  try {
    ensureDataDirectory();
    fs.writeFileSync(USERS_FILE_PATH, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error saving users to file:', error);
    throw error;
  }
}

// Find user by email
export function findUserByEmail(email: string): User | null {
  const users = getAllUsersFromFile();
  return users.find(user => user.email.toLowerCase() === email.toLowerCase()) || null;
}

// Find user by ID
export function findUserById(id: string): User | null {
  const users = getAllUsersFromFile();
  return users.find(user => user.id === id) || null;
}

// Create a new user
export async function createUser(input: CreateUserInput): Promise<User> {
  const users = getAllUsersFromFile();
  
  // Check if user already exists
  const existingUser = findUserByEmail(input.email);
  if (existingUser) {
    throw new Error('User with this email already exists');
  }
  
  // Hash password
  const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);
  
  // Create new user
  const newUser: User = {
    id: generateUserId(),
    email: input.email,
    password: hashedPassword,
    name: input.name,
    role: input.role,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  users.push(newUser);
  saveUsersToFile(users);
  
  return newUser;
}

// Update user
export function updateUser(id: string, updates: Partial<User>): User | null {
  const users = getAllUsersFromFile();
  const userIndex = users.findIndex(user => user.id === id);
  
  if (userIndex === -1) {
    return null;
  }
  
  users[userIndex] = {
    ...users[userIndex],
    ...updates,
    updatedAt: new Date(),
  };
  
  saveUsersToFile(users);
  return users[userIndex];
}

// Delete user
export function deleteUser(id: string): boolean {
  const users = getAllUsersFromFile();
  const filteredUsers = users.filter(user => user.id !== id);
  
  if (filteredUsers.length === users.length) {
    return false; // User not found
  }
  
  saveUsersToFile(filteredUsers);
  return true;
}

// Verify password
export async function verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}

// Generate unique user ID
function generateUserId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
