import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { useAuthStore } from "@/application/auth/auth-store";
import { queryKeys } from "@/application/query-keys";
import { useRepositories } from "@/application/repository-provider";

/**
 * Restores a session on app load: if tokens are already stored, confirms them against
 * `GET /auth/me` and populates the auth store, so a reload doesn't force a fresh login. If the
 * tokens turn out to be dead, the api-client's interceptor has already cleared them by the time
 * this query settles into an error.
 *
 * The store is updated from inside `queryFn` itself, not a `useEffect` on `query.data` — an
 * effect fires a render after `isPending` already flips to `false`, so a guard component
 * reading the store on that same render would see a stale `null` user and redirect incorrectly.
 */
export function useSessionBootstrap(): { isBootstrapping: boolean } {
  const { authRepository, tokenStorage } = useRepositories();
  const setUser = useAuthStore((state) => state.setUser);
  const hasStoredTokens = tokenStorage.getTokens() !== null;

  const query = useQuery({
    queryKey: queryKeys.session.currentUser,
    queryFn: async () => {
      const user = await authRepository.getCurrentUser();
      setUser(user);
      return user;
    },
    enabled: hasStoredTokens,
    retry: false,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (query.isError) {
      setUser(null);
    }
  }, [query.isError, setUser]);

  return { isBootstrapping: hasStoredTokens && query.isPending };
}
