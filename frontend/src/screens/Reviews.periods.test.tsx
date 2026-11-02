import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import Reviews from "./Reviews";

type Reply = { status: number; body?: unknown };
type Handler = (init?: RequestInit) => Reply;

const PEOPLE = [
  {
    id: "e1",
    full_name: "Amara Okafor",
    department: { id: "d1", name: "Design" },
    status: "Active",
  },
  {
    id: "e2",
    full_name: "Priya Nair",
    department: { id: "d2", name: "Engineering" },
    status: "Active",
  },
  { id: "e3", full_name: "Lea Gone", department: null, status: "Deactivated" },
];

const QUESTIONNAIRES = [
  { id: "t1", name: "Annual competency review 2026", status: "published" },
  { id: "t2", name: "Draft framework", status: "draft" },
];

const draftPeriod = (over: Record<string, unknown> = {}) => ({
  id: "p1",
  name: "H1 2027 Self-Review",
  template_id: "t1",
  start_date: "2027-01-01",
  end_date: "2027-06-30",
  submission_deadline: "2027-07-10",
  status: "draft",
  participant_ids: ["e1", "e2"],
  ...over,
});

// A typed mock of the review-period contract.
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

const base = (extra: Record<string, Reply | Handler> = {}) => ({
  "GET /employees": { status: 200, body: PEOPLE } as Reply,
  "GET /questionnaires": { status: 200, body: QUESTIONNAIRES } as Reply,
  "GET /review-periods": { status: 200, body: [] } as Reply,
  ...extra,
});

function renderScreen() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <Reviews />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

async function openHrTab() {
  const user = userEvent.setup();
  await user.click(screen.getByRole("tab", { name: "HR Admin" }));
  return user;
}

const bodyOf = (fn: ReturnType<typeof mockApi>, path: string, method: string) => {
  const call = fn.mock.calls.find(
    ([u, i]) => new URL(String(u)).pathname === path && (i as RequestInit)?.method === method,
  )!;
  return JSON.parse(String((call[1] as RequestInit).body));
};

const called = (fn: ReturnType<typeof mockApi>, path: string, method: string) =>
  fn.mock.calls.some(
    ([u, i]) =>
      new URL(String(u)).pathname === path && ((i as RequestInit)?.method ?? "GET") === method,
  );

afterEach(() => vi.unstubAllGlobals());

describe("Review periods", () => {
  it("[AC-063] creating and opening posts the period then POST /review-periods/{id}/open", async () => {
    let periods: unknown[] = [];
    const fn = mockApi(
      base({
        "GET /review-periods": () => ({ status: 200, body: periods }),
        "POST /review-periods": () => {
          periods = [draftPeriod()];
          return { status: 201, body: draftPeriod() };
        },
        "POST /review-periods/p1/open": () => {
          periods = [draftPeriod({ status: "open" })];
          return { status: 202, body: draftPeriod({ status: "open" }) };
        },
        "GET /review-periods/p1/status": {
          status: 200,
          body: [
            { employee: { id: "e1", full_name: "Amara Okafor" }, status: "not_started" },
            { employee: { id: "e2", full_name: "Priya Nair" }, status: "not_started" },
          ],
        },
      }),
    );
    renderScreen();
    const user = await openHrTab();

    await user.type(screen.getByLabelText("Period name"), "H1 2027 Self-Review");
    await user.selectOptions(screen.getByLabelText("Questionnaire"), "t1");
    await user.type(screen.getByLabelText("Start date"), "2027-01-01");
    await user.type(screen.getByLabelText("End date"), "2027-06-30");
    await user.type(screen.getByLabelText("Submission deadline"), "2027-07-10");
    await user.click(await screen.findByRole("checkbox", { name: /Amara Okafor/ }));
    await user.click(screen.getByRole("checkbox", { name: /Priya Nair/ }));
    await user.click(screen.getByRole("button", { name: "Save and open period" }));

    await waitFor(() => expect(called(fn, "/review-periods/p1/open", "POST")).toBe(true));
    expect(bodyOf(fn, "/review-periods", "POST")).toEqual({
      name: "H1 2027 Self-Review",
      template_id: "t1",
      start_date: "2027-01-01",
      end_date: "2027-06-30",
      submission_deadline: "2027-07-10",
      participant_ids: ["e1", "e2"],
    });
    // Tasks are queued: the screen says so rather than waiting for them.
    expect(await screen.findByText(/being created .* in the background/)).toBeInTheDocument();
  });

  it("[AC-064] editing a draft saves through PATCH and says no tasks exist until it is opened", async () => {
    const fn = mockApi(
      base({
        "GET /review-periods": { status: 200, body: [draftPeriod()] },
        "PATCH /review-periods/p1": {
          status: 200,
          body: draftPeriod({ submission_deadline: "2027-07-20" }),
        },
      }),
    );
    renderScreen();
    const user = await openHrTab();

    await user.click(await screen.findByRole("button", { name: /Edit/ }));
    expect(await screen.findByText(/No self-review tasks exist until you open it/)).toBeTruthy();
    const deadline = screen.getByLabelText("Submission deadline");
    await user.clear(deadline);
    await user.type(deadline, "2027-07-20");
    await user.click(screen.getByRole("checkbox", { name: /Priya Nair/ }));
    await user.click(screen.getByRole("button", { name: "Save as draft" }));

    await waitFor(() => expect(called(fn, "/review-periods/p1", "PATCH")).toBe(true));
    expect(bodyOf(fn, "/review-periods/p1", "PATCH")).toMatchObject({
      submission_deadline: "2027-07-20",
      participant_ids: ["e1"],
    });
    expect(
      await screen.findByText(/No self-review tasks exist until you open it/),
    ).toBeInTheDocument();
    expect(called(fn, "/review-periods/p1/open", "POST")).toBe(false);
  });

  it("[NFR-019] shows the API's per-field messages against the fields on a 422", async () => {
    mockApi(
      base({
        "POST /review-periods": {
          status: 422,
          body: {
            errors: {
              name: "Give the review period a name.",
              submission_deadline: "The deadline must fall inside the period.",
            },
          },
        },
      }),
    );
    renderScreen();
    const user = await openHrTab();
    await user.click(screen.getByRole("button", { name: "Save as draft" }));

    expect(await screen.findByText("Give the review period a name.")).toBeInTheDocument();
    expect(screen.getByText("The deadline must fall inside the period.")).toBeInTheDocument();
  });

  it("[AC-065] a submitted participant cannot be removed: the API's refusal shows and they stay", async () => {
    const rows = [
      {
        employee: { id: "e1", full_name: "Amara Okafor" },
        status: "submitted",
        submitted_at: "2027-07-02T09:00:00+00:00",
      },
      { employee: { id: "e2", full_name: "Priya Nair" }, status: "not_started" },
    ];
    mockApi(
      base({
        "GET /review-periods": { status: 200, body: [draftPeriod({ status: "open" })] },
        "GET /review-periods/p1/status": { status: 200, body: rows },
        "DELETE /review-periods/p1/participants/e1": {
          status: 409,
          body: {
            message:
              "Amara Okafor has submitted a review, which must be preserved, so they cannot be removed from this period.",
          },
        },
      }),
    );
    renderScreen();
    const user = await openHrTab();
    await user.click(await screen.findByRole("button", { name: "Track" }));

    const tracker = (await screen.findByText(/Submission tracker/)).closest("section")!;
    await user.click(within(tracker).getAllByRole("button", { name: /Remove/ })[0]);

    expect(await screen.findByText(/must be preserved/)).toBeInTheDocument();
    expect(within(tracker).getByText("Amara Okafor")).toBeInTheDocument();
  });

  it("[AC-066] the tracker reads the status endpoint and marks outstanding people overdue", async () => {
    const fn = mockApi(
      base({
        "GET /review-periods": {
          status: 200,
          body: [draftPeriod({ status: "open", submission_deadline: "2020-01-01" })],
        },
        "GET /review-periods/p1/status": {
          status: 200,
          body: [
            {
              employee: { id: "e1", full_name: "Amara Okafor" },
              status: "submitted",
              submitted_at: "2019-12-20T09:00:00+00:00",
            },
            { employee: { id: "e2", full_name: "Priya Nair" }, status: "draft" },
          ],
        },
      }),
    );
    renderScreen();
    const user = await openHrTab();
    await user.click(await screen.findByRole("button", { name: "Track" }));

    const tracker = (await screen.findByText(/Submission tracker/)).closest("section")!;
    expect(called(fn, "/review-periods/p1/status", "GET")).toBe(true);
    expect(within(tracker).getByText("Submitted 20 Dec 2019")).toBeInTheDocument();
    expect(within(tracker).getByText("Overdue · outstanding")).toBeInTheDocument();
    expect(within(tracker).getByText(/The submission deadline has passed/)).toBeInTheDocument();
  });

  it("[AC-066] outstanding people are not marked overdue before the deadline", async () => {
    mockApi(
      base({
        "GET /review-periods": {
          status: 200,
          body: [draftPeriod({ status: "open", submission_deadline: "2099-01-01" })],
        },
        "GET /review-periods/p1/status": {
          status: 200,
          body: [{ employee: { id: "e2", full_name: "Priya Nair" }, status: "not_started" }],
        },
      }),
    );
    renderScreen();
    const user = await openHrTab();
    await user.click(await screen.findByRole("button", { name: "Track" }));

    const tracker = (await screen.findByText(/Submission tracker/)).closest("section")!;
    expect(within(tracker).getByText("Outstanding", { selector: "span" })).toBeInTheDocument();
    expect(within(tracker).queryByText(/Overdue/)).toBeNull();
  });

  it("[AC-063] the picker and the period list come from the API, not from seeded constants", async () => {
    mockApi(base());
    renderScreen();
    await openHrTab();

    expect(await screen.findByRole("checkbox", { name: /Amara Okafor/ })).toBeInTheDocument();
    // Seeded prototype names and periods are gone; leavers are never offered.
    expect(screen.queryByRole("checkbox", { name: /Tomas Lindqvist/ })).toBeNull();
    expect(screen.queryByRole("checkbox", { name: /Lea Gone/ })).toBeNull();
    expect(screen.queryByText("H2 2026 Self-Review")).toBeNull();
    expect(screen.getByText(/No review periods yet/)).toBeInTheDocument();
    // Only published questionnaires may be chosen.
    expect(
      screen.getByRole("option", { name: "Annual competency review 2026" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Draft framework" })).toBeNull();
  });
});
