import { expect, test, type Page } from "@playwright/test";

// US-013 e2e: goal alignment and company/department levels.
const PASSWORD = "Dev-Passw0rd!";
const HR = "hr.admin@example.com";
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

async function openGoals(page: Page) {
  await page.getByRole("link", { name: "Goals" }).click();
  await expect(page).toHaveURL(/\/goals$/);
}

async function fillGoal(page: Page, title: string) {
  await page.getByRole("button", { name: "New goal" }).first().click();
  await page.getByLabel("Title", { exact: true }).fill(title);
  await page.getByLabel("Measurable target").fill("A measurable target");
  await page.getByLabel("Due date").fill(iso(30));
  await page.getByLabel(/Weighting/).fill("5");
}

test("[AC-052] [AC-054] HR sees a Level control; an employee does not", async ({ page }) => {
  await signIn(page, EMPLOYEE);
  await openGoals(page);
  await page.getByRole("button", { name: "New goal" }).first().click();
  await expect(page.getByLabel("Title", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Level", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Sign out" }).click();

  await signIn(page, "manager@example.com");
  await openGoals(page);
  await page.getByRole("button", { name: "New goal" }).first().click();
  await expect(page.getByLabel("Level", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Sign out" }).click();

  await signIn(page, HR);
  await openGoals(page);
  await page.getByRole("button", { name: "New goal" }).first().click();
  await expect(page.getByLabel("Level", { exact: true })).toBeVisible();
});

test("[AC-048] [AC-052] HR creates a company goal and an employee aligns to it", async ({
  page,
}) => {
  const stamp = Date.now();
  const parent = `QA Company ${stamp}`;
  const child = `QA Child ${stamp}`;

  await signIn(page, HR);
  await openGoals(page);
  await fillGoal(page, parent);
  await page.getByLabel("Level", { exact: true }).selectOption({ label: "Company" });
  await page.getByRole("button", { name: "Save goal" }).click();
  await expect(page.getByRole("status").filter({ hasText: parent })).toBeVisible();
  await page.getByRole("button", { name: "Sign out" }).click();

  await signIn(page, EMPLOYEE);
  await openGoals(page);
  await fillGoal(page, child);
  const optionValue = await page
    .getByLabel("Aligned to")
    .locator("option", { hasText: parent })
    .first()
    .getAttribute("value");
  await page.getByLabel("Aligned to").selectOption(optionValue!);
  await page.getByRole("button", { name: "Save goal" }).click();
  await expect(page.getByRole("status").filter({ hasText: child })).toBeVisible();

  // The goal shows the parent's title.
  await page.getByRole("listitem").filter({ hasText: child }).getByRole("button").first().click();
  await expect(page.getByText(parent).first()).toBeVisible();
});

test("[AC-050] a self-parent is refused and the message is shown", async ({ page }) => {
  const stamp = Date.now();
  const title = `QA Loop ${stamp}`;
  await signIn(page, EMPLOYEE);
  await openGoals(page);
  await fillGoal(page, title);
  await page.getByRole("button", { name: "Save goal" }).click();
  await expect(page.getByRole("status").filter({ hasText: title })).toBeVisible();

  await page.getByRole("listitem").filter({ hasText: title }).getByRole("button").first().click();
  await page.getByRole("button", { name: /Edit/ }).first().click();
  const select = page.getByLabel("Aligned to");
  // The goal may offer itself; if the UI hides it, the server refusal is covered by pytest.
  const own = select.locator("option", { hasText: title });
  test.skip((await own.count()) === 0, "UI does not offer the goal as its own parent");
  await select.selectOption({ label: title });
  await page.getByRole("button", { name: /Save/ }).first().click();
  await expect(page.locator("#parent_goal_id-e")).toBeVisible();
});
