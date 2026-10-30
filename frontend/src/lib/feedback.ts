import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  ApiError,
  API_BASE_URL,
  MUTATION_HEADER,
  MUTATION_HEADER_VALUE,
  apiFetch,
} from "@/lib/api";
import { FieldErrors, type Employee, type PersonRef } from "@/lib/employees";

// One feedback item as GET /me/dashboard and POST /feedback return it.
export interface FeedbackItem {
  id: string;
  author: PersonRef | null;
  recipient?: PersonRef | null;
  type: string;
  body: string;
  goal?: string | null;
  created_at: string;
  withdrawn?: string | null;
}

// GET /me/dashboard.
export interface Dashboard {
  feedback?: FeedbackItem[];
  unread_feedback?: number;
}

// The author is never sent: the API takes it from the session.
export interface FeedbackInput {
  recipient_id: string | null;
  type: string;
  body: string;
}

// apiFetch drops the 422 body, so mutations read it here (as in @/lib/goals).
async function send<T>(path: string, method: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    credentials: "include",
    headers: { "Content-Type": "application/json", [MUTATION_HEADER]: MUTATION_HEADER_VALUE },
    body: JSON.stringify(body),
  });
  if (response.ok) return (response.status === 204 ? undefined : await response.json()) as T;
  let payload: { errors?: Record<string, string>; message?: string; detail?: unknown } = {};
  try {
    payload = await response.json();
  } catch {
    /* no JSON body */
  }
  if (response.status === 422 && payload.errors) throw new FieldErrors(payload.errors);
  const text = payload.message ?? (typeof payload.detail === "string" ? payload.detail : "");
  throw new ApiError(response.status, text);
}

export const DASHBOARD_KEY = ["me", "dashboard"];

// Active colleagues for the recipient picker. Not the HR-only directory hook.
export const useRecipientPicker = () =>
  useQuery({
    queryKey: ["feedback", "recipients"],
    retry: false,
    queryFn: () => apiFetch<Employee[]>("/employees?active_only=true"),
  });

export const useDashboard = () =>
  useQuery({
    queryKey: DASHBOARD_KEY,
    retry: false,
    queryFn: () => apiFetch<Dashboard>("/me/dashboard"),
  });

// Refetched whenever the chosen recipient changes, so it is never stale.
export const useAudience = (recipientId: string, enabled = true) =>
  useQuery({
    queryKey: ["feedback", "audience", recipientId],
    retry: false,
    gcTime: 0,
    enabled,
    queryFn: () =>
      apiFetch<{ readers_statement: string }>(
        `/feedback/audience${recipientId ? `?recipient_id=${encodeURIComponent(recipientId)}` : ""}`,
      ),
  });

export function useSendFeedback() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: FeedbackInput) => send<FeedbackItem>("/feedback", "POST", input),
    onSuccess: () => client.invalidateQueries({ queryKey: DASHBOARD_KEY }),
  });
}
