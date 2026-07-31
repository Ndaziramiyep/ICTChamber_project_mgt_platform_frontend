import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useAuthStore } from "@/application/auth/auth-store";
import { useRepositories } from "@/application/repository-provider";
import type { LoginInput } from "@/domain/repositories/auth-repository";

export function useLoginMutation() {
  const { authRepository, tokenStorage } = useRepositories();
  const setUser = useAuthStore((state) => state.setUser);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: LoginInput) => authRepository.login(input),
    onSuccess: (session) => {
      tokenStorage.saveTokens({
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
      });
      setUser(session.user);
      void queryClient.invalidateQueries();
    },
  });
}
