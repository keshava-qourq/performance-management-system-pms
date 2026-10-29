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
const ENGINEER = { id: "t1", name: "Engineer" };
const ENGINEERING = { id: "d1", name: "Engineering" };

// Rows exactly as GET /employees returns them: named things by reference.
const PRIYA = {
  id: "e9",
  full_name: "Priya Nair",
  work_email: "priya@x.co",
  job_title: ENGINEER,
  department: ENGINEERING,
  manager: null as null | { id: string; full_name: string },
  missing_manager: true,
  role: "employee",
  status: "Active",
};
const DANIEL = {
  id: "e2",
  full_name: "Daniel Reyes",
  work_email: "daniel@x.co",
  job_title: ENGINEER,
  department: ENGINEERING,
  manager: null,
  missing_manager: true,
  role: "manager",
  status: "Active",
};
const SOFIA = {
  id: "e5",
  full_name: "Sofia Lindqvist",
  work_email: "sofia@x.co",
  job_title: ENGINEER,
  department: ENGINEERING,
  manager: null,
  missing_manager: true,
  role: "manager",
  status: "Active",
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

const rowFor = (name: string | RegExp) =>
  screen.getAllByRole("row").find((r) => within(r).queryByText(name))!;

const bodyOf = (fn: ReturnType<typeof mockApi>, method: string) =>
  JSON.parse(String(fn.mock.calls.find(([, i]) => i?.method === method)![1]?.body));

afterEach(() => vi.unstubAllGlobals());

describe("People directory", () => {
  it("[AC-001] creates an employee and lists it from GET /employees", async () => {
    let rows: unknown[] = [];
    const fn = mockApi("hr_admin", {
      "GET /employees": () => ({ status: 200, body: rows }),
      "POST /employees": (init) => {
        const b = JSON.parse(String(init?.body));
        rows = [{ ...PRIYA, full_name: b.full_name, work_email: b.work_email }];
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
    expect(bodyOf(fn, "POST")).toMatchObject({ job_title_id: "t2", department_id: "d1" });
  });

  it("[AC-002] shows API 422 messages beside the field and keeps the form open", async () => {
    mockApi("hr_admin", {
      "GET /employees": { status: 200, body: [PRIYA] },
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
    expect(screen.getByLabelText("Work email")).toHaveValue("priya@x.co");
  });

  it("[AC-003] editing job title calls PATCH and the row updates", async () => {
    let row = PRIYA;
    const fn = mockApi("hr_admin", {
      "GET /employees": () => ({ status: 200, body: [row] }),
      "GET /employees/e9/record": () => ({
        status: 200,
        body: { employee: row, direct_reports: [] },
      }),
      "PATCH /employees/e9": () => {
        row = { ...PRIYA, job_title: { id: "t2", name: "Designer" } };
        return { status: 200, body: {} };
      },
    });
    renderTab();
    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: "Manage Priya Nair" }));
    await screen.findByRole("option", { name: "Designer" });
    await user.selectOptions(screen.getByLabelText("Job title"), "t2");
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    await waitFor(() => expect(bodyOf(fn, "PATCH")).toEqual({ job_title_id: "t2" }));
    await waitFor(() =>
      expect(within(rowFor("priya@x.co")).getByText("Designer")).toBeInTheDocument(),
    );
  });

  it.each(["employee", "manager", "executive"])(
    "[AC-004] %s sees no Add employee or Manage actions",
    async (role) => {
      mockApi(role, { "GET /employees": { status: 200, body: [PRIYA] } });
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
    mockApi("hr_admin", { "GET /employees": { status: 200, body: [PRIYA] } });
    renderTab();
    await userEvent.type(await screen.findByLabelText("Search people"), "zzz");
    expect(screen.getByText("No one matches that search")).toBeInTheDocument();
  });

  // ---- reporting lines -------------------------------------------------

  it("[AC-008] setting a manager PUTs the reporting line and the manager column refetches", async () => {
    let rows = [PRIYA, DANIEL];
    const fn = mockApi("hr_admin", {
      "GET /employees": () => ({ status: 200, body: rows }),
      "GET /employees/e9/record": () => ({
        status: 200,
        body: { employee: rows[0], direct_reports: [] },
      }),
      "PUT /employees/e9/manager": () => {
        rows = [
          { ...PRIYA, manager: { id: "e2", full_name: "Daniel Reyes" }, missing_manager: false },
          DANIEL,
        ];
        return { status: 200, body: rows[0] };
      },
    });
    renderTab();
    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: "Manage Priya Nair" }));
    await user.selectOptions(await screen.findByLabelText("Manager"), "e2");
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    await waitFor(() => expect(bodyOf(fn, "PUT")).toEqual({ manager_id: "e2" }));
    await waitFor(() =>
      expect(within(rowFor("Priya Nair")).getByText("Daniel Reyes")).toBeInTheDocument(),
    );
    // No PATCH: only the reporting line changed.
    expect(fn.mock.calls.some(([, i]) => i?.method === "PATCH")).toBe(false);
  });

  it("[AC-008] the manager's record lists the employee under direct reports", async () => {
    mockApi("hr_admin", {
      "GET /employees": {
        status: 200,
        body: [{ ...PRIYA, manager: { id: "e2", full_name: "Daniel Reyes" } }, DANIEL],
      },
      "GET /employees/e2/record": {
        status: 200,
        body: { employee: DANIEL, direct_reports: [{ id: "e9", full_name: "Priya Nair" }] },
      },
    });
    renderTab();
    await userEvent.click(await screen.findByRole("button", { name: "Manage Daniel Reyes" }));
    const reports = await screen.findByRole("region", { name: "Direct reports" });
    expect(await within(reports).findByText("Priya Nair")).toBeInTheDocument();
  });

  it("[AC-008] a manager with nobody reporting to them sees an explanation, not an error", async () => {
    mockApi("hr_admin", {
      "GET /employees": { status: 200, body: [DANIEL] },
      "GET /employees/e2/record": {
        status: 200,
        body: { employee: DANIEL, direct_reports: [] },
      },
    });
    renderTab();
    await userEvent.click(await screen.findByRole("button", { name: "Manage Daniel Reyes" }));
    expect(await screen.findByText(/No one reports to Daniel Reyes yet/)).toBeInTheDocument();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("[AC-009] a 422 from the manager endpoint shows the circular message on the manager field", async () => {
    const message =
      "This would make the reporting line circular, because Daniel Reyes already reports to Priya Nair.";
    const fn = mockApi("hr_admin", {
      "GET /employees": { status: 200, body: [PRIYA, DANIEL] },
      "GET /employees/e9/record": {
        status: 200,
        body: { employee: PRIYA, direct_reports: [] },
      },
      "PUT /employees/e9/manager": { status: 422, body: { errors: { manager_id: message } } },
    });
    renderTab();
    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: "Manage Priya Nair" }));
    await user.selectOptions(await screen.findByLabelText("Manager"), "e2");
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    const error = await screen.findByText(message);
    expect(error).toBeInTheDocument();
    expect(screen.getByLabelText("Manager")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("Manager")).toHaveAttribute(
      "aria-describedby",
      "manager_id-error",
    );
    // Not treated as a save: no success message and nothing else was sent.
    expect(screen.queryByRole("status")).toBeNull();
    expect(fn.mock.calls.some(([, i]) => i?.method === "PATCH")).toBe(false);
  });

  it("[AC-010] an employee with no manager shows an empty manager field and a missing-reporting-line flag", async () => {
    mockApi("hr_admin", {
      "GET /employees": { status: 200, body: [PRIYA] },
      "GET /employees/e9/record": {
        status: 200,
        body: { employee: PRIYA, direct_reports: [] },
      },
    });
    renderTab();
    const row = within(rowFor(await screen.findByText("Priya Nair").then(() => "Priya Nair")));
    expect(row.getByText("Missing a reporting line")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Manage Priya Nair" }));
    expect(await screen.findByLabelText("Manager")).toHaveValue("");
  });

  it("[AC-011] reassigning to a different manager shows the new manager after refetch", async () => {
    let rows = [
      { ...PRIYA, manager: { id: "e2", full_name: "Daniel Reyes" }, missing_manager: false },
      DANIEL,
      SOFIA,
    ];
    const fn = mockApi("hr_admin", {
      "GET /employees": () => ({ status: 200, body: rows }),
      "GET /employees/e9/record": () => ({
        status: 200,
        body: { employee: rows[0], direct_reports: [] },
      }),
      "PUT /employees/e9/manager": () => {
        rows = [
          { ...PRIYA, manager: { id: "e5", full_name: "Sofia Lindqvist" }, missing_manager: false },
          DANIEL,
          SOFIA,
        ];
        return { status: 200, body: rows[0] };
      },
    });
    renderTab();
    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: "Manage Priya Nair" }));
    const picker = await screen.findByLabelText("Manager");
    expect(picker).toHaveValue("e2");
    await user.selectOptions(picker, "e5");
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    await waitFor(() => expect(bodyOf(fn, "PUT")).toEqual({ manager_id: "e5" }));
    await waitFor(() =>
      expect(within(rowFor("Priya Nair")).getByText("Sofia Lindqvist")).toBeInTheDocument(),
    );
  });

  it("[AC-011] the employee cannot be chosen as their own manager", async () => {
    mockApi("hr_admin", {
      "GET /employees": { status: 200, body: [PRIYA, DANIEL] },
      "GET /employees/e9/record": {
        status: 200,
        body: { employee: PRIYA, direct_reports: [] },
      },
    });
    renderTab();
    await userEvent.click(await screen.findByRole("button", { name: "Manage Priya Nair" }));
    const picker = await screen.findByLabelText("Manager");
    const labels = within(picker)
      .getAllByRole("option")
      .map((o) => o.textContent);
    expect(labels).toContain("Daniel Reyes");
    expect(labels).not.toContain("Priya Nair");
  });

  // ---- role -------------------------------------------------------------

  it("[AC-012] the role selector is available when editing and persists via PATCH", async () => {
    let row = PRIYA;
    const fn = mockApi("hr_admin", {
      "GET /employees": () => ({ status: 200, body: [row] }),
      "GET /employees/e9/record": () => ({
        status: 200,
        body: { employee: row, direct_reports: [] },
      }),
      "PATCH /employees/e9": () => {
        row = { ...PRIYA, role: "hr_admin" };
        return { status: 200, body: row };
      },
    });
    renderTab();
    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: "Manage Priya Nair" }));
    const roles = await screen.findByLabelText("Role");
    expect(roles).toHaveValue("employee");
    await user.selectOptions(roles, "hr_admin");
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    await waitFor(() => expect(bodyOf(fn, "PATCH")).toEqual({ role: "hr_admin" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Priya Nair was updated.");
  });

  it("[AC-014] a 422 on the role field shows the last-HR-Admin message against the role field", async () => {
    const message = "At least one HR Admin must remain, so this role cannot be changed.";
    mockApi("hr_admin", {
      "GET /employees": { status: 200, body: [{ ...PRIYA, role: "hr_admin" }] },
      "GET /employees/e9/record": {
        status: 200,
        body: { employee: PRIYA, direct_reports: [] },
      },
      "PATCH /employees/e9": { status: 422, body: { errors: { role: message } } },
    });
    renderTab();
    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: "Manage Priya Nair" }));
    await user.selectOptions(await screen.findByLabelText("Role"), "employee");
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    expect(await screen.findByText(message)).toBeInTheDocument();
    expect(screen.getByLabelText("Role")).toHaveAttribute("aria-invalid", "true");
    expect(screen.queryByRole("status")).toBeNull();
  });

  // ---- executive read-only ---------------------------------------------

  it("[AC-013] an executive sees the directory read-only with no create, edit or save controls", async () => {
    mockApi("executive", { "GET /employees": { status: 200, body: [PRIYA, DANIEL] } });
    renderTab();
    expect(await screen.findByText("Priya Nair")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Add employee" })).toBeNull();
    expect(screen.queryByRole("button", { name: /^Manage/ })).toBeNull();
    expect(screen.queryByRole("button", { name: "Save changes" })).toBeNull();
    expect(screen.queryByLabelText("Employee record form")).toBeNull();
    expect(
      screen.getByText(/Only HR Admins can add or change employee records/),
    ).toBeInTheDocument();
  });

  it("[AC-013] a 403 on the directory explains the refusal instead of crashing", async () => {
    mockApi("executive", { "GET /employees": { status: 403 } });
    renderTab();
    expect(
      await screen.findByText("You do not have access to the employee directory"),
    ).toBeInTheDocument();
    expect(screen.getByText(/not employee records, so nothing is shown here/)).toBeInTheDocument();
  });

  it("[AC-013] a 403 on save renders a read-only explanation rather than crashing", async () => {
    mockApi("hr_admin", {
      "GET /employees": { status: 200, body: [PRIYA] },
      "GET /employees/e9/record": {
        status: 200,
        body: { employee: PRIYA, direct_reports: [] },
      },
      "PATCH /employees/e9": { status: 403 },
    });
    renderTab();
    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: "Manage Priya Nair" }));
    await user.selectOptions(await screen.findByLabelText("Role"), "manager");
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Your role can view employee records but not change them, so nothing was saved.",
    );
  });

  it("[AC-008] no sample employee data is shown before the API answers", async () => {
    mockApi("hr_admin", { "GET /employees": { status: 200, body: [] } });
    renderTab();
    expect(await screen.findByText("No employees yet")).toBeInTheDocument();
    for (const seeded of ["Amara Okafor", "Helena Voss", "Tomas Lindgren", "Marcus Webb"])
      expect(screen.queryByText(seeded)).toBeNull();
  });
});
