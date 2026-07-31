import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { useAuthStore } from "@/application/auth/auth-store";
import { useRepositories } from "@/application/repository-provider";

/** Returns a stable callback that clears the session locally (no server-side logout endpoint exists). */
export function useLogoutAction(): () => void {
  const { tokenStorage } = useRepositories();
  const setUser = useAuthStore((state) => state.setUser);
  const queryClient = useQueryClient();

  return useCallback(() => {
    tokenStorage.clearTokens();
    setUser(null);
    queryClient.clear();
  }, [tokenStorage, setUser, queryClient]);
}
