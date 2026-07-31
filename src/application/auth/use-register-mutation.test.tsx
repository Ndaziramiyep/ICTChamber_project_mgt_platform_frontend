import { renderHook, waitFor, act } from "@testing-library/react";

import { useAuthStore } from "@/application/auth/auth-store";
import { useRegisterMutation } from "@/application/auth/use-register-mutation";
import {
  createFakeRepositories,
  createProvidersWrapper,
  resetAuthStore,
} from "@test/support/render-with-providers";

describe("useRegisterMutation", () => {
  afterEach(resetAuthStore);

  it("registers and immediately logs the user in", async () => {
    const repositories = createFakeRepositories();
    const { result } = renderHook(() => useRegisterMutation(), {
      wrapper: createProvidersWrapper(repositories),
    });

    act(() => {
      result.current.mutate({
        emailAddress: "jane@example.com",
        plainTextPassword: "at-least-8-characters",
        displayName: "Jane Doe",
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(useAuthStore.getState().user?.displayName).toBe("Jane Doe");
    expect(repositories.tokenStorage.getTokens()).not.toBeNull();
  });

  it("surfaces a conflict error when the email is already registered", async () => {
    const repositories = createFakeRepositories();
    await repositories.authRepository.register({
      emailAddress: "jane@example.com",
      plainTextPassword: "at-least-8-characters",
      displayName: "Jane Doe",
    });

    const { result } = renderHook(() => useRegisterMutation(), {
      wrapper: createProvidersWrapper(repositories),
    });

    act(() => {
      result.current.mutate({
        emailAddress: "jane@example.com",
        plainTextPassword: "another-password",
        displayName: "Jane Again",
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toMatchObject({ httpStatus: 409 });
  });
});
