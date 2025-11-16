'use client';

import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ChecklistManager } from '@/components/checklist/ChecklistManager';
import { ChecklistViewer } from '@/components/checklist/ChecklistViewer';

export default function DriverChecklistPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Route guard: Require authentication and fleet membership for drivers
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }
    
    const userRole = (session.user as any)?.role;
    const hasFleet = (session.user as any)?.fleetOwnerId;
    
    // Drivers must be part of a fleet to access this page
    if (userRole === 'driver' && !hasFleet) {
      router.push('/profile');
      return;
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const userRole = (session.user as any)?.role;
  const hasFleet = (session.user as any)?.fleetOwnerId;

  // Drivers without fleet should not see this page
  if (userRole === 'driver' && !hasFleet) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Driver Checklist</h1>
      
      {userRole === 'owner' ? (
        <ChecklistManager />
      ) : (
        <ChecklistViewer />
      )}
    </div>
  );
}
