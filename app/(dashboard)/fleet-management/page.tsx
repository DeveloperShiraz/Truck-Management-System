'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FleetCodeGenerator } from '@/components/fleet/FleetCodeGenerator';
import { FleetMemberList } from '@/components/fleet/FleetMemberList';
import { TruckRegistration } from '@/components/fleet/TruckRegistration';

export const dynamic = 'force-dynamic';

interface FleetCodeData {
  code: string;
  expiresAt: string;
  createdAt: string;
}

interface FleetMemberData {
  id: string;
  driverId: string;
  driverEmail: string;
  driverName: string;
  joinedAt: string;
}

interface TruckData {
  id: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  licensePlate: string;
  registeredAt: string;
  status: string;
}

export default function FleetManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeCode, setActiveCode] = useState<FleetCodeData | null>(null);
  const [members, setMembers] = useState<FleetMemberData[]>([]);
  const [trucks, setTrucks] = useState<TruckData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Route guard: Only Truck Owners can access this page
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }
    
    if ((session.user as any)?.role !== 'owner') {
      router.push('/profile');
      return;
    }
  }, [session, status, router]);

  // Fetch active fleet code, members, and trucks
  const fetchFleetData = async () => {
    setIsLoading(true);
    
    try {
      // Fetch active fleet code
      const codeResponse = await fetch('/api/fleet/generate-code');
      if (codeResponse.ok) {
        const codeData = await codeResponse.json();
        setActiveCode(codeData.code ? codeData : null);
      } else if (codeResponse.status === 404) {
        setActiveCode(null);
      }

      // Fetch fleet members
      const membersResponse = await fetch('/api/fleet/members');
      if (membersResponse.ok) {
        const membersData = await membersResponse.json();
        setMembers(membersData.members || []);
      }

      // Fetch trucks
      const trucksResponse = await fetch('/api/trucks');
      if (trucksResponse.ok) {
        const trucksData = await trucksResponse.json();
        setTrucks(trucksData.trucks || []);
      }
    } catch (error) {
      console.error('Error fetching fleet data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if ((session?.user as any)?.role === 'owner') {
      fetchFleetData();
    }
  }, [session]);

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!session || (session.user as any)?.role !== 'owner') {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-0">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Fleet Management</h1>
      
      <div className="space-y-4 sm:space-y-6">
        <TruckRegistration
          trucks={trucks}
          onTruckRegistered={fetchFleetData}
        />
        
        <FleetCodeGenerator
          activeCode={activeCode}
          onCodeGenerated={fetchFleetData}
          onCodeDeleted={fetchFleetData}
        />
        
        <FleetMemberList
          members={members}
          onMemberRemoved={fetchFleetData}
        />
      </div>
    </div>
  );
}
