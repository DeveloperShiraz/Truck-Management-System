'use client';

import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';

export const dynamic = 'force-dynamic';

export default function ServicePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Route guard: Require authentication and fleet membership
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }
    
    const userRole = (session.user as any)?.role;
    const hasFleet = (session.user as any)?.fleetOwnerId;
    
    // Drivers must be part of a fleet to access this page
    // Owners always have access (they own the fleet)
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

  // Mock data for demonstration
  const mockServiceHistory = [
    {
      id: 1,
      serviceType: 'Oil Change',
      date: '2024-11-01',
      mileage: 124500,
      description: 'Regular oil and filter change',
      cost: 125.00,
      nextServiceDue: '2025-02-01',
    },
    {
      id: 2,
      serviceType: 'Tire Rotation',
      date: '2024-10-15',
      mileage: 123000,
      description: 'Rotated all four tires and checked alignment',
      cost: 80.00,
      nextServiceDue: '2025-01-15',
    },
    {
      id: 3,
      serviceType: 'Brake Inspection',
      date: '2024-09-20',
      mileage: 121500,
      description: 'Inspected brake pads and rotors - all good',
      cost: 50.00,
      nextServiceDue: '2025-03-20',
    },
  ];

  const upcomingMaintenance = [
    {
      id: 1,
      serviceType: 'Oil Change',
      dueDate: '2025-02-01',
      dueMileage: 130000,
      priority: 'medium',
    },
    {
      id: 2,
      serviceType: 'Tire Rotation',
      dueDate: '2025-01-15',
      dueMileage: 129000,
      priority: 'low',
    },
    {
      id: 3,
      serviceType: 'Annual Inspection',
      dueDate: '2025-01-10',
      dueMileage: null,
      priority: 'high',
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Service & Maintenance</h1>
      
      {/* Informational Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Future AWS Integration
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                This page displays mock service and maintenance data. In future updates, this will integrate with AWS services 
                to provide automated maintenance scheduling, service history tracking, maintenance alerts, and integration with 
                service providers for seamless fleet management.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Maintenance */}
      <Card title="Upcoming Maintenance" className="mb-6">
        <div className="space-y-3">
          {upcomingMaintenance.map((item) => (
            <div 
              key={item.id} 
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h4 className="font-semibold text-gray-900">{item.serviceType}</h4>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(item.priority)}`}>
                    {item.priority.toUpperCase()}
                  </span>
                </div>
                <div className="mt-1 text-sm text-gray-600">
                  Due: {item.dueDate}
                  {item.dueMileage && ` • ${item.dueMileage.toLocaleString()} miles`}
                </div>
              </div>
              <button className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors">
                Schedule
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Service History */}
      <Card title="Service History">
        <div className="space-y-4">
          {mockServiceHistory.map((service) => (
            <div 
              key={service.id} 
              className="pb-4 border-b border-gray-200 last:border-b-0 last:pb-0"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold text-gray-900">{service.serviceType}</h4>
                  <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                </div>
                <span className="font-semibold text-gray-900">${service.cost.toFixed(2)}</span>
              </div>
              <div className="flex gap-4 text-sm text-gray-500">
                <span>Date: {service.date}</span>
                <span>•</span>
                <span>Mileage: {service.mileage.toLocaleString()}</span>
                <span>•</span>
                <span>Next Service: {service.nextServiceDue}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Maintenance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <Card title="Total Service Cost">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">
              ${mockServiceHistory.reduce((sum, s) => sum + s.cost, 0).toFixed(2)}
            </div>
            <div className="text-sm text-gray-500 mt-1">Last 3 months</div>
          </div>
        </Card>

        <Card title="Services Completed">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">
              {mockServiceHistory.length}
            </div>
            <div className="text-sm text-gray-500 mt-1">This year</div>
          </div>
        </Card>

        <Card title="Next Service">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">
              {upcomingMaintenance[0]?.dueDate || 'N/A'}
            </div>
            <div className="text-sm text-gray-500 mt-1">{upcomingMaintenance[0]?.serviceType || 'No upcoming service'}</div>
          </div>
        </Card>
      </div>
    </div>
  );
}
