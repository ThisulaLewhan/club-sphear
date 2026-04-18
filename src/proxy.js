// Feature Domain: Authentication & Access Control

// locks down routes so only logged in users can see them
// Note: renamed from middleware() to proxy() for Next.js 16+
// Uses `jose` (not `jsonwebtoken`) because the proxy runs on the Edge runtime.

import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

/** Returns the correct home dashboard URL for a given role */
function getDashboardForRole(role) {
  if (role === "mainAdmin" || role === "admin") return "/admin-dashboard";
  if (role === "club") return "/club-dashboard";
  return "/"; // students default to home page
}

/** Verify JWT token using jose (Edge-compatible). Returns payload or null. */
async function getTokenPayload(token) {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

export async function proxy(request) {
  const { pathname } = request.nextUrl;
  const rawToken = request.cookies.get("auth_token")?.value;

  // Decode the token so we know the role (without a DB call)
  const user = rawToken ? await getTokenPayload(rawToken) : null;
  const isLoggedIn = !!user;

  // ── Paths that require login ──────────────────────────────────────────────
  const protectedPaths = ["/student-profile", "/club-dashboard", "/admin-dashboard"];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Role-based dashboard guards ───────────────────────────────────────────
  if (isLoggedIn && user) {
    const role = user.role;

    if (pathname.startsWith("/admin-dashboard") && role !== "admin" && role !== "mainAdmin") {
      return NextResponse.redirect(new URL(getDashboardForRole(role), request.url));
    }

    if (pathname.startsWith("/club-dashboard") && role !== "club") {
      return NextResponse.redirect(new URL(getDashboardForRole(role), request.url));
    }

    if (pathname.startsWith("/student-profile") && role !== "student") {
      return NextResponse.redirect(new URL(getDashboardForRole(role), request.url));
    }
  }

  // ── Auth pages: redirect already-logged-in users to their dashboard ───────
  const authPaths = ["/auth/login", "/auth/register"];
  const isAuthPage = authPaths.some((p) => pathname.startsWith(p));

  if (isAuthPage && isLoggedIn && user) {
    return NextResponse.redirect(new URL(getDashboardForRole(user.role), request.url));
  }

  return NextResponse.next();
}

// Match all protected routes and auth pages
export const config = {
  matcher: [
    "/student-profile/:path*",
    "/club-dashboard/:path*",
    "/admin-dashboard/:path*",
    "/auth/login",
    "/auth/register",
  ],
};
