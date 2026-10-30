import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import People from "./People";

type Reply = { status: number; body?: unknown };
type Handler = Reply | (() => Reply);

const OFF = "Feedback is readable only by its author, its recipient and HR Admins.";
const ON = "Feedback is readable by its author, its recipient, HR Admins and the recipient's manager.";

function settings(visible: boolean) {
  return { manager_feedback_visible: visible, hr_private_notes_visible: false };
}

function mockApi(role: string, routes: Record<string, Handler>) {
  const fn = vi.fn(async (url: string, init?: RequestInit) => {
    const key = `${init?.method ?? "GET"} ${new URL(url).pathname}`;
    const base: Record<string, Handler> = {
      "GET /auth/me": { status: 200, body: { id: "h1", full_name: "Hana", role, is_manager: false } },
      "GET /employees": { status: 200, body: [] },
      "GET /departments": { status: 200, body: [] },
      "GET /job-titles": { status: 200, body: [] },
    };
    const route = routes[key] ?? base[key] ?? { status: 404, body: {} };
    const r = typeof route === "function" ? route() : route;
    return new Response(JSON.stringify(r.body ?? {}), { status: r.status });
  });
  vi.stubGlobal("fetch", fn);
  return fn;
}

function renderScreen() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <People />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

async function openSettings() {
  const user = userEvent.setup();
  await user.click(await screen.findByRole("button", { name: "Settings" }));
  return user;
}

const putCalls = (fn: ReturnType<typeof mockApi>) =>
  fn.mock.calls.filter(([, i]) => (i as RequestInit)?.method === "PUT");

afterEach(() => vi.unstubAllGlobals());

describe("People settings", () => {
  it("[AC-089] shows the stored value from GET /settings and the readers statement", async () => {
    mockApi("hr_admin", {
      "GET /settings": { status: 200, body: settings(true) },
      "GET /feedback/audience": {
        status: 200,
        body: { manager_feedback_visible: true, readers_statement: ON },
      },
    });
    renderScreen();
    await openSettings();
    await waitFor(() => expect(screen.getByRole("checkbox")).toBeChecked());
    expect(await screen.findByText(ON)).toBeInTheDocument();
  });

  it("[AC-089] switching on sends PUT and shows the saved message only after the API confirms", async () => {
    let resolvePut: (r: Reply) => void = () => {};
    const gate = new Promise<Reply>((res) => (resolvePut = res));
    const fn = vi.fn(async (url: string, init?: RequestInit) => {
      const key = `${init?.method ?? "GET"} ${new URL(url).pathname}`;
      let r: Reply = { status: 200, body: {} };
      if (key === "GET /auth/me")
        r.body = { id: "h1", full_name: "Hana", role: "hr_admin", is_manager: false };
      else if (key === "GET /settings") r.body = settings(false);
      else if (key === "GET /feedback/audience") r.body = { readers_statement: OFF };
      else if (key === "PUT /settings") r = await gate;
      else if (key === "GET /employees" || key.startsWith("GET /d") || key === "GET /job-titles")
        r.body = [];
      return new Response(JSON.stringify(r.body), { status: r.status });
    });
    vi.stubGlobal("fetch", fn);
    renderScreen();
    const user = await openSettings();
    await waitFor(() => expect(screen.getByRole("checkbox")).not.toBeChecked());
    await user.click(screen.getByRole("checkbox"));
    expect(screen.queryByText(/^Saved\./)).toBeNull();
    resolvePut({ status: 200, body: settings(true) });
    expect(
      await screen.findByText(
        "Saved. Managers can now read feedback addressed to people in their reporting line.",
      ),
    ).toBeInTheDocument();
    const call = putCalls(fn)[0];
    expect(JSON.parse(String((call[1] as RequestInit).body))).toEqual({
      manager_feedback_visible: true,
    });
    expect((call[1] as RequestInit).headers).toMatchObject({ "X-Requested-With": "pms" });
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("[AC-090] switching off says managers no longer see it and describes the off state", async () => {
    mockApi("hr_admin", {
      "GET /settings": { status: 200, body: settings(true) },
      "PUT /settings": { status: 200, body: settings(false) },
    });
    renderScreen();
    const user = await openSettings();
    await waitFor(() => expect(screen.getByRole("checkbox")).toBeChecked());
    await user.click(screen.getByRole("checkbox"));
    expect(
      await screen.findByText(
        "Saved. Managers can no longer see feedback addressed to their direct reports.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(/managers do not see feedback on a direct report/i)).toBeInTheDocument();
  });

  it("[AC-090] a failed save returns the switch to the stored value and shows an error", async () => {
    mockApi("hr_admin", {
      "GET /settings": { status: 200, body: settings(false) },
      "PUT /settings": { status: 500, body: {} },
    });
    renderScreen();
    const user = await openSettings();
    await waitFor(() => expect(screen.getByRole("checkbox")).not.toBeChecked());
    await user.click(screen.getByRole("checkbox"));
    expect(await screen.findByRole("alert")).toHaveTextContent(/could not be saved/);
    expect(screen.getByRole("checkbox")).not.toBeChecked();
    expect(screen.queryByText(/^Saved\./)).toBeNull();
  });

  it("[NFR-020] non-HR users get no Settings tab and no settings calls", async () => {
    const fn = mockApi("manager", {});
    renderScreen();
    await waitFor(() =>
      expect(fn.mock.calls.some(([u]) => String(u).endsWith("/auth/me"))).toBe(true),
    );
    expect(screen.queryByRole("button", { name: "Settings" })).toBeNull();
    expect(fn.mock.calls.some(([u]) => String(u).endsWith("/settings"))).toBe(false);
  });
});
