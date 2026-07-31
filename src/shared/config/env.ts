/**
 * Centralized access to build-time environment variables so the rest of the
 * codebase never touches `import.meta.env` directly.
 *
 * `VITE_API_BASE_URL` is baked in at build time, not read at runtime — a deploy platform must
 * have it set as a build-time environment variable (not just in a local, gitignored `.env`)
 * or every request silently falls back to a relative URL against the frontend's own origin,
 * which manifests as a confusing 404 instead of a clear error.
 */
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

if (!apiBaseUrl) {
  throw new Error(
    "VITE_API_BASE_URL is not set. Set it as a build-time environment variable on your " +
      "deploy platform (e.g. Vercel project settings) and redeploy — a local .env file is " +
      "not available during a hosted build.",
  );
}

export const environmentConfig = {
  apiBaseUrl,
} as const;
