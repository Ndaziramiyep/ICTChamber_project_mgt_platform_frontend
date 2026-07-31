/** An authenticated ICT Chamber Kanban user. */
export interface User {
  userId: string;
  emailAddress: string;
  displayName: string;
  accountCreatedAt: string;
  isAccountActive: boolean;
}

export interface AuthenticatedSession {
  user: User;
  accessToken: string;
  refreshToken: string;
}
