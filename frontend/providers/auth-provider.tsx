"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { tokenStore } from "@/lib/api";
import { authService } from "@/services";
import type { Role, User } from "@/types";

interface AuthContextValue {
  user: User | null;
  /** True until the stored token has been exchanged for a user. */
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  /** Where this role belongs after signing in. */
  homeFor: (role: Role) => string;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const HOME_BY_ROLE: Record<Role, string> = {
  CUSTOMER: "/dashboard",
  ARTIST: "/artist",
  ADMIN: "/admin",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const queryClient = useQueryClient();

  // Rehydrate the session from the stored token on first mount. A token
  // that the server rejects is stale — drop it rather than leaving the
  // UI in a half-authenticated state.
  useEffect(() => {
    if (!tokenStore.get()) {
      setIsLoading(false);
      return;
    }
    authService
      .me()
      .then(setUser)
      .catch(() => tokenStore.clear())
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { token, user: nextUser } = await authService.login({
      email,
      password,
    });
    tokenStore.set(token);
    setUser(nextUser);
    return nextUser;
  }, []);

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
    queryClient.clear();
    router.push("/");
  }, [queryClient, router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      login,
      logout,
      homeFor: (role: Role) => HOME_BY_ROLE[role],
    }),
    [user, isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
