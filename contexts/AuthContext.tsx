'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useSession, signOut as nextAuthSignOut } from 'next-auth/react';
import { UserRole } from '@/lib/types/user';

interface AuthContextType {
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    fleetOwnerId?: string;
  } | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';

  const user = session?.user
    ? {
        id: (session.user as any).id,
        email: session.user.email || '',
        name: session.user.name || '',
        role: (session.user as any).role as UserRole,
        fleetOwnerId: (session.user as any).fleetOwnerId,
      }
    : null;

  const logout = async () => {
    await nextAuthSignOut({ redirect: true, callbackUrl: '/login' });
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!session,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
