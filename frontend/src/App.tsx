import { NavLink, Navigate, Outlet, Route, Routes } from "react-router-dom";

import { useLogout, useSession, useSessionExpiry } from "@/lib/session";
import SignIn from "@/screens/SignIn";
import MyPerformance from "@/screens/MyPerformance";
import Goals from "@/screens/Goals";
import Reviews from "@/screens/Reviews";
import OneOnOnes from "@/screens/OneOnOnes";
import People from "@/screens/People";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "block rounded-[var(--brand-radius)] px-3 py-2 text-sm font-medium transition-colors",
    isActive ? "bg-[var(--brand-hover)] text-[var(--brand-fg)]" : "text-[var(--brand-fg-muted)]",
  ].join(" ");

// The screens behind sign-in render inside the side menu. Login and the other
// screens shown before sign-in render on their own, with no menu around them.
function Shell() {
  const { user, isLoading } = useSession();
  const logout = useLogout();
  useSessionExpiry();
  if (isLoading) return <p role="status" className="p-6">{"Loading…"}</p>;
  if (!user) return <Navigate to="/sign-in" replace />;
  return (
    <div className="flex min-h-screen">
      <aside
        className="w-56 shrink-0 border-r p-4"
        style={{
          backgroundColor: "var(--brand-surface)",
          borderColor: "var(--brand-border)",
        }}
      >
        <p
          className="mb-4 px-3 text-sm font-semibold"
          style={{ fontFamily: "var(--brand-font-heading)" }}
        >
          {"Performance management System (PMS)"}
        </p>
        <nav className="flex flex-col gap-1">
          <NavLink to="/my-performance" className={navLinkClass}>
            {"My performance"}
          </NavLink>
          <NavLink to="/goals" className={navLinkClass}>
            {"Goals"}
          </NavLink>
          <NavLink to="/reviews" className={navLinkClass}>
            {"Reviews"}
          </NavLink>
          <NavLink to="/one-on-ones" className={navLinkClass}>
            {"1:1 check-ins"}
          </NavLink>
          <NavLink to="/people" className={navLinkClass}>
            {"People"}
          </NavLink>
        </nav>
        <button
          type="button"
          onClick={() => logout.mutate()}
          className="mt-6 block w-full rounded-[var(--brand-radius)] px-3 py-2 text-left text-sm font-medium"
          style={{ color: "var(--brand-fg-muted)" }}
        >
          {"Sign out"}
        </button>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/sign-in" element={<SignIn />} />
      <Route element={<Shell />}>
        <Route path="/my-performance" element={<MyPerformance />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/one-on-ones" element={<OneOnOnes />} />
        <Route path="/people" element={<People />} />
      </Route>
      <Route path="*" element={<Navigate to="/sign-in" replace />} />
    </Routes>
  );
}
