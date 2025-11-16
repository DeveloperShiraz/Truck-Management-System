'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';

interface NavItem {
  label: string;
  href: string;
  roles?: ('owner' | 'driver')[];
  requiresFleet?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Profile', href: '/profile' },
  { label: 'Fleet Management', href: '/fleet-management', roles: ['owner'] },
  { label: 'Telemetrics', href: '/telemetrics', requiresFleet: true },
  { label: 'Service', href: '/service', requiresFleet: true },
  { label: 'Chatbot', href: '/chatbot' },
  { label: 'Driver Checklist', href: '/driver-checklist', requiresFleet: true },
];

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!user) {
    return null;
  }

  const hasFleet = user.role === 'owner' || !!(user as any).fleetOwnerId;

  // Format role for display
  const formatRole = (role: string) => {
    return role === 'owner' ? 'Truck Owner' : 'Driver';
  };

  const visibleNavItems = navItems.filter((item) => {
    // Check role restrictions
    if (item.roles && !item.roles.includes(user.role)) {
      return false;
    }

    // Check fleet requirements
    if (item.requiresFleet && !hasFleet) {
      return false;
    }

    return true;
  });

  const handleLogout = async () => {
    await logout();
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-900">TMS</h1>
            </div>
            {/* Desktop Navigation */}
            <div className="hidden md:ml-6 md:flex md:space-x-4 lg:space-x-8">
              {visibleNavItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
          
          {/* Desktop User Info & Logout */}
          <div className="hidden md:flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              <span className="hidden lg:inline">{user.name} </span>
              <span className="text-gray-500">({formatRole(user.role)})</span>
            </span>
            <Button variant="secondary" onClick={handleLogout} className="text-sm">
              Logout
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {!isMobileMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {visibleNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobileMenu}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="px-4 flex items-center">
              <div className="flex-1">
                <div className="text-base font-medium text-gray-800">{user.name}</div>
                <div className="text-sm font-medium text-gray-500">{user.email}</div>
                <div className="text-xs text-gray-400 mt-1">Role: {formatRole(user.role)}</div>
              </div>
            </div>
            <div className="mt-3 px-2">
              <Button 
                variant="secondary" 
                onClick={handleLogout} 
                className="w-full text-left"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
