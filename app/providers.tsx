"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { useState } from "react";
import { LayoutWrapper } from "@/components/common/LayoutWrapper";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster richColors position="top-right" />
      <LayoutWrapper>{children}</LayoutWrapper>
    </QueryClientProvider>
  );
}
