// Feature Domain: The Global Admin System

import { hasRole } from "@/lib/auth-utils";
import { redirect } from "next/navigation";

export default async function RoleGuard({ children, allowedRoles }) {
  const isAuthorized = await hasRole(allowedRoles);
  
  if (!isAuthorized) {
    // If not authorized, redirect to home or an unauthorized page
    // Using '/' to ensure we don't assume routes outside of my scope
    redirect("/"); 
  }
  
  return <>{children}</>;
}
