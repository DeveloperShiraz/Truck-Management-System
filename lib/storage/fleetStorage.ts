import { FleetCode, FleetMember, Truck } from '../types/fleet';
import { isCodeExpired } from '../utils/codeGenerator';

const FLEET_CODES_KEY = 'fleet_codes';
const FLEET_MEMBERS_KEY = 'fleet_members';
const TRUCKS_KEY = 'trucks';

// Helper function to get data from localStorage
function getFromStorage<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  
  const data = localStorage.getItem(key);
  if (!data) return [];
  
  try {
    const parsed = JSON.parse(data);
    // Convert date strings back to Date objects
    return parsed.map((item: any) => ({
      ...item,
      createdAt: item.createdAt ? new Date(item.createdAt) : undefined,
      expiresAt: item.expiresAt ? new Date(item.expiresAt) : undefined,
      joinedAt: item.joinedAt ? new Date(item.joinedAt) : undefined,
      registeredAt: item.registeredAt ? new Date(item.registeredAt) : undefined,
      updatedAt: item.updatedAt ? new Date(item.updatedAt) : undefined,
    }));
  } catch (error) {
    console.error(`Error parsing ${key} from localStorage:`, error);
    return [];
  }
}

// Helper function to save data to localStorage
function saveToStorage<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
}

// ============= Fleet Code Operations =============

/**
 * Get all fleet codes
 */
export function getAllFleetCodes(): FleetCode[] {
  return getFromStorage<FleetCode>(FLEET_CODES_KEY);
}

/**
 * Get active fleet code for a specific owner
 */
export function getActiveFleetCode(ownerId: string): FleetCode | null {
  const codes = getAllFleetCodes();
  const activeCode = codes.find(
    (code) => code.ownerId === ownerId && code.isActive && !isCodeExpired(code.expiresAt)
  );
  return activeCode || null;
}

/**
 * Get fleet code by code string
 */
export function getFleetCodeByCode(code: string): FleetCode | null {
  const codes = getAllFleetCodes();
  return codes.find((fc) => fc.code === code) || null;
}

/**
 * Create a new fleet code
 */
export function createFleetCode(fleetCode: FleetCode): FleetCode {
  const codes = getAllFleetCodes();
  codes.push(fleetCode);
  saveToStorage(FLEET_CODES_KEY, codes);
  return fleetCode;
}

/**
 * Invalidate (deactivate) a fleet code
 */
export function invalidateFleetCode(code: string): boolean {
  const codes = getAllFleetCodes();
  const index = codes.findIndex((fc) => fc.code === code);
  
  if (index === -1) return false;
  
  codes[index].isActive = false;
  saveToStorage(FLEET_CODES_KEY, codes);
  return true;
}

/**
 * Invalidate all active fleet codes for an owner
 */
export function invalidateOwnerFleetCodes(ownerId: string): void {
  const codes = getAllFleetCodes();
  const updatedCodes = codes.map((code) => {
    if (code.ownerId === ownerId && code.isActive) {
      return { ...code, isActive: false };
    }
    return code;
  });
  saveToStorage(FLEET_CODES_KEY, updatedCodes);
}

/**
 * Validate a fleet code (exists, active, not expired)
 */
export function validateFleetCode(code: string): {
  valid: boolean;
  error?: string;
  fleetCode?: FleetCode;
} {
  const fleetCode = getFleetCodeByCode(code);
  
  if (!fleetCode) {
    return { valid: false, error: 'Fleet code not found' };
  }
  
  if (!fleetCode.isActive) {
    return { valid: false, error: 'Fleet code is no longer active' };
  }
  
  if (isCodeExpired(fleetCode.expiresAt)) {
    return { valid: false, error: 'Fleet code has expired' };
  }
  
  return { valid: true, fleetCode };
}

/**
 * Get all existing fleet code strings (for uniqueness checking)
 */
export function getAllFleetCodeStrings(): string[] {
  const codes = getAllFleetCodes();
  return codes.map((code) => code.code);
}

// ============= Fleet Member Operations =============

/**
 * Get all fleet members
 */
export function getAllFleetMembers(): FleetMember[] {
  return getFromStorage<FleetMember>(FLEET_MEMBERS_KEY);
}

/**
 * Get fleet members for a specific owner
 */
export function getFleetMembersByOwner(ownerId: string): FleetMember[] {
  const members = getAllFleetMembers();
  return members.filter((member) => member.ownerId === ownerId && member.status === 'active');
}

/**
 * Get fleet member by driver ID
 */
export function getFleetMemberByDriverId(driverId: string): FleetMember | null {
  const members = getAllFleetMembers();
  return members.find((member) => member.driverId === driverId && member.status === 'active') || null;
}

/**
 * Add a driver to a fleet
 */
export function addFleetMember(member: FleetMember): FleetMember {
  const members = getAllFleetMembers();
  members.push(member);
  saveToStorage(FLEET_MEMBERS_KEY, members);
  return member;
}

/**
 * Remove a driver from a fleet
 */
export function removeFleetMember(driverId: string, ownerId: string): boolean {
  const members = getAllFleetMembers();
  const index = members.findIndex(
    (member) => member.driverId === driverId && member.ownerId === ownerId && member.status === 'active'
  );
  
  if (index === -1) return false;
  
  members[index].status = 'removed';
  saveToStorage(FLEET_MEMBERS_KEY, members);
  return true;
}

/**
 * Remove all fleet members for a specific driver (when they switch roles)
 */
export function removeDriverFromAllFleets(driverId: string): void {
  const members = getAllFleetMembers();
  const updatedMembers = members.map((member) => {
    if (member.driverId === driverId && member.status === 'active') {
      return { ...member, status: 'removed' as const };
    }
    return member;
  });
  saveToStorage(FLEET_MEMBERS_KEY, updatedMembers);
}

// ============= Truck Operations =============

/**
 * Get all trucks
 */
export function getAllTrucks(): Truck[] {
  return getFromStorage<Truck>(TRUCKS_KEY);
}

/**
 * Get trucks for a specific owner
 */
export function getTrucksByOwner(ownerId: string): Truck[] {
  const trucks = getAllTrucks();
  return trucks.filter((truck) => truck.ownerId === ownerId);
}

/**
 * Get truck by ID
 */
export function getTruckById(truckId: string): Truck | null {
  const trucks = getAllTrucks();
  return trucks.find((truck) => truck.id === truckId) || null;
}

/**
 * Register a new truck
 */
export function registerTruck(truck: Truck): Truck {
  const trucks = getAllTrucks();
  trucks.push(truck);
  saveToStorage(TRUCKS_KEY, trucks);
  return truck;
}

/**
 * Update truck information
 */
export function updateTruck(truckId: string, updates: Partial<Truck>): Truck | null {
  const trucks = getAllTrucks();
  const index = trucks.findIndex((truck) => truck.id === truckId);
  
  if (index === -1) return null;
  
  trucks[index] = { ...trucks[index], ...updates };
  saveToStorage(TRUCKS_KEY, trucks);
  return trucks[index];
}

/**
 * Delete a truck
 */
export function deleteTruck(truckId: string): boolean {
  const trucks = getAllTrucks();
  const filteredTrucks = trucks.filter((truck) => truck.id !== truckId);
  
  if (filteredTrucks.length === trucks.length) return false;
  
  saveToStorage(TRUCKS_KEY, filteredTrucks);
  return true;
}
