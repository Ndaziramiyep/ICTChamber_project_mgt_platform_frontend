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
 */
export function useSessionBootstrap(): { isBootstrapping: boolean } {
  const { authRepository, tokenStorage } = useRepositories();
  const setUser = useAuthStore((state) => state.setUser);
  const hasStoredTokens = tokenStorage.getTokens() !== null;

  const query = useQuery({
    queryKey: queryKeys.session.currentUser,
    queryFn: () => authRepository.getCurrentUser(),
    enabled: hasStoredTokens,
    retry: false,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (query.data) {
      setUser(query.data);
    }
  }, [query.data, setUser]);

  useEffect(() => {
    if (query.isError) {
      setUser(null);
    }
  }, [query.isError, setUser]);

  return { isBootstrapping: hasStoredTokens && query.isPending };
}
