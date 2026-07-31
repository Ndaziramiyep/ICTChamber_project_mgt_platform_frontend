import type { AuthenticatedSession, User } from "@/domain/entities/user";

export interface RegistrationInput {
  emailAddress: string;
  plainTextPassword: string;
  displayName: string;
}

export interface LoginInput {
  emailAddress: string;
  plainTextPassword: string;
}

/**
 * Port for the authentication workflows exposed by the backend
 * (`/api/v1/auth/*`). Implemented by infrastructure, consumed by the application layer.
 */
export interface AuthRepository {
  register(input: RegistrationInput): Promise<User>;
  login(input: LoginInput): Promise<AuthenticatedSession>;
  refreshAccessToken(refreshToken: string): Promise<string>;
  getCurrentUser(): Promise<User>;
}
