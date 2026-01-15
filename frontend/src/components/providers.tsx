'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

// Optimized React Query configuration for performance
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // 10 minutes - data considered fresh, no refetch
        staleTime: 10 * 60 * 1000,
        // 30 minutes - keep unused data in cache
        gcTime: 30 * 60 * 1000,
        // Disable retry to prevent duplicate requests
        retry: false,
        // Don't refetch on window focus (reduces API calls)
        refetchOnWindowFocus: false,
        // Only refetch on reconnect if data is stale
        refetchOnReconnect: false,
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
