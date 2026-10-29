import { expect, test, type Page } from "@playwright/test";

// US-006 e2e: HR invites an employee and copies the link, the invitee sets a
// password and lands signed in, and an expired link shows the contact-HR page.
//
// Seeded dev account (backend/app/seed.py).
const PASSWORD = "Dev-Passw0rd!";
const HR = "hr.admin@example.com";
const NEW_PASSWORD = "Qa-E2e-Passphrase!";

test.describe.configure({ mode: "serial" });

function apiBase(page: Page) {
  return page.evaluate(
    () => (window as unknown as { __API__?: string }).__API__ ?? "http://localhost:8000",
  );
}

async function signIn(page: Page, email: string, password = PASSWORD) {
  await page.goto("/sign-in");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
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

test("[AC-018] HR invites an employee and copies the invitation link", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const stamp = Date.now();
  const name = `QA Invitee ${stamp}`;

  await signIn(page, HR);
  await openDirectory(page);
  await addPerson(page, name, `qa.invitee.${stamp}@example.com`);

  await managePerson(page, name);
  await page.getByRole("button", { name: "Invite" }).click();

  // The link is shown so HR can hand it over, with its expiry.
  const link = page.getByLabel("Invitation link");
  await expect(link).toBeVisible();
  const value = await link.inputValue();
  expect(value).toMatch(/set-password|token=/);
  await expect(page.getByText(/Expires/i)).toBeVisible();

  await page.getByRole("button", { name: /Copy link/i }).click();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toBe(value);

  // AC-018: the directory now shows the account as Invited.
  await page.getByRole("button", { name: "Close panel" }).click();
  await expect(page.getByRole("row", { name: new RegExp(name) })).toContainText("Invited");
});

test("[AC-019] the invitee sets a password and lands signed in", async ({ page }) => {
  const stamp = Date.now();
  const name = `QA Joiner ${stamp}`;
  const email = `qa.joiner.${stamp}@example.com`;

  await signIn(page, HR);
  await openDirectory(page);
  await addPerson(page, name, email);
  await managePerson(page, name);
  await page.getByRole("button", { name: "Invite" }).click();
  const link = await page.getByLabel("Invitation link").inputValue();
  await page.getByRole("button", { name: "Sign out" }).click();

  // The invitee opens their own link.
  await page.goto(link);
  await expect(page.getByRole("heading", { name: /Set .*password/i })).toBeVisible();

  // AC-027: the rules are shown, and a weak password is refused field-level.
  await page.getByLabel("New password", { exact: true }).fill("abc");
  await page.getByRole("button", { name: /Set password/i }).click();
  await expect(page.locator("#password-error")).toBeVisible();
  await expect(page.getByRole("heading", { name: /Set .*password/i })).toBeVisible();

  await page.getByLabel("New password", { exact: true }).fill(NEW_PASSWORD);
  await page.getByRole("button", { name: /Set password/i }).click();

  // AC-019: activated and signed straight in.
  await expect(page).toHaveURL(/\/my-performance$/);
  await expect(page.getByRole("button", { name: "Sign out" })).toBeVisible();

  // The link is single-use: opening it again no longer sets a password (NFR-005).
  await page.getByRole("button", { name: "Sign out" }).click();
  await page.goto(link);
  await expect(page.getByText(/no longer valid|expired|contact HR/i)).toBeVisible();

  // ...and the new password works on a normal sign-in (AC-028).
  await signIn(page, email, NEW_PASSWORD);
});

test("[AC-020] an expired link shows the contact-HR page and no password form", async ({
  page,
}) => {
  const stamp = Date.now();
  const name = `QA Expired ${stamp}`;

  await signIn(page, HR);
  await openDirectory(page);
  await addPerson(page, name, `qa.expired.${stamp}@example.com`);
  await managePerson(page, name);
  await page.getByRole("button", { name: "Invite" }).click();
  const link = await page.getByLabel("Invitation link").inputValue();

  // HR revokes it: from that moment the link is dead (AC-021 / NFR-005).
  await page.getByRole("button", { name: /Revoke/i }).click();
  await page.getByRole("button", { name: "Sign out" }).click();

  await page.goto(link);
  await expect(page.getByText(/contact HR|ask HR/i)).toBeVisible();
  await expect(page.getByLabel("New password", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /^Set password/i })).toHaveCount(0);
});

test("[AC-021] reissuing an invitation leaves only the newest link working", async ({ page }) => {
  const stamp = Date.now();
  const name = `QA Reissue ${stamp}`;

  await signIn(page, HR);
  await openDirectory(page);
  await addPerson(page, name, `qa.reissue.${stamp}@example.com`);
  await managePerson(page, name);
  await page.getByRole("button", { name: "Invite" }).click();
  const first = await page.getByLabel("Invitation link").inputValue();
  await page.getByRole("button", { name: /Reissue|Invite again/i }).click();
  const second = await page.getByLabel("Invitation link").inputValue();
  expect(second).not.toBe(first);
  await page.getByRole("button", { name: "Sign out" }).click();

  await page.goto(first);
  await expect(page.getByText(/no longer valid|expired|contact HR/i)).toBeVisible();

  await page.goto(second);
  await expect(page.getByRole("heading", { name: /Set .*password/i })).toBeVisible();
});

test("[AC-029] an HR-issued reset link works once and then is invalid", async ({ page }) => {
  const stamp = Date.now();
  const name = `QA Reset ${stamp}`;
  const email = `qa.reset.${stamp}@example.com`;
  const resetPassword = `Qa-Reset-${stamp}!`;

  await signIn(page, HR);
  await openDirectory(page);
  await addPerson(page, name, email);
  await managePerson(page, name);
  await page.getByRole("button", { name: /Send password reset|Reset password/i }).click();
  const link = await page.getByLabel(/reset link/i).inputValue();
  await page.getByRole("button", { name: "Sign out" }).click();

  await page.goto(link);
  await page.getByLabel("New password", { exact: true }).fill(resetPassword);
  await page.getByRole("button", { name: /Set password/i }).click();
  await expect(page.getByRole("button", { name: "Sign out" })).toBeVisible();
  await page.getByRole("button", { name: "Sign out" }).click();

  await page.goto(link);
  await expect(page.getByText(/no longer valid|expired|contact HR/i)).toBeVisible();
  await signIn(page, email, resetPassword);
});

test("[AC-028] a signed-in employee changes their password and the old one is refused", async ({
  page,
}) => {
  const stamp = Date.now();
  const name = `QA Changer ${stamp}`;
  const email = `qa.changer.${stamp}@example.com`;
  const first = `Qa-First-${stamp}!`;
  const second = `Qa-Second-${stamp}!`;

  await signIn(page, HR);
  await openDirectory(page);
  await addPerson(page, name, email);
  await managePerson(page, name);
  await page.getByRole("button", { name: "Invite" }).click();
  const link = await page.getByLabel("Invitation link").inputValue();
  await page.getByRole("button", { name: "Sign out" }).click();

  await page.goto(link);
  await page.getByLabel("New password", { exact: true }).fill(first);
  await page.getByRole("button", { name: /Set password/i }).click();
  await expect(page.getByRole("button", { name: "Sign out" })).toBeVisible();

  await page.getByRole("button", { name: /Change password/i }).click();
  await page.getByLabel("Current password", { exact: true }).fill(first);
  await page.getByLabel("New password", { exact: true }).fill(second);
  await page.getByRole("button", { name: /^Change password$/ }).click();
  await expect(page.getByRole("status")).toContainText(/password/i);

  await page.getByRole("button", { name: "Sign out" }).click();
  await page.goto("/sign-in");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(first);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("alert")).toContainText("incorrect");

  await signIn(page, email, second);
});
