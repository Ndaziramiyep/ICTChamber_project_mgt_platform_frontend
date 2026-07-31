import { useMutation } from "@tanstack/react-query";

import { useAuthStore } from "@/application/auth/auth-store";
import { useRepositories } from "@/application/repository-provider";
import type { AuthenticatedSession } from "@/domain/entities/user";
import type { RegistrationInput } from "@/domain/repositories/auth-repository";

/**
 * The backend's `/auth/register` only returns the created profile, not tokens, so this
 * immediately logs the new user in for a one-step signup experience.
 */
export function useRegisterMutation() {
  const { authRepository, tokenStorage } = useRepositories();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation<AuthenticatedSession, unknown, RegistrationInput>({
    mutationFn: async (input) => {
      await authRepository.register(input);
      return authRepository.login({
        emailAddress: input.emailAddress,
        plainTextPassword: input.plainTextPassword,
      });
    },
    onSuccess: (session) => {
      tokenStorage.saveTokens({
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
      });
      setUser(session.user);
    },
  });
}
