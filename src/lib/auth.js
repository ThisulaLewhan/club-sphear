// imports for jwt and next cookies

import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_NAME = "auth_token";
const TOKEN_EXPIRY = "7d"; // Token valid for 7 days

function getSecret() {
  if (!JWT_SECRET) throw new Error("JWT_SECRET environment variable is not set");
  return JWT_SECRET;
}

// make a new token when user sign in
export function createToken(user) {
  return jwt.sign(
    {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      ...(user.clubId && { clubId: user.clubId.toString() }),
    },
    getSecret(),
    { expiresIn: TOKEN_EXPIRY }
  );
}

// check if token is good or expired
export function verifyToken(token) {
  try {
    return jwt.verify(token, getSecret());
  } catch (error) {
    return null;
  }
}

// save token to browser cookie securely
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

// read the token from cookies
export async function getAuthCookie() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(TOKEN_NAME);
  return cookie?.value || null;
}

// delete cookie when user logout
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

// find out who is logged in right now
export async function getCurrentUser() {
  const token = await getAuthCookie();
  if (!token) return null;
  return verifyToken(token);
}

// check if they are admin or student
export async function hasRole(requiredRoles) {
  const user = await getCurrentUser();
  if (!user) return false;
  if (!Array.isArray(requiredRoles)) {
    return user.role === requiredRoles;
  }
  return requiredRoles.includes(user.role);
}
