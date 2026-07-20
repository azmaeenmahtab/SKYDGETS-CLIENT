/**
 * Shared API fetch wrapper.
 *
 * - Reads NEXT_PUBLIC_API_URL for the base URL.
 * - Attaches Authorization header using Better Auth JWT.
 * - Normalizes all errors into { message: string, status: number } shape.
 */
import { getJwtToken } from "@/lib/auth-client";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export interface ApiErrorShape {
  message: string;
  status: number;
}

export class ApiClientError extends Error {
  public readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
  }
}

async function parseErrorResponse(res: Response): Promise<string> {
  try {
    const data = await res.json();
    return data?.error ?? data?.message ?? res.statusText;
  } catch {
    return res.statusText;
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

// In-memory token cache
let cachedToken: string | null = null;
let tokenExpiresAt: number | null = null;

async function getValidToken(): Promise<string | null> {
  // If we have a cached token and it expires in more than 1 minute, use it.
  // Note: the JWT plugin defaults to 1h. We don't have the exact decoded expiry time here on the client
  // without a JWT parsing library. For simplicity, we just fetch a new one if it's been ~50 mins.
  // Actually, better-auth's `getJwt()` is quite fast as it checks the session cookie on its end.
  // To implement "only refetch when expired" strictly, we should parse the JWT to get 'exp'.
  
  if (cachedToken && tokenExpiresAt && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  const token = await getJwtToken();
  if (token) {
    cachedToken = token;
    // Cache for 55 minutes (assuming 1h expiration time set in backend/frontend)
    tokenExpiresAt = Date.now() + 55 * 60 * 1000;
    return cachedToken;
  }
  
  cachedToken = null;
  tokenExpiresAt = null;
  return null;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, ...rest } = options;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(rest.headers ?? {}),
  };

  const token = await getValidToken();
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const message = await parseErrorResponse(res);
    throw new ApiClientError(message, res.status);
  }

  // 204 No Content — return empty
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

/** Convenience helpers */
export const apiGet = <T>(path: string, opts?: RequestOptions) =>
  apiRequest<T>(path, { ...opts, method: "GET" });

export const apiPost = <T>(path: string, body: unknown, opts?: RequestOptions) =>
  apiRequest<T>(path, { ...opts, method: "POST", body });

export const apiPatch = <T>(path: string, body: unknown, opts?: RequestOptions) =>
  apiRequest<T>(path, { ...opts, method: "PATCH", body });

export const apiDelete = <T>(path: string, opts?: RequestOptions) =>
  apiRequest<T>(path, { ...opts, method: "DELETE" });
