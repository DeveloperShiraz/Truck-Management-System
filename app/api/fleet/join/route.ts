import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { validateFleetCode, addFleetMember, getFleetMemberByDriverId } from '@/lib/storage/fleetStorage';
import { findUserById, updateUser } from '@/lib/storage/hybridStorage';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;

    // Verify user is a driver
    if (userRole !== 'driver') {
      return NextResponse.json(
        { message: 'Only drivers can join fleets' },
        { status: 403 }
      );
    }

    // Get request body
    const body = await request.json();
    const { code } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { message: 'Fleet code is required' },
        { status: 400 }
      );
    }

    // Check if driver is already in a fleet
    const existingMembership = getFleetMemberByDriverId(userId);
    if (existingMembership) {
      return NextResponse.json(
        { message: 'You are already a member of a fleet' },
        { status: 409 }
      );
    }

    // Validate fleet code
    const validation = validateFleetCode(code.trim().toUpperCase());
    
    if (!validation.valid) {
      return NextResponse.json(
        { message: validation.error || 'Invalid fleet code' },
        { status: 400 }
      );
    }

    const fleetCode = validation.fleetCode!;
    const ownerId = fleetCode.ownerId;

    // Get driver information
    const driver = findUserById(userId);
    if (!driver) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Create fleet member record
    const fleetMember = {
      id: `member_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      driverId: userId,
      ownerId: ownerId,
      driverEmail: driver.email,
      driverName: driver.name,
      joinedAt: new Date(),
      status: 'active' as const,
    };

    addFleetMember(fleetMember);

    // Update driver's fleetOwnerId
    updateUser(userId, { fleetOwnerId: ownerId });

    return NextResponse.json(
      {
        message: 'Successfully joined fleet',
        fleetMember: {
          id: fleetMember.id,
          ownerId: fleetMember.ownerId,
          joinedAt: fleetMember.joinedAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error joining fleet:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
