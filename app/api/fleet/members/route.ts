import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import {
  getFleetMembersByOwner,
  removeFleetMember,
} from '@/lib/storage/fleetStorage';
import { findUserById, updateUser } from '@/lib/storage/hybridStorage';

/**
 * GET /api/fleet/members
 * Fetch all fleet members for the authenticated truck owner
 */
export async function GET(request: NextRequest) {
  try {
    // Get the authenticated user session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in' },
        { status: 401 }
      );
    }
    
    // Verify user is a Truck Owner
    if ((session.user as any).role !== 'owner') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Only truck owners can view fleet members' },
        { status: 403 }
      );
    }
    
    // Get fleet members for this owner
    const members = getFleetMembersByOwner((session.user as any).id);
    
    return NextResponse.json(
      { members },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching fleet members:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to fetch fleet members' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/fleet/members?driverId=<driverId>
 * Remove a driver from the fleet
 */
export async function DELETE(request: NextRequest) {
  try {
    // Get the authenticated user session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in' },
        { status: 401 }
      );
    }
    
    // Verify user is a Truck Owner
    if ((session.user as any).role !== 'owner') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Only truck owners can remove fleet members' },
        { status: 403 }
      );
    }
    
    // Get driverId from query parameters
    const { searchParams } = new URL(request.url);
    const driverId = searchParams.get('driverId');
    
    if (!driverId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Driver ID is required' },
        { status: 400 }
      );
    }
    
    // Remove the fleet member
    const success = removeFleetMember(driverId, (session.user as any).id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Fleet member not found' },
        { status: 404 }
      );
    }
    
    // Update the driver's fleetOwnerId to null
    const driver = findUserById(driverId);
    if (driver) {
      updateUser(driverId, { fleetOwnerId: undefined });
    }
    
    return NextResponse.json(
      { message: 'Fleet member removed successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error removing fleet member:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to remove fleet member' },
      { status: 500 }
    );
  }
}
