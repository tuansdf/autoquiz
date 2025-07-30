import { MutationCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";

const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onSuccess: (_data, _var, _ctx, mutation) => {
      if (mutation.options.mutationKey) {
        queryClient.invalidateQueries({
          queryKey: mutation.options.mutationKey,
        });
      }
    },
  }),
});

export const QueryProvider = (props: PropsWithChildren) => {
  return <QueryClientProvider client={queryClient}>{props.children}</QueryClientProvider>;
};
