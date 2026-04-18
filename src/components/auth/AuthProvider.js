// Feature Domain: Authentication & Access Control

// holds auth state for entire app

"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // check if user is already logged in
  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
      } else {
        setUser(null);
        if (res.status === 401 || res.status === 404) {
          await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
        }
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // wrapper for logging in
  const login = async (email, password) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (data.success) {
      // Set basic user data immediately, then fetch full profile
      setUser(data.user);
      await fetchUser();
    }
    return data;
  };

  // wrapper for signing up
  const register = async (formData) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    const data = await res.json();

    if (data.success) {
      setUser(data.user);
      await fetchUser();
    }
    return data;
  };

  // wrapper for logging out
  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      // Use a full page navigation (not router.push) so the browser sends a fresh
      // request without the old auth cookie. router.push() is client-side only and
      // the proxy would still see the cached cookie and redirect away from /auth/login.
      window.location.href = "/auth/login";
    } catch (error) {
      console.error("Logout failed:", error);
      // Fallback: force reload even on error
      window.location.href = "/auth/login";
    }
  };

  // save profile changes
  const updateProfile = async (updateData) => {
    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        return {
          success: false,
          message: errorData.message || "Update failed",
          errors: errorData.errors || {},
        };
      }

      const data = await res.json();

      if (data.success && data.user) {
        setUser(data.user);
      }
      return data;
    } catch (error) {
      console.error("Update profile error:", error);
      return {
        success: false,
        message: "Network error. Please try again.",
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        refreshUser: fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// hook to use auth everywhere
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
