/**
 * Test-only stand-in for `@/shared/config/env`, which reads Vite's `import.meta.env` — syntax
 * ts-jest cannot compile under CommonJS. Wired in via jest.config.js `moduleNameMapper`.
 */
export const environmentConfig = {
  apiBaseUrl: "http://localhost:8000",
} as const;
