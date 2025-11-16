import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { updateUser, findUserById, getAllUsersFromFile as getAllUsers } from '@/lib/storage/hybridStorage';
import { UserRole } from '@/lib/types/user';

export async function PUT(request: NextRequest) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    const body = await request.json();
    const { name, email, role } = body;

    // Validate required fields
    if (!name || !email || !role) {
      return NextResponse.json(
        { error: 'Name, email, and role are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate role
    if (role !== 'owner' && role !== 'driver') {
      return NextResponse.json(
        { error: 'Invalid role. Must be "owner" or "driver"' },
        { status: 400 }
      );
    }

    // Check if email is already taken by another user
    const users = getAllUsers();
    const emailTaken = users.some(u => u.email.toLowerCase() === email.toLowerCase() && u.id !== userId);
    if (emailTaken) {
      return NextResponse.json(
        { error: 'Email is already in use by another account' },
        { status: 409 }
      );
    }

    // Get current user
    const currentUser = findUserById(userId);
    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const updates: any = {
      name,
      email,
      role: role as UserRole,
    };

    // Handle role change logic
    if (currentUser.role !== role) {
      if (currentUser.role === 'owner' && role === 'driver') {
        // Switching from Owner to Driver: invalidate fleet code
        updates.activeFleetCode = undefined;
      } else if (currentUser.role === 'driver' && role === 'owner') {
        // Switching from Driver to Owner: remove fleet membership
        updates.fleetOwnerId = undefined;
      }
    }

    // Update the user
    const updatedUser = updateUser(userId, updates);

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Failed to update user' },
        { status: 500 }
      );
    }

    // Return updated user (without password)
    const { password, ...userWithoutPassword } = updatedUser;

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
