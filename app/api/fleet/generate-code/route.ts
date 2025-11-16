import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import {
  getActiveFleetCode,
  createFleetCode,
  getAllFleetCodeStrings,
  invalidateFleetCode,
} from '@/lib/storage/fleetStorage';
import { generateUniqueFleetCode, calculateExpirationDate } from '@/lib/utils/codeGenerator';

/**
 * GET /api/fleet/generate-code
 * Get the active fleet code for the authenticated truck owner
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
    if (session.user.role !== 'owner') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Only truck owners can view fleet codes' },
        { status: 403 }
      );
    }
    
    // Get the active fleet code
    const activeCode = getActiveFleetCode(session.user.id);
    
    if (!activeCode) {
      return NextResponse.json(
        { error: 'Not Found', message: 'No active fleet code found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      {
        code: activeCode.code,
        expiresAt: activeCode.expiresAt,
        createdAt: activeCode.createdAt,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching fleet code:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to fetch fleet code' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/fleet/generate-code
 * Generate a new fleet code for a truck owner
 */
export async function POST(request: NextRequest) {
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
    if (session.user.role !== 'owner') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Only truck owners can generate fleet codes' },
        { status: 403 }
      );
    }
    
    // Check if owner already has an active fleet code
    const existingCode = getActiveFleetCode(session.user.id);
    if (existingCode) {
      return NextResponse.json(
        {
          error: 'Conflict',
          message: 'You already have an active fleet code. Please delete it before generating a new one.',
        },
        { status: 409 }
      );
    }
    
    // Generate a unique fleet code
    const existingCodes = getAllFleetCodeStrings();
    const code = generateUniqueFleetCode(existingCodes);
    
    // Calculate expiration date (7 days from now)
    const createdAt = new Date();
    const expiresAt = calculateExpirationDate(createdAt);
    
    // Create the fleet code
    const fleetCode = createFleetCode({
      code,
      ownerId: session.user.id,
      createdAt,
      expiresAt,
      isActive: true,
    });
    
    return NextResponse.json(
      {
        code: fleetCode.code,
        expiresAt: fleetCode.expiresAt,
        createdAt: fleetCode.createdAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error generating fleet code:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to generate fleet code' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/fleet/generate-code
 * Delete (invalidate) the active fleet code for a truck owner
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
    if (session.user.role !== 'owner') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Only truck owners can delete fleet codes' },
        { status: 403 }
      );
    }
    
    // Get the active fleet code
    const activeCode = getActiveFleetCode(session.user.id);
    
    if (!activeCode) {
      return NextResponse.json(
        { error: 'Not Found', message: 'No active fleet code found' },
        { status: 404 }
      );
    }
    
    // Invalidate the fleet code
    const success = invalidateFleetCode(activeCode.code);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Internal Server Error', message: 'Failed to delete fleet code' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { message: 'Fleet code deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting fleet code:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to delete fleet code' },
      { status: 500 }
    );
  }
}
