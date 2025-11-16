'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { JoinFleetForm } from '@/components/fleet/JoinFleetForm';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const { update } = useSession();
  const router = useRouter();

  const handleFleetJoinSuccess = async () => {
    // Update the session to reflect the new fleet membership
    await update();
    // Refresh the page to update navigation
    router.refresh();
    // Redirect to telemetrics page
    setTimeout(() => {
      router.push('/telemetrics');
    }, 500);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const hasFleet = user.role === 'owner' || !!(user as any).fleetOwnerId;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Welcome message for all users */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Welcome, {user.name}!
        </h2>
        <p className="text-gray-600">
          {user.role === 'owner' 
            ? 'Manage your fleet, track vehicles, and oversee operations from your dashboard.'
            : hasFleet
            ? 'Access your fleet resources, complete checklists, and monitor vehicle telemetrics.'
            : 'Join a fleet to access telemetrics, service information, and driver checklists.'}
        </p>
      </div>

      {/* Show JoinFleetForm for drivers without a fleet */}
      {user.role === 'driver' && !hasFleet && (
        <div className="mb-6">
          <JoinFleetForm onSuccess={handleFleetJoinSuccess} />
        </div>
      )}

      {/* Show quick links for users with fleet access */}
      {hasFleet && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {user.role === 'owner' && (
              <a
                href="/fleet-management"
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
              >
                <h3 className="font-semibold text-gray-900 mb-1">Fleet Management</h3>
                <p className="text-sm text-gray-600">
                  Manage drivers, generate fleet codes, and register trucks
                </p>
              </a>
            )}
            <a
              href="/telemetrics"
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
            >
              <h3 className="font-semibold text-gray-900 mb-1">Telemetrics</h3>
              <p className="text-sm text-gray-600">
                View vehicle performance and health data
              </p>
            </a>
            <a
              href="/service"
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
            >
              <h3 className="font-semibold text-gray-900 mb-1">Service</h3>
              <p className="text-sm text-gray-600">
                Track maintenance schedules and service history
              </p>
            </a>
            <a
              href="/driver-checklist"
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
            >
              <h3 className="font-semibold text-gray-900 mb-1">Driver Checklist</h3>
              <p className="text-sm text-gray-600">
                {user.role === 'owner' 
                  ? 'Create and manage driver checklists'
                  : 'View and complete assigned checklists'}
              </p>
            </a>
            <a
              href="/chatbot"
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
            >
              <h3 className="font-semibold text-gray-900 mb-1">Chatbot</h3>
              <p className="text-sm text-gray-600">
                Get help and answers to your questions
              </p>
            </a>
          </div>
        </div>
      )}

      {/* Alternative message for drivers without fleet */}
      {user.role === 'driver' && !hasFleet && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">
            Get Started with Your Truck
          </h3>
          <p className="text-blue-800 mb-4">
            To access fleet features, you have two options:
          </p>
          <div className="space-y-3">
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-1">Option 1: Join a Fleet</h4>
              <p className="text-sm text-gray-600">
                Enter a fleet code from a truck owner to join their fleet and access telemetrics, service tracking, and checklists.
              </p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-1">Option 2: Register Your Own Truck</h4>
              <p className="text-sm text-gray-600 mb-2">
                If you own a truck and want to manage it independently, switch your role to &quot;Truck Owner&quot; in your profile settings to register and manage your vehicles.
              </p>
              <a
                href="/profile"
                className="inline-block text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Go to Profile →
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
