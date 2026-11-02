import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  ApiError,
  API_BASE_URL,
  MUTATION_HEADER,
  MUTATION_HEADER_VALUE,
  apiFetch,
} from "@/lib/api";
import { FieldErrors, activeOnly, type Employee, type PersonRef } from "@/lib/employees";

// A review period exactly as the API returns it.
export interface ReviewPeriod {
  id: string;
  name: string;
  template_id: string;
  start_date: string;
  end_date: string;
  submission_deadline: string;
  status: string;
  opened_at?: string | null;
  participant_ids?: string[];
  participants?: PersonRef[];
}

export interface ReviewPeriodInput {
  name: string;
  template_id: string;
  start_date: string;
  end_date: string;
  submission_deadline: string;
  participant_ids: string[];
}

// GET /review-periods/{id}/status: one row per participant.
export interface ParticipantStatus {
  employee: PersonRef;
  status: string;
  submitted_at?: string | null;
}

// A published questionnaire the period can use.
export interface QuestionnaireRef {
  id: string;
  name: string;
  status?: string;
}

export const PERIODS_KEY = ["review-periods"];

// The ids of a period's participants, whichever shape the API used.
export const participantIds = (period: ReviewPeriod | null | undefined): string[] =>
  period?.participant_ids ?? (period?.participants ?? []).map((p) => p.id);

export const hasSubmitted = (row: ParticipantStatus) =>
  (row.status ?? "").toLowerCase() === "submitted";

// Outstanding participants are overdue once the deadline has passed.
export const isOverdue = (row: ParticipantStatus, deadline: string | undefined, today: string) =>
  !hasSubmitted(row) && Boolean(deadline) && deadline! < today;

// apiFetch drops the error body, and these screens need the 422 fields and the
// 409 refusal wording (as in @/lib/goals).
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

export const useReviewPeriods = (enabled = true) =>
  useQuery({
    queryKey: PERIODS_KEY,
    retry: false,
    enabled,
    queryFn: () => apiFetch<ReviewPeriod[]>("/review-periods"),
  });

// Submitted vs outstanding for one period; it changes as people submit, so it
// is never served from a long-lived cache.
export const usePeriodStatus = (id: string | null) =>
  useQuery({
    queryKey: [...PERIODS_KEY, "status", id],
    retry: false,
    gcTime: 0,
    enabled: Boolean(id),
    queryFn: () =>
      apiFetch<ParticipantStatus[]>(`/review-periods/${encodeURIComponent(id!)}/status`),
  });

// Active colleagues for the participant picker; leavers are never offered.
export const useParticipantPicker = (enabled = true) =>
  useQuery({
    queryKey: ["review-periods", "participants"],
    retry: false,
    enabled,
    select: activeOnly,
    queryFn: () => apiFetch<Employee[]>("/employees"),
  });

export const usePublishedQuestionnaires = (enabled = true) =>
  useQuery({
    queryKey: ["questionnaires"],
    retry: false,
    enabled,
    queryFn: () => apiFetch<QuestionnaireRef[]>("/questionnaires"),
  });

function useRefetchPeriods() {
  const client = useQueryClient();
  return () => client.invalidateQueries({ queryKey: PERIODS_KEY });
}

export function useCreateReviewPeriod() {
  const refetch = useRefetchPeriods();
  return useMutation({
    mutationFn: (input: ReviewPeriodInput) => send<ReviewPeriod>("/review-periods", "POST", input),
    onSuccess: refetch,
  });
}

export function useUpdateReviewPeriod() {
  const refetch = useRefetchPeriods();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<ReviewPeriodInput> }) =>
      send<ReviewPeriod>(`/review-periods/${encodeURIComponent(id)}`, "PATCH", input),
    onSuccess: refetch,
  });
}

// The tasks themselves are created by a queued job (NFR-014): the call returns
// at once and the screen does not wait for them.
export function useOpenReviewPeriod() {
  const refetch = useRefetchPeriods();
  return useMutation({
    mutationFn: (id: string) =>
      send<ReviewPeriod>(`/review-periods/${encodeURIComponent(id)}/open`, "POST"),
    onSuccess: refetch,
  });
}

// A 409 means the participant has submitted and must be preserved (NFR-010);
// the API's wording is what the screen shows.
export function useRemoveParticipant() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ periodId, employeeId }: { periodId: string; employeeId: string }) =>
      send<void>(
        `/review-periods/${encodeURIComponent(periodId)}/participants/${encodeURIComponent(
          employeeId,
        )}`,
        "DELETE",
      ),
    onSuccess: () => client.invalidateQueries({ queryKey: PERIODS_KEY }),
  });
}
