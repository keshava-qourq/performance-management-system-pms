import { expect, test, type Page } from "@playwright/test";

// US-011 e2e: the goal lifecycle on the goals screen — creating a goal, the
// missing-field messages, recording progress, the over-100% weighting warning
// and the overdue flag.
//
// Seeded dev account (backend/app/seed.py).
const PASSWORD = "Dev-Passw0rd!";
const EMPLOYEE = "employee@example.com";

// Goals persist for the signed-in employee, so these run one after another and
// each uses its own stamped titles.
test.describe.configure({ mode: "serial" });

function iso(offsetDays: number) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

async function signIn(page: Page, email = EMPLOYEE) {
  await page.goto("/sign-in");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("button", { name: "Sign out" })).toBeVisible();
}

async function openGoals(page: Page) {
  await page.getByRole("link", { name: "Goals" }).click();
  await expect(page).toHaveURL(/\/goals$/);
  await expect(page.getByRole("heading", { name: "My goals" })).toBeVisible();
}

async function startNewGoal(page: Page) {
  await page.getByRole("button", { name: "New goal" }).first().click();
  await expect(page.getByRole("form", { name: "New goal" })).toBeVisible();
}

async function createGoal(
  page: Page,
  values: { title: string; target: string; due: string; weighting: string },
) {
  await startNewGoal(page);
  await page.getByLabel("Title", { exact: true }).fill(values.title);
  await page.getByLabel("Measurable target").fill(values.target);
  await page.getByLabel("Due date").fill(values.due);
  await page.getByLabel(/Weighting/).fill(values.weighting);
  await page.getByRole("button", { name: "Save goal" }).click();
  await expect(page.getByRole("status").filter({ hasText: values.title })).toBeVisible();
}

test("[AC-038] an employee writes a goal and it appears at 0% progress", async ({ page }) => {
  const stamp = Date.now();
  const title = `QA Goal ${stamp}`;

  await signIn(page);
  await openGoals(page);
  await createGoal(page, {
    title,
    target: "Publish the onboarding guide",
    due: iso(30),
    weighting: "25",
  });

  // AC-038: listed, owned by the author, starting at 0%.
  const row = page.getByRole("listitem").filter({ hasText: title });
  await expect(row).toBeVisible();
  await expect(row).toContainText("0");
  await expect(row).toContainText("Not started");
  await row.getByRole("button").first().click();
  await expect(page.getByRole("heading", { name: title })).toBeVisible();
  await expect(page.getByText("Emi Employee")).toBeVisible();
});

test("[AC-039] [NFR-019] saving a goal with nothing filled in names every missing field", async ({
  page,
}) => {
  await signIn(page);
  await openGoals(page);
  await startNewGoal(page);
  await page.getByRole("button", { name: "Save goal" }).click();

  // Each mandatory field is highlighted with its own message in plain English.
  await expect(page.getByLabel("Title", { exact: true })).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByLabel("Measurable target")).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByLabel("Due date")).toHaveAttribute("aria-invalid", "true");
  await expect(page.locator("#title-e")).toContainText(/title/i);
  await expect(page.locator("#target-e")).toContainText(/target/i);
  await expect(page.locator("#due_date-e")).toContainText(/date/i);

  // AC-040: a weighting outside 0–100 is refused on the field, and blocks the save.
  await page.getByLabel("Title", { exact: true }).fill("QA Rejected goal");
  await page.getByLabel("Measurable target").fill("Something measurable");
  await page.getByLabel("Due date").fill(iso(20));
  await page.getByLabel(/Weighting/).fill("140");
  await page.getByRole("button", { name: "Save goal" }).click();
  await expect(page.locator("#weighting-e")).toContainText(/0/);
  await expect(page.locator("#weighting-e")).toContainText(/100/);
  await expect(page.getByRole("listitem").filter({ hasText: "QA Rejected goal" })).toHaveCount(0);
});

test("[AC-043] [AC-045] the owner records progress and a status against their goal", async ({
  page,
}) => {
  const stamp = Date.now();
  const title = `QA Progress ${stamp}`;

  await signIn(page);
  await openGoals(page);
  await createGoal(page, {
    title,
    target: "Three releases shipped",
    due: iso(45),
    weighting: "10",
  });

  await page.getByRole("listitem").filter({ hasText: title }).getByRole("button").first().click();
  await page.getByLabel("Progress (%)").fill("60");
  await page.getByLabel("Status", { exact: true }).selectOption("On track");
  await page.getByRole("button", { name: "Save progress" }).click();

  await expect(page.getByRole("status").filter({ hasText: "60%" })).toBeVisible();
  await expect(page.getByRole("listitem").filter({ hasText: title })).toContainText("On track");

  // AC-044: a percentage outside 0–100 is refused and the stored value stands.
  await page.getByLabel("Progress (%)").fill("150");
  await page.getByRole("button", { name: "Save progress" }).click();
  await expect(page.locator("#p-val-e")).toContainText(/100/);
  await page.reload();
  await page.getByRole("listitem").filter({ hasText: title }).getByRole("button").first().click();
  await expect(page.getByLabel("Progress (%)")).toHaveValue("60");
});

test("[AC-041] [NFR-019] weightings over 100% for a period warn without blocking the save", async ({
  page,
}) => {
  const stamp = Date.now();

  await signIn(page);
  await openGoals(page);
  await createGoal(page, {
    title: `QA Heavy A ${stamp}`,
    target: "First half of the plan",
    due: iso(40),
    weighting: "60",
  });
  await createGoal(page, {
    title: `QA Heavy B ${stamp}`,
    target: "Second half of the plan",
    due: iso(41),
    weighting: "55",
  });

  // Both goals saved, and the screen warns about the total rather than refusing it.
  await expect(page.getByRole("listitem").filter({ hasText: `QA Heavy A ${stamp}` })).toBeVisible();
  await expect(page.getByRole("listitem").filter({ hasText: `QA Heavy B ${stamp}` })).toBeVisible();
  await expect(page.getByText(/over 100%/i)).toBeVisible();
  await expect(page.getByText(/You can still save them/i)).toBeVisible();
  await expect(page.getByText(/Total weighting/)).toBeVisible();
});

test("[AC-046] a goal past its due date is flagged overdue until it is closed", async ({
  page,
}) => {
  const stamp = Date.now();
  const title = `QA Overdue ${stamp}`;

  await signIn(page);
  await openGoals(page);
  await createGoal(page, {
    title,
    target: "Was due last week",
    due: iso(-7),
    weighting: "5",
  });

  const row = page.getByRole("listitem").filter({ hasText: title });
  await expect(row).toContainText("Overdue");

  // Marking it Achieved clears the flag (AC-046).
  await row.getByRole("button").first().click();
  await page.getByLabel("Status", { exact: true }).selectOption("Achieved");
  await page.getByRole("button", { name: "Save progress" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Achieved" })).toBeVisible();
  await expect(row).not.toContainText("Overdue");
});

test("[AC-047] a non-owner, non-HR user is refused by the server with an empty body", async ({
  page,
}) => {
  const stamp = Date.now();
  const title = `QA Guarded ${stamp}`;

  await signIn(page);
  await openGoals(page);
  await createGoal(page, {
    title,
    target: "Owned by Emi only",
    due: iso(25),
    weighting: "5",
  });

  // The owner notes the goal's id, then hands the browser to someone else.
  const goalId = await page.evaluate(async (goalTitle) => {
    const base = (window as unknown as { __API__?: string }).__API__ ?? "http://localhost:8000";
    const list = await (await fetch(`${base}/goals`, { credentials: "include" })).json();
    return (list.goals as Array<{ id: string; title: string }>).find((g) => g.title === goalTitle)!
      .id;
  }, title);
  await page.getByRole("button", { name: "Sign out" }).click();

  await signIn(page, "manager@example.com");
  const result = await page.evaluate(async (id) => {
    const base = (window as unknown as { __API__?: string }).__API__ ?? "http://localhost:8000";
    const headers = { "Content-Type": "application/json", "X-Requested-With": "pms" };
    const patch = await fetch(`${base}/goals/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers,
      body: JSON.stringify({ title: "Hijacked" }),
    });
    const progress = await fetch(`${base}/goals/${id}/progress`, {
      method: "POST",
      credentials: "include",
      headers,
      body: JSON.stringify({ progress: 99 }),
    });
    return {
      patch: patch.status,
      patchBody: await patch.text(),
      progress: progress.status,
      progressBody: await progress.text(),
    };
  }, goalId);

  expect(result.patch).toBe(403);
  expect(result.patchBody).toBe("");
  expect(result.progress).toBe(403);
  expect(result.progressBody).toBe("");

  // Nothing changed for the owner.
  await page.getByRole("button", { name: "Sign out" }).click();
  await signIn(page);
  await openGoals(page);
  const row = page.getByRole("listitem").filter({ hasText: title });
  await expect(row).toBeVisible();
  await expect(row).toContainText("Not started");
});
