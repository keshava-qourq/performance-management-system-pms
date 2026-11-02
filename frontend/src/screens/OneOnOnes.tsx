import * as React from "react";

import { ApiError } from "@/lib/api";
import { brand } from "@/lib/brand";
import { formatDate } from "@/lib/dateFormat";
import { FieldErrors } from "@/lib/employees";
import { Icons } from "@/lib/icons";
import {
  type ActionItem,
  type OneOnOneSummary,
  type TalkingPoint,
  useAddActionItem,
  useCompleteActionItem,
  useOneOnOne,
  useOneOnOnes,
  useSavePrivateNote,
} from "@/lib/oneOnOnes";
import { useSession } from "@/lib/session";
import { useSettings } from "@/lib/settings";

const fmt = (iso: string | null | undefined) => formatDate(iso);
const fmtShort = (iso: string | null | undefined) =>
  formatDate(iso, { day: "numeric", month: "short" });
const fmtDay = (iso: string | null | undefined) =>
  formatDate(iso, { weekday: "short", day: "numeric", month: "short" });
const firstName = (name: string | null | undefined) => (name ?? "").split(" ")[0] ?? "";

const today = () => new Date().toISOString().slice(0, 10);

// Overdue is the API's judgement; the date comparison is only a fallback for a
// payload that does not carry the flag.
const isOverdue = (it: ActionItem) =>
  it.completed_at ? false : (it.overdue ?? it.due_date < today());

export default function Screen() {
  const { user } = useSession();
  const meId = user?.id ?? "";

  const list = useOneOnOnes();
  const meetings = React.useMemo(() => list.data?.one_on_ones ?? [], [list.data]);
  const myOpen = React.useMemo(() => list.data?.open_action_items ?? [], [list.data]);

  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [tab, setTab] = React.useState("upcoming");
  const [query, setQuery] = React.useState("");

  const detailQuery = useOneOnOne(selectedId);
  const detail = detailQuery.data ?? null;

  // Talking points keep the agenda behaviour of the prototype; wiring them is a
  // separate packet, so they are seeded from the API record and edited locally.
  const [points, setPoints] = React.useState<TalkingPoint[]>([]);
  const [tpDraft, setTpDraft] = React.useState("");
  const [tpError, setTpError] = React.useState("");

  const [aiDesc, setAiDesc] = React.useState("");
  const [aiOwner, setAiOwner] = React.useState("");
  const [aiDue, setAiDue] = React.useState("");
  const [aiErrors, setAiErrors] = React.useState<Record<string, string>>({});
  const [noteDraft, setNoteDraft] = React.useState("");
  const [noteSaved, setNoteSaved] = React.useState(false);
  const [noteError, setNoteError] = React.useState("");
  const [itemError, setItemError] = React.useState("");
  const [live, setLive] = React.useState("");
  const headingRef = React.useRef<HTMLHeadingElement | null>(null);

  const addItem = useAddActionItem();
  const completeItem = useCompleteActionItem();
  const saveNote = useSavePrivateNote();

  // Only the manager sees the note at all (NFR-007); when the API does not
  // state the HR setting on the record, fall back to GET /settings.
  const mgr = Boolean(detail?.i_am_manager);
  const hrOnRecord = detail?.hr_can_read_private_notes;
  const settings = useSettings(mgr && hrOnRecord === undefined);
  const hrCanRead = hrOnRecord ?? settings.data?.hr_private_notes_visible;

  // A fresh record re-seeds every draft in the record pane.
  const recordKey = detail ? `${detail.id}:${detail.private_note ?? ""}` : "";
  React.useEffect(() => {
    if (!detail) return;
    setPoints(detail.talking_points ?? []);
    setTpDraft("");
    setTpError("");
    setAiDesc("");
    setAiDue("");
    setAiErrors({});
    setItemError("");
    setAiOwner(meId);
    setNoteDraft(detail.private_note ?? "");
    setNoteSaved(false);
    setNoteError("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordKey]);

  const bg = brand.backgroundColor;
  const ink = brand.primaryColor;
  const muted = brand.neutralColor;
  const accent = brand.accentColor;
  const surface = `color-mix(in srgb, ${ink} 4%, ${bg})`;
  const surfaceUp = `color-mix(in srgb, ${ink} 8%, ${bg})`;
  const line = `color-mix(in srgb, ${ink} 12%, transparent)`;
  const lineStrong = `color-mix(in srgb, ${ink} 28%, transparent)`;
  const serif = brand.fontHeading;

  const panel: React.CSSProperties = {
    background: surface,
    border: `1px solid ${line}`,
    borderRadius: brand.radius,
  };
  const label: React.CSSProperties = {
    fontSize: 12,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: muted,
    fontWeight: 500,
    display: "block",
    marginBottom: 8,
  };
  const field: React.CSSProperties = {
    width: "100%",
    minHeight: 44,
    padding: "10px 12px",
    background: bg,
    color: ink,
    border: `1px solid ${lineStrong}`,
    borderRadius: brand.radius,
    fontSize: 14,
    fontFamily: brand.fontBody,
  };
  const btnPrimary: React.CSSProperties = {
    background: accent,
    color: bg,
    border: `1px solid ${accent}`,
    borderRadius: brand.radius,
    minHeight: 44,
    padding: "0 20px",
    fontWeight: 600,
    fontSize: 14,
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    cursor: "pointer",
  };
  const btnGhost: React.CSSProperties = {
    background: "transparent",
    color: ink,
    border: `1px solid ${lineStrong}`,
    borderRadius: brand.radius,
    minHeight: 44,
    padding: "0 16px",
    fontSize: 14,
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    cursor: "pointer",
  };
  const h3: React.CSSProperties = {
    fontFamily: serif,
    fontSize: 20,
    fontWeight: 600,
    color: ink,
    margin: 0,
  };

  const err = (msg: string, id: string) => (
    <p
      id={id}
      role="alert"
      style={{ color: ink, fontSize: 13, marginTop: 8, display: "flex", gap: 8 }}
    >
      <Icons.AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
      <span>{msg}</span>
    </p>
  );

  const q = query.trim().toLowerCase();
  const now = today();
  const visible = meetings
    .filter((r) =>
      tab === "all" ? true : tab === "upcoming" ? r.meeting_date >= now : r.meeting_date < now,
    )
    .filter((r) => !q || (r.counterpart?.full_name ?? "").toLowerCase().includes(q))
    .sort((a, b) =>
      tab === "upcoming"
        ? a.meeting_date.localeCompare(b.meeting_date)
        : b.meeting_date.localeCompare(a.meeting_date),
    );

  const myOverdue = myOpen.filter(isOverdue).length;
  const nextOne = meetings
    .filter((r) => r.meeting_date >= now)
    .sort((a, b) => a.meeting_date.localeCompare(b.meeting_date))[0];

  const select = (id: string) => {
    setSelectedId(id);
    setTimeout(() => headingRef.current?.focus({ preventScroll: true }), 0);
  };

  /* ---- talking points (local; wiring is a separate packet) ---- */
  const addPoint = (event: React.FormEvent) => {
    event.preventDefault();
    if (!tpDraft.trim()) {
      setTpError("Write the talking point before adding it.");
      return;
    }
    setTpError("");
    setPoints((ps) => [
      ...ps,
      {
        id: `local-${Date.now()}`,
        author: { id: meId, full_name: user?.full_name ?? "" },
        body: tpDraft.trim(),
        discussed: false,
      },
    ]);
    setTpDraft("");
  };
  const movePoint = (id: string, dir: number) =>
    setPoints((ps) => {
      const next = [...ps];
      const i = next.findIndex((p) => p.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= next.length) return ps;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  const toggleDiscussed = (id: string) =>
    setPoints((ps) => ps.map((p) => (p.id === id ? { ...p, discussed: !p.discussed } : p)));

  /* ---- action items ---- */
  const submitItem = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!detail) return;
    setAiErrors({});
    setItemError("");
    try {
      const saved = await addItem.mutateAsync({
        id: detail.id,
        input: { description: aiDesc, owner_id: aiOwner, due_date: aiDue },
      });
      setAiDesc("");
      setAiDue("");
      setLive(`Action item added for ${saved.owner?.full_name ?? "the owner"}.`);
    } catch (error) {
      if (error instanceof FieldErrors) {
        setAiErrors(error.errors);
        setItemError("");
      } else if (error instanceof ApiError && error.status === 403) {
        setItemError("You cannot add action items to this 1:1.");
      } else {
        setItemError(
          error instanceof Error && error.message
            ? error.message
            : "That action item could not be saved.",
        );
      }
    }
  };

  const markComplete = async (item: ActionItem) => {
    setItemError("");
    try {
      await completeItem.mutateAsync(item.id);
      setLive("Action item marked complete.");
    } catch (error) {
      setItemError(
        error instanceof Error && error.message
          ? error.message
          : "That action item could not be marked complete.",
      );
    }
  };

  const itemStatus = (it: ActionItem) => {
    if (it.completed_at)
      return (
        <span
          style={{
            display: "inline-flex",
            gap: 6,
            alignItems: "center",
            color: accent,
            fontSize: 13,
          }}
        >
          <Icons.CheckCircle className="w-4 h-4" aria-hidden="true" />
          {`Completed ${fmt(it.completed_at.slice(0, 10))}`}
          {it.completed_by ? ` by ${it.completed_by.full_name}` : ""}
        </span>
      );
    if (isOverdue(it))
      return (
        <span
          style={{
            display: "inline-flex",
            gap: 6,
            alignItems: "center",
            fontSize: 13,
            fontWeight: 600,
            color: ink,
            border: `1px solid ${ink}`,
            borderRadius: brand.radius,
            padding: "2px 8px",
          }}
        >
          <Icons.AlertCircle className="w-4 h-4" aria-hidden="true" />
          Overdue · was due {fmtShort(it.due_date)}
        </span>
      );
    return (
      <span
        style={{ display: "inline-flex", gap: 6, alignItems: "center", color: muted, fontSize: 13 }}
      >
        <Icons.Clock className="w-4 h-4" aria-hidden="true" />
        Open · due {fmtShort(it.due_date)}
      </span>
    );
  };

  const itemRow = (it: ActionItem, opts: { carried?: boolean } = {}) => (
    <li
      key={it.id}
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 12,
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 0",
        borderTop: `1px solid ${line}`,
      }}
    >
      <div style={{ flex: "1 1 260px", minWidth: 0 }}>
        <p
          style={{
            margin: 0,
            fontSize: 15,
            color: ink,
            textDecoration: it.completed_at ? "line-through" : "none",
          }}
        >
          {it.description}
        </p>
        <p style={{ margin: "6px 0 0", fontSize: 13, color: muted }}>
          Owner:{" "}
          <span style={{ color: ink }}>
            {it.owner?.id === meId ? "You" : (it.owner?.full_name ?? "—")}
          </span>
          {opts.carried && it.meeting_date ? (
            <span> · from the {fmtShort(it.meeting_date)} 1:1</span>
          ) : null}
        </p>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
        {itemStatus(it)}
        {!it.completed_at && it.owner?.id === meId ? (
          <button
            type="button"
            className="oo-ghost"
            style={btnGhost}
            onClick={() => markComplete(it)}
            aria-label={`Mark complete: ${it.description}`}
          >
            <Icons.Check className="w-4 h-4" aria-hidden="true" />
            Mark complete
          </button>
        ) : null}
        {!it.completed_at && it.owner && it.owner.id !== meId ? (
          <span style={{ fontSize: 13, color: muted }}>
            Waiting on {firstName(it.owner.full_name)}
          </span>
        ) : null}
      </div>
    </li>
  );

  /* ---- private note ---- */
  const submitNote = async () => {
    if (!detail) return;
    setNoteError("");
    try {
      await saveNote.mutateAsync({ id: detail.id, body: noteDraft });
      setNoteSaved(true);
      setLive("Private note saved.");
    } catch (error) {
      setNoteSaved(false);
      if (error instanceof FieldErrors)
        setNoteError(error.errors.body ?? Object.values(error.errors)[0]);
      else
        setNoteError(
          error instanceof Error && error.message ? error.message : "That note could not be saved.",
        );
    }
  };

  const other = detail?.counterpart ?? null;
  const otherFirst = firstName(other?.full_name);

  const summaryLine = (r: OneOnOneSummary) => {
    const open = r.open_action_item_count ?? 0;
    const od = r.overdue_action_item_count ?? 0;
    return (
      <span style={{ display: "block", fontSize: 13, color: muted, marginTop: 6 }}>
        {open} open {open === 1 ? "action" : "actions"}
        {od > 0 ? <span style={{ color: ink, fontWeight: 600 }}> · {od} overdue</span> : null}
      </span>
    );
  };

  return (
    <div
      className="oo"
      style={{ color: ink, fontFamily: brand.fontBody, fontVariantNumeric: "tabular-nums" }}
    >
      <style>{`
        .oo button:focus-visible, .oo input:focus-visible, .oo select:focus-visible, .oo textarea:focus-visible { outline: 2px solid ${accent}; outline-offset: 2px; }
        .oo .oo-ghost:hover { background: ${surfaceUp} !important; }
        .oo .oo-row:hover { background: ${surfaceUp}; }
        .oo input[type=date] { color-scheme: dark; }
        .oo-grid { display: grid; grid-template-columns: minmax(0, 1fr); gap: 32px; }
        @media (min-width: 1024px) { .oo-grid { grid-template-columns: 22rem minmax(0, 1fr); } }
        .oo-ico { min-width: 36px; min-height: 36px; display: inline-flex; align-items: center; justify-content: center; background: transparent; border: 1px solid ${line}; border-radius: ${brand.radius}; color: ${ink}; cursor: pointer; }
      `}</style>

      <div
        aria-live="polite"
        role="status"
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          overflow: "hidden",
          clip: "rect(0 0 0 0)",
        }}
      >
        {live}
      </div>

      <header style={{ paddingBottom: 24, borderBottom: `1px solid ${line}` }}>
        <p style={{ ...label, color: accent, marginBottom: 12 }}>Conversations</p>
        <h1
          style={{ fontFamily: serif, fontSize: 40, lineHeight: 1.15, fontWeight: 700, margin: 0 }}
        >
          1:1 check-ins
        </h1>
        <p style={{ margin: "12px 0 0", color: muted, fontSize: 15, lineHeight: 1.6 }}>
          One shared record per conversation: the agenda you both build, what you agreed to do, and
          what was left open last time.
        </p>
        <dl style={{ display: "flex", flexWrap: "wrap", gap: 32, margin: "24px 0 0" }}>
          <div>
            <dt style={{ ...label, marginBottom: 4 }}>Next 1:1</dt>
            <dd style={{ margin: 0, fontFamily: serif, fontSize: 20, color: accent }}>
              {nextOne
                ? `${fmtDay(nextOne.meeting_date)} · ${firstName(nextOne.counterpart?.full_name)}`
                : "Nothing scheduled"}
            </dd>
          </div>
          <div>
            <dt style={{ ...label, marginBottom: 4 }}>Your open actions</dt>
            <dd style={{ margin: 0, fontFamily: serif, fontSize: 20, color: accent }}>
              {myOpen.length}
            </dd>
          </div>
          <div>
            <dt style={{ ...label, marginBottom: 4 }}>Overdue</dt>
            <dd
              style={{ margin: 0, fontFamily: serif, fontSize: 20, color: myOverdue ? ink : muted }}
            >
              {myOverdue}
            </dd>
          </div>
        </dl>
      </header>

      {myOpen.length > 0 ? (
        <section
          aria-label="Your open action items"
          style={{ ...panel, padding: 24, marginTop: 24 }}
        >
          <h3 style={h3}>Your open action items</h3>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {myOpen.map((it) => itemRow(it, { carried: true }))}
          </ul>
        </section>
      ) : null}

      <div className="oo-grid" style={{ marginTop: 32 }}>
        <section aria-label="Your 1:1s" style={{ minWidth: 0 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {[
              ["upcoming", "Upcoming"],
              ["past", "Past"],
              ["all", "All"],
            ].map(([k, l]) => (
              <button
                key={k}
                type="button"
                aria-pressed={tab === k}
                onClick={() => setTab(k)}
                style={{
                  flex: 1,
                  minHeight: 40,
                  fontSize: 14,
                  borderRadius: brand.radius,
                  cursor: "pointer",
                  border: "1px solid transparent",
                  background: tab === k ? accent : "transparent",
                  color: tab === k ? bg : ink,
                  fontWeight: tab === k ? 600 : 400,
                }}
              >
                {l}
              </button>
            ))}
          </div>
          <div style={{ marginBottom: 16 }}>
            <label htmlFor="oo-search" style={label}>
              Search by person
            </label>
            <input
              id="oo-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={field}
            />
          </div>

          {list.isLoading ? (
            <p role="status" style={{ color: muted }}>
              Loading your 1:1s…
            </p>
          ) : list.isError ? (
            <p role="alert" style={{ color: ink }}>
              Your 1:1s could not be loaded. Try again.
            </p>
          ) : visible.length === 0 ? (
            <div style={{ ...panel, padding: 24 }}>
              <p style={{ fontFamily: serif, fontSize: 18, margin: 0 }}>
                {tab === "upcoming" ? "Nothing on the calendar" : "No 1:1s to show"}
              </p>
              <p style={{ color: muted, fontSize: 14, margin: "8px 0 0", lineHeight: 1.6 }}>
                1:1s you hold with your manager or your direct reports are listed here.
              </p>
            </div>
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {visible.map((r) => (
                <li key={r.id} style={{ borderTop: `1px solid ${line}` }}>
                  <button
                    type="button"
                    className="oo-row"
                    onClick={() => select(r.id)}
                    aria-current={r.id === selectedId ? "true" : undefined}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      background: r.id === selectedId ? surfaceUp : "transparent",
                      border: 0,
                      color: ink,
                      padding: "16px 12px",
                      cursor: "pointer",
                    }}
                  >
                    <span style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                      <span style={{ fontWeight: 600, fontSize: 15 }}>
                        {r.counterpart?.full_name}
                      </span>
                      <span
                        style={{
                          fontSize: 13,
                          color: r.meeting_date >= now ? accent : muted,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {fmtShort(r.meeting_date)}
                      </span>
                    </span>
                    {summaryLine(r)}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-label="1:1 record" style={{ minWidth: 0 }}>
          {!selectedId ? (
            <div style={{ ...panel, padding: 48 }}>
              <p style={{ fontFamily: serif, fontSize: 24, margin: 0 }}>
                Pick a 1:1 to open its record
              </p>
              <p style={{ color: muted, margin: "12px 0 0", lineHeight: 1.6, maxWidth: 480 }}>
                The agenda, action items and anything carried over from last time appear here.
              </p>
            </div>
          ) : detailQuery.isLoading ? (
            <p role="status" style={{ color: muted }}>
              Loading this 1:1…
            </p>
          ) : detailQuery.isError || !detail ? (
            <p role="alert" style={{ color: ink }}>
              This 1:1 could not be loaded. Try again.
            </p>
          ) : (
            <div style={{ display: "grid", gap: 24 }}>
              <div style={{ ...panel, padding: 24 }}>
                <h2
                  ref={headingRef}
                  tabIndex={-1}
                  style={{
                    fontFamily: serif,
                    fontSize: 28,
                    fontWeight: 700,
                    margin: 0,
                    outline: "none",
                  }}
                >
                  1:1 with {other?.full_name}
                </h2>
                <p style={{ margin: "8px 0 0", color: muted, fontSize: 14 }}>
                  {mgr ? `You manage ${otherFirst}` : `${otherFirst} is your manager`} ·{" "}
                  {fmtDay(detail.meeting_date)}
                </p>
              </div>

              {/* Carried over from earlier 1:1s with the same person */}
              <div style={{ ...panel, padding: 24 }}>
                <h3 style={h3}>Carried over from earlier 1:1s</h3>
                {(detail.carry_over ?? []).length === 0 ? (
                  <p style={{ margin: "8px 0 0", color: muted, fontSize: 14, lineHeight: 1.6 }}>
                    Nothing is still open from your previous conversations with {otherFirst}.
                  </p>
                ) : (
                  <>
                    <p style={{ margin: "4px 0 16px", color: muted, fontSize: 14 }}>
                      Still open from your previous conversations with {otherFirst}. Settle these
                      first.
                    </p>
                    <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                      {detail.carry_over.map((it) => itemRow(it, { carried: true }))}
                    </ul>
                  </>
                )}
              </div>

              {/* Agenda */}
              <div style={{ ...panel, padding: 24 }}>
                <h3 style={h3}>Shared agenda</h3>
                {points.length === 0 ? (
                  <p style={{ margin: "8px 0 0", color: muted, fontSize: 14, lineHeight: 1.6 }}>
                    The agenda is blank. Add the first thing you want to cover.
                  </p>
                ) : (
                  <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
                    {points.map((p, i) => (
                      <li
                        key={p.id}
                        style={{
                          display: "flex",
                          gap: 16,
                          padding: "16px 0",
                          borderTop: `1px solid ${line}`,
                          alignItems: "flex-start",
                        }}
                      >
                        <div style={{ flex: "1 1 auto", minWidth: 0 }}>
                          <p style={{ margin: 0, fontSize: 15 }}>{p.body}</p>
                          <p style={{ margin: "6px 0 0", fontSize: 13, color: muted }}>
                            {p.author?.id === meId ? "You" : (p.author?.full_name ?? "—")}
                            {p.discussed ? " · Discussed" : ""}
                          </p>
                        </div>
                        <button
                          type="button"
                          className="oo-ico"
                          aria-label={`Move up: ${p.body}`}
                          disabled={i === 0}
                          onClick={() => movePoint(p.id, -1)}
                        >
                          <Icons.ChevronRight className="w-4 h-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className="oo-ico"
                          aria-label={`Move down: ${p.body}`}
                          disabled={i === points.length - 1}
                          onClick={() => movePoint(p.id, 1)}
                        >
                          <Icons.ChevronDown className="w-4 h-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className="oo-ico"
                          aria-label={`Mark discussed: ${p.body}`}
                          onClick={() => toggleDiscussed(p.id)}
                        >
                          <Icons.Check className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </li>
                    ))}
                  </ol>
                )}
                <form
                  onSubmit={addPoint}
                  noValidate
                  style={{ borderTop: `1px solid ${line}`, paddingTop: 16, marginTop: 16 }}
                >
                  <label htmlFor="tp-new" style={label}>
                    Add a talking point
                  </label>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <input
                      id="tp-new"
                      type="text"
                      value={tpDraft}
                      onChange={(e) => setTpDraft(e.target.value)}
                      style={{ ...field, flex: "1 1 260px", width: "auto" }}
                      aria-invalid={tpError ? true : undefined}
                      aria-describedby={tpError ? "tp-err" : undefined}
                    />
                    <button type="submit" style={btnPrimary}>
                      <Icons.Plus className="w-4 h-4" aria-hidden="true" />
                      Add to agenda
                    </button>
                  </div>
                  {tpError ? err(tpError, "tp-err") : null}
                </form>
              </div>

              {/* Action items */}
              <div style={{ ...panel, padding: 24 }}>
                <h3 style={h3}>Action items</h3>
                <p style={{ margin: "4px 0 16px", color: muted, fontSize: 14 }}>
                  What the two of you agreed to do. Each item has one owner and a due date.
                </p>
                {(detail.action_items ?? []).length === 0 ? (
                  <div style={{ borderTop: `1px solid ${line}`, padding: "24px 0" }}>
                    <p style={{ fontFamily: serif, fontSize: 18, margin: 0 }}>
                      No action items yet
                    </p>
                    <p style={{ color: muted, fontSize: 14, margin: "8px 0 0", lineHeight: 1.6 }}>
                      Record what you agreed to do, who owns it and when it is due. It will show in
                      the owner’s open items.
                    </p>
                  </div>
                ) : (
                  <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                    {detail.action_items.map((it) => itemRow(it))}
                  </ul>
                )}
                {itemError ? err(itemError, "ai-err") : null}
                <form
                  onSubmit={submitItem}
                  noValidate
                  style={{ borderTop: `1px solid ${line}`, paddingTop: 16 }}
                >
                  <p style={{ ...label, marginBottom: 12 }}>Add an action item</p>
                  <div
                    style={{
                      display: "grid",
                      gap: 16,
                      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    }}
                  >
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label htmlFor="ai-desc" style={label}>
                        Description
                      </label>
                      <input
                        id="ai-desc"
                        type="text"
                        value={aiDesc}
                        onChange={(e) => setAiDesc(e.target.value)}
                        style={field}
                        aria-invalid={aiErrors.description ? true : undefined}
                        aria-describedby={aiErrors.description ? "ai-desc-err" : undefined}
                      />
                      {aiErrors.description ? err(aiErrors.description, "ai-desc-err") : null}
                    </div>
                    <div>
                      <label htmlFor="ai-owner" style={label}>
                        Owner
                      </label>
                      <select
                        id="ai-owner"
                        value={aiOwner}
                        onChange={(e) => setAiOwner(e.target.value)}
                        style={field}
                        aria-invalid={aiErrors.owner_id ? true : undefined}
                        aria-describedby={aiErrors.owner_id ? "ai-owner-err" : undefined}
                      >
                        <option value={meId}>You ({firstName(user?.full_name)})</option>
                        {other ? <option value={other.id}>{other.full_name}</option> : null}
                      </select>
                      {aiErrors.owner_id ? err(aiErrors.owner_id, "ai-owner-err") : null}
                    </div>
                    <div>
                      <label htmlFor="ai-due" style={label}>
                        Due date
                      </label>
                      <input
                        id="ai-due"
                        type="date"
                        value={aiDue}
                        onChange={(e) => setAiDue(e.target.value)}
                        style={field}
                        aria-invalid={aiErrors.due_date ? true : undefined}
                        aria-describedby={aiErrors.due_date ? "ai-due-err" : undefined}
                      />
                      {aiErrors.due_date ? err(aiErrors.due_date, "ai-due-err") : null}
                    </div>
                  </div>
                  <div style={{ marginTop: 16 }}>
                    <button type="submit" style={btnPrimary} disabled={addItem.isPending}>
                      <Icons.Plus className="w-4 h-4" aria-hidden="true" />
                      Add action item
                    </button>
                  </div>
                </form>
              </div>

              {/* Private notes: manager only, never rendered for the report (NFR-007) */}
              {mgr ? (
                <div style={{ ...panel, padding: 24, borderColor: lineStrong }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <h3 style={h3}>Private notes</h3>
                  </div>
                  <p
                    id="oo-note-readers"
                    style={{ margin: "8px 0 16px", color: muted, fontSize: 14, lineHeight: 1.6 }}
                  >
                    {`Only you can read this note. ${otherFirst} cannot see it anywhere in the product.`}
                    {hrCanRead === undefined
                      ? ""
                      : hrCanRead
                        ? " HR Admins can read private notes."
                        : " HR Admins cannot read private notes."}
                  </p>
                  <label htmlFor="oo-note" style={label}>
                    Your observations
                  </label>
                  <textarea
                    id="oo-note"
                    rows={4}
                    value={noteDraft}
                    onChange={(e) => {
                      setNoteDraft(e.target.value);
                      setNoteSaved(false);
                    }}
                    style={{ ...field, resize: "vertical", lineHeight: 1.5 }}
                    aria-describedby={noteError ? "oo-note-err" : "oo-note-readers"}
                    aria-invalid={noteError ? true : undefined}
                  />
                  <div
                    style={{
                      display: "flex",
                      gap: 16,
                      alignItems: "center",
                      marginTop: 16,
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      type="button"
                      className="oo-ghost"
                      style={btnGhost}
                      onClick={submitNote}
                      disabled={saveNote.isPending}
                    >
                      Save private note
                    </button>
                    {noteSaved ? (
                      <span
                        style={{
                          display: "inline-flex",
                          gap: 6,
                          alignItems: "center",
                          fontSize: 13,
                          color: accent,
                        }}
                      >
                        <Icons.CheckCircle className="w-4 h-4" aria-hidden="true" />
                        Saved
                      </span>
                    ) : null}
                  </div>
                  {noteError ? err(noteError, "oo-note-err") : null}
                </div>
              ) : null}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
