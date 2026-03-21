/**
 * Next.js Middleware — Route Protection
 * ======================================
 * Protects routes based on authentication status.
 * 
 * Rules:
 * - /student-profile/* → Requires authentication → redirects to /auth/login if not logged in
 * - /auth/login, /auth/register → Only for unauthenticated users → redirects to /student-profile if logged in
 * 
 * Owner: Lisura (Authentication & Student Profile Module)
 */

import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth_token")?.value;

  // Protected routes — require authentication
  const protectedPaths = ["/student-profile"];
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

  // Auth routes — only for unauthenticated users
  const authPaths = ["/auth/login", "/auth/register"];
  const isAuthPage = authPaths.some((path) => pathname.startsWith(path));

  // If accessing protected route without token → redirect to login
  if (isProtected && !token) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If accessing auth pages with token → redirect to profile
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/student-profile", request.url));
  }

  return NextResponse.next();
}

// Only run middleware on these paths
export const config = {
  matcher: ["/student-profile/:path*", "/auth/:path*"],
};
