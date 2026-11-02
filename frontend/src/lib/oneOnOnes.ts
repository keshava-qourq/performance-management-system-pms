import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  ApiError,
  API_BASE_URL,
  MUTATION_HEADER,
  MUTATION_HEADER_VALUE,
  apiFetch,
} from "@/lib/api";
import { FieldErrors, type PersonRef } from "@/lib/employees";

// One action item, exactly as the API returns it on a 1:1 and in carry-over.
export interface ActionItem {
  id: string;
  description: string;
  owner: PersonRef | null;
  due_date: string;
  // The API decides what counts as overdue; the UI never recomputes it.
  overdue?: boolean;
  completed_at: string | null;
  completed_by: PersonRef | null;
  // Carried-over items say which earlier 1:1 they came from.
  one_on_one_id?: string;
  meeting_date?: string | null;
}

export interface TalkingPoint {
  id: string;
  author: PersonRef | null;
  body: string;
  discussed: boolean;
}

// GET /one-on-ones row.
export interface OneOnOneSummary {
  id: string;
  counterpart: PersonRef;
  meeting_date: string;
  reference?: string | null;
  i_am_manager?: boolean;
  talking_point_count?: number;
  open_action_item_count?: number;
  overdue_action_item_count?: number;
}

// GET /one-on-ones/{id}. `private_note` and `hr_can_read_private_notes` are
// only present when the caller is the manager (NFR-007).
export interface OneOnOneDetail {
  id: string;
  counterpart: PersonRef;
  meeting_date: string;
  reference?: string | null;
  i_am_manager: boolean;
  updated_at?: string | null;
  talking_points: TalkingPoint[];
  action_items: ActionItem[];
  carry_over: ActionItem[];
  private_note?: string | null;
  hr_can_read_private_notes?: boolean;
}

export interface ActionItemInput {
  description: string;
  owner_id: string;
  due_date: string;
}

// GET /one-on-ones answers with the meetings and the caller's open items. Some
// deployments answer with the bare array, so both shapes are accepted.
export interface OneOnOneList {
  one_on_ones: OneOnOneSummary[];
  open_action_items: ActionItem[];
}

// apiFetch drops the 422 body, so mutations read it here (as in @/lib/goals).
async function send<T>(path: string, method: string, body?: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    credentials: "include",
    headers: { "Content-Type": "application/json", [MUTATION_HEADER]: MUTATION_HEADER_VALUE },
    body: JSON.stringify(body ?? {}),
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

export const ONE_ON_ONES_KEY = ["one-on-ones"];

export const useOneOnOnes = () =>
  useQuery({
    queryKey: ONE_ON_ONES_KEY,
    retry: false,
    queryFn: async () => {
      const data = await apiFetch<OneOnOneList | OneOnOneSummary[]>("/one-on-ones");
      return Array.isArray(data)
        ? { one_on_ones: data, open_action_items: [] }
        : { one_on_ones: data.one_on_ones ?? [], open_action_items: data.open_action_items ?? [] };
    },
  });

export const useOneOnOne = (id: string | null) =>
  useQuery({
    queryKey: [...ONE_ON_ONES_KEY, "detail", id],
    retry: false,
    enabled: Boolean(id),
    queryFn: () => apiFetch<OneOnOneDetail>(`/one-on-ones/${encodeURIComponent(id!)}`),
  });

// Every write changes what both the list and the open 1:1 show.
function useRefetch() {
  const client = useQueryClient();
  return () => client.invalidateQueries({ queryKey: ONE_ON_ONES_KEY });
}

export function useAddActionItem() {
  const refetch = useRefetch();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ActionItemInput }) =>
      send<ActionItem>(`/one-on-ones/${encodeURIComponent(id)}/action-items`, "POST", input),
    onSuccess: refetch,
  });
}

// The completion date and who completed it come back from the API (AC-101).
export function useCompleteActionItem() {
  const refetch = useRefetch();
  return useMutation({
    mutationFn: (itemId: string) =>
      send<ActionItem>(`/action-items/${encodeURIComponent(itemId)}/complete`, "POST"),
    onSuccess: refetch,
  });
}

export function useSavePrivateNote() {
  const refetch = useRefetch();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: string }) =>
      send<OneOnOneDetail>(`/one-on-ones/${encodeURIComponent(id)}/private-note`, "PUT", { body }),
    onSuccess: refetch,
  });
}
