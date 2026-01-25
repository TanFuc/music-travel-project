'use client';

import { QueryClient, QueryClientProvider, isServer } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

// Browser-side query client singleton
let browserQueryClient: QueryClient | undefined = undefined;

// Optimized React Query configuration for performance
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // 5 minutes - data considered fresh, no refetch
        staleTime: 5 * 60 * 1000,
        // 30 minutes - keep unused data in cache
        gcTime: 30 * 60 * 1000,
        // Disable retry to prevent duplicate requests
        retry: false,
        // Don't refetch on window focus (reduces API calls)
        refetchOnWindowFocus: false,
        // Only refetch on reconnect if data is stale
        refetchOnReconnect: false,
        // Use previous data while fetching new data (prevents loading flicker)
        placeholderData: (previousData: unknown) => previousData,
        // Reduce network mode to avoid blocking
        networkMode: 'offlineFirst',
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

function getQueryClient() {
  if (isServer) {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    // This ensures we reuse the same client across renders
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

export function Providers({ children }: { children: ReactNode }) {
  // Use getQueryClient to get or create the singleton
  const [queryClient] = useState(getQueryClient);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
