import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  ApiError,
  API_BASE_URL,
  MUTATION_HEADER,
  MUTATION_HEADER_VALUE,
  apiFetch,
} from "@/lib/api";
import { FieldErrors, type PersonRef } from "@/lib/employees";

export const GOAL_STATUSES = [
  "Not started",
  "On track",
  "At risk",
  "Off track",
  "Achieved",
  "Cancelled",
] as const;

// A goal exactly as GET /goals, POST /goals and PATCH /goals/{id} return it.
export interface Goal {
  id: string;
  owner: PersonRef | null;
  title: string;
  description: string | null;
  target: string;
  due_date: string;
  period: string;
  weighting: number;
  progress: number;
  status: string;
  parent_goal_id: string | null;
  parent_title?: string | null;
  level?: string;
  // The API decides what counts as overdue; the UI never recomputes it.
  overdue: boolean;
  updated_at: string | null;
  updated_by: PersonRef | null;
  progress_updated_at: string | null;
  progress_updated_by: PersonRef | null;
}

// GET /goals. The total and its warning come from the API (AC-041).
export interface GoalList {
  goals: Goal[];
  weighting_total: number;
  over_100_warning: boolean;
  warning: string | null;
}

export interface GoalHistoryEntry {
  action: string;
  actor: PersonRef | null;
  created_at: string;
  details: Record<string, unknown> | null;
}

// GET /goals/{id}.
export interface GoalDetail {
  goal: Goal;
  children: Goal[];
  comments: unknown[];
  history: GoalHistoryEntry[];
}

export interface GoalInput {
  title?: string;
  description?: string;
  target?: string;
  due_date?: string;
  weighting?: string | number;
  parent_goal_id?: string | null;
  level?: string;
  department_id?: string;
}

// GET /goals/parent-options: company goals plus the user's own department's.
export interface ParentOption {
  id: string;
  title: string;
  level: string;
}

// A 409 on delete: the goal still has aligned children.
export class HasChildren extends Error {
  childCount: number;
  constructor(childCount: number) {
    super("This goal still has aligned goals.");
    this.childCount = childCount;
  }
}

export interface ProgressInput {
  progress?: string | number;
  status?: string;
}

// apiFetch drops the 422 body, so mutations read it here (as in @/lib/employees).
async function send<T>(path: string, method: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    credentials: "include",
    headers: { "Content-Type": "application/json", [MUTATION_HEADER]: MUTATION_HEADER_VALUE },
    body: JSON.stringify(body),
  });
  if (response.ok) return (response.status === 204 ? undefined : await response.json()) as T;
  let payload: {
    errors?: Record<string, string>;
    child_count?: number;
    message?: string;
    detail?: unknown;
  } = {};
  try {
    payload = await response.json();
  } catch {
    /* no JSON body */
  }
  if (response.status === 422 && payload.errors) throw new FieldErrors(payload.errors);
  if (response.status === 409 && typeof payload.child_count === "number")
    throw new HasChildren(payload.child_count);
  const text = payload.message ?? (typeof payload.detail === "string" ? payload.detail : "");
  throw new ApiError(response.status, text);
}

export const GOALS_KEY = ["goals"];

export const useGoals = () =>
  useQuery({
    queryKey: [...GOALS_KEY, "me"],
    retry: false,
    queryFn: () => apiFetch<GoalList>("/goals"),
  });

export const useGoal = (id: string | null) =>
  useQuery({
    queryKey: [...GOALS_KEY, "detail", id],
    retry: false,
    enabled: Boolean(id),
    queryFn: () => apiFetch<GoalDetail>(`/goals/${encodeURIComponent(id!)}`),
  });

function useRefetchGoals() {
  const client = useQueryClient();
  return () => client.invalidateQueries({ queryKey: GOALS_KEY });
}

export function useCreateGoal() {
  const refetch = useRefetchGoals();
  return useMutation({
    mutationFn: (input: GoalInput) => send<Goal>("/goals", "POST", input),
    onSuccess: refetch,
  });
}

export function useUpdateGoal() {
  const refetch = useRefetchGoals();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: GoalInput }) =>
      send<Goal>(`/goals/${encodeURIComponent(id)}`, "PATCH", input),
    onSuccess: refetch,
  });
}

// Progress is always the number the person typed in; it is never calculated.
export function useRecordProgress() {
  const refetch = useRefetchGoals();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ProgressInput }) =>
      send<Goal>(`/goals/${encodeURIComponent(id)}/progress`, "POST", input),
    onSuccess: refetch,
  });
}

export const useParentOptions = () =>
  useQuery({
    queryKey: [...GOALS_KEY, "parent-options"],
    retry: false,
    queryFn: () => apiFetch<ParentOption[]>("/goals/parent-options"),
  });

export function useDeleteGoal() {
  const refetch = useRefetchGoals();
  return useMutation({
    mutationFn: (id: string) => send<void>(`/goals/${encodeURIComponent(id)}`, "DELETE", {}),
    onSuccess: refetch,
  });
}
