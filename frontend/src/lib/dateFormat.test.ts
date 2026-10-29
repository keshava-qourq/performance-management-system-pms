import { afterEach, describe, expect, it, vi } from "vitest";

import { formatDate, formatDateTime } from "@/lib/dateFormat";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("formatDate", () => {
  it("[AC-118] formats an ISO date in English regardless of the runtime locale", () => {
    expect(formatDate("2026-10-29")).toBe("29 Oct 2026");
  });

  it("[AC-118] returns an empty string for a missing date", () => {
    expect(formatDate(undefined)).toBe("");
    expect(formatDate(null)).toBe("");
  });

  it("[AC-118] stays English even when Intl's default locale would be German", () => {
    const original = Intl.DateTimeFormat;
    // Simulate a browser whose default locale is de-DE: toLocaleDateString()
    // with no locale argument would format "29.10.2026". The shared helper
    // must not be swayed by this because it always passes an explicit locale.
    vi.stubGlobal(
      "Intl",
      Object.assign(Intl, {
        DateTimeFormat: function (
          locale?: string | string[],
          options?: Intl.DateTimeFormatOptions,
        ) {
          return new original(locale ?? "de-DE", options);
        },
      }),
    );
    expect(formatDate("2026-10-29")).toBe("29 Oct 2026");
  });
});

describe("formatDateTime", () => {
  it("[AC-118] formats a Date in English", () => {
    const text = formatDateTime(new Date("2026-10-29T10:00:00Z"));
    expect(text).toMatch(/2026/);
    expect(text).not.toMatch(/[äöüß]/i);
  });
});
