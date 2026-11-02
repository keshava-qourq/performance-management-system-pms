import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  ApiError,
  API_BASE_URL,
  MUTATION_HEADER,
  MUTATION_HEADER_VALUE,
  apiFetch,
} from "@/lib/api";
import { FieldErrors, activeOnly, type Employee, type PersonRef } from "@/lib/employees";
import { DASHBOARD_KEY } from "@/lib/feedback";

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

/* ---- The employee's own self-review task (US-018) ---- */

// A rating scale point as the questionnaire snapshot carries it.
export interface ScalePoint {
  value: number;
  label: string;
}

export interface SelfReviewQuestion {
  id: string;
  text: string;
  type: string;
  mandatory: boolean;
  requires?: { rating?: boolean; comment?: boolean };
  scale?: { points?: ScalePoint[]; labels?: ScalePoint[] } | null;
}

export interface SelfReviewCompetency {
  id: string;
  name: string;
  questions: SelfReviewQuestion[];
}

// GET /self-reviews/{id}: the questionnaire (snapshot once submitted) and the
// answers saved so far.
export interface SelfReviewQuestionnaire {
  name: string;
  scale?: { points?: ScalePoint[]; labels?: ScalePoint[] } | null;
  competencies: SelfReviewCompetency[];
}

export interface SelfReviewAnswer {
  question_id: string;
  rating?: number | null;
  comment?: string | null;
}

export interface SelfReview {
  id: string;
  status: string;
  overdue?: boolean;
  submitted_at?: string | null;
  submitted_by?: PersonRef | null;
  period_name?: string | null;
  period_status?: string | null;
  submission_deadline?: string | null;
  questionnaire: SelfReviewQuestionnaire;
  answers: SelfReviewAnswer[];
}

// GET /me/dashboard: the self-review tasks this person has, if any.
export interface DashboardReview {
  id: string;
  period_id?: string;
  period_name: string;
  status: string;
  submitted_at?: string | null;
  submission_deadline: string;
  overdue?: boolean;
}

// A 422 from submit: the questions still to answer, with the API's wording.
export class Unanswered extends Error {
  questionIds: string[];
  messages: Record<string, string>;
  constructor(questionIds: string[], messages: Record<string, string>, message: string) {
    super(message || "Some required questions still need an answer.");
    this.questionIds = questionIds;
    this.messages = messages;
  }
}

// The question's rating labels, whichever key the snapshot used.
export const scalePoints = (
  scale: { points?: ScalePoint[]; labels?: ScalePoint[] } | null | undefined,
): ScalePoint[] => scale?.points ?? scale?.labels ?? [];

export const needsRating = (q: SelfReviewQuestion) =>
  q.requires?.rating ?? (q.type === "rated" || q.type === "both");
export const needsComment = (q: SelfReviewQuestion) =>
  q.requires?.comment ?? (q.type === "text" || q.type === "both");

// A mandatory question is answered once everything it asks for is there.
export const isAnswered = (q: SelfReviewQuestion, a: SelfReviewAnswer | undefined) => {
  if (needsRating(q) && !(a?.rating ?? null)) return false;
  if (needsComment(q) && !(a?.comment ?? "").trim()) return false;
  return true;
};

export const allQuestions = (q: SelfReviewQuestionnaire | undefined): SelfReviewQuestion[] =>
  (q?.competencies ?? []).flatMap((c) => c.questions ?? []);

export const SELF_REVIEW_KEY = ["self-review"];

// The signed-in person's open self-review task comes from their dashboard;
// nothing about it is held in the screen.
export const useMyReviewTasks = (enabled = true) =>
  useQuery({
    queryKey: [...DASHBOARD_KEY, "reviews"],
    retry: false,
    enabled,
    select: (data: { reviews?: DashboardReview[] }) => data.reviews ?? [],
    queryFn: () => apiFetch<{ reviews?: DashboardReview[] }>("/me/dashboard"),
  });

export const useSelfReview = (id: string | null) =>
  useQuery({
    queryKey: [...SELF_REVIEW_KEY, id],
    retry: false,
    enabled: Boolean(id),
    queryFn: () => apiFetch<SelfReview>(`/self-reviews/${encodeURIComponent(id!)}`),
  });

function useRefetchSelfReview() {
  const client = useQueryClient();
  return () =>
    Promise.all([
      client.invalidateQueries({ queryKey: SELF_REVIEW_KEY }),
      client.invalidateQueries({ queryKey: DASHBOARD_KEY }),
    ]);
}

export function useSaveAnswers() {
  const refetch = useRefetchSelfReview();
  return useMutation({
    mutationFn: ({ id, answers }: { id: string; answers: SelfReviewAnswer[] }) =>
      send<unknown>(`/self-reviews/${encodeURIComponent(id)}/answers`, "PUT", { answers }),
    onSuccess: refetch,
  });
}

// A 422 names the questions still unanswered; the API's wording is shown
// against each one (AC-069).
export function useSubmitSelfReview() {
  const refetch = useRefetchSelfReview();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(
        `${API_BASE_URL}/self-reviews/${encodeURIComponent(id)}/submit`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            [MUTATION_HEADER]: MUTATION_HEADER_VALUE,
          },
          body: "{}",
        },
      );
      if (response.ok) return (await response.json()) as SelfReview;
      let payload: {
        unanswered?: Array<string | { question_id: string; message?: string }>;
        errors?: Record<string, string>;
        message?: string;
        detail?: unknown;
      } = {};
      try {
        payload = await response.json();
      } catch {
        /* no JSON body */
      }
      const text = payload.message ?? (typeof payload.detail === "string" ? payload.detail : "");
      if (response.status === 422) {
        const messages: Record<string, string> = { ...(payload.errors ?? {}) };
        const ids = (payload.unanswered ?? []).map((entry) => {
          if (typeof entry === "string") return entry;
          if (entry.message) messages[entry.question_id] = entry.message;
          return entry.question_id;
        });
        const all = Array.from(new Set([...ids, ...Object.keys(messages)]));
        if (all.length) throw new Unanswered(all, messages, text);
      }
      throw new ApiError(response.status, text);
    },
    onSuccess: refetch,
  });
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
