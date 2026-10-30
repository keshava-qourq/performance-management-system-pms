import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  ApiError,
  API_BASE_URL,
  MUTATION_HEADER,
  MUTATION_HEADER_VALUE,
  apiFetch,
} from "@/lib/api";
import { EMPLOYEES_KEY, FieldErrors, type PersonRef, type Ref } from "@/lib/employees";

// GET /me/profile, exactly as the API returns it.
export interface Profile {
  id: string;
  full_name: string;
  work_email: string | null;
  job_title: Ref | null;
  department: Ref | null;
  manager: PersonRef | null;
  role: string;
  display_name: string | null;
  pronouns: string | null;
  photo_url: string | null;
  // Fields HR maintains; the screen shows them read-only.
  hr_maintained: string[];
}

export interface ProfileInput {
  display_name?: string;
  pronouns?: string;
}

export const PROFILE_KEY = ["me", "profile"];

// apiFetch drops the 422 body, so mutations read it here (as in @/lib/employees).
async function send<T>(path: string, method: string, body: BodyInit, json: boolean): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    credentials: "include",
    // A multipart body needs the browser to set its own Content-Type boundary.
    headers: {
      ...(json ? { "Content-Type": "application/json" } : {}),
      [MUTATION_HEADER]: MUTATION_HEADER_VALUE,
    },
    body,
  });
  if (response.ok) return (await response.json()) as T;
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

export const useProfile = () =>
  useQuery({
    queryKey: PROFILE_KEY,
    retry: false,
    queryFn: () => apiFetch<Profile>("/me/profile"),
  });

function useRefetchProfile() {
  const client = useQueryClient();
  return () =>
    Promise.all([
      client.invalidateQueries({ queryKey: PROFILE_KEY }),
      client.invalidateQueries({ queryKey: EMPLOYEES_KEY }),
    ]);
}

export function useUpdateProfile() {
  const refetch = useRefetchProfile();
  return useMutation({
    mutationFn: (input: ProfileInput) =>
      send<Profile>("/me/profile", "PATCH", JSON.stringify(input), true),
    onSuccess: refetch,
  });
}

// PUT /me/profile/photo, multipart with the file in the `photo` part.
export function useUploadPhoto() {
  const refetch = useRefetchProfile();
  return useMutation({
    mutationFn: (file: File) => {
      const data = new FormData();
      data.append("photo", file);
      return send<{ photo_url: string }>("/me/profile/photo", "PUT", data, false);
    },
    onSuccess: refetch,
  });
}
