/**
 * The interface is English-only (NFR-018): dates must read the same
 * regardless of the browser's preferred language. Every date display goes
 * through this module instead of calling `toLocaleDateString` /
 * `toLocaleString` directly, which would otherwise follow the browser's
 * locale.
 */
const ENGLISH_LOCALE = "en-GB";

export function formatDate(
  iso: string | null | undefined,
  options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" },
): string {
  if (!iso) return "";
  const date = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(ENGLISH_LOCALE, options);
}

export function formatDateTime(
  date: Date = new Date(),
  options?: Intl.DateTimeFormatOptions,
): string {
  return date.toLocaleString(ENGLISH_LOCALE, options);
}
