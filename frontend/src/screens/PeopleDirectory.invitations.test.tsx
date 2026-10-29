import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import DirectoryTab from "./PeopleDirectory";

type Reply = { status: number; body?: unknown };
type Handler = Reply | ((init?: RequestInit) => Reply);

const DEPTS = [{ id: "d1", name: "Engineering" }];
const TITLES = [{ id: "t1", name: "Engineer" }];

// A row exactly as GET /employees returns it, with its account status.
const priya = (account_status: string) => ({
  id: "e9",
  full_name: "Priya Nair",
  work_email: "priya@x.co",
  job_title: TITLES[0],
  department: DEPTS[0],
  manager: null,
  missing_manager: true,
  role: "employee",
  status: "Active",
  account_status,
});

function mockApi(routes: Record<string, Handler>) {
  const fn = vi.fn(async (url: string, init?: RequestInit) => {
    const key = `${init?.method ?? "GET"} ${new URL(url).pathname}`;
    const base: Record<string, Handler> = {
      "GET /auth/me": {
        status: 200,
        body: { id: "e1", full_name: "A", role: "hr_admin", is_manager: false },
      },
      "GET /departments": { status: 200, body: DEPTS },
      "GET /job-titles": { status: 200, body: TITLES },
      "GET /employees/e9/record": { status: 200, body: { employee: priya("No account") } },
    };
    const h = routes[key] ?? base[key] ?? { status: 404 };
    const r = typeof h === "function" ? h(init) : h;
    return new Response(r.status === 204 ? null : JSON.stringify(r.body ?? {}), {
      status: r.status,
    });
  });
  vi.stubGlobal("fetch", fn);
  return fn;
}

// userEvent installs its own clipboard stub, so spy on that rather than
// replacing navigator.
function clipboardSpy() {
  return vi.spyOn(navigator.clipboard, "writeText");
}

function renderTab() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <DirectoryTab />
    </QueryClientProvider>,
  );
}

const LINK = { link: "https://pms.example/set-password/tok-1", expires_at: "2026-11-05T10:00:00Z" };

afterEach(() => vi.unstubAllGlobals());

describe("HR invitation controls", () => {
  it("[AC-018] Invite issues a link, shows it with a copy control and the record reads Invited", async () => {
    let row = priya("No account");
    const fn = mockApi({
      "GET /employees": () => ({ status: 200, body: [row] }),
      "POST /employees/e9/invitations": () => {
        row = priya("Invited");
        return { status: 201, body: LINK };
      },
    });
    renderTab();
    const user = userEvent.setup();
    const writeText = clipboardSpy();
    await user.click(await screen.findByRole("button", { name: "Manage Priya Nair" }));
    await user.click(await screen.findByRole("button", { name: "Invite" }));

    expect(await screen.findByLabelText("Invitation link")).toHaveValue(LINK.link);
    await user.click(screen.getByRole("button", { name: "Copy link" }));
    expect(writeText).toHaveBeenCalledWith(LINK.link);
    await waitFor(() =>
      expect(within(screen.getByLabelText("Account access")).getByText(/Invited/)).toBeVisible(),
    );
    const call = fn.mock.calls.find(([u]) => String(u).endsWith("/employees/e9/invitations"))!;
    expect((call[1]?.headers as Record<string, string>)["X-Requested-With"]).toBe("pms");
  });

  it("[AC-021] an outstanding invitation can be revoked, and the link disappears", async () => {
    let row = priya("Invited");
    const fn = mockApi({
      "GET /employees": () => ({ status: 200, body: [row] }),
      "POST /employees/e9/invitations": { status: 201, body: LINK },
      "DELETE /employees/e9/invitations": () => {
        row = priya("No account");
        return { status: 204 };
      },
    });
    renderTab();
    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: "Manage Priya Nair" }));
    await user.click(await screen.findByRole("button", { name: "Reissue invitation" }));
    expect(await screen.findByLabelText("Invitation link")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Revoke invitation" }));
    await waitFor(() => expect(screen.queryByLabelText("Invitation link")).toBeNull());
    expect(screen.getByRole("status")).toHaveTextContent("no longer works");
    expect(fn.mock.calls.some(([, i]) => i?.method === "DELETE")).toBe(true);
  });

  it("[AC-021] reissuing says only the newest link works", async () => {
    mockApi({
      "GET /employees": { status: 200, body: [priya("Invited")] },
      "POST /employees/e9/invitations": {
        status: 201,
        body: { ...LINK, link: "https://pms.example/set-password/tok-2" },
      },
    });
    renderTab();
    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: "Manage Priya Nair" }));
    await user.click(await screen.findByRole("button", { name: "Reissue invitation" }));
    expect(await screen.findByLabelText("Invitation link")).toHaveValue(
      "https://pms.example/set-password/tok-2",
    );
    expect(screen.getByText(/only the newest link works/i)).toBeInTheDocument();
  });

  it("[AC-029] HR issues a password-reset link, shown the same way with a copy control", async () => {
    mockApi({
      "GET /employees": { status: 200, body: [priya("Active")] },
      "POST /employees/e9/password-resets": { status: 201, body: LINK },
    });
    renderTab();
    const user = userEvent.setup();
    const writeText = clipboardSpy();
    await user.click(await screen.findByRole("button", { name: "Manage Priya Nair" }));
    // Someone with an account is not re-invited, only reset.
    expect(screen.queryByRole("button", { name: "Invite" })).toBeNull();
    await user.click(screen.getByRole("button", { name: "Issue password-reset link" }));

    expect(await screen.findByLabelText("Password-reset link")).toHaveValue(LINK.link);
    await user.click(screen.getByRole("button", { name: "Copy link" }));
    expect(writeText).toHaveBeenCalledWith(LINK.link);
  });

  it("[AC-018] a refused invitation shows a plain-English message, not a raw error", async () => {
    mockApi({
      "GET /employees": { status: 200, body: [priya("No account")] },
      "POST /employees/e9/invitations": { status: 403, body: {} },
    });
    renderTab();
    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: "Manage Priya Nair" }));
    await user.click(screen.getByRole("button", { name: "Invite" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("That could not be done.");
    expect(screen.queryByLabelText("Invitation link")).toBeNull();
  });
});
