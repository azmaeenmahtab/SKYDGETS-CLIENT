import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Edge-runtime safe: only uses fetch + request headers, no Node/Mongo imports.
export async function proxy(request: NextRequest) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const baseUrl = process.env.BETTER_AUTH_URL || request.nextUrl.origin;

  const res = await fetch(`${baseUrl}/api/auth/get-session`, {
    headers: { cookie: cookieHeader },
    cache: "no-store",
  });

  const session = res.ok ? await res.json() : null;

  // Not authenticated at all → redirect to login
  if (!session || !session.user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  const { pathname } = request.nextUrl;
  const role = session.user.role ?? "user";

  // Admin-only routes: /items/add, /items/manage, /admin/*
  const adminOnlyPaths = ["/items/add", "/items/manage", "/admin"];
  const requiresAdmin = adminOnlyPaths.some((p) => pathname.startsWith(p));

  if (requiresAdmin && role !== "admin") {
    // Authenticated but not admin → redirect to home with a toast param
    return NextResponse.redirect(new URL("/?error=unauthorized", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/items/:path*",
    "/orders/:path*",
    "/profile/:path*",
    "/admin/:path*",
  ],
};
