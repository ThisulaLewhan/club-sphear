/**
 * Authentication Utilities
 * ========================
 * JWT token creation, verification, and cookie management.
 * Used by: auth API routes (register, login, logout, me)
 * Owner: Lisura (Authentication & Student Profile Module)
 */

import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-dev-secret-change-in-production";
const TOKEN_NAME = "auth_token";
const TOKEN_EXPIRY = "7d"; // Token valid for 7 days

/**
 * Create a signed JWT token for a user
 * @param {Object} user - User document from MongoDB
 * @returns {string} Signed JWT token
 */
export function createToken(user) {
  return jwt.sign(
    {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
}

/**
 * Verify and decode a JWT token
 * @param {string} token - JWT token string
 * @returns {Object|null} Decoded payload or null if invalid
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Set the auth token as an HTTP-only cookie
 * @param {string} token - JWT token to store
 */
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

/**
 * Get the auth token from cookies
 * @returns {string|null} Token string or null
 */
export async function getAuthCookie() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(TOKEN_NAME);
  return cookie?.value || null;
}

/**
 * Remove the auth cookie (logout)
 */
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

/**
 * Get current authenticated user payload from cookie
 * @returns {Object|null} User payload { userId, email, role } or null
 */
export async function getCurrentUser() {
  const token = await getAuthCookie();
  if (!token) return null;
  return verifyToken(token);
}
