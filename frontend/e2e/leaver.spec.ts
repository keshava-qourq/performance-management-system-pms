import { expect, test, type Page } from "@playwright/test";

// Seeded dev account (backend/app/seed.py).
const PASSWORD = "Dev-Passw0rd!";
const HR = "hr.admin@example.com";

// These scenarios create their own people so no seeded account is ever left
// deactivated for the other specs.
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
}

async function pick(page: Page, label: string) {
  const select = page.getByLabel(label, { exact: true });
  const value = await select.locator("option").nth(1).getAttribute("value");
  await select.selectOption(value!);
}

async function addPerson(page: Page, name: string, email: string) {
  await page.getByRole("button", { name: "Add employee" }).click();
  await page.getByLabel("Full name").fill(name);
  await page.getByLabel("Work email").fill(email);
  await pick(page, "Job title");
  await pick(page, "Department");
  await page.getByRole("button", { name: "Create employee" }).click();
  await expect(page.getByRole("row", { name: new RegExp(name) })).toBeVisible();
}

async function managePerson(page: Page, name: string) {
  await page.getByRole("button", { name: `Manage ${name}` }).click();
  await expect(page.getByRole("complementary", { name: "Employee record form" })).toBeVisible();
}

async function setManager(page: Page, person: string, managerLabel: string) {
  await managePerson(page, person);
  await page.getByLabel("Manager", { exact: true }).selectOption({ label: managerLabel });
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByRole("row", { name: new RegExp(person) })).toContainText(managerLabel);
}

test("[AC-017] [AC-015] HR deactivating a manager is forced through the reassign prompt", async ({
  page,
}) => {
  const stamp = Date.now();
  const leaver = `QA Leaver ${stamp}`;
  const report = `QA Report ${stamp}`;
  const successor = `QA Successor ${stamp}`;

  await signIn(page, HR);
  await openDirectory(page);
  await addPerson(page, leaver, `qa.leaver.${stamp}@example.com`);
  await addPerson(page, report, `qa.report.${stamp}@example.com`);
  await addPerson(page, successor, `qa.successor.${stamp}@example.com`);
  await setManager(page, report, leaver);

  // Step one: the leaving date only. The API refuses because people still report in.
  await managePerson(page, leaver);
  await page.getByRole("button", { name: "Deactivate employee" }).click();
  await page.getByLabel("Leaving date").fill("2026-06-30");
  await page.getByRole("button", { name: "Confirm deactivation" }).click();

  // Step two: the prompt names the outstanding direct report and asks for a new manager.
  const form = page.getByRole("form", { name: "Deactivate employee" });
  await expect(form).toContainText(report);
  await expect(page.getByLabel("New manager", { exact: true })).toBeVisible();
  await expect(page.locator("#reassign_manager_id-error")).toContainText(report);

  // The prompt cannot be skipped: confirming with no new manager chosen is refused.
  await page.getByRole("button", { name: "Reassign and deactivate" }).click();
  await expect(page.locator("#reassign_manager_id-error")).toBeVisible();
  await expect(page.getByRole("row", { name: new RegExp(leaver) })).not.toContainText(
    "Deactivated",
  );

  await page.getByLabel("New manager", { exact: true }).selectOption({ label: successor });
  await page.getByRole("button", { name: "Reassign and deactivate" }).click();

  // AC-017: the reassignment and the deactivation complete together.
  await expect(page.getByRole("status")).toContainText(
    "goals, feedback and reviews are kept on their record",
  );
  await expect(page.getByRole("row", { name: new RegExp(report) })).toContainText(successor);
  await expect(page.getByRole("row", { name: new RegExp(leaver) })).toContainText("Deactivated");
});

test("[AC-015] [AC-016] a deactivated leaver keeps their record and leaves the manager picker", async ({
  page,
}) => {
  const stamp = Date.now();
  const leaver = `QA Gone ${stamp}`;
  const other = `QA Stays ${stamp}`;

  await signIn(page, HR);
  await openDirectory(page);
  await addPerson(page, leaver, `qa.gone.${stamp}@example.com`);
  await addPerson(page, other, `qa.stays.${stamp}@example.com`);

  await managePerson(page, leaver);
  await page.getByRole("button", { name: "Deactivate employee" }).click();
  await page.getByLabel("Leaving date").fill("2026-06-30");
  await page.getByRole("button", { name: "Confirm deactivation" }).click();
  await expect(page.getByRole("row", { name: new RegExp(leaver) })).toContainText("Deactivated");

  // AC-015: gone from the active picker used when choosing a manager.
  await managePerson(page, other);
  await expect(
    page.getByLabel("Manager", { exact: true }).locator("option", { hasText: leaver }),
  ).toHaveCount(0);

  // AC-016 / NFR-010: the record is still open, read-only, with no delete control.
  await managePerson(page, leaver);
  await expect(page.getByRole("region", { name: "History" })).toBeVisible();
  await expect(page.getByText("cannot be deleted")).toBeVisible();
  await expect(page.getByRole("button", { name: /Delete/i })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Deactivate employee" })).toHaveCount(0);
});
