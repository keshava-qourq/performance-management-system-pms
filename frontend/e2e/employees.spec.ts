import { expect, test, type Page } from "@playwright/test";

const PASSWORD = "Dev-Passw0rd!";

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

test("[AC-001] an HR Admin adds an employee who appears in the directory", async ({ page }) => {
  const stamp = Date.now();
  const name = `QA Person ${stamp}`;
  await signIn(page, "hr.admin@example.com");
  await openDirectory(page);
  await page.getByRole("button", { name: "Add employee" }).click();
  await page.getByLabel("Full name").fill(name);
  await page.getByLabel("Work email").fill(`qa.${stamp}@example.com`);
  await pick(page, "Job title");
  await pick(page, "Department");
  await page.getByRole("button", { name: "Create employee" }).click();
  await expect(page.getByRole("row", { name: new RegExp(name) })).toBeVisible();
});

test("[AC-002] missing and duplicate values show field-level errors in English", async ({ page }) => {
  await signIn(page, "hr.admin@example.com");
  await openDirectory(page);
  await page.getByRole("button", { name: "Add employee" }).click();
  await page.getByRole("button", { name: "Create employee" }).click();
  await expect(page.getByLabel("Full name")).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByLabel("Work email")).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByText("Enter the employee's full name.")).toBeVisible();
  await expect(page.getByText("Enter a work email address.")).toBeVisible();

  await page.getByLabel("Full name").fill("Duplicate Person");
  await page.getByLabel("Work email").fill("EMPLOYEE@example.com");
  await pick(page, "Job title");
  await pick(page, "Department");
  await page.getByRole("button", { name: "Create employee" }).click();
  await expect(page.getByLabel("Work email")).toHaveAttribute("aria-invalid", "true");
  await expect(
    page.getByText("This work email is already used by another employee."),
  ).toBeVisible();
});

test("[AC-003] an edit shows immediately in the directory", async ({ page }) => {
  await signIn(page, "hr.admin@example.com");
  await openDirectory(page);
  await page.getByRole("button", { name: "Manage Emi Employee" }).click();
  const title = page.getByLabel("Job title", { exact: true });
  const options = await title.locator("option").evaluateAll((os) =>
    os.map((o) => ({ v: (o as HTMLOptionElement).value, t: o.textContent ?? "" })).filter((o) => o.v),
  );
  const current = await title.inputValue();
  const next = options.find((o) => o.v !== current) ?? options[0];
  await title.selectOption(next.v);
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByRole("row", { name: /Emi Employee/ })).toContainText(next.t);
});

test("[AC-004] a non-HR user sees no Add or Manage actions", async ({ page }) => {
  await signIn(page, "manager@example.com");
  await page.goto("/people");
  await expect(page.getByRole("button", { name: "Add employee" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /^Manage / })).toHaveCount(0);
});

test("[AC-004] [NFR-001] a direct request by a non-HR user is refused by the server", async ({ page }) => {
  await signIn(page, "employee@example.com");
  const result = await page.evaluate(async () => {
    const base = (window as unknown as { __API__?: string }).__API__ ?? "http://localhost:8000";
    const post = await fetch(`${base}/employees`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json", "X-Requested-With": "pms" },
      body: JSON.stringify({ full_name: "X", work_email: "x@example.com" }),
    });
    const get = await fetch(`${base}/employees`, { credentials: "include" });
    return { post: post.status, postBody: await post.text(), get: get.status, getBody: await get.text() };
  });
  expect(result.post).toBe(403);
  expect(result.postBody).toBe("");
  expect(result.get).toBe(403);
  expect(result.getBody).toBe("");
});
