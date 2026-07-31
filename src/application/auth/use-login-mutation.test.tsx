import {
  createFakeRepositories,
  createProvidersWrapper,
  resetAuthStore,
} from "@test/support/render-with-providers";
import { renderHook, waitFor, act } from "@testing-library/react";

import { useAuthStore } from "@/application/auth/auth-store";
import { useLoginMutation } from "@/application/auth/use-login-mutation";

describe("useLoginMutation", () => {
  afterEach(resetAuthStore);

  it("saves tokens and sets the auth store user on success", async () => {
    const repositories = createFakeRepositories();
    await repositories.authRepository.register({
      emailAddress: "jane@example.com",
      plainTextPassword: "at-least-8-characters",
      displayName: "Jane Doe",
    });

    const { result } = renderHook(() => useLoginMutation(), {
      wrapper: createProvidersWrapper(repositories),
    });

    act(() => {
      result.current.mutate({
        emailAddress: "jane@example.com",
        plainTextPassword: "at-least-8-characters",
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(useAuthStore.getState().user?.emailAddress).toBe("jane@example.com");
    expect(repositories.tokenStorage.getTokens()).not.toBeNull();
  });

  it("surfaces an error and does not set a user on bad credentials", async () => {
    const repositories = createFakeRepositories();
    const { result } = renderHook(() => useLoginMutation(), {
      wrapper: createProvidersWrapper(repositories),
    });

    act(() => {
      result.current.mutate({
        emailAddress: "nobody@example.com",
        plainTextPassword: "wrong-password",
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(useAuthStore.getState().user).toBeNull();
    expect(repositories.tokenStorage.getTokens()).toBeNull();
  });
});
