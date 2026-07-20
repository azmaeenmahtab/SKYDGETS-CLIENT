import { createAuthClient } from "better-auth/react";
import { jwtClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL,
  plugins: [jwtClient()],
});

export const { signIn, signOut, useSession } = authClient;

export const getJwtToken = async () => {
  try {
    const response = await fetch("/api/auth/token");
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return data?.token ?? null;
  } catch (error) {
    console.error("Failed to fetch token", error);
    return null;
  }
};
