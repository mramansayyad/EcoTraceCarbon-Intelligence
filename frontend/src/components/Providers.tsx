'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from './ui/Toast';
import { useAuth } from '../hooks/useAuth';

function AuthStateLoader({ children }: { children: React.ReactNode }) {
  // Execute the useAuth hook to keep auth state synced with Firebase and Firestore
  useAuth();
  return <>{children}</>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <AuthStateLoader>
        {children}
        <ToastContainer />
      </AuthStateLoader>
    </QueryClientProvider>
  );
}
