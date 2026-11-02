import { expect, test, type Page } from "@playwright/test";

// US-018 e2e: the employee's own self-review — opening the task, part-completing
// it, saving a draft, reloading to find the answers, being blocked on submit with
// the unanswered questions highlighted, then submitting and seeing the submitter's
// name and the timestamp. Plus the empty state for someone with no open task.
//
// Seeded dev accounts (backend/app/seed.py).
const PASSWORD = "Dev-Passw0rd!";
const HR = "hr.admin@example.com";
const EMPLOYEE = "employee@example.com";
const EXECUTIVE = "executive@example.com";

// A review period is shared backend state, so these run one after another.
test.describe.configure({ mode: "serial" });

const RATED_QUESTION = "How consistently did you deliver against your goals this period?";
const TEXT_QUESTION = "Which outcome are you most proud of, and why?";
const SCALE = [
  { value: 1, label: "Developing" },
  { value: 2, label: "Proficient" },
  { value: 3, label: "Exemplary" },
];

function iso(offsetDays: number) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

async function signIn(page: Page, email: string) {
  await page.goto("/sign-in");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("button", { name: "Sign out" })).toBeVisible();
}

async function signOut(page: Page) {
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/sign-in/);
}

async function api(page: Page, method: string, path: string, body?: unknown) {
  return page.evaluate(
    async ({ method, path, body }) => {
      const base = (window as unknown as { __API__?: string }).__API__ ?? "http://localhost:8000";
      const response = await fetch(`${base}${path}`, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json", "X-Requested-With": "e2e" },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      const text = await response.text();
      return { status: response.status, json: text ? JSON.parse(text) : null };
    },
    { method, path, body },
  );
}

async function openReviews(page: Page) {
  await page.getByRole("link", { name: "Reviews" }).click();
  await expect(page).toHaveURL(/\/reviews$/);
  await expect(page.getByRole("heading", { name: "Reviews" })).toBeVisible();
}

/**
 * HR publishes a questionnaire with a rated+comment question and an optional
 * one, then opens a period that includes Emi Employee. Returns the period name.
 */
async function hrOpensAPeriodFor(page: Page, emails: string[]) {
  const stamp = Date.now();
  const periodName = `QA Self-review period ${stamp}`;

  const scale = await api(page, "POST", "/rating-scales", {
    name: `QA scale ${stamp}`,
    points: SCALE,
  });
  expect(scale.status).toBe(201);

  const template = await api(page, "POST", "/questionnaires", {
    name: `QA questionnaire ${stamp}`,
    rating_scale_id: scale.json.id,
    competencies: [
      {
        name: "Delivery",
        questions: [
          { text: RATED_QUESTION, type: "both", mandatory: true },
          { text: TEXT_QUESTION, type: "text", mandatory: false },
        ],
      },
    ],
  });
  expect(template.status).toBe(201);
  expect((await api(page, "POST", `/questionnaires/${template.json.id}/publish`)).status).toBe(200);
  const detail = await api(page, "GET", `/questionnaires/${template.json.id}`);
  expect(detail.status).toBe(200);

  const people = (await api(page, "GET", "/employees")).json as {
    id: string;
    work_email: string;
  }[];
  const ids = emails.map((email) => people.find((p) => p.work_email === email)!.id);

  const period = await api(page, "POST", "/review-periods", {
    name: periodName,
    questionnaire_version_id: detail.json.version_id,
    start_date: iso(-1),
    end_date: iso(30),
    submission_deadline: iso(20),
    participant_ids: ids,
  });
  expect(period.status).toBe(201);
  expect((await api(page, "POST", `/review-periods/${period.json.id}/open`)).status).toBe(200);
  return { periodName, periodId: period.json.id as string };
}

/** The task is created by a queued job (NFR-014), so wait for it to appear. */
async function waitForMyTask(page: Page, periodId: string) {
  await expect
    .poll(
      async () => {
        const dashboard = await api(page, "GET", "/me/dashboard");
        const reviews = (dashboard.json?.reviews ?? []) as { period_id?: string }[];
        return reviews.filter((r) => r.period_id === periodId).length;
      },
      { timeout: 30_000, message: "the self-review task was never created for the participant" },
    )
    .toBe(1);
}

test("[AC-067] [AC-068] [AC-069] [AC-070] an employee completes, drafts and submits a self-review", async ({
  page,
}) => {
  await signIn(page, HR);
  const { periodName, periodId } = await hrOpensAPeriodFor(page, [EMPLOYEE]);
  await signOut(page);

  await signIn(page, EMPLOYEE);
  await waitForMyTask(page, periodId);

  // AC-067: the task opens with the published questions and the scale's labels.
  await openReviews(page);
  await expect(page.getByRole("heading", { name: periodName })).toBeVisible();
  await expect(page.getByText(RATED_QUESTION)).toBeVisible();
  await expect(page.getByText(TEXT_QUESTION)).toBeVisible();
  const ratings = page.getByRole("radiogroup", { name: `Rating for: ${RATED_QUESTION}` });
  for (const point of SCALE) {
    await expect(
      ratings.getByRole("radio", { name: `${point.value} · ${point.label}` }),
    ).toBeVisible();
  }

  // AC-068: part-complete it — the optional comment only — and save the draft.
  const optionalComment = page.getByLabel(`Comment for: ${TEXT_QUESTION}`);
  await optionalComment.fill("Shipping the onboarding guide on time.");
  await page.getByRole("button", { name: "Save as draft" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Draft saved" })).toBeVisible();

  // AC-068: a reload shows exactly what was saved.
  await page.reload();
  await expect(page.getByRole("heading", { name: periodName })).toBeVisible();
  await expect(page.getByLabel(`Comment for: ${TEXT_QUESTION}`)).toHaveValue(
    "Shipping the onboarding guide on time.",
  );

  // AC-069: submitting with the mandatory question unanswered is blocked and
  // the question itself is highlighted in plain English (NFR-019).
  await page.getByRole("button", { name: "Submit self-review" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Submission blocked" })).toBeVisible();
  await expect(
    page
      .getByRole("alert")
      .filter({ hasText: /before submitting/ })
      .first(),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Submit your self-review?" })).toHaveCount(0);

  // Answer the required question, then submit for real.
  await ratings.getByRole("radio", { name: "3 · Exemplary" }).click();
  await page.getByLabel(`Comment for: ${RATED_QUESTION}`).fill("I met every milestone I agreed.");
  await page.getByRole("button", { name: "Submit self-review" }).click();
  await expect(page.getByRole("heading", { name: "Submit your self-review?" })).toBeVisible();
  await page.getByRole("button", { name: "Confirm and submit" }).click();

  // AC-070: the submitted review names who submitted it and when, and is read-only.
  const confirmation = page.getByRole("status").filter({ hasText: "Submitted by Emi Employee" });
  await expect(confirmation).toBeVisible();
  await expect(confirmation).toContainText(String(new Date().getFullYear()));
  await expect(confirmation).toContainText("read-only");
  await expect(page.getByRole("heading", { name: "Your submitted answers" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Submit self-review" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Save as draft" })).toHaveCount(0);
  await expect(page.getByLabel(`Comment for: ${RATED_QUESTION}`)).toHaveCount(0);
  await expect(page.getByText("I met every milestone I agreed.")).toBeVisible();
  await expect(page.getByText("3 · Exemplary")).toBeVisible();

  // AC-070: the lock is the server's, not the screen's.
  const tasks = (await api(page, "GET", "/me/dashboard")).json.reviews as {
    id: string;
    period_id?: string;
  }[];
  const mine = tasks.find((t) => t.period_id === periodId)!;
  const refused = await api(page, "PUT", `/self-reviews/${mine.id}/answers`, { answers: {} });
  expect([403, 409, 422]).toContain(refused.status);
  await signOut(page);
});

test("[AC-069] [NFR-019] a participant with no open task sees the empty state, not an error", async ({
  page,
}) => {
  await signIn(page, EXECUTIVE);
  await openReviews(page);

  await expect(page.getByText("No self-review is open for you")).toBeVisible();
  await expect(
    page.getByText(/your self-review task will appear here and on your dashboard/i),
  ).toBeVisible();
  await expect(page.getByRole("alert")).toHaveCount(0);
  await expect(page.getByText(/could not be loaded/i)).toHaveCount(0);
  await signOut(page);
});
