import { setupServer } from "msw/node";

import { handlers, mockBackend } from "./handlers";

export const server = setupServer(...handlers);

/** Call from `beforeAll`/`afterAll`/`afterEach` in any test suite that hits the mock backend. */
export function registerMockServerLifecycleHooks(): void {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
  afterEach(() => {
    server.resetHandlers();
    mockBackend.reset();
  });
  afterAll(() => server.close());
}
