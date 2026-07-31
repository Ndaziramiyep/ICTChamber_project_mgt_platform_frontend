import type { AxiosInstance } from "axios";

import type { AuthenticatedSession, User } from "@/domain/entities/user";
import type {
  AuthRepository,
  LoginInput,
  RegistrationInput,
} from "@/domain/repositories/auth-repository";
import { mapUserResponse } from "@/infrastructure/repositories/mappers";
import type {
  AccessTokenResponseSchema,
  TokenPairResponseSchema,
  UserProfileResponseSchema,
} from "@/infrastructure/repositories/wire-schemas";

/** Implements {@link AuthRepository} against `/api/v1/auth/*`. */
export class HttpAuthRepository implements AuthRepository {
  constructor(private readonly httpClient: AxiosInstance) {}

  async register(input: RegistrationInput): Promise<User> {
    const response = await this.httpClient.post<UserProfileResponseSchema>(
      "/api/v1/auth/register",
      {
        email_address: input.emailAddress,
        plain_text_password: input.plainTextPassword,
        display_name: input.displayName,
      },
    );
    return mapUserResponse(response.data);
  }

  async login(input: LoginInput): Promise<AuthenticatedSession> {
    const tokenResponse = await this.httpClient.post<TokenPairResponseSchema>(
      "/api/v1/auth/login",
      {
        email_address: input.emailAddress,
        plain_text_password: input.plainTextPassword,
      },
    );

    const accessToken = tokenResponse.data.access_token_value;
    const refreshToken = tokenResponse.data.refresh_token_value;

    const userResponse = await this.httpClient.get<UserProfileResponseSchema>("/api/v1/auth/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    return {
      user: mapUserResponse(userResponse.data),
      accessToken,
      refreshToken,
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<string> {
    const response = await this.httpClient.post<AccessTokenResponseSchema>("/api/v1/auth/refresh", {
      refresh_token_value: refreshToken,
    });
    return response.data.access_token_value;
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.httpClient.get<UserProfileResponseSchema>("/api/v1/auth/me");
    return mapUserResponse(response.data);
  }
}
