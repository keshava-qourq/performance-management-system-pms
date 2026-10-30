import { expect, test, type Page } from "@playwright/test";

// US-015 e2e: manager oversight of team goals and commenting.
const PASSWORD = "Dev-Passw0rd!";
const HR = "hr.admin@example.com";
const MANAGER = "manager@example.com";
const EMPLOYEE = "employee@example.com";

test.describe.configure({ mode: "serial" });

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

async function setManager(page: Page, email: string, managerEmail: string | null) {
  const list = (await api(page, "GET", "/employees")).json as {
    id: string;
    work_email: string;
  }[];
  const id = (e: string) => list.find((x) => x.work_email === e)!.id;
  await api(page, "PUT", `/employees/${id(email)}/manager`, {
    manager_id: managerEmail ? id(managerEmail) : null,
  });
}

test("[AC-055] [AC-056] [AC-057] manager sees reports' goals, comments, and reassigned report leaves", async ({
  page,
}) => {
  const title = `Team goal ${Date.now()}`;
  const comment = `Great progress ${Date.now()}`;
  let goalId = "";

  await signIn(page, HR);
  await setManager(page, EMPLOYEE, MANAGER);
  await signOut(page);

  try {
    await signIn(page, EMPLOYEE);
    const created = await api(page, "POST", "/goals", {
      title,
      target: "A measurable target",
      due_date: iso(30),
      weighting: 40,
    });
    expect(created.status).toBe(201);
    goalId = created.json.id;
    await signOut(page);

    // AC-055: the manager's Team goals screen lists the report and the goal.
    await signIn(page, MANAGER);
    await page.getByRole("link", { name: "Goals" }).click();
    await page
      .getByRole("tab", { name: /Team goals/i })
      .or(page.getByRole("link", { name: /Team goals/i }))
      .or(page.getByRole("button", { name: /Team goals/i }))
      .first()
      .click();
    await expect(page.getByText("Emi Employee").first()).toBeVisible();
    await expect(page.getByText(title)).toBeVisible();
    await expect(page.getByText(/Not started/).first()).toBeVisible();

    // AC-056: the manager comments; blank comment is refused.
    const box = page.getByLabel(/comment/i).first();
    await box.fill("   ");
    await page
      .getByRole("button", { name: /comment/i })
      .first()
      .click();
    await expect(page.getByText("Enter a comment.")).toBeVisible();
    await box.fill(comment);
    await page
      .getByRole("button", { name: /comment/i })
      .first()
      .click();
    await expect(page.getByText(comment).first()).toBeVisible();
    await signOut(page);

    // AC-056: the owner sees the comment on the Goals screen.
    await signIn(page, EMPLOYEE);
    await page.getByRole("link", { name: "Goals" }).click();
    await page.getByText(title).first().click();
    await expect(page.getByText(comment).first()).toBeVisible();
    await signOut(page);

    // AC-057: after reassignment the goal leaves the first manager's view.
    await signIn(page, HR);
    await setManager(page, EMPLOYEE, null);
    await signOut(page);
    await signIn(page, MANAGER);
    const team = await api(page, "GET", "/team/goals");
    expect(team.status).toBe(200);
    expect(JSON.stringify(team.json)).not.toContain(title);
    expect((await api(page, "GET", `/goals/${goalId}`)).status).toBe(403);
    await page.getByRole("link", { name: "Goals" }).click();
    await expect(page.getByText(title)).toHaveCount(0);
  } finally {
    await page.goto("/sign-in");
    if (
      await page
        .getByRole("button", { name: "Sign out" })
        .isVisible()
        .catch(() => false)
    ) {
      await signOut(page);
    }
    await signIn(page, HR);
    await setManager(page, EMPLOYEE, null);
    if (goalId) await api(page, "DELETE", `/goals/${goalId}`);
  }
});

test("[NFR-001] an employee gets 403 from /team/goals", async ({ page }) => {
  await signIn(page, EMPLOYEE);
  const r = await api(page, "GET", "/team/goals");
  expect(r.status).toBe(403);
  expect(r.json).toBeNull();
});
