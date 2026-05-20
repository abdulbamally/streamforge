/** Subset of JWT access claims verified by social-service. */
export interface AccessTokenUser {
  sub: string;
  email: string;
  username: string;
  plan: string;
  emailVerified: boolean;
}
