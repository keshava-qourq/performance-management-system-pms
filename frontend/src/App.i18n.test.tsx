import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import App from "./App";
import { setUnauthorizedHandler } from "./lib/api";

type Reply = { status: number; body?: unknown };

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

afterEach(() => {
  vi.unstubAllGlobals();
  setUnauthorizedHandler(null);
});

describe("[AC-119] English-only interface regardless of browser locale", () => {
  it("the document declares lang=en", async () => {
    mockApi({ "GET /auth/me": { status: 401 } });
    renderAt("/sign-in");
    await screen.findByLabelText("Email");
    expect(document.documentElement.lang).toBe("en");
  });

  it("offers no language-selection control before sign-in", async () => {
    mockApi({ "GET /auth/me": { status: 401 } });
    renderAt("/sign-in");
    await screen.findByLabelText("Email");
    expect(screen.queryByRole("combobox", { name: /language/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /language/i })).toBeNull();
  });

  it("renders English after sign-in even with a German browser preference, with no language control", async () => {
    vi.stubGlobal("navigator", { ...navigator, language: "de-DE", languages: ["de-DE", "de"] });
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
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText("Email"), "a@b.co");
    await user.type(screen.getByLabelText("Password"), "pw");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByRole("button", { name: "Sign out" })).toBeInTheDocument();
    expect(screen.getByText("My performance")).toBeInTheDocument();
    expect(document.documentElement.lang).toBe("en");
    expect(screen.queryByRole("combobox", { name: /language/i })).toBeNull();
    expect(screen.queryByText(/sprache|langue|idioma/i)).toBeNull();
  });
});
