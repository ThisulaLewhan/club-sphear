import { cookies } from "next/headers";

/**
 * MOCK FUNCTION: This will be replaced by Lisura's actual auth implementation.
 * Currently, it reads a simulated 'mock-role' cookie for testing purposes.
 */
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const mockRole = cookieStore.get("mock-role")?.value; // e.g., 'mainAdmin', 'admin', 'club'
  const mockId = cookieStore.get("mock-id")?.value || "60d5ec49f1b2c8b1f8e4e1a1"; // Dummy ObjectId

  if (!mockRole) {
    return null; // Not authenticated
  }

  return {
    id: mockId,
    role: mockRole,
    name: "Mock User",
    email: "mock@example.com",
    clubId: mockRole === "club" ? "60d5ec49f1b2c8b1f8e4e1a2" : null,
  };
}

export async function hasRole(requiredRoles) {
  const user = await getCurrentUser();
  if (!user) return false;
  if (!Array.isArray(requiredRoles)) {
    return user.role === requiredRoles;
  }
  return requiredRoles.includes(user.role);
}
