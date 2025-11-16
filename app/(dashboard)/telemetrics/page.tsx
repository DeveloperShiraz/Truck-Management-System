'use client';

import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';

export default function TelemetricsPage() {
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
  const mockTelemetrics = {
    odometer: 125847,
    oilLevel: 85,
    fuelLevel: 62,
    engineTemp: 195,
    tirePressure: [32, 32, 31, 33],
    lastUpdated: new Date().toLocaleString(),
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Telemetrics</h1>
      
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
                This page displays mock telemetrics data. In future updates, this will integrate with AWS IoT Core 
                to provide real-time data from your trucks including odometer readings, oil levels, fuel consumption, 
                engine temperature, tire pressure, and more.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Telemetrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {/* Odometer */}
        <Card title="Odometer">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {mockTelemetrics.odometer.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">miles</div>
          </div>
        </Card>

        {/* Oil Level */}
        <Card title="Oil Level">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {mockTelemetrics.oilLevel}%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
              <div 
                className="bg-green-600 h-2.5 rounded-full" 
                style={{ width: `${mockTelemetrics.oilLevel}%` }}
              ></div>
            </div>
          </div>
        </Card>

        {/* Fuel Level */}
        <Card title="Fuel Level">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {mockTelemetrics.fuelLevel}%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${mockTelemetrics.fuelLevel}%` }}
              ></div>
            </div>
          </div>
        </Card>

        {/* Engine Temperature */}
        <Card title="Engine Temperature">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {mockTelemetrics.engineTemp}°F
            </div>
            <div className="text-sm text-gray-500">Normal operating range</div>
          </div>
        </Card>

        {/* Tire Pressure */}
        <Card title="Tire Pressure" className="md:col-span-2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {mockTelemetrics.tirePressure.map((pressure, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {pressure}
                </div>
                <div className="text-xs text-gray-500">
                  Tire {index + 1} (PSI)
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Additional Metrics Section */}
      <Card title="Performance Metrics">
        <div className="space-y-4">
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600">Average Speed</span>
            <span className="font-semibold text-gray-900">58 mph</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600">Fuel Efficiency</span>
            <span className="font-semibold text-gray-900">6.8 mpg</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600">Engine Hours</span>
            <span className="font-semibold text-gray-900">8,432 hrs</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-600">Last Updated</span>
            <span className="font-semibold text-gray-900">{mockTelemetrics.lastUpdated}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
