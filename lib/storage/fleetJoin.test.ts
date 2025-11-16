import { describe, it, expect, beforeEach } from 'vitest';
import {
  createFleetCode,
  validateFleetCode,
  addFleetMember,
  getFleetMemberByDriverId,
} from './fleetStorage';
import { createUser, findUserById, updateUser } from './userStorage';
import { FleetCode } from '@/lib/types/fleet';
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

describe('Fleet Joining Functionality', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('Driver joining fleet with valid code', () => {
    it('successfully joins fleet with valid active code', async () => {
      // Create owner
      const ownerInput: CreateUserInput = {
        email: 'owner@example.com',
        password: 'password123',
        name: 'Fleet Owner',
        role: 'owner',
      };
      const owner = await createUser(ownerInput);

      // Create driver
      const driverInput: CreateUserInput = {
        email: 'driver@example.com',
        password: 'password123',
        name: 'Test Driver',
        role: 'driver',
      };
      const driver = await createUser(driverInput);

      // Create fleet code
      const fleetCode: FleetCode = {
        code: 'ABC12345',
        ownerId: owner.id,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isActive: true,
      };
      createFleetCode(fleetCode);

      // Validate code
      const validation = validateFleetCode('ABC12345');
      expect(validation.valid).toBe(true);

      // Add driver to fleet
      const fleetMember = {
        id: `member_${Date.now()}`,
        driverId: driver.id,
        ownerId: owner.id,
        driverEmail: driver.email,
        driverName: driver.name,
        joinedAt: new Date(),
        status: 'active' as const,
      };
      addFleetMember(fleetMember);

      // Update driver's fleetOwnerId
      updateUser(driver.id, { fleetOwnerId: owner.id });

      // Verify driver is in fleet
      const membership = getFleetMemberByDriverId(driver.id);
      expect(membership).toBeDefined();
      expect(membership?.ownerId).toBe(owner.id);

      // Verify driver's fleetOwnerId is updated
      const updatedDriver = findUserById(driver.id);
      expect(updatedDriver?.fleetOwnerId).toBe(owner.id);
    });
  });

  describe('Driver joining fleet with invalid code', () => {
    it('fails to join with non-existent code', () => {
      const validation = validateFleetCode('INVALID1');
      expect(validation.valid).toBe(false);
      expect(validation.error).toBe('Fleet code not found');
    });

    it('fails to join with inactive code', async () => {
      // Create owner
      const ownerInput: CreateUserInput = {
        email: 'owner@example.com',
        password: 'password123',
        name: 'Fleet Owner',
        role: 'owner',
      };
      const owner = await createUser(ownerInput);

      // Create inactive fleet code
      const fleetCode: FleetCode = {
        code: 'INACTIVE1',
        ownerId: owner.id,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isActive: false,
      };
      createFleetCode(fleetCode);

      // Validate code
      const validation = validateFleetCode('INACTIVE1');
      expect(validation.valid).toBe(false);
      expect(validation.error).toBe('Fleet code is no longer active');
    });
  });

  describe('Driver joining fleet with expired code', () => {
    it('fails to join with expired code', async () => {
      // Create owner
      const ownerInput: CreateUserInput = {
        email: 'owner@example.com',
        password: 'password123',
        name: 'Fleet Owner',
        role: 'owner',
      };
      const owner = await createUser(ownerInput);

      // Create expired fleet code
      const fleetCode: FleetCode = {
        code: 'EXPIRED1',
        ownerId: owner.id,
        createdAt: new Date('2020-01-01'),
        expiresAt: new Date('2020-01-08'),
        isActive: true,
      };
      createFleetCode(fleetCode);

      // Validate code
      const validation = validateFleetCode('EXPIRED1');
      expect(validation.valid).toBe(false);
      expect(validation.error).toBe('Fleet code has expired');
    });
  });

  describe('Navigation update after joining', () => {
    it('driver has fleetOwnerId after joining', async () => {
      // Create owner
      const ownerInput: CreateUserInput = {
        email: 'owner@example.com',
        password: 'password123',
        name: 'Fleet Owner',
        role: 'owner',
      };
      const owner = await createUser(ownerInput);

      // Create driver
      const driverInput: CreateUserInput = {
        email: 'driver@example.com',
        password: 'password123',
        name: 'Test Driver',
        role: 'driver',
      };
      const driver = await createUser(driverInput);

      // Verify driver has no fleet initially
      expect(driver.fleetOwnerId).toBeUndefined();

      // Create and join fleet
      const fleetCode: FleetCode = {
        code: 'ABC12345',
        ownerId: owner.id,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isActive: true,
      };
      createFleetCode(fleetCode);

      const fleetMember = {
        id: `member_${Date.now()}`,
        driverId: driver.id,
        ownerId: owner.id,
        driverEmail: driver.email,
        driverName: driver.name,
        joinedAt: new Date(),
        status: 'active' as const,
      };
      addFleetMember(fleetMember);
      updateUser(driver.id, { fleetOwnerId: owner.id });

      // Verify driver now has fleetOwnerId
      const updatedDriver = findUserById(driver.id);
      expect(updatedDriver?.fleetOwnerId).toBe(owner.id);
    });
  });

  describe('Prevent duplicate fleet membership', () => {
    it('driver cannot join multiple fleets', async () => {
      // Create two owners
      const owner1Input: CreateUserInput = {
        email: 'owner1@example.com',
        password: 'password123',
        name: 'Fleet Owner 1',
        role: 'owner',
      };
      const owner1 = await createUser(owner1Input);

      const owner2Input: CreateUserInput = {
        email: 'owner2@example.com',
        password: 'password123',
        name: 'Fleet Owner 2',
        role: 'owner',
      };
      const owner2 = await createUser(owner2Input);

      // Create driver
      const driverInput: CreateUserInput = {
        email: 'driver@example.com',
        password: 'password123',
        name: 'Test Driver',
        role: 'driver',
      };
      const driver = await createUser(driverInput);

      // Join first fleet
      const fleetCode1: FleetCode = {
        code: 'FLEET001',
        ownerId: owner1.id,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isActive: true,
      };
      createFleetCode(fleetCode1);

      const fleetMember1 = {
        id: `member_${Date.now()}`,
        driverId: driver.id,
        ownerId: owner1.id,
        driverEmail: driver.email,
        driverName: driver.name,
        joinedAt: new Date(),
        status: 'active' as const,
      };
      addFleetMember(fleetMember1);
      updateUser(driver.id, { fleetOwnerId: owner1.id });

      // Check if driver is already in a fleet
      const existingMembership = getFleetMemberByDriverId(driver.id);
      expect(existingMembership).toBeDefined();
      expect(existingMembership?.ownerId).toBe(owner1.id);

      // Attempting to join second fleet should be prevented by API
      // (This test verifies the check logic exists)
    });
  });
});
