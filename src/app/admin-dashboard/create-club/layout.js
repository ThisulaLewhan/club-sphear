import RoleGuard from "@/components/admin/RoleGuard";

export default function CreateClubLayout({ children }) {
  // Only mainAdmin can access the create-club page
  return <RoleGuard allowedRoles={["mainAdmin"]}>{children}</RoleGuard>;
}
