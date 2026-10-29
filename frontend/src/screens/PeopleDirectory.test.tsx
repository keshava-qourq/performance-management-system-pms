import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import DirectoryTab from "./PeopleDirectory";

type Reply = { status: number; body?: unknown };
type Handler = Reply | ((init?: RequestInit) => Reply);

const DEPTS = [
  { id: "d1", name: "Engineering" },
  { id: "d2", name: "Design" },
];
const TITLES = [
  { id: "t1", name: "Engineer" },
  { id: "t2", name: "Designer" },
];
const ROW = {
  id: "e9",
  full_name: "Priya Nair",
  work_email: "priya@x.co",
  job_title: "Engineer",
  department: "Engineering",
  manager: null,
  status: "Active",
  account_status: "Active",
  missing_manager: false,
};

function mockApi(role: string, routes: Record<string, Handler>) {
  const fn = vi.fn(async (url: string, init?: RequestInit) => {
    const key = `${init?.method ?? "GET"} ${new URL(url).pathname}`;
    const base: Record<string, Handler> = {
      "GET /auth/me": { status: 200, body: { id: "e1", full_name: "A", role, is_manager: false } },
      "GET /departments": { status: 200, body: DEPTS },
      "GET /job-titles": { status: 200, body: TITLES },
    };
    const h = routes[key] ?? base[key] ?? { status: 404 };
    const r = typeof h === "function" ? h(init) : h;
    return new Response(JSON.stringify(r.body ?? {}), { status: r.status });
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

afterEach(() => vi.unstubAllGlobals());

describe("People directory", () => {
  it("[AC-001] creates an employee and lists it from GET /employees", async () => {
    let rows: unknown[] = [];
    const fn = mockApi("hr_admin", {
      "GET /employees": () => ({ status: 200, body: rows }),
      "POST /employees": (init) => {
        const b = JSON.parse(String(init?.body));
        rows = [{ ...ROW, full_name: b.full_name, work_email: b.work_email }];
        return { status: 201, body: rows[0] };
      },
    });
    renderTab();
    expect(await screen.findByText("No employees yet")).toBeInTheDocument();
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Add employee" }));
    await screen.findByRole("option", { name: "Designer" });
    await user.type(screen.getByLabelText("Full name"), "Priya Nair");
    await user.type(screen.getByLabelText("Work email"), "priya@x.co");
    await user.selectOptions(screen.getByLabelText("Job title"), "t2");
    await user.selectOptions(screen.getByLabelText("Department"), "d1");
    await user.click(screen.getByRole("button", { name: "Create employee" }));
    expect(await screen.findByText("priya@x.co")).toBeInTheDocument();
    const post = fn.mock.calls.find(([, i]) => i?.method === "POST")!;
    expect(JSON.parse(String(post[1]?.body))).toMatchObject({
      job_title_id: "t2",
      department_id: "d1",
    });
  });

  it("[AC-002] shows API 422 messages beside the field and keeps the form open", async () => {
    mockApi("hr_admin", {
      "GET /employees": { status: 200, body: [ROW] },
      "POST /employees": {
        status: 422,
        body: {
          errors: {
            full_name: "This field is required.",
            work_email: "That work email is already in use.",
          },
        },
      },
    });
    renderTab();
    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: "Add employee" }));
    await user.type(screen.getByLabelText("Work email"), "priya@x.co");
    await user.click(screen.getByRole("button", { name: "Create employee" }));
    expect(await screen.findByText("This field is required.")).toBeInTheDocument();
    expect(screen.getByText("That work email is already in use.")).toBeInTheDocument();
    expect(screen.getByLabelText("Full name")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("Work email")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("Work email")).toHaveValue("priya@x.co");
  });

  it("[AC-003] editing job title calls PATCH and the row updates", async () => {
    let row = ROW;
    const fn = mockApi("hr_admin", {
      "GET /employees": () => ({ status: 200, body: [row] }),
      "PATCH /employees/e9": () => {
        row = { ...ROW, job_title: "Designer" };
        return { status: 200, body: {} };
      },
    });
    renderTab();
    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: "Manage Priya Nair" }));
    await screen.findByRole("option", { name: "Designer" });
    await user.selectOptions(screen.getByLabelText("Job title"), "t2");
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    await waitFor(() => expect(fn.mock.calls.some(([, i]) => i?.method === "PATCH")).toBe(true));
    const patch = fn.mock.calls.find(([, i]) => i?.method === "PATCH")!;
    expect(JSON.parse(String(patch[1]?.body))).toEqual({ job_title_id: "t2" });
    await waitFor(() => {
      const row = screen.getAllByRole("row").find((r) => within(r).queryByText("priya@x.co"))!;
      expect(within(row).getByText("Designer")).toBeInTheDocument();
    });
  });

  it.each(["employee", "manager", "executive"])(
    "[AC-004] %s sees no Add employee or Manage actions",
    async (role) => {
      mockApi(role, { "GET /employees": { status: 200, body: [ROW] } });
      renderTab();
      expect(await screen.findByText("Priya Nair")).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Add employee" })).toBeNull();
      expect(screen.queryByRole("button", { name: /Manage/ })).toBeNull();
    },
  );

  it("[AC-004] a 403 shows a refusal and no data", async () => {
    mockApi("employee", { "GET /employees": { status: 403 } });
    renderTab();
    expect(await screen.findByText(/do not have access/)).toBeInTheDocument();
    expect(screen.queryByText("Priya Nair")).toBeNull();
  });

  it("[AC-001] explains an empty search result", async () => {
    mockApi("hr_admin", { "GET /employees": { status: 200, body: [ROW] } });
    renderTab();
    await userEvent.type(await screen.findByLabelText("Search people"), "zzz");
    expect(screen.getByText("No one matches that search")).toBeInTheDocument();
  });
});
