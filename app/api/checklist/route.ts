import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import {
  getChecklistsByOwner,
  createChecklist,
  updateChecklist,
  deleteChecklist,
  updateCompletionStatus,
  getChecklistCompletionStatus,
} from '@/lib/storage/checklistStorage';
import { findUserById } from '@/lib/storage/hybridStorage';

/**
 * GET /api/checklist
 * Fetch checklists based on user role
 * - Truck Owners: Get their own checklists
 * - Drivers: Get checklists from their fleet owner
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
    
    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;
    
    let checklists;
    
    if (userRole === 'owner') {
      // Truck owners get their own checklists
      checklists = getChecklistsByOwner(userId);
    } else {
      // Drivers get checklists from their fleet owner
      const user = findUserById(userId);
      
      if (!user || !user.fleetOwnerId) {
        return NextResponse.json(
          { error: 'Forbidden', message: 'You must be part of a fleet to view checklists' },
          { status: 403 }
        );
      }
      
      checklists = getChecklistsByOwner(user.fleetOwnerId);
      
      // Add completion status for each checklist
      const checklistsWithCompletions = checklists.map((checklist) => {
        const completionStatus = getChecklistCompletionStatus(checklist.id, userId);
        return {
          ...checklist,
          completions: Object.fromEntries(completionStatus),
        };
      });
      
      return NextResponse.json(
        { checklists: checklistsWithCompletions },
        { status: 200 }
      );
    }
    
    return NextResponse.json(
      { checklists },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching checklists:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to fetch checklists' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/checklist
 * Create a new checklist (Truck Owner only)
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
    
    const userRole = (session.user as any).role;
    
    if (userRole !== 'owner') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Only truck owners can create checklists' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const { title, items } = body;
    
    if (!title || !items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Title and items array are required' },
        { status: 400 }
      );
    }
    
    const checklist = createChecklist({
      ownerId: (session.user as any).id,
      title,
      items,
    });
    
    return NextResponse.json(
      { checklist },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating checklist:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to create checklist' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/checklist?id=<checklistId>
 * Update a checklist (Truck Owner only)
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in' },
        { status: 401 }
      );
    }
    
    const userRole = (session.user as any).role;
    
    if (userRole !== 'owner') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Only truck owners can update checklists' },
        { status: 403 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const checklistId = searchParams.get('id');
    
    if (!checklistId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Checklist ID is required' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const { title, items } = body;
    
    const updatedChecklist = updateChecklist(checklistId, { title, items });
    
    if (!updatedChecklist) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Checklist not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { checklist: updatedChecklist },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating checklist:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to update checklist' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/checklist?id=<checklistId>
 * Delete a checklist (Truck Owner only)
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in' },
        { status: 401 }
      );
    }
    
    const userRole = (session.user as any).role;
    
    if (userRole !== 'owner') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Only truck owners can delete checklists' },
        { status: 403 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const checklistId = searchParams.get('id');
    
    if (!checklistId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Checklist ID is required' },
        { status: 400 }
      );
    }
    
    const success = deleteChecklist(checklistId);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Checklist not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: 'Checklist deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting checklist:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to delete checklist' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/checklist
 * Update completion status for a checklist item (Driver only)
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in' },
        { status: 401 }
      );
    }
    
    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;
    
    if (userRole !== 'driver') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Only drivers can update completion status' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const { checklistId, itemId, completed } = body;
    
    if (!checklistId || !itemId || typeof completed !== 'boolean') {
      return NextResponse.json(
        { error: 'Bad Request', message: 'checklistId, itemId, and completed status are required' },
        { status: 400 }
      );
    }
    
    const completion = updateCompletionStatus(checklistId, itemId, userId, completed);
    
    return NextResponse.json(
      { completion },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating completion status:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to update completion status' },
      { status: 500 }
    );
  }
}
