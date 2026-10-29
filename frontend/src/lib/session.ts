import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { ApiError, apiFetch, setUnauthorizedHandler } from "@/lib/api";

// Shape of GET /auth/me: {id, full_name, role, is_manager}.
export interface SessionUser {
  id: string;
  full_name: string;
  role: string;
  is_manager: boolean;
}

const ME_KEY = ["auth", "me"];

// The signed-in user and role for any screen. `user` is null when signed out.
export function useSession() {
  const query = useQuery<SessionUser | null>({
    queryKey: ME_KEY,
    retry: false,
    staleTime: Infinity,
    queryFn: async () => {
      try {
        return await apiFetch<SessionUser>("/auth/me");
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) return null;
        throw error;
      }
    },
  });
  return {
    user: query.data ?? null,
    role: query.data?.role ?? null,
    isLoading: query.isLoading,
  };
}

// Any later 401 (including inactivity timeout) ends the session here.
export function useSessionExpiry() {
  const client = useQueryClient();
  const navigate = useNavigate();
  useEffect(() => {
    setUnauthorizedHandler(() => {
      client.setQueryData(ME_KEY, null);
      navigate("/sign-in", { replace: true });
    });
    return () => setUnauthorizedHandler(null);
  }, [client, navigate]);
}

export function useLogin() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      apiFetch<unknown>("/auth/login", { method: "POST", body: JSON.stringify(credentials) }),
    onSuccess: () => client.invalidateQueries({ queryKey: ME_KEY }),
  });
}

export function useLogout() {
  const client = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: () => apiFetch<void>("/auth/logout", { method: "POST", body: "{}" }),
    onSettled: () => {
      client.clear();
      client.setQueryData(ME_KEY, null);
      navigate("/sign-in", { replace: true });
    },
  });
}
