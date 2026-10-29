// @ts-nocheck -- generated from the approved design under its JS runtime contract; not hand-written TypeScript.
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";

import { brand } from "@/lib/brand";

const PRODUCT = "Performance management System (PMS)";
const SCREEN = "Sign in";
const HAIRLINE = "1px solid rgba(255,255,255,0.10)";

export default function Screen() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [done, setDone] = React.useState(false);
  const field = { border: HAIRLINE, borderRadius: brand.radius, height: 46, backgroundColor: "rgba(0,0,0,0.25)", color: brand.primaryColor };
  const label = { color: brand.neutralColor, letterSpacing: "0.18em" };

  return (
    <div className="flex min-h-screen items-center justify-center px-6" style={{ color: brand.primaryColor, fontFamily: brand.fontBody }}>
      <main className="w-full max-w-md p-10" style={{ backgroundColor: "rgba(255,255,255,0.04)", border: HAIRLINE, borderRadius: brand.radius }}>
        <h1 className="text-3xl" style={{ fontFamily: brand.fontHeading }}>{PRODUCT}</h1>
        <div aria-hidden className="mt-3 h-px w-12" style={{ backgroundColor: brand.accentColor }} />
        <p className="mt-3 text-xs uppercase" style={label}>{SCREEN}</p>
        {done ? (
          <p role="status" className="mt-8 text-xl" style={{ fontFamily: brand.fontHeading }}>Welcome back.</p>
        ) : (
          <form className="mt-8 space-y-5" onSubmit={(e) => { e.preventDefault(); setDone(true); }}>
            <div className="space-y-2">
              <label htmlFor="vl-email" className="block text-xs uppercase" style={label}>Email</label>
              <input id="vl-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 text-sm outline-none" style={field} />
            </div>
            <div className="space-y-2">
              <label htmlFor="vl-password" className="block text-xs uppercase" style={label}>Password</label>
              <input id="vl-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 text-sm outline-none" style={field} />
            </div>
            <button type="submit" className="h-12 w-full text-xs font-bold uppercase tracking-[0.25em] transition-opacity hover:opacity-90" style={{ backgroundColor: brand.accentColor, color: brand.backgroundColor, borderRadius: brand.radius }}>
              Sign in
            </button>
          </form>
        )}
        <p className="mt-8 text-xs uppercase" style={label}>
          No account? <button type="button" className="underline underline-offset-4" style={{ color: brand.accentColor }}>Request an invitation</button>
        </p>
      </main>
    </div>
  );
}
