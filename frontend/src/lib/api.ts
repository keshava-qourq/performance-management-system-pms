/// <reference types="vite/client" />
// Without the reference above, `import.meta.env` is not typed and `tsc --noEmit` fails.

// Set at build time; the fallback is the local backend.
export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

// Kept for compatibility with existing imports. User calls no longer send it: the session
// cookie authenticates them.
export const API_SECRET_KEY: string = import.meta.env.VITE_API_SECRET_KEY ?? "";

// Custom header sent on every mutation, next to the session cookie.
export const MUTATION_HEADER = "X-Requested-With";
export const MUTATION_HEADER_VALUE = "pms";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

// The sign-in and session-check calls handle their own 401.
const OWN_401 = ["/auth/login", "/auth/me"];

async function messageOf(response: Response): Promise<string> {
  try {
    const body = await response.json();
    const text = body?.message ?? body?.detail;
    if (typeof text === "string") return text;
  } catch {
    /* no JSON body */
  }
  return "";
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const method = (init?.method ?? "GET").toUpperCase();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(method === "GET" || method === "HEAD" ? {} : { [MUTATION_HEADER]: MUTATION_HEADER_VALUE }),
      ...(init?.headers ?? {}),
    },
  });
  if (!response.ok) {
    if (response.status === 401 && !OWN_401.includes(path)) onUnauthorized?.();
    throw new ApiError(response.status, await messageOf(response));
  }
  return response.status === 204 ? (undefined as T) : ((await response.json()) as T);
}
