"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, createContext, useContext } from "react";

// ═══════════════════════════════════════════════════════════════════
// QUERY CLIENT CONTEXT
//
// Exposes the QueryClient instance so hooks can programmatically
// invalidate/clear all queries (e.g., when admin clicks "Invalidate All Caches")
// ═══════════════════════════════════════════════════════════════════

const QueryClientContext = createContext<QueryClient | null>(null);

/**
 * Hook to access the QueryClient instance directly.
 * Useful for invalidating all queries after backend cache clear.
 */
export function useQueryClientInstance(): QueryClient {
  const client = useContext(QueryClientContext);
  if (!client) {
    throw new Error("useQueryClientInstance must be used within QueryProvider");
  }
  return client;
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientContext.Provider value={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
      </QueryClientProvider>
    </QueryClientContext.Provider>
  );
}
