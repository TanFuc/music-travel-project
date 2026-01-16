'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

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
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

export function Providers({ children }: { children: ReactNode }) {
  // Create a stable query client instance using useState
  const [queryClient] = useState(() => makeQueryClient());

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
