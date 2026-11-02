import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import Reviews from "./Reviews";

type Reply = { status: number; body?: unknown };
type Handler = (init?: RequestInit) => Reply;

const ME = { id: "e1", full_name: "Amara Okafor", role: "Employee", is_manager: false };

const SCALE = {
  id: "s1",
  name: "Five-point proficiency",
  points: [
    { value: 1, label: "Developing" },
    { value: 2, label: "Emerging" },
    { value: 3, label: "Proficient" },
    { value: 4, label: "Strong" },
    { value: 5, label: "Exemplary" },
  ],
};

// The questionnaire exactly as GET /self-reviews/{id} returns it.
const QUESTIONNAIRE = {
  name: "Annual competency review 2026",
  scale: SCALE,
  competencies: [
    {
      id: "c1",
      name: "Delivery",
      questions: [
        {
          id: "q1",
          text: "How consistently did you deliver against your goals?",
          type: "both",
          mandatory: true,
          requires: { rating: true, comment: true },
          scale: SCALE,
        },
        {
          id: "q2",
          text: "Which outcome are you most proud of?",
          type: "text",
          mandatory: false,
          requires: { rating: false, comment: true },
          scale: null,
        },
      ],
    },
    {
      id: "c2",
      name: "Collaboration",
      questions: [
        {
          id: "q3",
          text: "How well did you unblock others?",
          type: "rated",
          mandatory: true,
          requires: { rating: true, comment: false },
          scale: SCALE,
        },
      ],
    },
  ],
};

const task = (over: Record<string, unknown> = {}) => ({
  id: "sr1",
  period_id: "p1",
  period_name: "H2 2026 Self-Review",
  status: "draft",
  submitted_at: null,
  submission_deadline: "2026-11-13",
  overdue: false,
  ...over,
});

const selfReview = (over: Record<string, unknown> = {}) => ({
  id: "sr1",
  status: "draft",
  overdue: false,
  submitted_at: null,
  period_name: "H2 2026 Self-Review",
  period_status: "open",
  submission_deadline: "2026-11-13",
  questionnaire: QUESTIONNAIRE,
  answers: [],
  ...over,
});

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
  "GET /auth/me": { status: 200, body: ME } as Reply,
  "GET /me/dashboard": { status: 200, body: { reviews: [task()] } } as Reply,
  "GET /self-reviews/sr1": { status: 200, body: selfReview() } as Reply,
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

const bodyOf = (fn: ReturnType<typeof mockApi>, suffix: string, method: string) => {
  const call = fn.mock.calls.find(
    ([u, i]) => String(u).endsWith(suffix) && (i as RequestInit)?.method === method,
  )!;
  return JSON.parse(String((call[1] as RequestInit).body));
};

afterEach(() => vi.unstubAllGlobals());

describe("Employee self-review", () => {
  it("[AC-067] renders every competency, question, scale label and free-text box from the API", async () => {
    mockApi(base());
    renderScreen();
    expect(await screen.findByText("Delivery")).toBeInTheDocument();
    expect(screen.getByText("Collaboration")).toBeInTheDocument();
    expect(
      screen.getByText("How consistently did you deliver against your goals?"),
    ).toBeInTheDocument();
    expect(screen.getByText("Which outcome are you most proud of?")).toBeInTheDocument();
    expect(screen.getByText("Annual competency review 2026")).toBeInTheDocument();

    const group = screen.getByRole("radiogroup", {
      name: "Rating for: How consistently did you deliver against your goals?",
    });
    expect(within(group).getAllByRole("radio")).toHaveLength(5);
    expect(within(group).getByRole("radio", { name: "3 · Proficient" })).toBeInTheDocument();
    // A rated-only question has no comment box; a text one has no ratings.
    expect(
      screen.getByLabelText("Comment for: How consistently did you deliver against your goals?"),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("Comment for: How well did you unblock others?")).toBeNull();

    // Nothing from the old prototype seed survives on the employee path.
    expect(screen.queryByText(/Which outcome are you most proud of, and why\?/)).toBeNull();
    expect(screen.queryByText(/Craft and growth/)).toBeNull();
  });

  it("[AC-068] Save as draft calls PUT /self-reviews/{id}/answers with the ratings and comments", async () => {
    const fn = mockApi(base({ "PUT /self-reviews/sr1/answers": { status: 200, body: {} } }));
    renderScreen();
    const user = userEvent.setup();
    const group = await screen.findByRole("radiogroup", {
      name: "Rating for: How consistently did you deliver against your goals?",
    });
    await user.click(within(group).getByRole("radio", { name: "4 · Strong" }));
    await user.type(
      screen.getByLabelText("Comment for: How consistently did you deliver against your goals?"),
      "Shipped early.",
    );
    await user.click(screen.getByRole("button", { name: "Save as draft" }));

    expect(await screen.findByText(/Draft saved/)).toBeInTheDocument();
    expect(bodyOf(fn, "/self-reviews/sr1/answers", "PUT").answers).toEqual(
      expect.arrayContaining([
        { question_id: "q1", rating: 4, comment: "Shipped early." },
        { question_id: "q3", rating: null, comment: "" },
      ]),
    );
  });

  it("[AC-068] a reload restores the ratings and comments the API has stored", async () => {
    mockApi(
      base({
        "GET /self-reviews/sr1": {
          status: 200,
          body: selfReview({
            answers: [
              { question_id: "q1", rating: 4, comment: "Shipped early." },
              { question_id: "q3", rating: 2, comment: null },
            ],
          }),
        },
      }),
    );
    renderScreen();
    const group = await screen.findByRole("radiogroup", {
      name: "Rating for: How consistently did you deliver against your goals?",
    });
    expect(within(group).getByRole("radio", { name: "4 · Strong" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(
      screen.getByLabelText("Comment for: How consistently did you deliver against your goals?"),
    ).toHaveValue("Shipped early.");
    const rated = screen.getByRole("radiogroup", {
      name: "Rating for: How well did you unblock others?",
    });
    expect(within(rated).getByRole("radio", { name: "2 · Emerging" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  it("[AC-069] submitting with mandatory questions unanswered is blocked and explained in place", async () => {
    const fn = mockApi(base({ "PUT /self-reviews/sr1/answers": { status: 200, body: {} } }));
    renderScreen();
    const user = userEvent.setup();
    await screen.findByText("Delivery");
    await user.click(screen.getByRole("button", { name: "Submit self-review" }));

    expect(
      await screen.findByText(/2 required questions are still unanswered/),
    ).toBeInTheDocument();
    expect(screen.getByText("Choose a rating and write a comment before submitting.")).toBeVisible();
    expect(screen.getByText("Choose a rating before submitting.")).toBeVisible();
    // Nothing was submitted and no confirmation was offered.
    expect(fn.mock.calls.some(([u]) => String(u).endsWith("/submit"))).toBe(false);
    expect(screen.queryByRole("button", { name: "Confirm and submit" })).toBeNull();
  });

  it("[AC-069] the API's 422 per-field messages are shown against each question", async () => {
    mockApi(
      base({
        "GET /self-reviews/sr1": {
          status: 200,
          body: selfReview({
            answers: [
              { question_id: "q1", rating: 4, comment: "Shipped early." },
              { question_id: "q3", rating: 3, comment: "" },
            ],
          }),
        },
        "PUT /self-reviews/sr1/answers": { status: 200, body: {} },
        "POST /self-reviews/sr1/submit": {
          status: 422,
          body: {
            message: "This review cannot be submitted yet.",
            unanswered: [{ question_id: "q3", message: "Give a rating for this competency." }],
          },
        },
      }),
    );
    renderScreen();
    const user = userEvent.setup();
    await screen.findByText("Delivery");
    await user.click(screen.getByRole("button", { name: "Submit self-review" }));
    await user.click(await screen.findByRole("button", { name: "Confirm and submit" }));

    expect(await screen.findByText("Give a rating for this competency.")).toBeInTheDocument();
    expect(screen.getByText("This review cannot be submitted yet.")).toBeInTheDocument();
  });

  it("[AC-070] confirming Submit posts to /submit and the review becomes read-only with name and time", async () => {
    let current = selfReview({
      answers: [
        { question_id: "q1", rating: 4, comment: "Shipped early." },
        { question_id: "q3", rating: 3, comment: "" },
      ],
    });
    const submitted = {
      ...current,
      status: "submitted",
      submitted_at: "2026-10-29T14:20:00Z",
      submitted_by: { id: "e1", full_name: "Amara Okafor" },
    };
    const fn = mockApi(
      base({
        "GET /self-reviews/sr1": () => ({ status: 200, body: current }),
        "GET /me/dashboard": () => ({
          status: 200,
          body: { reviews: [task({ status: current.status })] },
        }),
        "PUT /self-reviews/sr1/answers": { status: 200, body: {} },
        "POST /self-reviews/sr1/submit": () => {
          current = submitted;
          return { status: 200, body: submitted };
        },
      }),
    );
    renderScreen();
    const user = userEvent.setup();
    await screen.findByText("Delivery");
    await user.click(screen.getByRole("button", { name: "Submit self-review" }));
    await user.click(await screen.findByRole("button", { name: "Confirm and submit" }));

    expect(await screen.findByText(/Submitted by Amara Okafor on/)).toBeInTheDocument();
    expect(fn.mock.calls.some(([u]) => String(u).endsWith("/self-reviews/sr1/submit"))).toBe(true);
    await waitFor(() =>
      expect(screen.queryByRole("button", { name: "Submit self-review" })).toBeNull(),
    );
    expect(screen.queryByRole("radiogroup")).toBeNull();
    expect(
      screen.queryByLabelText("Comment for: How consistently did you deliver against your goals?"),
    ).toBeNull();
    expect(screen.getByText(/4 · Strong/)).toBeInTheDocument();
  });

  it("[AC-071] an overdue task is flagged and submission is still offered", async () => {
    mockApi(
      base({
        "GET /me/dashboard": { status: 200, body: { reviews: [task({ overdue: true })] } },
        "GET /self-reviews/sr1": { status: 200, body: selfReview({ overdue: true }) },
      }),
    );
    renderScreen();
    expect(await screen.findByText(/This task is overdue/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Submit self-review" })).toBeInTheDocument();
  });

  it("[AC-071] a closed period explains why submission is no longer offered", async () => {
    mockApi(
      base({
        "GET /self-reviews/sr1": {
          status: 200,
          body: selfReview({ overdue: true, period_status: "closed" }),
        },
      }),
    );
    renderScreen();
    expect(await screen.findByText(/This review period is closed/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Submit self-review" })).toBeNull();
  });

  it("[NFR-019] a participant with no open self-review sees an explanation, not an error", async () => {
    mockApi(base({ "GET /me/dashboard": { status: 200, body: { reviews: [] } } }));
    renderScreen();
    expect(await screen.findByText("No self-review is open for you")).toBeInTheDocument();
    expect(screen.getByText(/your self-review task will appear here/i)).toBeInTheDocument();
    expect(screen.queryByRole("alert")).toBeNull();
  });
});
