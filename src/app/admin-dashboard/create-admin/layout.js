import RoleGuard from "@/components/admin/RoleGuard";

export default function CreateAdminLayout({ children }) {
  // Only mainAdmin can access the create-admin page
  return <RoleGuard allowedRoles={["mainAdmin"]}>{children}</RoleGuard>;
}
