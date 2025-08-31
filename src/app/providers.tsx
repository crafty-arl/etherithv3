'use client';

import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from '@/lib/auth/auth-context';
import { ReactNode } from 'react';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </SessionProvider>
  );
}