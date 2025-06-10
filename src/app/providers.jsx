"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { ReactQueryStreamedHydration } from "@tanstack/react-query-next-experimental";

export function Providers({ children }) {
  // now React.useState is valid
  const [client] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { refetchOnWindowFocus: false, staleTime: 1000 * 60 },
        },
      })
  );

  return (
    <QueryClientProvider client={client}>
      <ThemeProvider
        attribute="class"
        enableSystem={false}
        defaultTheme="light"
        disableTransitionOnChange
      >
        <ReactQueryStreamedHydration>{children}</ReactQueryStreamedHydration>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
