import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  ApiError,
  API_BASE_URL,
  MUTATION_HEADER,
  MUTATION_HEADER_VALUE,
  apiFetch,
} from "@/lib/api";

// GET /employees row. Fields beyond the contract's list are optional.
export interface Employee {
  id: string;
  full_name: string;
  work_email?: string;
  job_title: string | null;
  department: string | null;
  job_title_id?: string;
  department_id?: string;
  manager: string | null;
  status: string;
  account_status: string;
  missing_manager: boolean;
}
export interface Department {
  id: string;
  name: string;
}
export interface JobTitle {
  id: string;
  name: string;
}
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

export function useCreateEmployee() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: EmployeeInput) => send<Employee>("/employees", "POST", input),
    onSuccess: () => client.invalidateQueries({ queryKey: EMPLOYEES_KEY }),
  });
}

// Updates the cached row straight away, then refetches.
export function useUpdateEmployee(departments: Department[], titles: JobTitle[]) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: EmployeeInput }) =>
      send<unknown>(`/employees/${encodeURIComponent(id)}`, "PATCH", input),
    onSuccess: (_data, { id, input }) => {
      client.setQueryData<Employee[]>(EMPLOYEES_KEY, (rows) =>
        rows?.map((row) => {
          if (row.id !== id) return row;
          const next: Employee = { ...row };
          if (input.full_name) next.full_name = input.full_name;
          if (input.work_email) next.work_email = input.work_email;
          if (input.job_title_id) {
            next.job_title_id = input.job_title_id;
            next.job_title = titles.find((t) => t.id === input.job_title_id)?.name ?? row.job_title;
          }
          if (input.department_id) {
            next.department_id = input.department_id;
            next.department =
              departments.find((d) => d.id === input.department_id)?.name ?? row.department;
          }
          return next;
        }),
      );
      return client.invalidateQueries({ queryKey: EMPLOYEES_KEY });
    },
  });
}
