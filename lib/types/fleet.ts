export interface FleetCode {
  code: string;              // 8-character alphanumeric
  ownerId: string;
  createdAt: Date;
  expiresAt: Date;           // createdAt + 7 days
  isActive: boolean;
}

export interface FleetMember {
  id: string;
  driverId: string;
  ownerId: string;
  driverEmail: string;
  driverName: string;
  joinedAt: Date;
  status: 'active' | 'removed';
}

export interface Truck {
  id: string;
  ownerId: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  licensePlate: string;
  registeredAt: Date;
  status: 'active' | 'maintenance' | 'inactive';
}
