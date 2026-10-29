import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { API_BASE_URL, ApiError, MUTATION_HEADER, MUTATION_HEADER_VALUE } from "@/lib/api";
import { EMPLOYEES_KEY, RECORD_KEY } from "@/lib/employees";

// A link HR copies and passes on by hand: POST /employees/{id}/invitations and
// POST /employees/{id}/password-resets both answer with this shape.
export interface IssuedLink {
  link: string;
  expires_at: string;
}

// GET /auth/tokens/{token}. A spent, revoked or expired link answers 410.
export interface TokenCheck {
  purpose: string;
  valid: boolean;
  password_rules: string[];
}

// A 422 from a password endpoint: the rules this password did not meet.
export class UnmetRules extends Error {
  rules: string[];
  constructor(rules: string[], message: string) {
    super(message || "That password does not meet the rules.");
    this.rules = rules;
  }
}

interface ErrorBody {
  unmet_rules?: string[];
  errors?: Record<string, string | string[]>;
  message?: string;
  detail?: unknown;
}

// apiFetch drops the error body, and these screens need what is in it.
async function send<T>(path: string, method: string, body?: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    credentials: "include",
    headers: { "Content-Type": "application/json", [MUTATION_HEADER]: MUTATION_HEADER_VALUE },
    body: JSON.stringify(body ?? {}),
  });
  if (response.ok) return (response.status === 204 ? undefined : await response.json()) as T;
  let payload: ErrorBody = {};
  try {
    payload = await response.json();
  } catch {
    /* no JSON body */
  }
  const message = payload.message ?? (typeof payload.detail === "string" ? payload.detail : "");
  if (response.status === 422) {
    const raw = payload.unmet_rules ?? payload.errors?.password ?? [];
    const rules = (Array.isArray(raw) ? raw : [raw]).filter(Boolean) as string[];
    if (rules.length) throw new UnmetRules(rules, message);
  }
  throw new ApiError(response.status, message);
}

function useRefetchPeople() {
  const client = useQueryClient();
  return () =>
    Promise.all([
      client.invalidateQueries({ queryKey: EMPLOYEES_KEY }),
      client.invalidateQueries({ queryKey: RECORD_KEY }),
    ]);
}

// Issuing again revokes whatever came before (NFR-005): only the newest works.
export function useIssueInvitation() {
  const refetch = useRefetchPeople();
  return useMutation({
    mutationFn: (id: string) =>
      send<IssuedLink>(`/employees/${encodeURIComponent(id)}/invitations`, "POST"),
    onSuccess: refetch,
  });
}

export function useRevokeInvitation() {
  const refetch = useRefetchPeople();
  return useMutation({
    mutationFn: (id: string) =>
      send<void>(`/employees/${encodeURIComponent(id)}/invitations`, "DELETE"),
    onSuccess: refetch,
  });
}

export function useIssuePasswordReset() {
  const refetch = useRefetchPeople();
  return useMutation({
    mutationFn: (id: string) =>
      send<IssuedLink>(`/employees/${encodeURIComponent(id)}/password-resets`, "POST"),
    onSuccess: refetch,
  });
}

// The unauthenticated check behind the set-password screen.
export function useTokenCheck(token: string | undefined) {
  return useQuery<TokenCheck>({
    queryKey: ["auth", "token", token],
    retry: false,
    enabled: Boolean(token),
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/auth/tokens/${encodeURIComponent(token!)}`, {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new ApiError(response.status, "");
      return (await response.json()) as TokenCheck;
    },
  });
}

export function useAcceptToken(token: string | undefined) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (password: string) =>
      send<unknown>(`/auth/tokens/${encodeURIComponent(token ?? "")}/accept`, "POST", {
        password,
      }),
    onSuccess: () => client.invalidateQueries({ queryKey: ["auth", "me"] }),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (input: { current_password: string; new_password: string }) =>
      send<unknown>("/auth/password", "POST", input),
  });
}
