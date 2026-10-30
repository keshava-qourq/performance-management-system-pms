import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import Profile from "./Profile";

type Reply = { status: number; body?: unknown };

const PROFILE = {
  id: "e1",
  full_name: "Amara Okafor",
  work_email: "amara@example.com",
  job_title: { id: "t1", name: "Product Designer" },
  department: { id: "d1", name: "Design" },
  manager: { id: "e2", full_name: "Daniel Reyes" },
  role: "Employee",
  display_name: "Amara",
  pronouns: "she/her",
  photo_url: null,
  hr_maintained: ["job_title", "department", "manager", "role"],
};

function mockApi(routes: Record<string, Reply>) {
  const fn = vi.fn(async (url: string, init?: RequestInit) => {
    const r = routes[`${init?.method ?? "GET"} ${new URL(url).pathname}`] ?? { status: 404 };
    return new Response(JSON.stringify(r.body ?? {}), { status: r.status });
  });
  vi.stubGlobal("fetch", fn);
  return fn;
}

function renderScreen() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <Profile />
    </QueryClientProvider>,
  );
}

afterEach(() => vi.unstubAllGlobals());

describe("Profile", () => {
  it("[AC-031] shows name, email, job title, department and manager", async () => {
    mockApi({ "GET /me/profile": { status: 200, body: PROFILE } });
    renderScreen();
    expect(await screen.findByText("amara@example.com")).toBeInTheDocument();
    expect(screen.getByText("Product Designer")).toBeInTheDocument();
    expect(screen.getByText("Design")).toBeInTheDocument();
    expect(screen.getByText("Daniel Reyes")).toBeInTheDocument();
    expect(screen.getByText("Amara Okafor")).toBeInTheDocument();
  });

  it("[AC-032] saving sends PATCH /me/profile with display name and pronouns", async () => {
    const fn = mockApi({
      "GET /me/profile": { status: 200, body: PROFILE },
      "PATCH /me/profile": { status: 200, body: PROFILE },
    });
    renderScreen();
    const user = userEvent.setup();
    const name = await screen.findByLabelText("Display name");
    await user.clear(name);
    await user.type(name, "Amy");
    await user.click(screen.getByRole("button", { name: "Save profile" }));
    expect(await screen.findByText("Profile saved.")).toBeInTheDocument();
    const call = fn.mock.calls.find(([, i]) => (i as RequestInit)?.method === "PATCH")!;
    expect(JSON.parse(String((call[1] as RequestInit).body))).toEqual({
      display_name: "Amy",
      pronouns: "she/her",
    });
  });

  it("[AC-032] uploading a photo calls PUT /me/profile/photo and renders the returned URL", async () => {
    let photo: string | null = null;
    const fn = mockApi({});
    fn.mockImplementation(async (url: string, init?: RequestInit) => {
      const key = `${init?.method ?? "GET"} ${new URL(url).pathname}`;
      if (key === "PUT /me/profile/photo") {
        photo = "http://img.test/p.jpg";
        return new Response(JSON.stringify({ photo_url: photo }), { status: 200 });
      }
      return new Response(JSON.stringify({ ...PROFILE, photo_url: photo }), { status: 200 });
    });
    renderScreen();
    const input = await screen.findByLabelText("Profile photo");
    await userEvent.upload(input, new File(["x"], "me.png", { type: "image/png" }));
    await waitFor(() =>
      expect(screen.getByRole("img")).toHaveAttribute("src", "http://img.test/p.jpg"),
    );
    expect(fn.mock.calls.some(([, i]) => (i as RequestInit)?.method === "PUT")).toBe(true);
  });

  it("[AC-033] HR-owned fields are read-only and labelled as maintained by HR", async () => {
    mockApi({ "GET /me/profile": { status: 200, body: PROFILE } });
    renderScreen();
    await screen.findByText("Product Designer");
    expect(screen.getAllByText("Maintained by HR")).toHaveLength(4);
    expect(screen.queryByLabelText("Job title", { selector: "input" })).toBeNull();
    expect(screen.queryByLabelText("Role", { selector: "input" })).toBeNull();
  });

  it("[NFR-019] shows the API's field message against the field", async () => {
    mockApi({
      "GET /me/profile": { status: 200, body: PROFILE },
      "PATCH /me/profile": {
        status: 422,
        body: { errors: { pronouns: "Use pronouns of 40 characters or fewer." } },
      },
    });
    renderScreen();
    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: "Save profile" }));
    expect(await screen.findByText("Use pronouns of 40 characters or fewer.")).toBeInTheDocument();
    expect(screen.getByLabelText("Pronouns")).toHaveAttribute("aria-invalid", "true");
  });
});
