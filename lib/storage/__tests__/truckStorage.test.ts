import { describe, it, expect, beforeEach } from 'vitest';
import {
  registerTruck,
  getTrucksByOwner,
  getTruckById,
  updateTruck,
  deleteTruck,
} from '../fleetStorage';
import { Truck } from '../../types/fleet';

describe('Truck Storage', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('registerTruck', () => {
    it('should register a new truck', () => {
      const truck: Truck = {
        id: 'truck_1',
        ownerId: 'owner_1',
        make: 'Ford',
        model: 'F-150',
        year: 2020,
        vin: 'ABC123456789',
        licensePlate: 'XYZ-1234',
        registeredAt: new Date(),
        status: 'active',
      };

      const result = registerTruck(truck);

      expect(result).toEqual(truck);
      expect(getTruckById('truck_1')).toEqual(truck);
    });
  });

  describe('getTrucksByOwner', () => {
    it('should return trucks for a specific owner', () => {
      const truck1: Truck = {
        id: 'truck_1',
        ownerId: 'owner_1',
        make: 'Ford',
        model: 'F-150',
        year: 2020,
        vin: 'ABC123456789',
        licensePlate: 'XYZ-1234',
        registeredAt: new Date(),
        status: 'active',
      };

      const truck2: Truck = {
        id: 'truck_2',
        ownerId: 'owner_1',
        make: 'Chevrolet',
        model: 'Silverado',
        year: 2021,
        vin: 'DEF987654321',
        licensePlate: 'ABC-5678',
        registeredAt: new Date(),
        status: 'active',
      };

      const truck3: Truck = {
        id: 'truck_3',
        ownerId: 'owner_2',
        make: 'Ram',
        model: '1500',
        year: 2019,
        vin: 'GHI111222333',
        licensePlate: 'DEF-9012',
        registeredAt: new Date(),
        status: 'active',
      };

      registerTruck(truck1);
      registerTruck(truck2);
      registerTruck(truck3);

      const owner1Trucks = getTrucksByOwner('owner_1');
      expect(owner1Trucks).toHaveLength(2);
      expect(owner1Trucks).toContainEqual(truck1);
      expect(owner1Trucks).toContainEqual(truck2);
    });

    it('should return empty array for owner with no trucks', () => {
      const trucks = getTrucksByOwner('nonexistent_owner');
      expect(trucks).toEqual([]);
    });
  });

  describe('getTruckById', () => {
    it('should return truck by ID', () => {
      const truck: Truck = {
        id: 'truck_1',
        ownerId: 'owner_1',
        make: 'Ford',
        model: 'F-150',
        year: 2020,
        vin: 'ABC123456789',
        licensePlate: 'XYZ-1234',
        registeredAt: new Date(),
        status: 'active',
      };

      registerTruck(truck);

      const result = getTruckById('truck_1');
      expect(result).toEqual(truck);
    });

    it('should return null for non-existent truck', () => {
      const result = getTruckById('nonexistent_truck');
      expect(result).toBeNull();
    });
  });

  describe('updateTruck', () => {
    it('should update truck information', () => {
      const truck: Truck = {
        id: 'truck_1',
        ownerId: 'owner_1',
        make: 'Ford',
        model: 'F-150',
        year: 2020,
        vin: 'ABC123456789',
        licensePlate: 'XYZ-1234',
        registeredAt: new Date(),
        status: 'active',
      };

      registerTruck(truck);

      const updates = { status: 'maintenance' as const };
      const result = updateTruck('truck_1', updates);

      expect(result).not.toBeNull();
      expect(result?.status).toBe('maintenance');
    });

    it('should return null for non-existent truck', () => {
      const result = updateTruck('nonexistent_truck', { status: 'maintenance' });
      expect(result).toBeNull();
    });
  });

  describe('deleteTruck', () => {
    it('should delete a truck', () => {
      const truck: Truck = {
        id: 'truck_1',
        ownerId: 'owner_1',
        make: 'Ford',
        model: 'F-150',
        year: 2020,
        vin: 'ABC123456789',
        licensePlate: 'XYZ-1234',
        registeredAt: new Date(),
        status: 'active',
      };

      registerTruck(truck);
      expect(getTruckById('truck_1')).not.toBeNull();

      const result = deleteTruck('truck_1');
      expect(result).toBe(true);
      expect(getTruckById('truck_1')).toBeNull();
    });

    it('should return false for non-existent truck', () => {
      const result = deleteTruck('nonexistent_truck');
      expect(result).toBe(false);
    });
  });
});
