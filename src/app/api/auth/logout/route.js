/**
 * POST /api/auth/logout
 * =====================
 * Logout Endpoint
 * 
 * Business Rules:
 * - Removes the auth cookie (destroys session)
 * - Returns success message
 * - Client should redirect to login page
 * 
 * Owner: Lisura (Authentication & Student Profile Module)
 */

import { removeAuthCookie } from "@/lib/auth";

export async function POST() {
  try {
    // Remove auth cookie to destroy session
    await removeAuthCookie();

    return Response.json(
      { success: true, message: "Logged out successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Logout error:", error);
    return Response.json(
      { success: false, message: "Error during logout" },
      { status: 500 }
    );
  }
}
