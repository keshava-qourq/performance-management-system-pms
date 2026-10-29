import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import App from "./App";
import { setUnauthorizedHandler } from "./lib/api";

type Reply = { status: number; body?: unknown };

// A typed mock of the auth contract: POST /auth/login, POST /auth/logout, GET /auth/me.
function mockApi(routes: Record<string, Reply>) {
  const fn = vi.fn(async (url: string, init?: RequestInit) => {
    const key = `${init?.method ?? "GET"} ${new URL(url).pathname}`;
    const r = routes[key] ?? { status: 404 };
    return new Response(r.status === 204 ? null : JSON.stringify(r.body ?? {}), {
      status: r.status,
    });
  });
  vi.stubGlobal("fetch", fn);
  return fn;
}

const ME = { id: "e1", full_name: "Amara Okafor", role: "Employee", is_manager: false };

function renderAt(path: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

async function signIn() {
  const user = userEvent.setup();
  await user.type(await screen.findByLabelText("Email"), "a@b.co");
  await user.type(screen.getByLabelText("Password"), "pw");
  await user.click(screen.getByRole("button", { name: "Sign in" }));
}

afterEach(() => {
  vi.unstubAllGlobals();
  setUnauthorizedHandler(null);
});

describe("App", () => {
  it("[AC-025] protected routes redirect to sign-in when /auth/me is 401", async () => {
    mockApi({ "GET /auth/me": { status: 401 } });
    renderAt("/goals");
    expect(await screen.findByLabelText("Email")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Sign out" })).toBeNull();
  });

  it("[AC-022] sign-in calls /auth/login with cookies and goes to /my-performance", async () => {
    let signedIn = false;
    const fn = mockApi({});
    fn.mockImplementation(async (url: string, init?: RequestInit) => {
      const key = `${init?.method ?? "GET"} ${new URL(url).pathname}`;
      if (key === "POST /auth/login") {
        signedIn = true;
        return new Response(JSON.stringify({ employee: ME, role: "Employee" }), { status: 200 });
      }
      if (key === "GET /auth/me")
        return new Response(JSON.stringify(ME), { status: signedIn ? 200 : 401 });
      return new Response("{}", { status: 200 });
    });
    renderAt("/sign-in");
    await signIn();
    expect(await screen.findByRole("button", { name: "Sign out" })).toBeInTheDocument();
    expect(screen.queryByText("Welcome back.")).toBeNull();
    const call = fn.mock.calls.find(([u]) => String(u).endsWith("/auth/login"))!;
    expect(call[1]?.credentials).toBe("include");
    expect((call[1]?.headers as Record<string, string>)["X-Requested-With"]).toBe("pms");
  });

  it("[AC-023] [AC-026] a failed sign-in shows the API message and stays", async () => {
    mockApi({
      "GET /auth/me": { status: 401 },
      "POST /auth/login": { status: 401, body: { message: "Email or password is incorrect." } },
    });
    renderAt("/sign-in");
    await signIn();
    expect(await screen.findByRole("alert")).toHaveTextContent("Email or password is incorrect.");
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("[AC-024] a blocked account shows the blocked message and stays", async () => {
    mockApi({
      "GET /auth/me": { status: 401 },
      "POST /auth/login": {
        status: 423,
        body: { message: "Too many attempts. Try again later." },
      },
    });
    renderAt("/sign-in");
    await signIn();
    expect(await screen.findByRole("alert")).toHaveTextContent("Too many attempts");
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("[AC-025] Sign out calls /auth/logout and returns to sign-in", async () => {
    const fn = mockApi({
      "GET /auth/me": { status: 200, body: ME },
      "POST /auth/logout": { status: 204 },
    });
    renderAt("/goals");
    await userEvent.click(await screen.findByRole("button", { name: "Sign out" }));
    expect(await screen.findByLabelText("Email")).toBeInTheDocument();
    expect(fn.mock.calls.some(([u]) => String(u).endsWith("/auth/logout"))).toBe(true);
  });

  it("[AC-025] a later 401 clears the session and redirects to sign-in", async () => {
    mockApi({ "GET /auth/me": { status: 200, body: ME } });
    renderAt("/goals");
    await screen.findByRole("button", { name: "Sign out" });
    const { apiFetch } = await import("./lib/api");
    mockApi({ "GET /goals": { status: 401 } });
    await apiFetch("/goals").catch(() => undefined);
    await waitFor(() => expect(screen.getByLabelText("Email")).toBeInTheDocument());
  });
});
