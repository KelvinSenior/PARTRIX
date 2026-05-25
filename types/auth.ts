export type UserRole = "ADMIN" | "MANAGER" | "STAFF";

export interface JwtTokenPayload {
  sub: string;
  email: string;
  role: UserRole;
}

export interface JwtPayload extends JwtTokenPayload {
  iat: number;
  exp: number;
}

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
}

export interface AuthContextValue {
  user: SessionUser | null;
  loading: boolean;
  refreshSession: () => Promise<void>;
  logout: () => Promise<void>;
}
