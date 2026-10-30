import { expect, test, type Page } from "@playwright/test";

const [REDACTED_SECRET]";
const HR = "hr.admin@example.com";
const EMPLOYEE = "employee@example.com";
const OFF = "Feedback is readable only by its author, its recipient and HR Admins.";

test.describe.configure({ mode: "serial" });

async function signIn(page: Page, email: string) {
  await page.goto("/sign-in");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("button", { name: "Sign out" })).toBeVisible();
}

async function setVisibility(page: Page, on: boolean) {
  await page.getByRole("link", { name: "People" }).click();
  await page.getByRole("tab", { name: "Settings" }).click();
  const panel = page.getByRole("region", { name: "Visibility settings" });
  const toggle = panel.getByRole("switch");
  if ((await toggle.getAttribute("aria-checked")) !== String(on)) await toggle.click();
  await expect(toggle).toHaveAttribute("aria-checked", String(on));
}

async function resetOff(page: Page) {
  await page.request.put("/api/settings", {
    data: { manager_feedback_visible: false },
    headers: { "X-Requested-With": "e2e" },
  });
}

async function composerStatement(page: Page) {
  await page.getByRole("link", { name: "My Performance" }).click();
  await page.getByRole("button", { name: "Give praise or feedback" }).click();
  await expect(page.getByRole("form", { name: /New (praise|feedback)/ })).toBeVisible();
}

test("[AC-089] HR switches the setting on, it survives a reload", async ({ page }) => {
  await signIn(page, HR);
  try {
    await setVisibility(page, true);
    await page.reload();
    await page.getByRole("tab", { name: "Settings" }).click();
    await expect(
      page.getByRole("region", { name: "Visibility settings" }).getByRole("switch"),
    ).toHaveAttribute("aria-checked", "true");
  } finally {
    await setVisibility(page, false);
  }
});

test("[AC-091] composer shows the readership statement and it updates after HR toggles", async ({
  browser,
}) => {
  const hrCtx = await browser.newContext();
  const hr = await hrCtx.newPage();
  const empCtx = await browser.newContext();
  const emp = await empCtx.newPage();
  try {
    await signIn(hr, HR);
    await setVisibility(hr, false);
    await signIn(emp, EMPLOYEE);
    await composerStatement(emp);
    await expect(emp.getByText(OFF)).toBeVisible();

    await setVisibility(hr, true);
    await emp.reload();
    await composerStatement(emp);
    await expect(emp.getByText(OFF)).toHaveCount(0);
    await expect(emp.getByText(/manager/i).first()).toBeVisible();
  } finally {
    await setVisibility(hr, false).catch(() => resetOff(hr));
    await hrCtx.close();
    await empCtx.close();
  }
});

test("[NFR-020] a non-HR user has no editable setting", async ({ page }) => {
  await signIn(page, EMPLOYEE);
  await expect(page.getByRole("link", { name: "People" })).toBeVisible();
  const r = await page.request.put("/api/settings", {
    data: { manager_feedback_visible: true },
    headers: { "X-Requested-With": "e2e" },
  });
  expect(r.status()).toBe(403);
});
