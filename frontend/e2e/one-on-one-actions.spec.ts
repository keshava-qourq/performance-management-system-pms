import { expect, test, type Page } from "@playwright/test";

// US-027/US-028 e2e: the 1:1 screen — adding an action item with an owner and a
// due date, marking it complete, seeing an overdue item flagged, and the manager
// seeing the private-note field with its visibility statement while the direct
// report sees no such field anywhere.
//
// Seeded dev accounts (backend/app/seed.py).
const PASSWORD = "Dev-Passw0rd!";
const HR = "hr.admin@example.com";
const MANAGER = "manager@example.com";
const EMPLOYEE = "employee@example.com";

// One shared reporting line and one shared 1:1 record: run in order.
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

/** Calls the API with the session cookie and the mutation header, as the app does. */
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

async function openOneOnOnes(page: Page) {
  await page.getByRole("link", { name: "1:1 check-ins" }).click();
  await expect(page).toHaveURL(/one-on-ones/);
}

/** Opens the 1:1 record for the given counterpart from the list. */
async function openRecordWith(page: Page, counterpart: string) {
  await page.getByRole("button", { name: "All" }).click();
  await page
    .getByRole("region", { name: "Your 1:1s" })
    .getByRole("button")
    .filter({ hasText: counterpart })
    .first()
    .click();
  await expect(page.getByRole("region", { name: "1:1 record" })).toBeVisible();
}

/** HR puts Emi Employee under Mo Manager so they can hold a 1:1. */
async function hrLinksTheReportingLine(page: Page) {
  await signIn(page, HR);
  const people = (await api(page, "GET", "/employees")).json as {
    id: string;
    work_email: string;
  }[];
  const manager = people.find((p) => p.work_email === MANAGER)!;
  const employee = people.find((p) => p.work_email === EMPLOYEE)!;
  const linked = await api(page, "PUT", `/employees/${employee.id}/manager`, {
    manager_id: manager.id,
  });
  expect(linked.status).toBe(200);
  await signOut(page);
  return { managerId: manager.id, employeeId: employee.id };
}

test("[AC-100] [AC-101] the manager adds an action item and the owner marks it complete", async ({
  page,
}) => {
  const stamp = Date.now();
  const description = `QA action item ${stamp}`;

  await hrLinksTheReportingLine(page);

  await signIn(page, MANAGER);
  const created = await api(page, "POST", "/one-on-ones", { meeting_date: iso(3) });
  expect([200, 201]).toContain(created.status);

  await openOneOnOnes(page);
  await openRecordWith(page, "Emi Employee");

  // AC-100: a description, an owner (either participant) and a due date.
  await page.getByLabel("Description").fill(description);
  await page.getByLabel("Owner").selectOption({ label: /You/ });
  await page.getByLabel("Due date").fill(iso(5));
  await page.getByRole("button", { name: "Add action item" }).click();

  const item = page.getByRole("listitem").filter({ hasText: description });
  await expect(item).toBeVisible();
  await expect(item).toContainText("Owner:");

  // AC-100: it is in the owner's open action items.
  const myOpen = page.getByRole("region", { name: "Your open action items" });
  await expect(myOpen.getByText(description)).toBeVisible();

  // AC-101: marking it complete shows the completion date and who completed it.
  await page.getByRole("button", { name: `Mark complete: ${description}` }).click();
  await expect(page.getByRole("listitem").filter({ hasText: description }).first()).toContainText(
    /Completed/,
  );
  await expect(page.getByRole("listitem").filter({ hasText: description }).first()).toContainText(
    "Mo Manager",
  );
  await signOut(page);
});

test("[AC-102] an open action item past its due date is flagged as overdue", async ({ page }) => {
  const stamp = Date.now();
  const description = `QA overdue item ${stamp}`;

  await signIn(page, MANAGER);
  const meetings = (await api(page, "GET", "/one-on-ones")).json as {
    one_on_ones: { id: string; counterpart: { full_name: string } }[];
  };
  const meeting = meetings.one_on_ones.find((m) => m.counterpart.full_name === "Emi Employee")!;
  const people = (await api(page, "GET", "/employees?active_only=true")).json as {
    id: string;
    full_name: string;
  }[];
  const emi = people.find((p) => p.full_name === "Emi Employee")!;
  const added = await api(page, "POST", `/one-on-ones/${meeting.id}/action-items`, {
    description,
    owner_id: emi.id,
    due_date: iso(-4),
  });
  expect([200, 201]).toContain(added.status);

  // Flagged on the 1:1 for the manager...
  await openOneOnOnes(page);
  await openRecordWith(page, "Emi Employee");
  await expect(page.getByRole("listitem").filter({ hasText: description })).toContainText(
    "Overdue",
  );
  await signOut(page);

  // ...and for the direct report, who also sees it in their open items.
  await signIn(page, EMPLOYEE);
  await openOneOnOnes(page);
  await expect(
    page.getByRole("region", { name: "Your open action items" }).getByText(description),
  ).toBeVisible();
  await openRecordWith(page, "Mo Manager");
  await expect(page.getByRole("listitem").filter({ hasText: description }).first()).toContainText(
    "Overdue",
  );
  await signOut(page);
});

test("[AC-104] [AC-105] [NFR-007] only the manager sees the private note and its visibility statement", async ({
  page,
}) => {
  const stamp = Date.now();
  const note = `QA private observation ${stamp}`;

  await signIn(page, MANAGER);
  await openOneOnOnes(page);
  await openRecordWith(page, "Emi Employee");

  // AC-104: the field is there, labelled plainly with who can read it (NFR-007).
  await expect(page.getByRole("heading", { name: "Private notes" })).toBeVisible();
  await expect(page.locator("#oo-note-readers")).toContainText("Only you can read this note");
  await expect(page.locator("#oo-note-readers")).toContainText(/HR Admins can(not)? read/);

  await page.getByLabel("Your observations").fill(note);
  await page.getByRole("button", { name: "Save private note" }).click();
  await expect(page.getByText("Saved")).toBeVisible();

  // It survives a reload for the manager.
  await page.reload();
  await openRecordWith(page, "Emi Employee");
  await expect(page.getByLabel("Your observations")).toHaveValue(note);
  await signOut(page);

  // AC-105/NFR-007: the direct report sees no field and no note anywhere.
  await signIn(page, EMPLOYEE);
  await openOneOnOnes(page);
  await openRecordWith(page, "Mo Manager");
  await expect(page.getByRole("heading", { name: "Private notes" })).toHaveCount(0);
  await expect(page.getByLabel("Your observations")).toHaveCount(0);
  await expect(page.getByText(note)).toHaveCount(0);
  const detail = await api(page, "GET", "/one-on-ones");
  expect(JSON.stringify(detail.json)).not.toContain(note);
  await signOut(page);
});
