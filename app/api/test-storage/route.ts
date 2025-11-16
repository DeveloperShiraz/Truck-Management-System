import { NextResponse } from 'next/server';
import { getAllUsersFromFile } from '@/lib/storage/hybridStorage';

export async function GET() {
  try {
    const users = getAllUsersFromFile();
    
    return NextResponse.json({
      success: true,
      count: users.length,
      users: users.map(u => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        passwordHash: u.password.substring(0, 20) + '...',
      })),
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
