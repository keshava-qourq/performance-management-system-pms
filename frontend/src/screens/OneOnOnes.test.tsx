import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import OneOnOnes from "./OneOnOnes";

type Reply = { status: number; body?: unknown };
type Handler = (init?: RequestInit) => Reply;

const ME = { id: "e1", full_name: "Amara Okafor", role: "Employee", is_manager: true };
const REPORT = { id: "e2", full_name: "Tomás Reyes" };

const summary = (over: Record<string, unknown> = {}) => ({
  id: "r1",
  counterpart: REPORT,
  meeting_date: "2999-01-10",
  open_action_item_count: 0,
  overdue_action_item_count: 0,
  ...over,
});

const detail = (over: Record<string, unknown> = {}) => ({
  id: "r1",
  counterpart: REPORT,
  meeting_date: "2999-01-10",
  i_am_manager: true,
  talking_points: [],
  action_items: [],
  carry_over: [],
  ...over,
});

const item = (over: Record<string, unknown> = {}) => ({
  id: "i1",
  description: "Draft the migration RFC",
  owner: { id: ME.id, full_name: ME.full_name },
  due_date: "2999-01-20",
  overdue: false,
  completed_at: null,
  completed_by: null,
  ...over,
});

// A typed mock of the 1:1 contract: GET /one-on-ones, GET /one-on-ones/{id},
// POST /one-on-ones/{id}/action-items, POST /action-items/{id}/complete,
// PUT /one-on-ones/{id}/private-note, GET /settings.
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
        <OneOnOnes />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

const bodyOf = (fn: ReturnType<typeof mockApi>, suffix: string) => {
  const call = fn.mock.calls.find(
    ([u, i]) => String(u).endsWith(suffix) && (i as RequestInit)?.method !== "GET",
  )!;
  return JSON.parse(String((call[1] as RequestInit).body));
};

async function open(user: ReturnType<typeof userEvent.setup>) {
  await user.click(await screen.findByRole("button", { name: /Tomás Reyes/ }));
  await screen.findByRole("heading", { name: /1:1 with Tomás Reyes/ });
}

afterEach(() => vi.unstubAllGlobals());

describe("1:1 action items", () => {
  it("[AC-100] adding an item posts to the API and it appears on the 1:1 and in the owner's open items", async () => {
    const added = item();
    let items: unknown[] = [];
    let open_items: unknown[] = [];
    const fn = mockApi({
      "GET /auth/me": { status: 200, body: ME },
      "GET /one-on-ones": () => ({
        status: 200,
        body: { one_on_ones: [summary()], open_action_items: open_items },
      }),
      "GET /one-on-ones/r1": () => ({ status: 200, body: detail({ action_items: items }) }),
      "POST /one-on-ones/r1/action-items": () => {
        items = [added];
        open_items = [added];
        return { status: 201, body: added };
      },
    });
    renderScreen();
    const user = userEvent.setup();
    await open(user);
    await user.type(screen.getByLabelText("Description"), "Draft the migration RFC");
    await user.selectOptions(screen.getByLabelText("Owner"), "e1");
    await user.type(screen.getByLabelText("Due date"), "2999-01-20");
    await user.click(screen.getByRole("button", { name: "Add action item" }));

    expect(bodyOf(fn, "/one-on-ones/r1/action-items")).toEqual({
      description: "Draft the migration RFC",
      owner_id: "e1",
      due_date: "2999-01-20",
    });
    const record = screen.getByRole("region", { name: "1:1 record" });
    expect(await within(record).findByText("Draft the migration RFC")).toBeInTheDocument();
    const mine = await screen.findByRole("region", { name: "Your open action items" });
    expect(within(mine).getByText("Draft the migration RFC")).toBeInTheDocument();
  });

  it("[AC-100] a 422 is shown against the field in plain English and nothing is listed", async () => {
    mockApi({
      "GET /auth/me": { status: 200, body: ME },
      "GET /one-on-ones": {
        status: 200,
        body: { one_on_ones: [summary()], open_action_items: [] },
      },
      "GET /one-on-ones/r1": { status: 200, body: detail() },
      "POST /one-on-ones/r1/action-items": {
        status: 422,
        body: {
          errors: {
            description: "Describe what needs to happen.",
            due_date: "Set a due date.",
          },
        },
      },
    });
    renderScreen();
    const user = userEvent.setup();
    await open(user);
    await user.click(screen.getByRole("button", { name: "Add action item" }));

    expect(await screen.findByText("Describe what needs to happen.")).toBeInTheDocument();
    expect(screen.getByText("Set a due date.")).toBeInTheDocument();
    expect(screen.getByLabelText("Description")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("No action items yet")).toBeInTheDocument();
  });

  it("[AC-101] marking complete posts to the API and the row shows the date and who completed it", async () => {
    let stored = item();
    const fn = mockApi({
      "GET /auth/me": { status: 200, body: ME },
      "GET /one-on-ones": {
        status: 200,
        body: { one_on_ones: [summary()], open_action_items: [] },
      },
      "GET /one-on-ones/r1": () => ({ status: 200, body: detail({ action_items: [stored] }) }),
      "POST /action-items/i1/complete": () => {
        stored = item({
          completed_at: "2026-10-30",
          completed_by: { id: "e2", full_name: "Tomás Reyes" },
        });
        return { status: 200, body: stored };
      },
    });
    renderScreen();
    const user = userEvent.setup();
    await open(user);
    await user.click(
      screen.getByRole("button", { name: "Mark complete: Draft the migration RFC" }),
    );

    expect(await screen.findByText(/Completed 30 Oct 2026 by Tomás Reyes/)).toBeInTheDocument();
    expect(
      fn.mock.calls.some(
        ([u, i]) =>
          String(u).endsWith("/action-items/i1/complete") && (i as RequestInit)?.method === "POST",
      ),
    ).toBe(true);
  });

  it("[AC-102] an item the API flags overdue is flagged for the viewer", async () => {
    const late = item({ id: "i2", due_date: "2026-01-02", overdue: true });
    mockApi({
      "GET /auth/me": { status: 200, body: ME },
      "GET /one-on-ones": {
        status: 200,
        body: { one_on_ones: [summary()], open_action_items: [late] },
      },
      "GET /one-on-ones/r1": { status: 200, body: detail({ action_items: [late] }) },
    });
    renderScreen();
    const user = userEvent.setup();
    await open(user);
    const record = screen.getByRole("region", { name: "1:1 record" });
    await waitFor(() => expect(record).toHaveTextContent("Overdue · was due 2 Jan"));
  });

  it("[AC-102] the other participant sees the same overdue flag on an item they do not own", async () => {
    const late = item({ owner: REPORT, due_date: "2026-01-02", overdue: true });
    mockApi({
      "GET /auth/me": { status: 200, body: ME },
      "GET /one-on-ones": {
        status: 200,
        body: { one_on_ones: [summary()], open_action_items: [] },
      },
      "GET /one-on-ones/r1": { status: 200, body: detail({ action_items: [late] }) },
    });
    renderScreen();
    const user = userEvent.setup();
    await open(user);
    const record = screen.getByRole("region", { name: "1:1 record" });
    await waitFor(() => expect(record).toHaveTextContent("Overdue · was due 2 Jan"));
    // Not theirs to complete, but still visibly flagged.
    expect(screen.queryByRole("button", { name: /Mark complete/ })).toBeNull();
  });

  it("[AC-103] a new 1:1 lists the still-open items carried over from previous 1:1s", async () => {
    const carried = item({
      id: "i9",
      description: "Book a shadow day with SRE",
      meeting_date: "2026-10-13",
    });
    mockApi({
      "GET /auth/me": { status: 200, body: ME },
      "GET /one-on-ones": {
        status: 200,
        body: { one_on_ones: [summary()], open_action_items: [] },
      },
      "GET /one-on-ones/r1": { status: 200, body: detail({ carry_over: [carried] }) },
    });
    renderScreen();
    const user = userEvent.setup();
    await open(user);
    const heading = await screen.findByRole("heading", {
      name: "Carried over from earlier 1:1s",
    });
    const section = heading.parentElement!;
    expect(within(section).getByText("Book a shadow day with SRE")).toBeInTheDocument();
    expect(section).toHaveTextContent("from the 13 Oct 1:1");
  });

  it("[AC-103] with nothing outstanding the carry-over section explains rather than erroring", async () => {
    mockApi({
      "GET /auth/me": { status: 200, body: ME },
      "GET /one-on-ones": {
        status: 200,
        body: { one_on_ones: [summary()], open_action_items: [] },
      },
      "GET /one-on-ones/r1": { status: 200, body: detail() },
    });
    renderScreen();
    const user = userEvent.setup();
    await open(user);
    expect(await screen.findByText(/Nothing is still open from your previous/)).toBeInTheDocument();
    expect(screen.queryByRole("alert")).toBeNull();
  });
});

describe("1:1 private note", () => {
  it("[AC-104] the manager's note saves through PUT /one-on-ones/{id}/private-note", async () => {
    const fn = mockApi({
      "GET /auth/me": { status: 200, body: ME },
      "GET /one-on-ones": {
        status: 200,
        body: { one_on_ones: [summary()], open_action_items: [] },
      },
      "GET /one-on-ones/r1": {
        status: 200,
        body: detail({ private_note: "", hr_can_read_private_notes: false }),
      },
      "PUT /one-on-ones/r1/private-note": { status: 200, body: detail({ private_note: "Ready" }) },
    });
    renderScreen();
    const user = userEvent.setup();
    await open(user);
    await user.type(screen.getByLabelText("Your observations"), "Ready for more scope");
    await user.click(screen.getByRole("button", { name: "Save private note" }));

    expect(await screen.findByText("Saved")).toBeInTheDocument();
    expect(bodyOf(fn, "/one-on-ones/r1/private-note")).toEqual({ body: "Ready for more scope" });
  });

  it("[AC-104] [NFR-019] a refusal from the API is shown in plain English against the field", async () => {
    mockApi({
      "GET /auth/me": { status: 200, body: ME },
      "GET /one-on-ones": {
        status: 200,
        body: { one_on_ones: [summary()], open_action_items: [] },
      },
      "GET /one-on-ones/r1": {
        status: 200,
        body: detail({ private_note: "", hr_can_read_private_notes: false }),
      },
      "PUT /one-on-ones/r1/private-note": {
        status: 422,
        body: { errors: { body: "This note is too long to save." } },
      },
    });
    renderScreen();
    const user = userEvent.setup();
    await open(user);
    await user.click(screen.getByRole("button", { name: "Save private note" }));
    expect(await screen.findByText("This note is too long to save.")).toBeInTheDocument();
    expect(screen.getByLabelText("Your observations")).toHaveAttribute("aria-invalid", "true");
  });

  it("[AC-106] the label says HR cannot read the note when the API setting is off", async () => {
    mockApi({
      "GET /auth/me": { status: 200, body: ME },
      "GET /one-on-ones": {
        status: 200,
        body: { one_on_ones: [summary()], open_action_items: [] },
      },
      "GET /one-on-ones/r1": {
        status: 200,
        body: detail({ hr_can_read_private_notes: false }),
      },
    });
    renderScreen();
    const user = userEvent.setup();
    await open(user);
    expect(await screen.findByText(/HR Admins cannot read private notes/)).toBeInTheDocument();
  });

  it("[AC-106] the same label says HR can read it when the API setting is on", async () => {
    mockApi({
      "GET /auth/me": { status: 200, body: ME },
      "GET /one-on-ones": {
        status: 200,
        body: { one_on_ones: [summary()], open_action_items: [] },
      },
      "GET /one-on-ones/r1": { status: 200, body: detail({ hr_can_read_private_notes: true }) },
    });
    renderScreen();
    const user = userEvent.setup();
    await open(user);
    expect(await screen.findByText(/HR Admins can read private notes/)).toBeInTheDocument();
    expect(screen.queryByText(/cannot read private notes/)).toBeNull();
  });

  it("[AC-106] falls back to GET /settings when the record does not carry the setting", async () => {
    const fn = mockApi({
      "GET /auth/me": { status: 200, body: ME },
      "GET /one-on-ones": {
        status: 200,
        body: { one_on_ones: [summary()], open_action_items: [] },
      },
      "GET /one-on-ones/r1": { status: 200, body: detail() },
      "GET /settings": { status: 200, body: { hr_private_notes_visible: true } },
    });
    renderScreen();
    const user = userEvent.setup();
    await open(user);
    expect(await screen.findByText(/HR Admins can read private notes/)).toBeInTheDocument();
    expect(fn.mock.calls.some(([u]) => String(u).endsWith("/settings"))).toBe(true);
  });

  it("[NFR-007] a direct report's view has no private-note field or placeholder anywhere", async () => {
    mockApi({
      "GET /auth/me": { status: 200, body: { ...ME, is_manager: false } },
      "GET /one-on-ones": {
        status: 200,
        body: { one_on_ones: [summary()], open_action_items: [] },
      },
      "GET /one-on-ones/r1": { status: 200, body: detail({ i_am_manager: false }) },
      "GET /settings": { status: 403, body: {} },
    });
    renderScreen();
    const user = userEvent.setup();
    await open(user);
    expect(screen.queryByLabelText("Your observations")).toBeNull();
    expect(screen.queryByText(/Private notes/i)).toBeNull();
    expect(screen.queryByText(/private note/i)).toBeNull();
    expect(screen.queryByRole("button", { name: /private/i })).toBeNull();
  });
});
