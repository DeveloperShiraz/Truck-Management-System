import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { registerTruck, getTrucksByOwner } from '@/lib/storage/fleetStorage';
import { Truck } from '@/lib/types/fleet';

/**
 * GET /api/trucks
 * Get all trucks for the authenticated owner
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in' },
        { status: 401 }
      );
    }

    const user = session.user as any;

    // Only truck owners can view trucks
    if (user.role !== 'owner') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Only truck owners can view trucks' },
        { status: 403 }
      );
    }

    const trucks = getTrucksByOwner(user.id);

    return NextResponse.json({ trucks }, { status: 200 });
  } catch (error) {
    console.error('Error fetching trucks:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to fetch trucks' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/trucks
 * Register a new truck
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in' },
        { status: 401 }
      );
    }

    const user = session.user as any;

    // Only truck owners can register trucks
    if (user.role !== 'owner') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Only truck owners can register trucks' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { make, model, year, vin, licensePlate } = body;

    // Validate required fields
    if (!make || !model || !year || !vin || !licensePlate) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'All fields are required: make, model, year, VIN, and license plate',
        },
        { status: 400 }
      );
    }

    // Validate year is a number and reasonable
    const yearNum = parseInt(year);
    if (isNaN(yearNum) || yearNum < 1900 || yearNum > new Date().getFullYear() + 1) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'Year must be a valid number between 1900 and current year',
        },
        { status: 400 }
      );
    }

    // Create truck object
    const truck: Truck = {
      id: `truck_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ownerId: user.id,
      make: make.trim(),
      model: model.trim(),
      year: yearNum,
      vin: vin.trim().toUpperCase(),
      licensePlate: licensePlate.trim().toUpperCase(),
      registeredAt: new Date(),
      status: 'active',
    };

    // Register the truck
    const registeredTruck = registerTruck(truck);

    return NextResponse.json(
      {
        message: 'Truck registered successfully',
        truck: registeredTruck,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error registering truck:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to register truck' },
      { status: 500 }
    );
  }
}
