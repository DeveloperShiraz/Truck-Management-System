'use client';

import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from '@/contexts/AuthContext';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { errorLogger } from '@/lib/utils/errorLogger';

interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    errorLogger.log(error, {
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    });
  };

  return (
    <ErrorBoundary onError={handleError}>
      <SessionProvider>
        <AuthProvider>{children}</AuthProvider>
      </SessionProvider>
    </ErrorBoundary>
  );
};
