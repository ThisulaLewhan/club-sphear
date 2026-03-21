/**
 * AuthProvider — Client-Side Auth Context
 * ========================================
 * Provides authentication state to all client components.
 * Fetches current user from /api/auth/me on mount.
 * 
 * Usage: Wrap in root layout or auth-related pages.
 * 
 * Owner: Lisura (Authentication & Student Profile Module)
 */

"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch current user session
  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
      } else {
        setUser(null);
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

  // Login function
  const login = async (email, password) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (data.success) {
      setUser(data.user);
    }
    return data;
  };

  // Register function
  const register = async (formData) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    const data = await res.json();

    if (data.success) {
      setUser(data.user);
    }
    return data;
  };

  // Logout function
  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Update profile
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

/**
 * Custom hook to access auth context
 * @returns {{ user, loading, login, register, logout, updateProfile, refreshUser }}
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
