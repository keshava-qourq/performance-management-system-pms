import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import MyPerformance from "./MyPerformance";

type Reply = { status: number; body?: unknown };

function mockApi(routes: Record<string, Reply>) {
  const fn = vi.fn(async (url: string, init?: RequestInit) => {
    const key = `${init?.method ?? "GET"} ${new URL(url).pathname}`;
    const r = routes[key] ?? { status: 200, body: {} };
    return new Response(r.status === 204 ? null : JSON.stringify(r.body ?? {}), {
      status: r.status,
    });
  });
  vi.stubGlobal("fetch", fn);
  return fn;
}

function renderScreen() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <MyPerformance />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

async function openChangePassword() {
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: "Profile & password" }));
  return user;
}

afterEach(() => vi.unstubAllGlobals());

describe("Change password", () => {
  it("[AC-027] lists the unmet rules the API returns against the password field", async () => {
    mockApi({
      "POST /auth/password": {
        status: 422,
        body: { unmet_rules: ["At least 12 characters", "At least one symbol, such as ! or #"] },
      },
    });
    renderScreen();
    const user = await openChangePassword();
    await user.type(screen.getByLabelText("Current password"), "old-password");
    await user.type(screen.getByLabelText("New password"), "shorty1A!xx");
    await user.type(screen.getByLabelText("Confirm new password"), "shorty1A!xx");
    await user.click(screen.getByRole("button", { name: "Change password" }));

    const unmet = await screen.findByRole("list", { name: "Unmet password rules" });
    expect(unmet).toHaveTextContent("At least 12 characters");
    expect(unmet).toHaveTextContent("At least one symbol");
    await waitFor(() =>
      expect(screen.getByLabelText("New password")).toHaveAttribute("aria-invalid", "true"),
    );
    expect(screen.getByLabelText("New password")).toHaveAttribute("aria-describedby", "pw-unmet");
  });

  it("[AC-027] a password the API accepts is confirmed and the fields are cleared", async () => {
    const fn = mockApi({ "POST /auth/password": { status: 200, body: {} } });
    renderScreen();
    const user = await openChangePassword();
    await user.type(screen.getByLabelText("Current password"), "old-password");
    await user.type(screen.getByLabelText("New password"), "Correct-horse-99");
    await user.type(screen.getByLabelText("Confirm new password"), "Correct-horse-99");
    await user.click(screen.getByRole("button", { name: "Change password" }));

    expect(await screen.findByText(/Password changed/)).toBeInTheDocument();
    expect(screen.getByLabelText("New password")).toHaveValue("");
    const call = fn.mock.calls.find(([u]) => String(u).endsWith("/auth/password"))!;
    expect(JSON.parse(String(call[1]?.body))).toEqual({
      current_password: "old-password",
      new_password: "Correct-horse-99",
    });
  });

  it("[AC-027] mismatched passwords are explained and nothing is sent", async () => {
    const fn = mockApi({});
    renderScreen();
    const user = await openChangePassword();
    await user.type(screen.getByLabelText("Current password"), "old-password");
    await user.type(screen.getByLabelText("New password"), "Correct-horse-99");
    await user.type(screen.getByLabelText("Confirm new password"), "Correct-horse-98");
    await user.click(screen.getByRole("button", { name: "Change password" }));

    expect(await screen.findByText(/do not match/)).toBeInTheDocument();
    expect(fn.mock.calls.some(([u]) => String(u).endsWith("/auth/password"))).toBe(false);
  });
});
