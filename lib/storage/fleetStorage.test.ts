import { describe, it, expect, beforeEach } from 'vitest';
import {
  createFleetCode,
  getActiveFleetCode,
  getFleetCodeByCode,
  invalidateFleetCode,
  invalidateOwnerFleetCodes,
  validateFleetCode,
  getAllFleetCodeStrings,
  addFleetMember,
  getFleetMembersByOwner,
  getFleetMemberByDriverId,
  removeFleetMember,
  removeDriverFromAllFleets,
} from './fleetStorage';
import { FleetCode, FleetMember } from '@/lib/types/fleet';

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

describe('fleetStorage', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('Fleet Code Operations', () => {
    describe('createFleetCode', () => {
      it('creates and stores a fleet code', () => {
        const fleetCode: FleetCode = {
          code: 'ABC12345',
          ownerId: 'owner1',
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          isActive: true,
        };

        const created = createFleetCode(fleetCode);
        expect(created.code).toBe('ABC12345');
        expect(created.ownerId).toBe('owner1');
        expect(created.isActive).toBe(true);
      });
    });

    describe('getActiveFleetCode', () => {
      it('returns active fleet code for owner', () => {
        const fleetCode: FleetCode = {
          code: 'ABC12345',
          ownerId: 'owner1',
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          isActive: true,
        };

        createFleetCode(fleetCode);
        const active = getActiveFleetCode('owner1');

        expect(active).toBeDefined();
        expect(active?.code).toBe('ABC12345');
      });

      it('returns null when no active code exists', () => {
        const active = getActiveFleetCode('owner1');
        expect(active).toBeNull();
      });

      it('returns null for expired code', () => {
        const fleetCode: FleetCode = {
          code: 'ABC12345',
          ownerId: 'owner1',
          createdAt: new Date('2020-01-01'),
          expiresAt: new Date('2020-01-08'),
          isActive: true,
        };

        createFleetCode(fleetCode);
        const active = getActiveFleetCode('owner1');

        expect(active).toBeNull();
      });

      it('returns null for inactive code', () => {
        const fleetCode: FleetCode = {
          code: 'ABC12345',
          ownerId: 'owner1',
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          isActive: false,
        };

        createFleetCode(fleetCode);
        const active = getActiveFleetCode('owner1');

        expect(active).toBeNull();
      });
    });

    describe('getFleetCodeByCode', () => {
      it('finds fleet code by code string', () => {
        const fleetCode: FleetCode = {
          code: 'ABC12345',
          ownerId: 'owner1',
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          isActive: true,
        };

        createFleetCode(fleetCode);
        const found = getFleetCodeByCode('ABC12345');

        expect(found).toBeDefined();
        expect(found?.ownerId).toBe('owner1');
      });

      it('returns null when code not found', () => {
        const found = getFleetCodeByCode('NOTFOUND');
        expect(found).toBeNull();
      });
    });

    describe('invalidateFleetCode', () => {
      it('invalidates an active fleet code', () => {
        const fleetCode: FleetCode = {
          code: 'ABC12345',
          ownerId: 'owner1',
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          isActive: true,
        };

        createFleetCode(fleetCode);
        const success = invalidateFleetCode('ABC12345');

        expect(success).toBe(true);

        const code = getFleetCodeByCode('ABC12345');
        expect(code?.isActive).toBe(false);
      });

      it('returns false when code not found', () => {
        const success = invalidateFleetCode('NOTFOUND');
        expect(success).toBe(false);
      });
    });

    describe('invalidateOwnerFleetCodes', () => {
      it('invalidates all active codes for an owner', () => {
        const code1: FleetCode = {
          code: 'ABC12345',
          ownerId: 'owner1',
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          isActive: true,
        };

        const code2: FleetCode = {
          code: 'XYZ67890',
          ownerId: 'owner1',
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          isActive: true,
        };

        createFleetCode(code1);
        createFleetCode(code2);

        invalidateOwnerFleetCodes('owner1');

        const foundCode1 = getFleetCodeByCode('ABC12345');
        const foundCode2 = getFleetCodeByCode('XYZ67890');

        expect(foundCode1?.isActive).toBe(false);
        expect(foundCode2?.isActive).toBe(false);
      });
    });

    describe('validateFleetCode', () => {
      it('validates a valid active non-expired code', () => {
        const fleetCode: FleetCode = {
          code: 'ABC12345',
          ownerId: 'owner1',
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          isActive: true,
        };

        createFleetCode(fleetCode);
        const result = validateFleetCode('ABC12345');

        expect(result.valid).toBe(true);
        expect(result.fleetCode).toBeDefined();
        expect(result.error).toBeUndefined();
      });

      it('returns error for non-existent code', () => {
        const result = validateFleetCode('NOTFOUND');

        expect(result.valid).toBe(false);
        expect(result.error).toBe('Fleet code not found');
      });

      it('returns error for inactive code', () => {
        const fleetCode: FleetCode = {
          code: 'ABC12345',
          ownerId: 'owner1',
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          isActive: false,
        };

        createFleetCode(fleetCode);
        const result = validateFleetCode('ABC12345');

        expect(result.valid).toBe(false);
        expect(result.error).toBe('Fleet code is no longer active');
      });

      it('returns error for expired code', () => {
        const fleetCode: FleetCode = {
          code: 'ABC12345',
          ownerId: 'owner1',
          createdAt: new Date('2020-01-01'),
          expiresAt: new Date('2020-01-08'),
          isActive: true,
        };

        createFleetCode(fleetCode);
        const result = validateFleetCode('ABC12345');

        expect(result.valid).toBe(false);
        expect(result.error).toBe('Fleet code has expired');
      });
    });

    describe('getAllFleetCodeStrings', () => {
      it('returns all fleet code strings', () => {
        const code1: FleetCode = {
          code: 'ABC12345',
          ownerId: 'owner1',
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          isActive: true,
        };

        const code2: FleetCode = {
          code: 'XYZ67890',
          ownerId: 'owner2',
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          isActive: true,
        };

        createFleetCode(code1);
        createFleetCode(code2);

        const codes = getAllFleetCodeStrings();
        expect(codes).toContain('ABC12345');
        expect(codes).toContain('XYZ67890');
        expect(codes).toHaveLength(2);
      });

      it('returns empty array when no codes exist', () => {
        const codes = getAllFleetCodeStrings();
        expect(codes).toEqual([]);
      });
    });
  });

  describe('Fleet Member Operations', () => {
    describe('addFleetMember', () => {
      it('adds a fleet member', () => {
        const member: FleetMember = {
          id: 'member1',
          driverId: 'driver1',
          ownerId: 'owner1',
          driverEmail: 'driver@example.com',
          driverName: 'Driver Name',
          joinedAt: new Date(),
          status: 'active',
        };

        const added = addFleetMember(member);
        expect(added.id).toBe('member1');
        expect(added.driverId).toBe('driver1');
        expect(added.status).toBe('active');
      });
    });

    describe('getFleetMembersByOwner', () => {
      it('returns active fleet members for owner', () => {
        const member1: FleetMember = {
          id: 'member1',
          driverId: 'driver1',
          ownerId: 'owner1',
          driverEmail: 'driver1@example.com',
          driverName: 'Driver 1',
          joinedAt: new Date(),
          status: 'active',
        };

        const member2: FleetMember = {
          id: 'member2',
          driverId: 'driver2',
          ownerId: 'owner1',
          driverEmail: 'driver2@example.com',
          driverName: 'Driver 2',
          joinedAt: new Date(),
          status: 'active',
        };

        addFleetMember(member1);
        addFleetMember(member2);

        const members = getFleetMembersByOwner('owner1');
        expect(members).toHaveLength(2);
      });

      it('excludes removed members', () => {
        const member: FleetMember = {
          id: 'member1',
          driverId: 'driver1',
          ownerId: 'owner1',
          driverEmail: 'driver@example.com',
          driverName: 'Driver Name',
          joinedAt: new Date(),
          status: 'removed',
        };

        addFleetMember(member);

        const members = getFleetMembersByOwner('owner1');
        expect(members).toHaveLength(0);
      });
    });

    describe('getFleetMemberByDriverId', () => {
      it('finds active fleet member by driver ID', () => {
        const member: FleetMember = {
          id: 'member1',
          driverId: 'driver1',
          ownerId: 'owner1',
          driverEmail: 'driver@example.com',
          driverName: 'Driver Name',
          joinedAt: new Date(),
          status: 'active',
        };

        addFleetMember(member);

        const found = getFleetMemberByDriverId('driver1');
        expect(found).toBeDefined();
        expect(found?.ownerId).toBe('owner1');
      });

      it('returns null when driver not in any fleet', () => {
        const found = getFleetMemberByDriverId('driver1');
        expect(found).toBeNull();
      });
    });

    describe('removeFleetMember', () => {
      it('removes a fleet member', () => {
        const member: FleetMember = {
          id: 'member1',
          driverId: 'driver1',
          ownerId: 'owner1',
          driverEmail: 'driver@example.com',
          driverName: 'Driver Name',
          joinedAt: new Date(),
          status: 'active',
        };

        addFleetMember(member);
        const success = removeFleetMember('driver1', 'owner1');

        expect(success).toBe(true);

        const found = getFleetMemberByDriverId('driver1');
        expect(found).toBeNull();
      });

      it('returns false when member not found', () => {
        const success = removeFleetMember('driver1', 'owner1');
        expect(success).toBe(false);
      });
    });

    describe('removeDriverFromAllFleets', () => {
      it('removes driver from all fleets', () => {
        const member: FleetMember = {
          id: 'member1',
          driverId: 'driver1',
          ownerId: 'owner1',
          driverEmail: 'driver@example.com',
          driverName: 'Driver Name',
          joinedAt: new Date(),
          status: 'active',
        };

        addFleetMember(member);
        removeDriverFromAllFleets('driver1');

        const found = getFleetMemberByDriverId('driver1');
        expect(found).toBeNull();
      });
    });
  });
});
