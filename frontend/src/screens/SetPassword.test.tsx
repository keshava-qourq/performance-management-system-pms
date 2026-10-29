import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import App from "../App";
import { setUnauthorizedHandler } from "../lib/api";

type Reply = { status: number; body?: unknown };
type Handler = Reply | ((init?: RequestInit) => Reply);

const ME = { id: "e9", full_name: "Priya Nair", role: "Employee", is_manager: false };
const RULES = ["At least 12 characters", "At least one number"];

function mockApi(routes: Record<string, Handler>) {
  const fn = vi.fn(async (url: string, init?: RequestInit) => {
    const key = `${init?.method ?? "GET"} ${new URL(url).pathname}`;
    const h = routes[key] ?? { status: 404 };
    const r = typeof h === "function" ? h(init) : h;
    return new Response(r.status === 204 ? null : JSON.stringify(r.body ?? {}), {
      status: r.status,
    });
  });
  vi.stubGlobal("fetch", fn);
  return fn;
}

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

describe("Set-password screen", () => {
  it("[AC-019] a valid invitation link accepts a password, signs the person in and lands them in the app", async () => {
    let accepted = false;
    const fn = mockApi({
      "GET /auth/tokens/tok-1": {
        status: 200,
        body: { purpose: "invitation", valid: true, password_rules: RULES },
      },
      "POST /auth/tokens/tok-1/accept": () => {
        accepted = true;
        return { status: 200, body: { employee: ME } };
      },
      "GET /auth/me": () => (accepted ? { status: 200, body: ME } : { status: 401 }),
    });
    renderAt("/set-password/tok-1");

    const user = userEvent.setup();
    await user.type(await screen.findByLabelText("New password"), "Correct-horse-9");
    await user.type(screen.getByLabelText("Confirm password"), "Correct-horse-9");
    await user.click(screen.getByRole("button", { name: "Set password and sign in" }));

    expect(await screen.findByRole("button", { name: "Sign out" })).toBeInTheDocument();
    const call = fn.mock.calls.find(([u]) => String(u).endsWith("/accept"))!;
    expect(JSON.parse(String(call[1]?.body))).toEqual({ password: "Correct-horse-9" });
    expect((call[1]?.headers as Record<string, string>)["X-Requested-With"]).toBe("pms");
  });

  it("[AC-019] shows the link being checked before asking for anything", async () => {
    mockApi({
      "GET /auth/tokens/tok-1": {
        status: 200,
        body: { purpose: "invitation", valid: true, password_rules: RULES },
      },
    });
    renderAt("/set-password/tok-1");
    expect(screen.getByRole("status")).toHaveTextContent("Checking this link");
    expect(await screen.findByLabelText("New password")).toBeInTheDocument();
  });

  it("[AC-020] an expired or used link explains it is no longer valid and shows no password form", async () => {
    mockApi({ "GET /auth/tokens/tok-dead": { status: 410, body: {} } });
    renderAt("/set-password/tok-dead");

    expect(await screen.findByText("This link is no longer valid")).toBeInTheDocument();
    expect(screen.getByText(/Contact your HR Admin/)).toBeInTheDocument();
    expect(screen.queryByLabelText("New password")).toBeNull();
    expect(screen.queryByRole("button", { name: "Set password and sign in" })).toBeNull();
  });

  it("[AC-020] a link the API reports as not valid shows the same explanation", async () => {
    mockApi({
      "GET /auth/tokens/tok-used": {
        status: 200,
        body: { purpose: "invitation", valid: false, password_rules: [] },
      },
    });
    renderAt("/set-password/tok-used");
    expect(await screen.findByText("This link is no longer valid")).toBeInTheDocument();
    expect(screen.queryByLabelText("New password")).toBeNull();
  });

  it("[AC-027] the unmet rules the API returns are listed against the password field", async () => {
    mockApi({
      "GET /auth/tokens/tok-1": {
        status: 200,
        body: { purpose: "invitation", valid: true, password_rules: RULES },
      },
      "POST /auth/tokens/tok-1/accept": {
        status: 422,
        body: { unmet_rules: ["At least 12 characters", "At least one symbol"] },
      },
      "GET /auth/me": { status: 401 },
    });
    renderAt("/set-password/tok-1");

    const user = userEvent.setup();
    await user.type(await screen.findByLabelText("New password"), "short1");
    await user.type(screen.getByLabelText("Confirm password"), "short1");
    await user.click(screen.getByRole("button", { name: "Set password and sign in" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("At least 12 characters");
    expect(alert).toHaveTextContent("At least one symbol");
    await waitFor(() =>
      expect(screen.getByLabelText("New password")).toHaveAttribute("aria-invalid", "true"),
    );
    expect(screen.getByLabelText("New password")).toHaveAttribute(
      "aria-describedby",
      "password-rules",
    );
  });

  it("[AC-027] mismatched passwords are explained in context and nothing is sent", async () => {
    const fn = mockApi({
      "GET /auth/tokens/tok-1": {
        status: 200,
        body: { purpose: "password_reset", valid: true, password_rules: RULES },
      },
      "GET /auth/me": { status: 401 },
    });
    renderAt("/set-password/tok-1");

    const user = userEvent.setup();
    await user.type(await screen.findByLabelText("New password"), "Correct-horse-9");
    await user.type(screen.getByLabelText("Confirm password"), "Correct-horse-8");
    await user.click(screen.getByRole("button", { name: "Set password and sign in" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("do not match");
    expect(fn.mock.calls.some(([u]) => String(u).endsWith("/accept"))).toBe(false);
  });

  it("[AC-029] a reset link reads as a reset rather than an invitation", async () => {
    mockApi({
      "GET /auth/tokens/tok-2": {
        status: 200,
        body: { purpose: "password_reset", valid: true, password_rules: RULES },
      },
    });
    renderAt("/set-password/tok-2");
    expect(await screen.findByText("Set a new password")).toBeInTheDocument();
    expect(screen.getByText("Password reset")).toBeInTheDocument();
  });
});
