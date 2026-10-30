import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import Goals from "./Goals";

type Reply = { status: number; body?: unknown };
type Handler = (init?: RequestInit) => Reply;

const ME = { id: "e1", full_name: "Amara Okafor", role: "Employee", is_manager: false };
const OTHER = { id: "e9", full_name: "Priya Raman" };

function goal(over: Partial<Record<string, unknown>> = {}) {
  return {
    id: "g1",
    owner: { id: ME.id, full_name: ME.full_name },
    title: "Ship onboarding v2",
    description: "Guided checklist for new accounts.",
    target: "100% of new accounts self-serve",
    due_date: "2026-12-11",
    period: "2026-Q4",
    weighting: 40,
    progress: 55,
    status: "On track",
    parent_goal_id: null,
    overdue: false,
    updated_at: "2026-10-27T09:00:00+00:00",
    updated_by: { id: ME.id, full_name: ME.full_name },
    progress_updated_at: "2026-10-27T09:00:00+00:00",
    progress_updated_by: { id: ME.id, full_name: ME.full_name },
    ...over,
  };
}

const listBody = (goals: unknown[], extra: Record<string, unknown> = {}) => ({
  goals,
  weighting_total: 40,
  over_100_warning: false,
  warning: null,
  ...extra,
});

// A typed mock of the goals contract: GET/POST /goals, GET/PATCH /goals/{id},
// POST /goals/{id}/progress.
function mockApi(routes: Record<string, Reply | Handler>) {
  const fn = vi.fn(async (url: string, init?: RequestInit) => {
    const key = `${init?.method ?? "GET"} ${new URL(url).pathname}`;
    const route = routes[key];
    const r: Reply =
      typeof route === "function" ? route(init) : (route ?? { status: 404, body: {} });
    return new Response(r.status === 204 ? null : JSON.stringify(r.body ?? {}), {
      status: r.status,
    });
  });
  vi.stubGlobal("fetch", fn);
  return fn;
}

function renderScreen() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <Goals />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

const bodyOf = (fn: ReturnType<typeof mockApi>, suffix: string, method = "POST") => {
  const call = fn.mock.calls.find(
    ([u, i]) => String(u).endsWith(suffix) && (i as RequestInit)?.method === method,
  )!;
  return JSON.parse(String((call[1] as RequestInit).body));
};

async function fillForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Title"), "Run discovery interviews");
  await user.type(screen.getByLabelText("Measurable target"), "12 interviews");
  await user.type(screen.getByLabelText("Due date"), "2026-12-01");
  await user.type(screen.getByLabelText("Weighting (0–100)"), "30");
}

afterEach(() => vi.unstubAllGlobals());

describe("Goals", () => {
  it("[AC-038] lists the signed-in user's goals from GET /goals with no seeded data", async () => {
    mockApi({
      "GET /auth/me": { status: 200, body: ME },
      "GET /goals": { status: 200, body: listBody([goal()]) },
    });
    renderScreen();
    expect(await screen.findByText("Ship onboarding v2")).toBeInTheDocument();
    // Names and goals from the old prototype seed must be gone.
    expect(screen.queryByText(/Marta Lindqvist/)).toBeNull();
    expect(screen.queryByText(/Reach 92% customer retention/)).toBeNull();
  });

  it("[NFR-019] explains what will appear when the user has no goals", async () => {
    mockApi({
      "GET /auth/me": { status: 200, body: ME },
      "GET /goals": { status: 200, body: listBody([], { weighting_total: 0 }) },
    });
    renderScreen();
    expect(await screen.findByText("No goals yet")).toBeInTheDocument();
    expect(screen.getByText(/will be listed here/i)).toBeInTheDocument();
  });

  it("[AC-038] creating a goal posts to POST /goals and it appears at 0% progress", async () => {
    const created = goal({ id: "g2", title: "Run discovery interviews", progress: 0 });
    let listed: unknown[] = [];
    const fn = mockApi({
      "GET /auth/me": { status: 200, body: ME },
      "GET /goals": () => ({ status: 200, body: listBody(listed) }),
      "POST /goals": () => {
        listed = [created];
        return { status: 201, body: created };
      },
      "GET /goals/g2": { status: 200, body: { goal: created, children: [], history: [] } },
    });
    renderScreen();
    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: "New goal" }));
    await fillForm(user);
    await user.click(screen.getByRole("button", { name: "Save goal" }));

    const list = await screen.findByRole("region", { name: "My goals" });
    expect(await within(list).findByText("Run discovery interviews")).toBeInTheDocument();
    expect(within(list).getByText("0")).toBeInTheDocument();
    expect(bodyOf(fn, "/goals")).toMatchObject({
      title: "Run discovery interviews",
      target: "12 interviews",
      due_date: "2026-12-01",
      weighting: "30",
    });
  });

  it("[AC-039] shows the API's per-field messages and saves nothing", async () => {
    const fn = mockApi({
      "GET /auth/me": { status: 200, body: ME },
      "GET /goals": { status: 200, body: listBody([]) },
      "POST /goals": {
        status: 422,
        body: {
          errors: {
            title: "Enter a title for this goal.",
            target: "Enter a measurable target.",
            due_date: "Choose a due date.",
          },
        },
      },
    });
    renderScreen();
    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: "New goal" }));
    await user.click(screen.getByRole("button", { name: "Save goal" }));

    expect(await screen.findByText("Enter a title for this goal.")).toBeInTheDocument();
    expect(screen.getByText("Enter a measurable target.")).toBeInTheDocument();
    expect(screen.getByText("Choose a due date.")).toBeInTheDocument();
    expect(screen.getByLabelText("Title")).toHaveAttribute("aria-invalid", "true");
    // Nothing was stored: the list is still empty and the form is still open.
    expect(fn.mock.calls.filter(([, i]) => (i as RequestInit)?.method === "POST")).toHaveLength(1);
    expect(screen.getByRole("button", { name: "Save goal" })).toBeInTheDocument();
  });

  it("[AC-040] shows the API's validation message on the weighting field", async () => {
    mockApi({
      "GET /auth/me": { status: 200, body: ME },
      "GET /goals": { status: 200, body: listBody([]) },
      "POST /goals": {
        status: 422,
        body: { errors: { weighting: "Enter a weighting between 0 and 100." } },
      },
    });
    renderScreen();
    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: "New goal" }));
    await fillForm(user);
    await user.click(screen.getByRole("button", { name: "Save goal" }));

    expect(await screen.findByText("Enter a weighting between 0 and 100.")).toBeInTheDocument();
    expect(screen.getByLabelText("Weighting (0–100)")).toHaveAttribute("aria-invalid", "true");
  });

  it("[AC-041] shows the total with a warning when weightings exceed 100%, saving still allowed", async () => {
    mockApi({
      "GET /auth/me": { status: 200, body: ME },
      "GET /goals": {
        status: 200,
        body: listBody(
          [goal({ weighting: 70 }), goal({ id: "g2", title: "Second", weighting: 60 })],
          {
            weighting_total: 130,
            over_100_warning: true,
            warning: "These goals add up to 130% for this period, which is over 100%.",
          },
        ),
      },
    });
    renderScreen();
    expect(await screen.findByText(/Total weighting 130%/)).toBeInTheDocument();
    const status = await screen.findByRole("status");
    expect(status).toHaveTextContent("add up to 130%");
    // Not blocking: the goal form is still reachable.
    expect(screen.getByRole("button", { name: "New goal" })).toBeEnabled();
  });

  it("[AC-042] editing patches PATCH /goals/{id} and shows who last changed it and when", async () => {
    const patched = goal({
      title: "Ship onboarding v3",
      updated_by: OTHER,
      updated_at: "2026-10-29T11:00:00+00:00",
    });
    const fn = mockApi({
      "GET /auth/me": { status: 200, body: ME },
      "GET /goals": { status: 200, body: listBody([goal()]) },
      "GET /goals/g1": { status: 200, body: { goal: goal(), children: [], history: [] } },
      "PATCH /goals/g1": { status: 200, body: patched },
    });
    renderScreen();
    const user = userEvent.setup();
    await user.click(await screen.findByText("Ship onboarding v2"));
    await user.click(await screen.findByRole("button", { name: "Edit goal" }));
    const title = screen.getByLabelText("Title");
    await user.clear(title);
    await user.type(title, "Ship onboarding v3");
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(
      await screen.findByText("Last changed by Priya Raman on 29 Oct 2026."),
    ).toBeInTheDocument();
    expect(bodyOf(fn, "/goals/g1", "PATCH")).toMatchObject({ title: "Ship onboarding v3" });
  });

  it("[AC-043] [AC-045] progress posts to /goals/{id}/progress and shows percentage, status, date and name", async () => {
    const updated = goal({
      progress: 80,
      status: "At risk",
      progress_updated_at: "2026-10-30T08:00:00+00:00",
      progress_updated_by: { id: ME.id, full_name: ME.full_name },
    });
    let stored = goal();
    const fn = mockApi({
      "GET /auth/me": { status: 200, body: ME },
      "GET /goals": () => ({ status: 200, body: listBody([stored]) }),
      "GET /goals/g1": () => ({ status: 200, body: { goal: stored, children: [], history: [] } }),
      "POST /goals/g1/progress": () => {
        stored = updated;
        return { status: 200, body: updated };
      },
    });
    renderScreen();
    const user = userEvent.setup();
    await user.click(await screen.findByText("Ship onboarding v2"));
    const field = await screen.findByLabelText("Progress (%)");
    await user.clear(field);
    await user.type(field, "80");
    await user.selectOptions(screen.getByLabelText("Status"), "At risk");
    await user.click(screen.getByRole("button", { name: "Save progress" }));

    expect(
      await screen.findByText(/80% · At risk · recorded by Amara Okafor on 30 Oct 2026/),
    ).toBeInTheDocument();
    expect(bodyOf(fn, "/goals/g1/progress")).toEqual({ progress: "80", status: "At risk" });
  });

  it("[AC-044] progress above 100 shows the message and keeps the previously shown progress", async () => {
    mockApi({
      "GET /auth/me": { status: 200, body: ME },
      "GET /goals": { status: 200, body: listBody([goal()]) },
      "GET /goals/g1": { status: 200, body: { goal: goal(), children: [], history: [] } },
      "POST /goals/g1/progress": {
        status: 422,
        body: { errors: { progress: "Enter progress as a percentage between 0 and 100." } },
      },
    });
    renderScreen();
    const user = userEvent.setup();
    await user.click(await screen.findByText("Ship onboarding v2"));
    const field = await screen.findByLabelText("Progress (%)");
    await user.clear(field);
    await user.type(field, "120");
    await user.click(screen.getByRole("button", { name: "Save progress" }));

    expect(
      await screen.findByText("Enter progress as a percentage between 0 and 100."),
    ).toBeInTheDocument();
    expect(screen.getByText(/55% · On track/)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByLabelText("Progress (%)")).toHaveValue("55"));
  });

  it("[AC-046] an overdue goal is flagged in both the list and the detail pane", async () => {
    const late = goal({ due_date: "2026-01-31", overdue: true, status: "Off track" });
    mockApi({
      "GET /auth/me": { status: 200, body: ME },
      "GET /goals": { status: 200, body: listBody([late]) },
      "GET /goals/g1": { status: 200, body: { goal: late, children: [], history: [] } },
    });
    renderScreen();
    const user = userEvent.setup();
    const list = await screen.findByRole("region", { name: "My goals" });
    expect(await within(list).findByText("Overdue")).toBeInTheDocument();
    await user.click(await screen.findByText("Ship onboarding v2"));
    const detail = screen.getByRole("region", { name: "Goal detail" });
    expect(await within(detail).findByText("Overdue")).toBeInTheDocument();
  });

  it("[AC-047] a viewer who is neither owner nor HR Admin gets read-only progress and status", async () => {
    const theirs = goal({ owner: OTHER });
    mockApi({
      "GET /auth/me": { status: 200, body: ME },
      "GET /goals": { status: 200, body: listBody([theirs]) },
      "GET /goals/g1": { status: 200, body: { goal: theirs, children: [], history: [] } },
    });
    renderScreen();
    const user = userEvent.setup();
    await user.click(await screen.findByText("Ship onboarding v2"));
    expect(await screen.findByLabelText("Progress (%)")).toBeDisabled();
    expect(screen.getByLabelText("Status")).toBeDisabled();
    expect(screen.queryByRole("button", { name: "Save progress" })).toBeNull();
  });

  it("[AC-047] a 403 from the API turns the progress fields read-only", async () => {
    const hrView = goal({ owner: { id: ME.id, full_name: ME.full_name } });
    mockApi({
      "GET /auth/me": { status: 200, body: ME },
      "GET /goals": { status: 200, body: listBody([hrView]) },
      "GET /goals/g1": { status: 200, body: { goal: hrView, children: [], history: [] } },
      "POST /goals/g1/progress": { status: 403, body: {} },
    });
    renderScreen();
    const user = userEvent.setup();
    await user.click(await screen.findByText("Ship onboarding v2"));
    await user.click(await screen.findByRole("button", { name: "Save progress" }));
    await waitFor(() => expect(screen.getByLabelText("Progress (%)")).toBeDisabled());
  });
});
