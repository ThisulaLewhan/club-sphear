// Feature Domain: Authentication & Access Control

// auth utils for tokens and cookies

import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET environment variable is not set");
const TOKEN_NAME = "auth_token";
const TOKEN_EXPIRY = "7d"; // Token valid for 7 days

// create a new token when user logs in or registers
export function createToken(user) {
  return jwt.sign(
    {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      ...(user.clubId && { clubId: user.clubId.toString() }),
    },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
}

// check if token is valid
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// save token to cookie securely
export async function setAuthCookie(token) {
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
    path: "/",
  });
}

// grab the token from cookie
export async function getAuthCookie() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(TOKEN_NAME);
  return cookie?.value || null;
}

// delete cookie on logout
export async function removeAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
}

// get the currently logged in user info
export async function getCurrentUser() {
  const token = await getAuthCookie();
  if (!token) return null;
  return verifyToken(token);
}

// check user role for permissions
export async function hasRole(requiredRoles) {
  const user = await getCurrentUser();
  if (!user) return false;
  if (!Array.isArray(requiredRoles)) {
    return user.role === requiredRoles;
  }
  return requiredRoles.includes(user.role);
}
