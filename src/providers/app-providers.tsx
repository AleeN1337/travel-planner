"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { CookieBanner } from "@/components/legal/cookie-banner";
import { getQueryClient } from "@/lib/query-client";
import { Toaster } from "@/components/ui/sonner";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <CookieBanner />
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}
