import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  ApiError,
  API_BASE_URL,
  MUTATION_HEADER,
  MUTATION_HEADER_VALUE,
  apiFetch,
} from "@/lib/api";

// A named thing the API returns by reference: {id, name} or {id, full_name}.
export interface Ref {
  id: string;
  name: string;
}
export interface PersonRef {
  id: string;
  full_name: string;
}

// GET /employees row, exactly as the API returns it.
export interface Employee {
  id: string;
  full_name: string;
  work_email: string | null;
  job_title: Ref | null;
  department: Ref | null;
  manager: PersonRef | null;
  missing_manager: boolean;
  role: string;
  status: string;
  // "No account" | "Invited" | "Active" -- whether this person can sign in yet.
  account_status?: string | null;
  leaving_date?: string | null;
}

// Leavers are deactivated, never deleted (NFR-010), so every picker of people
// for something new has to leave them out. The API spells the status either
// way round, so compare case-insensitively.
export const isDeactivated = (e: Pick<Employee, "status">) =>
  (e.status ?? "").toLowerCase() === "deactivated";
export const activeOnly = (people: Employee[]) => people.filter((p) => !isDeactivated(p));

export interface RecordGoal {
  id: string;
  title: string;
  status?: string;
}
export interface RecordReview {
  id: string;
  period: string;
  status?: string;
}
export interface RecordFeedback {
  id: string;
  body: string;
  from?: PersonRef | null;
}
export interface EmployeeRecord {
  employee: Employee;
  direct_reports: PersonRef[];
  goals?: RecordGoal[];
  self_reviews?: RecordReview[];
  feedback?: RecordFeedback[];
}
export interface DeactivateInput {
  leaving_date: string;
  reassign_manager_id?: string;
}
export type Department = Ref;
export type JobTitle = Ref;
export interface EmployeeInput {
  full_name?: string;
  work_email?: string;
  job_title_id?: string;
  department_id?: string;
  role?: string;
}

// A 422 from the API: one plain-English message per field.
export class FieldErrors extends Error {
  errors: Record<string, string>;
  constructor(errors: Record<string, string>) {
    super("Some fields need attention.");
    this.errors = errors;
  }
}

// apiFetch drops the 422 body, so mutations read it here.
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

export const EMPLOYEES_KEY = ["employees"];
export const RECORD_KEY = ["employee-record"];

export const useEmployees = () =>
  useQuery({
    queryKey: EMPLOYEES_KEY,
    retry: false,
    queryFn: () => apiFetch<Employee[]>("/employees"),
  });
export const useDepartments = () =>
  useQuery({
    queryKey: ["departments"],
    retry: false,
    queryFn: () => apiFetch<Department[]>("/departments"),
  });
export const useJobTitles = () =>
  useQuery({
    queryKey: ["job-titles"],
    retry: false,
    queryFn: () => apiFetch<JobTitle[]>("/job-titles"),
  });

// The employee's own record, including who reports to them.
export const useEmployeeRecord = (id: string | null) =>
  useQuery({
    queryKey: [...RECORD_KEY, id],
    retry: false,
    enabled: Boolean(id),
    queryFn: () => apiFetch<EmployeeRecord>(`/employees/${encodeURIComponent(id!)}/record`),
  });

function useRefetchAll() {
  const client = useQueryClient();
  return () =>
    Promise.all([
      client.invalidateQueries({ queryKey: EMPLOYEES_KEY }),
      client.invalidateQueries({ queryKey: RECORD_KEY }),
    ]);
}

export function useCreateEmployee() {
  const refetch = useRefetchAll();
  return useMutation({
    mutationFn: (input: EmployeeInput) => send<Employee>("/employees", "POST", input),
    onSuccess: refetch,
  });
}

export function useUpdateEmployee() {
  const refetch = useRefetchAll();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: EmployeeInput }) =>
      send<unknown>(`/employees/${encodeURIComponent(id)}`, "PATCH", input),
    onSuccess: refetch,
  });
}

// POST /employees/{id}/deactivate. A 422 naming reassign_manager_id means the
// leaver still has direct reports and a new manager must be chosen first.
export function useDeactivateEmployee() {
  const refetch = useRefetchAll();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: DeactivateInput }) =>
      send<Employee>(`/employees/${encodeURIComponent(id)}/deactivate`, "POST", input),
    onSuccess: refetch,
  });
}

// PUT /employees/{id}/manager. `manager_id: null` clears the reporting line.
export function useSetManager() {
  const refetch = useRefetchAll();
  return useMutation({
    mutationFn: ({ id, manager_id }: { id: string; manager_id: string | null }) =>
      send<unknown>(`/employees/${encodeURIComponent(id)}/manager`, "PUT", { manager_id }),
    onSuccess: refetch,
  });
}
