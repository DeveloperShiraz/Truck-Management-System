import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  createUser,
  findUserByEmail,
  findUserById,
  verifyPassword,
  getAllUsers,
} from './userStorage';
import { CreateUserInput } from '@/lib/types/user';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
});

describe('userStorage', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('createUser', () => {
    it('creates a new user with hashed password', async () => {
      const input: CreateUserInput = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: 'driver',
      };

      const user = await createUser(input);

      expect(user.id).toBeDefined();
      expect(user.email).toBe(input.email);
      expect(user.name).toBe(input.name);
      expect(user.role).toBe(input.role);
      expect(user.password).not.toBe(input.password); // Password should be hashed
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it('throws error when user with email already exists', async () => {
      const input: CreateUserInput = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: 'driver',
      };

      await createUser(input);

      await expect(createUser(input)).rejects.toThrow(
        'User with this email already exists'
      );
    });
  });

  describe('findUserByEmail', () => {
    it('finds user by email', async () => {
      const input: CreateUserInput = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: 'driver',
      };

      const createdUser = await createUser(input);
      const foundUser = findUserByEmail('test@example.com');

      expect(foundUser).toBeDefined();
      expect(foundUser?.id).toBe(createdUser.id);
      expect(foundUser?.email).toBe(createdUser.email);
    });

    it('returns null when user not found', () => {
      const foundUser = findUserByEmail('nonexistent@example.com');
      expect(foundUser).toBeNull();
    });

    it('is case insensitive', async () => {
      const input: CreateUserInput = {
        email: 'Test@Example.com',
        password: 'password123',
        name: 'Test User',
        role: 'driver',
      };

      await createUser(input);
      const foundUser = findUserByEmail('test@example.com');

      expect(foundUser).toBeDefined();
    });
  });

  describe('findUserById', () => {
    it('finds user by id', async () => {
      const input: CreateUserInput = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: 'driver',
      };

      const createdUser = await createUser(input);
      const foundUser = findUserById(createdUser.id);

      expect(foundUser).toBeDefined();
      expect(foundUser?.id).toBe(createdUser.id);
    });

    it('returns null when user not found', () => {
      const foundUser = findUserById('nonexistent-id');
      expect(foundUser).toBeNull();
    });
  });

  describe('verifyPassword', () => {
    it('verifies correct password', async () => {
      const input: CreateUserInput = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: 'driver',
      };

      const user = await createUser(input);
      const isValid = await verifyPassword('password123', user.password);

      expect(isValid).toBe(true);
    });

    it('rejects incorrect password', async () => {
      const input: CreateUserInput = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: 'driver',
      };

      const user = await createUser(input);
      const isValid = await verifyPassword('wrongpassword', user.password);

      expect(isValid).toBe(false);
    });
  });

  describe('getAllUsers', () => {
    it('returns empty array when no users exist', () => {
      const users = getAllUsers();
      expect(users).toEqual([]);
    });

    it('returns all users', async () => {
      const input1: CreateUserInput = {
        email: 'user1@example.com',
        password: 'password123',
        name: 'User 1',
        role: 'driver',
      };

      const input2: CreateUserInput = {
        email: 'user2@example.com',
        password: 'password123',
        name: 'User 2',
        role: 'owner',
      };

      await createUser(input1);
      await createUser(input2);

      const users = getAllUsers();
      expect(users).toHaveLength(2);
    });
  });
});
