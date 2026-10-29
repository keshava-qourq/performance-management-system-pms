import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { activeOnly } from "@/lib/employees";
import DirectoryTab from "./PeopleDirectory";

type Reply = { status: number; body?: unknown };
type Handler = Reply | ((init?: RequestInit) => Reply);

const ENGINEER = { id: "t1", name: "Engineer" };
const ENGINEERING = { id: "d1", name: "Engineering" };
const base = {
  work_email: "x@x.co",
  job_title: ENGINEER,
  department: ENGINEERING,
  manager: null as null | { id: string; full_name: string },
  missing_manager: true,
  role: "manager",
  status: "Active",
};
const PRIYA = { ...base, id: "e9", full_name: "Priya Nair", work_email: "priya@x.co" };
const DANIEL = { ...base, id: "e2", full_name: "Daniel Reyes", work_email: "daniel@x.co" };
const SOFIA = { ...base, id: "e5", full_name: "Sofia Lindqvist", work_email: "sofia@x.co" };
const REPORTS = [{ id: "e3", full_name: "Tomas Lind" }];

function mockApi(routes: Record<string, Handler>) {
  const fn = vi.fn(async (url: string, init?: RequestInit) => {
    const key = `${init?.method ?? "GET"} ${new URL(url).pathname}`;
    const defaults: Record<string, Handler> = {
      "GET /auth/me": {
        status: 200,
        body: { id: "e1", full_name: "A", role: "hr_admin", is_manager: false },
      },
      "GET /departments": { status: 200, body: [ENGINEERING] },
      "GET /job-titles": { status: 200, body: [ENGINEER] },
    };
    const handler = routes[key] ?? defaults[key] ?? { status: 404 };
    const reply = typeof handler === "function" ? handler(init) : handler;
    return new Response(JSON.stringify(reply.body ?? {}), { status: reply.status });
  });
  vi.stubGlobal("fetch", fn);
  return fn;
}

function renderTab() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <DirectoryTab />
    </QueryClientProvider>,
  );
}

const bodyOf = (fn: ReturnType<typeof mockApi>, index = 0) =>
  JSON.parse(
    String(fn.mock.calls.filter(([, i]) => i?.method === "POST")[index]![1]?.body),
  ) as Record<string, string>;

afterEach(() => vi.unstubAllGlobals());

describe("Leaver deactivation", () => {
  it("[AC-015] deactivates an employee with a leaving date and shows them as deactivated", async () => {
    let rows: unknown[] = [PRIYA, DANIEL];
    const fn = mockApi({
      "GET /employees": () => ({ status: 200, body: rows }),
      "GET /employees/e9/record": () => ({
        status: 200,
        body: { employee: rows[0], direct_reports: [] },
      }),
      "POST /employees/e9/deactivate": () => {
        rows = [{ ...PRIYA, status: "Deactivated", leaving_date: "2026-11-30" }, DANIEL];
        return { status: 200, body: rows[0] };
      },
    });
    renderTab();
    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: "Manage Priya Nair" }));
    await user.click(await screen.findByRole("button", { name: "Deactivate employee" }));
    await user.type(screen.getByLabelText("Leaving date"), "2026-11-30");
    await user.click(screen.getByRole("button", { name: "Confirm deactivation" }));

    await waitFor(() => expect(bodyOf(fn)).toEqual({ leaving_date: "2026-11-30" }));
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Priya Nair was deactivated. Their goals, feedback and reviews are kept on their record.",
    );
    const row = screen.getAllByRole("row").find((r) => within(r).queryByText("Priya Nair"))!;
    expect(within(row).getByText("Deactivated")).toBeInTheDocument();
  });

  it("[AC-015] a deactivated person is not offered as a manager for anyone else", async () => {
    mockApi({
      "GET /employees": {
        status: 200,
        body: [DANIEL, { ...PRIYA, status: "Deactivated" }],
      },
      "GET /employees/e2/record": {
        status: 200,
        body: { employee: DANIEL, direct_reports: [] },
      },
    });
    renderTab();
    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: "Manage Daniel Reyes" }));
    const picker = await screen.findByLabelText("Manager");
    expect(within(picker).queryByRole("option", { name: "Priya Nair" })).toBeNull();
  });

  it("[AC-015] the shared people filter leaves deactivated employees out of every picker", () => {
    expect(
      activeOnly([PRIYA, { ...DANIEL, status: "deactivated" }]).map((p) => p.full_name),
    ).toEqual(["Priya Nair"]);
  });

  it("[AC-016] a deactivated record still shows its history and offers no delete control", async () => {
    const leaver = { ...PRIYA, status: "Deactivated", leaving_date: "2026-09-30" };
    mockApi({
      "GET /employees": { status: 200, body: [leaver] },
      "GET /employees/e9/record": {
        status: 200,
        body: {
          employee: leaver,
          direct_reports: [],
          goals: [{ id: "g1", title: "Ship onboarding v2" }],
          self_reviews: [{ id: "r1", period: "H1 2026" }],
          feedback: [{ id: "f1", body: "Clear prototype walkthrough" }],
        },
      },
    });
    renderTab();
    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: "Manage Priya Nair" }));
    expect(await screen.findByText("Ship onboarding v2")).toBeInTheDocument();
    expect(screen.getByText("H1 2026")).toBeInTheDocument();
    expect(screen.getByText("Clear prototype walkthrough")).toBeInTheDocument();
    expect(screen.getByText(/left on 30 Sept? 2026/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /delete/i })).toBeNull();
    expect(screen.queryByRole("button", { name: "Deactivate employee" })).toBeNull();
  });

  it("[AC-016] explains plainly when a deactivated employee has no history yet", async () => {
    const leaver = { ...PRIYA, status: "Deactivated" };
    mockApi({
      "GET /employees": { status: 200, body: [leaver] },
      "GET /employees/e9/record": {
        status: 200,
        body: { employee: leaver, direct_reports: [], goals: [], self_reviews: [], feedback: [] },
      },
    });
    renderTab();
    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: "Manage Priya Nair" }));
    expect(
      await screen.findByText(/Nothing has been recorded for Priya Nair yet/),
    ).toBeInTheDocument();
  });

  it("[AC-017] the reassign-direct-reports 422 lists them and resubmits with the new manager", async () => {
    const message =
      "Priya Nair still manages Tomas Lind. Choose a new manager for them before deactivating.";
    let rows: unknown[] = [PRIYA, SOFIA];
    const fn = mockApi({
      "GET /employees": () => ({ status: 200, body: rows }),
      "GET /employees/e9/record": () => ({
        status: 200,
        body: { employee: rows[0], direct_reports: REPORTS },
      }),
      "POST /employees/e9/deactivate": (init) => {
        const body = JSON.parse(String(init?.body));
        if (!body.reassign_manager_id)
          return { status: 422, body: { errors: { reassign_manager_id: message } } };
        rows = [{ ...PRIYA, status: "Deactivated" }, SOFIA];
        return { status: 200, body: rows[0] };
      },
    });
    renderTab();
    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: "Manage Priya Nair" }));
    await user.click(await screen.findByRole("button", { name: "Deactivate employee" }));
    await user.type(screen.getByLabelText("Leaving date"), "2026-11-30");
    await user.click(screen.getByRole("button", { name: "Confirm deactivation" }));

    expect(await screen.findByText(message)).toBeInTheDocument();
    const list = screen.getByLabelText("Affected direct reports");
    expect(within(list).getByText("Tomas Lind")).toBeInTheDocument();
    expect(screen.getByLabelText("New manager")).toHaveAttribute("aria-invalid", "true");

    await user.selectOptions(screen.getByLabelText("New manager"), "e5");
    await user.click(screen.getByRole("button", { name: "Reassign and deactivate" }));
    await waitFor(() =>
      expect(bodyOf(fn, 1)).toEqual({
        leaving_date: "2026-11-30",
        reassign_manager_id: "e5",
      }),
    );
    expect(await screen.findByRole("status")).toHaveTextContent("Priya Nair was deactivated.");
  });

  it("[AC-017] an invalid reassignment target renders inline against the new-manager field", async () => {
    const first =
      "Priya Nair still manages Tomas Lind. Choose a new manager for them before deactivating.";
    const circular =
      "This would make the reporting line circular, because Sofia Lindqvist reports to Tomas Lind.";
    mockApi({
      "GET /employees": { status: 200, body: [PRIYA, SOFIA] },
      "GET /employees/e9/record": {
        status: 200,
        body: { employee: PRIYA, direct_reports: REPORTS },
      },
      "POST /employees/e9/deactivate": (init) => {
        const body = JSON.parse(String(init?.body));
        return {
          status: 422,
          body: { errors: { reassign_manager_id: body.reassign_manager_id ? circular : first } },
        };
      },
    });
    renderTab();
    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: "Manage Priya Nair" }));
    await user.click(await screen.findByRole("button", { name: "Deactivate employee" }));
    await user.type(screen.getByLabelText("Leaving date"), "2026-11-30");
    await user.click(screen.getByRole("button", { name: "Confirm deactivation" }));
    await screen.findByText(first);
    await user.selectOptions(screen.getByLabelText("New manager"), "e5");
    await user.click(screen.getByRole("button", { name: "Reassign and deactivate" }));
    expect(await screen.findByText(circular)).toBeInTheDocument();
    expect(screen.getByLabelText("New manager")).toHaveAttribute("aria-invalid", "true");
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("[AC-015] asks for the leaving date in plain English before calling the API", async () => {
    const fn = mockApi({
      "GET /employees": { status: 200, body: [PRIYA] },
      "GET /employees/e9/record": {
        status: 200,
        body: { employee: PRIYA, direct_reports: [] },
      },
    });
    renderTab();
    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: "Manage Priya Nair" }));
    await user.click(await screen.findByRole("button", { name: "Deactivate employee" }));
    await user.click(screen.getByRole("button", { name: "Confirm deactivation" }));
    expect(await screen.findByText("Enter the date this employee is leaving.")).toBeInTheDocument();
    expect(fn.mock.calls.some(([, i]) => i?.method === "POST")).toBe(false);
  });
});
