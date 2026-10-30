import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  ApiError,
  API_BASE_URL,
  MUTATION_HEADER,
  MUTATION_HEADER_VALUE,
  apiFetch,
} from "@/lib/api";
import { FieldErrors } from "@/lib/employees";

// GET /settings and PUT /settings (HR Admin only); the value is never a constant.
export interface Settings {
  manager_feedback_visible: boolean;
  hr_private_notes_visible: boolean;
}

export type SettingsInput = Partial<Settings>;

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

export const SETTINGS_KEY = ["settings"];

export const useSettings = (enabled = true) =>
  useQuery({
    queryKey: SETTINGS_KEY,
    retry: false,
    enabled,
    queryFn: () => apiFetch<Settings>("/settings"),
  });

export function useUpdateSettings() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: SettingsInput) => send<Settings>("/settings", "PUT", input),
    onSuccess: (saved) => {
      client.setQueryData(SETTINGS_KEY, saved);
      // The readers statement is the server's wording for the new state.
      return client.invalidateQueries({ queryKey: ["feedback", "audience"] });
    },
  });
}
