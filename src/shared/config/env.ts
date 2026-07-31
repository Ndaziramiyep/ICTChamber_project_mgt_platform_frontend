/**
 * Centralized access to build-time environment variables so the rest of the
 * codebase never touches `import.meta.env` directly.
 */
export const environmentConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
} as const;
