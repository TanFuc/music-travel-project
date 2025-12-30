'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

// Optimized React Query configuration for performance
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // 5 minutes - data considered fresh, no refetch
        staleTime: 5 * 60 * 1000,
        // 10 minutes - keep unused data in cache
        gcTime: 10 * 60 * 1000,
        // Only retry once on failure
        retry: 1,
        // Don't refetch on window focus (reduces API calls)
        refetchOnWindowFocus: false,
        // Don't refetch on reconnect unless stale
        refetchOnReconnect: 'always',
        // Use cached data while refetching
        placeholderData: (previousData: unknown) => previousData,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

// Singleton pattern for SSR safety
let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always create a new query client
    return makeQueryClient();
  } else {
    // Browser: reuse client across renders
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
