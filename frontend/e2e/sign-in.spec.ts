import { expect, test, type Page } from "@playwright/test";

// Seeded dev account (backend/app/seed.py).
const EMAIL = "employee@example.com";
const PASSWORD = "Dev-Passw0rd!";

async function signIn(page: Page, password: string) {
  await page.goto("/sign-in");
  await page.getByLabel("Email").fill(EMAIL);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
}

test("[AC-022] sign in lands on /my-performance", async ({ page }) => {
  await signIn(page, PASSWORD);
  await expect(page).toHaveURL(/\/my-performance$/);
  await expect(page.getByRole("button", { name: "Sign out" })).toBeVisible();
});

test("[AC-023] a wrong password shows a generic message and stays on sign-in", async ({ page }) => {
  await signIn(page, "definitely-wrong");
  await expect(page.getByRole("alert")).toContainText("incorrect");
  await expect(page.getByRole("alert")).not.toContainText(EMAIL);
  await expect(page).toHaveURL(/\/sign-in$/);
});

test("[AC-025] Sign out returns to /sign-in and protected pages are closed", async ({ page }) => {
  await signIn(page, PASSWORD);
  await expect(page).toHaveURL(/\/my-performance$/);
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/sign-in$/);
  await page.goto("/goals");
  await expect(page).toHaveURL(/\/sign-in$/);
});

test("[AC-025] a protected URL visited signed out redirects to /sign-in", async ({ page }) => {
  await page.goto("/my-performance");
  await expect(page).toHaveURL(/\/sign-in$/);
});
