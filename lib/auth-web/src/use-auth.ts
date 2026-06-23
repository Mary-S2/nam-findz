import { useState, useEffect, useCallback } from "react";
import type { AuthUser } from "@workspace/api-client-react";
export type { AuthUser };

const API_URL = import.meta.env.VITE_API_URL ?? "";

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

async function fetchUser(): Promise<AuthUser | null> {
  try {
    const res = await fetch(`${API_URL}/api/auth/user`, { credentials: "include" });
    if (!res.ok) return null;
    const data = (await res.json()) as { user: AuthUser | null };
    return data.user ?? null;
  } catch {
    return null;
  }
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const refresh = useCallback(async () => {
    setIsLoading(true);
    const u = await fetchUser();
    setUser(u);
    setIsLoading(false);
  }, []);
  useEffect(() => {
    void refresh();
  }, [refresh]);
  const logout = useCallback(async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // ignore network errors on logout
    }
    setUser(null);
    window.location.href = "/";
  }, []);
  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    refresh,
    logout,
  };
}