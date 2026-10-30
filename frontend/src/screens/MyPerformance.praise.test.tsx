import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import MyPerformance from "./MyPerformance";

type Reply = { status: number; body?: unknown };

const ME = { id: "e1", full_name: "Amara Okafor", role: "Employee", is_manager: false };
const PEOPLE = [
  { id: "e1", full_name: "Amara Okafor", job_title: null, status: "Active" },
  { id: "e2", full_name: "Priya Nair", job_title: { id: "t", name: "PM" }, status: "Active" },
];

function mockApi(routes: Record<string, Reply>) {
  const fn = vi.fn(async (url: string, init?: RequestInit) => {
    const u = new URL(url);
    const key = `${init?.method ?? "GET"} ${u.pathname}`;
    const r = routes[key] ?? { status: 404, body: {} };
    return new Response(JSON.stringify(r.body ?? {}), { status: r.status });
  });
  vi.stubGlobal("fetch", fn);
  return fn;
}

const base = (feedback: unknown[] = []): Record<string, Reply> => ({
  "GET /auth/me": { status: 200, body: ME },
  "GET /employees": { status: 200, body: PEOPLE },
  "GET /me/dashboard": { status: 200, body: { feedback } },
  "GET /feedback/audience": {
    status: 200,
    body: { readers_statement: "You, the recipient and HR Admins can read this." },
  },
});

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

async function openComposer() {
  const user = userEvent.setup();
  await user.click(screen.getAllByRole("button", { name: /Give praise or feedback/ })[0]);
  await screen.findByRole("option", { name: /Priya Nair/ });
  return user;
}

const toField = () => document.getElementById("fb-to") as HTMLSelectElement;

afterEach(() => vi.unstubAllGlobals());

describe("Praise composer", () => {
  it("[AC-078] sends POST /feedback and confirms with the recipient's name, excluding me", async () => {
    const fn = mockApi({ ...base(), "POST /feedback": { status: 201, body: { id: "f1" } } });
    renderScreen();
    const user = await openComposer();
    expect(screen.queryByRole("option", { name: /Amara Okafor/ })).toBeNull();
    await user.selectOptions(toField(), "e2");
    await user.type(screen.getByLabelText("Message"), "Great work");
    await user.click(screen.getByRole("button", { name: "Send praise" }));
    expect(await screen.findByText(/Praise sent to Priya Nair/)).toBeInTheDocument();
    const call = fn.mock.calls.find(
      ([u, i]) => String(u).endsWith("/feedback") && i?.method === "POST",
    )!;
    expect(JSON.parse(String(call[1]?.body))).toEqual({
      recipient_id: "e2",
      type: "praise",
      body: "Great work",
    });
  });

  it("[AC-079] shows the API's messages beside an empty message and missing recipient", async () => {
    mockApi({
      ...base(),
      "POST /feedback": {
        status: 422,
        body: {
          errors: { recipient_id: "Choose a colleague.", body: "Write a message before sending." },
        },
      },
    });
    renderScreen();
    const user = await openComposer();
    await user.click(screen.getByRole("button", { name: "Send praise" }));
    expect(await screen.findByText("Choose a colleague.")).toBeInTheDocument();
    expect(screen.getByText("Write a message before sending.")).toBeInTheDocument();
    expect(toField()).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("Message")).toHaveAttribute("aria-invalid", "true");
    expect(screen.queryByText(/Praise sent to/)).toBeNull();
  });

  it("[AC-080] shows the self-recipient message on the recipient field", async () => {
    mockApi({
      ...base(),
      "POST /feedback": {
        status: 422,
        body: { errors: { recipient_id: "Praise must be addressed to someone else." } },
      },
    });
    renderScreen();
    const user = await openComposer();
    await user.selectOptions(toField(), "e2");
    await user.type(screen.getByLabelText("Message"), "Hi");
    await user.click(screen.getByRole("button", { name: "Send praise" }));
    expect(
      await screen.findByText("Praise must be addressed to someone else."),
    ).toBeInTheDocument();
    expect(toField()).toHaveAttribute("aria-invalid", "true");
  });

  it("[AC-091] shows the readers statement from GET /feedback/audience before sending", async () => {
    const fn = mockApi(base());
    renderScreen();
    const user = await openComposer();
    await user.selectOptions(toField(), "e2");
    expect(await screen.findByText(/HR Admins can read this/)).toBeInTheDocument();
    expect(
      fn.mock.calls.some(([u]) => String(u).includes("/feedback/audience?recipient_id=e2")),
    ).toBe(true);
  });
});

describe("Received feedback", () => {
  it("[AC-081] lists each item with author and date, newest first", async () => {
    mockApi(
      base([
        {
          id: "a",
          author: { id: "e3", full_name: "Older Author" },
          type: "praise",
          body: "Old",
          created_at: "2026-09-01T10:00:00",
        },
        {
          id: "b",
          author: { id: "e2", full_name: "Priya Nair" },
          type: "praise",
          body: "New",
          created_at: "2026-10-27T10:00:00",
        },
      ]),
    );
    renderScreen();
    const section = (await screen.findByText("Latest feedback")).closest("section")!;
    const items = await within(section).findAllByRole("listitem");
    expect(items[0]).toHaveTextContent("Priya Nair");
    expect(items[0]).toHaveTextContent("27 Oct 2026");
    expect(items[1]).toHaveTextContent("Older Author");
  });

  it("[AC-081] shows an empty-state explanation, not an error, with none", async () => {
    mockApi(base());
    renderScreen();
    expect(await screen.findByText("Nothing received yet")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).toBeNull();
  });
});
