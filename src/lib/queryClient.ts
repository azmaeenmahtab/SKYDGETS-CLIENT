import { QueryClient } from "@tanstack/react-query";

/**
 * Singleton QueryClient instance shared across the app.
 * Created once at module load — not inside a component to avoid recreating on render.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
    },
  },
});
