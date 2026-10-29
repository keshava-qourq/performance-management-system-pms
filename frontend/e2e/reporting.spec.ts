import { expect, test, type Page } from "@playwright/test";

// Seeded dev accounts (backend/app/seed.py).
const PASSWORD = "Dev-Passw0rd!";
const HR = "hr.admin@example.com";
const EMPLOYEE = "Emi Employee";
const MANAGER = "Mo Manager";

// These scenarios change shared reporting lines, so they run one after another
// and each puts the directory back to "no manager" when it is done.
test.describe.configure({ mode: "serial" });

async function signIn(page: Page, email: string) {
  await page.goto("/sign-in");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("button", { name: "Sign out" })).toBeVisible();
}

async function openDirectory(page: Page) {
  await page.getByRole("link", { name: "People" }).click();
  await expect(page).toHaveURL(/\/people$/);
  await expect(page.getByRole("row", { name: new RegExp(EMPLOYEE) })).toBeVisible();
}

async function managePerson(page: Page, name: string) {
  await page.getByRole("button", { name: `Manage ${name}` }).click();
  await expect(page.getByRole("complementary", { name: "Employee record form" })).toBeVisible();
}

async function setManager(page: Page, person: string, managerLabel: string) {
  await managePerson(page, person);
  await page.getByLabel("Manager", { exact: true }).selectOption({ label: managerLabel });
  await page.getByRole("button", { name: "Save changes" }).click();
}

async function clearManager(page: Page, person: string) {
  await openDirectory(page);
  await setManager(page, person, "No manager");
  await expect(page.getByRole("row", { name: new RegExp(person) })).toContainText(
    "Missing a reporting line",
  );
}

test("[AC-008] [AC-010] an HR Admin assigns a manager and the missing-line flag clears", async ({
  page,
}) => {
  await signIn(page, HR);
  await openDirectory(page);

  // AC-010: with no manager set the row flags the gap in plain English.
  const row = page.getByRole("row", { name: new RegExp(EMPLOYEE) });
  await expect(row).toContainText("Missing a reporting line");

  await setManager(page, EMPLOYEE, MANAGER);

  // AC-008: the reporting line shows in the directory...
  await expect(row).toContainText(MANAGER);
  await expect(row).not.toContainText("Missing a reporting line");

  // ...and the new manager lists the direct report on their record.
  await managePerson(page, MANAGER);
  const reports = page.getByRole("region", { name: "Direct reports" });
  await expect(reports).toContainText(EMPLOYEE);

  await clearManager(page, EMPLOYEE);
});

test("[AC-009] [NFR-019] a circular reporting line is refused with an inline message", async ({
  page,
}) => {
  await signIn(page, HR);
  await openDirectory(page);
  await setManager(page, EMPLOYEE, MANAGER);
  await expect(page.getByRole("row", { name: new RegExp(EMPLOYEE) })).toContainText(MANAGER);

  // Mo now reports to Emi, who already reports to Mo: a cycle.
  await managePerson(page, MANAGER);
  const select = page.getByLabel("Manager", { exact: true });
  await select.selectOption({ label: EMPLOYEE });
  await page.getByRole("button", { name: "Save changes" }).click();

  await expect(select).toHaveAttribute("aria-invalid", "true");
  await expect(page.locator("#manager_id-error")).toContainText("circular");

  // Nothing was saved: Mo still has no manager.
  await page.getByRole("button", { name: "Close panel" }).click();
  await expect(page.getByRole("row", { name: new RegExp(MANAGER) })).toContainText(
    "Missing a reporting line",
  );

  await clearManager(page, EMPLOYEE);
});

test("[AC-009] an employee cannot be set as their own manager", async ({ page }) => {
  await signIn(page, HR);
  await openDirectory(page);
  await managePerson(page, EMPLOYEE);
  // The form leaves the person out of their own manager list; the API refuses it too.
  await expect(
    page.getByLabel("Manager", { exact: true }).locator("option", { hasText: EMPLOYEE }),
  ).toHaveCount(0);

  const result = await page.evaluate(async (name) => {
    const base = (window as unknown as { __API__?: string }).__API__ ?? "http://localhost:8000";
    const list = await (await fetch(`${base}/employees`, { credentials: "include" })).json();
    const me = (list as Array<{ id: string; full_name: string }>).find(
      (e) => e.full_name === name,
    )!;
    const response = await fetch(`${base}/employees/${me.id}/manager`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json", "X-Requested-With": "pms" },
      body: JSON.stringify({ manager_id: me.id }),
    });
    return { status: response.status, body: await response.text() };
  }, EMPLOYEE);

  expect(result.status).toBe(422);
  expect(JSON.parse(result.body).errors.manager_id).toContain("themselves");
});
