/**
 * Lightweight server-only fetch helper.
 * Used inside Next.js Server Components / RSC to call the backend directly.
 * Does NOT import auth-client (browser-only). Public endpoints need no token.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export async function serverFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    next: { revalidate: 30 }, // ISR: revalidate every 30s
  });

  if (!res.ok) {
    let message = res.statusText;
    try {
      const data = await res.json();
      message = data?.error ?? data?.message ?? message;
    } catch {}
    throw new Error(`API Error ${res.status}: ${message}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
