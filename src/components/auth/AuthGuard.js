/**
 * AuthGuard — Client-Side Route Protection
 * ==========================================
 * Wraps protected page content. Shows loading state while checking auth.
 * Redirects to login if not authenticated.
 * 
 * Note: The middleware handles server-side redirects. This component
 * provides client-side protection and loading states.
 * 
 * Owner: Lisura (Authentication & Student Profile Module)
 */

"use client";

import { useAuth } from "./AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthGuard({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
