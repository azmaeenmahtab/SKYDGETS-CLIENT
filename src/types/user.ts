// User type definitions
export type UserRole = "customer" | "admin";
export type AuthProvider = "credentials" | "google";

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  provider: AuthProvider;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
}
