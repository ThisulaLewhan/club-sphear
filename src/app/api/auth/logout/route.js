// api route for destroying session

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
