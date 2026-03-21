// locks down routes so only logged in users can see them

import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth_token")?.value;

  // paths that require login
  const protectedPaths = ["/student-profile"];
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

  // paths only for logged out users
  const authPaths = ["/auth/login", "/auth/register"];
  const isAuthPage = authPaths.some((path) => pathname.startsWith(path));

  // kick them out to login if they try to access protected stuff without token
  if (isProtected && !token) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // send them away from auth page if already logged in
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/student-profile", request.url));
  }

  return NextResponse.next();
}

// match these paths
export const config = {
  matcher: ["/student-profile/:path*", "/auth/:path*"],
};
