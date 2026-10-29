// @ts-nocheck -- generated from the approved design under its JS runtime contract; not hand-written TypeScript.
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";

import * as UI from "@/lib/ui";
import { Icons } from "@/lib/icons";
import { brand } from "@/lib/brand";
import { formatDate } from "@/lib/dateFormat";

const { Select } = UI;

const { Search, Check, Edit, Filter } = Icons;

const TODAY = "2026-10-29";
const ME_ID = "e1";
const HR_CAN_READ_PRIVATE_NOTES = false;

const PEOPLE = {
  e1: { id: "e1", name: "Amara Okafor", title: "Engineering Manager" },
  e2: { id: "e2", name: "Tomás Reyes", title: "Senior Engineer" },
  e3: { id: "e3", name: "Priya Raman", title: "Software Engineer" },
  e4: { id: "e4", name: "Jonas Lindqvist", title: "QA Lead" },
  e5: { id: "e5", name: "Daniel Whitcombe", title: "VP Engineering" },
};
const MY_MANAGER = "e5";
const MY_REPORTS = ["e2", "e3", "e4"];

const SEED = [
  {
    id: "r1",
    ref: "OO-0148",
    managerId: "e1",
    reportId: "e2",
    date: "2026-11-03",
    updatedAt: "2026-10-28",
    points: [
      {
        id: "p1",
        authorId: "e2",
        body: "Walk through the Q4 goal weightings. I think the platform goal is overweighted.",
        discussed: false,
      },
      { id: "p2", authorId: "e1", body: "Migration RFC: where are you blocked?", discussed: false },
      {
        id: "p3",
        authorId: "e2",
        body: "Conference talk proposal for the March meetup",
        discussed: false,
      },
    ],
    items: [],
    note: "Tomás is stretched across two workstreams. Ask about capacity before suggesting the talk.",
  },
  {
    id: "r2",
    ref: "OO-0139",
    managerId: "e1",
    reportId: "e2",
    date: "2026-10-13",
    updatedAt: "2026-10-13",
    points: [
      {
        id: "p4",
        authorId: "e1",
        body: "On-call rotation change: how is it landing?",
        discussed: true,
      },
      {
        id: "p5",
        authorId: "e2",
        body: "Benchmarking write-up for the search service",
        discussed: true,
      },
    ],
    items: [
      {
        id: "i1",
        ownerId: "e2",
        description: "Draft the migration RFC and share it with the platform group",
        due: "2026-10-24",
        completedAt: null,
        completedBy: null,
      },
      {
        id: "i2",
        ownerId: "e1",
        description: "Book a shadow day with the SRE on-call team",
        due: "2026-10-30",
        completedAt: null,
        completedBy: null,
      },
      {
        id: "i3",
        ownerId: "e2",
        description: "Send Amara the benchmarking write-up",
        due: "2026-10-16",
        completedAt: "2026-10-15",
        completedBy: "e2",
      },
    ],
    note: "Confidence is up since the on-call rotation change.",
  },
  {
    id: "r3",
    ref: "OO-0151",
    managerId: "e1",
    reportId: "e3",
    date: "2026-10-30",
    updatedAt: "2026-10-29",
    points: [
      {
        id: "p6",
        authorId: "e3",
        body: "Pairing sessions with Jonas on test coverage",
        discussed: false,
      },
      {
        id: "p7",
        authorId: "e1",
        body: "Feedback on the onboarding doc you wrote",
        discussed: false,
      },
    ],
    items: [],
    note: "",
  },
  {
    id: "r4",
    ref: "OO-0144",
    managerId: "e1",
    reportId: "e3",
    date: "2026-10-16",
    updatedAt: "2026-10-16",
    points: [
      { id: "p8", authorId: "e3", body: "Scope of the notifications rewrite", discussed: true },
    ],
    items: [
      {
        id: "i4",
        ownerId: "e3",
        description: "Add integration tests for the notifications service",
        due: "2026-10-23",
        completedAt: "2026-10-22",
        completedBy: "e3",
      },
      {
        id: "i5",
        ownerId: "e1",
        description: "Introduce Priya to the design systems lead",
        due: "2026-10-31",
        completedAt: null,
        completedBy: null,
      },
    ],
    note: "Priya is ready for larger scope. Revisit when goals are reset in January.",
  },
  {
    id: "r5",
    ref: "OO-0141",
    managerId: "e1",
    reportId: "e4",
    date: "2026-10-22",
    updatedAt: "2026-10-22",
    points: [
      { id: "p9", authorId: "e4", body: "Release freeze dates for November", discussed: true },
      { id: "p10", authorId: "e1", body: "Hiring a second QA engineer", discussed: true },
    ],
    items: [
      {
        id: "i6",
        ownerId: "e4",
        description: "Propose a regression test schedule for the November release",
        due: "2026-10-28",
        completedAt: null,
        completedBy: null,
      },
    ],
    note: "Jonas wants a title conversation. Not urgent, but do not let it drift.",
  },
  {
    id: "r6",
    ref: "OO-0152",
    managerId: "e5",
    reportId: "e1",
    date: "2026-11-05",
    updatedAt: "2026-10-27",
    points: [
      {
        id: "p11",
        authorId: "e1",
        body: "Q1 headcount: one backend hire or one QA engineer?",
        discussed: false,
      },
      { id: "p12", authorId: "e5", body: "Your development goals for next year", discussed: false },
    ],
    items: [],
    note: "",
  },
  {
    id: "r7",
    ref: "OO-0136",
    managerId: "e5",
    reportId: "e1",
    date: "2026-10-08",
    updatedAt: "2026-10-08",
    points: [{ id: "p13", authorId: "e1", body: "Team goal weightings for Q4", discussed: true }],
    items: [
      {
        id: "i7",
        ownerId: "e1",
        description: "Send Daniel the revised team goal weightings",
        due: "2026-10-15",
        completedAt: "2026-10-14",
        completedBy: "e1",
      },
      {
        id: "i8",
        ownerId: "e5",
        description: "Confirm the Q1 headcount envelope with Finance",
        due: "2026-11-06",
        completedAt: null,
        completedBy: null,
      },
    ],
    note: "",
  },
];

const fmt = (iso) =>
  formatDate(iso, { day: "numeric", month: "short", year: "numeric" });
const fmtShort = (iso) => formatDate(iso, { day: "numeric", month: "short" });
const fmtDay = (iso) =>
  formatDate(iso, { weekday: "short", day: "numeric", month: "short" });
const first = (id) => PEOPLE[id].name.split(" ")[0];
const initials = (id) =>
  PEOPLE[id].name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
const isOverdue = (it) => !it.completedAt && it.due < TODAY;

export default function Screen() {
  const [records, setRecords] = React.useState(SEED);
  const [selectedId, setSelectedId] = React.useState("r3");
  const [tab, setTab] = React.useState("upcoming");
  const [query, setQuery] = React.useState("");
  const [showNew, setShowNew] = React.useState(false);
  const [newPerson, setNewPerson] = React.useState("");
  const [newDate, setNewDate] = React.useState("");
  const [newErrors, setNewErrors] = React.useState({});
  const [dateDraft, setDateDraft] = React.useState("");
  const [dateError, setDateError] = React.useState("");
  const [tpDraft, setTpDraft] = React.useState("");
  const [tpError, setTpError] = React.useState("");
  const [editingTp, setEditingTp] = React.useState(null);
  const [editText, setEditText] = React.useState("");
  const [confirmTp, setConfirmTp] = React.useState(null);
  const [aiDesc, setAiDesc] = React.useState("");
  const [aiOwner, setAiOwner] = React.useState(ME_ID);
  const [aiDue, setAiDue] = React.useState("");
  const [aiErrors, setAiErrors] = React.useState({});
  const [noteDraft, setNoteDraft] = React.useState("");
  const [noteSavedAt, setNoteSavedAt] = React.useState(null);
  const [live, setLive] = React.useState("");
  const [newId, setNewId] = React.useState(null);
  const headingRef = React.useRef(null);
  const newSelectRef = React.useRef(null);

  const selected = records.find((r) => r.id === selectedId) || null;

  React.useEffect(() => {
    if (!selected) return;
    setDateDraft(selected.date);
    setDateError("");
    setTpDraft("");
    setTpError("");
    setEditingTp(null);
    setConfirmTp(null);
    setAiDesc("");
    setAiDue("");
    setAiErrors({});
    setAiOwner(ME_ID);
    setNoteDraft(selected.note);
    setNoteSavedAt(null);
  }, [selectedId]);

  React.useEffect(() => {
    if (showNew && newSelectRef.current) newSelectRef.current.focus();
  }, [showNew]);

  const bg = brand.backgroundColor;
  const ink = brand.primaryColor;
  const muted = brand.neutralColor;
  const accent = brand.accentColor;
  const surface = `color-mix(in srgb, ${ink} 4%, ${bg})`;
  const surfaceUp = `color-mix(in srgb, ${ink} 8%, ${bg})`;
  const line = `color-mix(in srgb, ${ink} 12%, transparent)`;
  const lineStrong = `color-mix(in srgb, ${ink} 28%, transparent)`;
  const serif = brand.fontHeading;

  const panel = { background: surface, border: `1px solid ${line}`, borderRadius: brand.radius };
  const label = {
    fontSize: 12,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: muted,
    fontWeight: 500,
    display: "block",
    marginBottom: 8,
  };
  const field = {
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
  const btnPrimary = {
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
  const btnGhost = {
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
  const errText = {
    color: ink,
    fontSize: 13,
    marginTop: 8,
    display: "flex",
    gap: 8,
    alignItems: "flex-start",
  };
  const h3 = { fontFamily: serif, fontSize: 20, fontWeight: 600, color: ink, margin: 0 };

  const otherOf = (r) => (r.managerId === ME_ID ? r.reportId : r.managerId);
  const iAmManager = (r) => r.managerId === ME_ID;
  const update = (id, fn) =>
    setRecords((rs) => rs.map((r) => (r.id === id ? { ...fn(r), updatedAt: TODAY } : r)));

  const err = (msg, id) => (
    <p id={id} role="alert" style={errText}>
      <Icons.AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
      <span>{msg}</span>
    </p>
  );

  // ---- derived list
  const q = query.trim().toLowerCase();
  const visible = records
    .filter((r) => (tab === "all" ? true : tab === "upcoming" ? r.date >= TODAY : r.date < TODAY))
    .filter((r) => !q || PEOPLE[otherOf(r)].name.toLowerCase().includes(q))
    .sort((a, b) =>
      tab === "upcoming" ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date),
    );

  const myOpen = records.flatMap((r) =>
    r.items.filter((i) => i.ownerId === ME_ID && !i.completedAt),
  );
  const myOverdue = myOpen.filter(isOverdue).length;
  const nextOne = records
    .filter((r) => r.date >= TODAY)
    .sort((a, b) => a.date.localeCompare(b.date))[0];

  // ---- actions
  const select = (id) => {
    setSelectedId(id);
    setTimeout(() => {
      if (headingRef.current) {
        headingRef.current.focus({ preventScroll: window.innerWidth >= 1024 });
        if (window.innerWidth < 1024) headingRef.current.scrollIntoView();
      }
    }, 0);
  };

  const createOneOnOne = (e) => {
    e.preventDefault();
    const errs = {};
    if (!newPerson) errs.person = "Choose your manager or one of your direct reports.";
    if (!newDate) errs.date = "Pick the date of the 1:1.";
    if (newPerson && newDate) {
      const dup = records.find((r) => otherOf(r) === newPerson && r.date === newDate);
      if (dup)
        errs.date = `You already have a 1:1 with ${first(newPerson)} on ${fmt(newDate)} (${dup.ref}).`;
    }
    setNewErrors(errs);
    if (Object.keys(errs).length) return;
    const isMgr = MY_REPORTS.includes(newPerson);
    const n = 153 + records.filter((r) => /^r\d+$/.test(r.id) && Number(r.id.slice(1)) > 7).length;
    const id = "r" + (100 + n);
    const rec = {
      id,
      ref: "OO-0" + n,
      managerId: isMgr ? ME_ID : newPerson,
      reportId: isMgr ? newPerson : ME_ID,
      date: newDate,
      updatedAt: TODAY,
      points: [],
      items: [],
      note: "",
    };
    setRecords((rs) => [...rs, rec]);
    setNewId(id);
    setTab(newDate >= TODAY ? "upcoming" : "past");
    setQuery("");
    setShowNew(false);
    setNewPerson("");
    setNewDate("");
    setNewErrors({});
    setLive(`1:1 with ${PEOPLE[newPerson].name} on ${fmt(newDate)} created.`);
    select(id);
  };

  const saveDate = () => {
    if (!dateDraft) {
      setDateError("Pick a date for this 1:1.");
      return;
    }
    setDateError("");
    update(selected.id, (r) => ({ ...r, date: dateDraft }));
    setLive(`1:1 moved to ${fmt(dateDraft)}. ${PEOPLE[otherOf(selected)].name} sees the new date.`);
  };

  const addPoint = (e) => {
    e.preventDefault();
    if (!tpDraft.trim()) {
      setTpError("Write the talking point before adding it.");
      return;
    }
    setTpError("");
    update(selected.id, (r) => ({
      ...r,
      points: [
        ...r.points,
        { id: "p" + Date.now(), authorId: ME_ID, body: tpDraft.trim(), discussed: false },
      ],
    }));
    setTpDraft("");
    setLive(`Talking point added. ${first(otherOf(selected))} can see it now.`);
  };
  const savePointEdit = (pid) => {
    if (!editText.trim()) return;
    update(selected.id, (r) => ({
      ...r,
      points: r.points.map((p) => (p.id === pid ? { ...p, body: editText.trim() } : p)),
    }));
    setEditingTp(null);
    setLive("Talking point updated.");
  };
  const movePoint = (pid, dir) => {
    update(selected.id, (r) => {
      const pts = [...r.points];
      const i = pts.findIndex((p) => p.id === pid);
      const j = i + dir;
      if (j < 0 || j >= pts.length) return r;
      [pts[i], pts[j]] = [pts[j], pts[i]];
      return { ...r, points: pts };
    });
    setLive("Talking point moved.");
  };
  const deletePoint = (pid) => {
    update(selected.id, (r) => ({ ...r, points: r.points.filter((p) => p.id !== pid) }));
    setConfirmTp(null);
    setLive("Talking point deleted.");
  };
  const toggleDiscussed = (pid) => {
    update(selected.id, (r) => ({
      ...r,
      points: r.points.map((p) => (p.id === pid ? { ...p, discussed: !p.discussed } : p)),
    }));
  };

  const addItem = (e) => {
    e.preventDefault();
    const errs = {};
    if (!aiDesc.trim()) errs.desc = "Describe what needs to happen.";
    if (!aiDue) errs.due = "Set a due date.";
    setAiErrors(errs);
    if (Object.keys(errs).length) return;
    update(selected.id, (r) => ({
      ...r,
      items: [
        ...r.items,
        {
          id: "i" + Date.now(),
          ownerId: aiOwner,
          description: aiDesc.trim(),
          due: aiDue,
          completedAt: null,
          completedBy: null,
        },
      ],
    }));
    setLive(`Action item added for ${first(aiOwner)}.`);
    setAiDesc("");
    setAiDue("");
  };
  const completeItem = (recId, itemId) => {
    update(recId, (r) => ({
      ...r,
      items: r.items.map((i) =>
        i.id === itemId ? { ...i, completedAt: TODAY, completedBy: ME_ID } : i,
      ),
    }));
    setLive("Action item marked complete.");
  };
  const saveNote = () => {
    update(selected.id, (r) => ({ ...r, note: noteDraft }));
    setNoteSavedAt(TODAY);
    setLive("Private note saved. Only you can read it.");
  };

  // ---- render helpers
  const itemStatus = (it) => {
    if (it.completedAt)
      return (
        <span
          style={{
            display: "inline-flex",
            gap: 6,
            alignItems: "center",
            color: muted,
            fontSize: 13,
          }}
        >
          <Icons.CheckCircle className="w-4 h-4" aria-hidden="true" />
          Done {fmtShort(it.completedAt)} by{" "}
          {it.completedBy === ME_ID ? "you" : first(it.completedBy)}
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
          Overdue · was due {fmtShort(it.due)}
        </span>
      );
    return (
      <span
        style={{ display: "inline-flex", gap: 6, alignItems: "center", color: muted, fontSize: 13 }}
      >
        <Icons.Clock className="w-4 h-4" aria-hidden="true" />
        Open · due {fmtShort(it.due)}
      </span>
    );
  };

  const itemRow = (it, recId, opts = {}) => (
    <li
      key={it.id}
      className="oo-enter"
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
            textDecoration: it.completedAt ? "line-through" : "none",
            textDecorationColor: muted,
          }}
        >
          {it.description}
        </p>
        <p style={{ margin: "6px 0 0", fontSize: 13, color: muted }}>
          Owner:{" "}
          <span style={{ color: ink }}>
            {it.ownerId === ME_ID ? "You" : PEOPLE[it.ownerId].name}
          </span>
          {opts.from ? <span> · from the {fmtShort(opts.from)} 1:1</span> : null}
        </p>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
        {itemStatus(it)}
        {!it.completedAt && it.ownerId === ME_ID && (
          <button
            type="button"
            style={btnGhost}
            onClick={() => completeItem(recId, it.id)}
            aria-label={`Mark complete: ${it.description}`}
          >
            <Icons.Check className="w-4 h-4" aria-hidden="true" />
            Mark complete
          </button>
        )}
        {!it.completedAt && it.ownerId !== ME_ID && (
          <span style={{ fontSize: 13, color: muted }}>Waiting on {first(it.ownerId)}</span>
        )}
      </div>
    </li>
  );

  // carry-over
  const carry = selected
    ? records
        .filter(
          (r) => r.id !== selected.id && otherOf(r) === otherOf(selected) && r.date < selected.date,
        )
        .flatMap((r) =>
          r.items
            .filter((i) => !i.completedAt)
            .map((i) => ({ item: i, recId: r.id, from: r.date })),
        )
    : [];

  const other = selected ? otherOf(selected) : null;
  const mgr = selected ? iAmManager(selected) : false;

  return (
    <div
      className="oo"
      style={{ color: ink, fontFamily: brand.fontBody, fontVariantNumeric: "tabular-nums" }}
    >
      <style>{`
        .oo button:focus-visible, .oo input:focus-visible, .oo select:focus-visible, .oo textarea:focus-visible { outline: 2px solid ${accent}; outline-offset: 2px; }
        .oo button { transition: background-color .15s ease, border-color .15s ease, opacity .15s ease; }
        .oo .oo-ghost:hover { background: ${surfaceUp} !important; }
        .oo .oo-primary:hover { opacity: .88; }
        .oo .oo-row:hover { background: ${surfaceUp}; }
        .oo input::placeholder, .oo textarea::placeholder { color: ${muted}; opacity: .8; }
        .oo input[type=date] { color-scheme: dark; }
        .oo-grid { display: grid; grid-template-columns: minmax(0, 1fr); gap: 32px; }
        @media (min-width: 1024px) { .oo-grid { grid-template-columns: 22rem minmax(0, 1fr); } }
        .oo-ico { min-width: 36px; min-height: 36px; display: inline-flex; align-items: center; justify-content: center; background: transparent; border: 1px solid ${line}; border-radius: ${brand.radius}; color: ${ink}; cursor: pointer; }
        .oo-ico:hover { background: ${surfaceUp}; }
        .oo-ico:disabled { opacity: .35; cursor: not-allowed; }
        @media (pointer: coarse) { .oo-ico { min-width: 44px; min-height: 44px; } }
        @keyframes oo-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
        .oo-enter { animation: oo-in .25s ease both; }
        @media (prefers-reduced-motion: reduce) { .oo-enter { animation: none; } .oo button { transition: none; } }
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

      {/* Header */}
      <header
        style={{ paddingBottom: 24, borderBottom: `1px solid ${line}`, position: "relative" }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 24,
            alignItems: "flex-end",
            justifyContent: "space-between",
          }}
        >
          <div style={{ maxWidth: 620 }}>
            <p style={{ ...label, color: accent, marginBottom: 12 }}>Conversations</p>
            <h1
              style={{
                fontFamily: serif,
                fontSize: 40,
                lineHeight: 1.15,
                fontWeight: 700,
                margin: 0,
              }}
            >
              1:1 check-ins
            </h1>
            <p style={{ margin: "12px 0 0", color: muted, fontSize: 15, lineHeight: 1.6 }}>
              One shared record per conversation: the agenda you both build, what you agreed to do,
              and what was left open last time.
            </p>
          </div>
          <button
            type="button"
            className="oo-primary"
            style={btnPrimary}
            onClick={() => setShowNew((v) => !v)}
            aria-expanded={showNew}
            aria-controls="new-one-on-one"
          >
            <Icons.Plus className="w-4 h-4" aria-hidden="true" />
            New 1:1
          </button>
        </div>
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            left: 0,
            bottom: -1,
            width: 64,
            height: 1,
            background: accent,
          }}
        />
        <dl style={{ display: "flex", flexWrap: "wrap", gap: 32, margin: "24px 0 0" }}>
          <div>
            <dt style={{ ...label, marginBottom: 4 }}>Next 1:1</dt>
            <dd style={{ margin: 0, fontFamily: serif, fontSize: 20, color: accent }}>
              {nextOne
                ? `${fmtDay(nextOne.date)} · ${first(otherOf(nextOne))}`
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

      {/* New 1:1 */}
      {showNew && (
        <form
          id="new-one-on-one"
          onSubmit={createOneOnOne}
          noValidate
          className="oo-enter"
          onKeyDown={(e) => {
            if (e.key === "Escape") setShowNew(false);
          }}
          style={{ ...panel, padding: 24, marginTop: 24 }}
          aria-labelledby="new-heading"
        >
          <h2 id="new-heading" style={{ ...h3, marginBottom: 4 }}>
            Set up a 1:1
          </h2>
          <p style={{ margin: "0 0 24px", color: muted, fontSize: 14 }}>
            Only your manager and your direct reports can be chosen.
          </p>
          <div
            style={{
              display: "grid",
              gap: 24,
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            }}
          >
            <div>
              <label htmlFor="new-person" style={label}>
                With
              </label>
              <select
                id="new-person"
                ref={newSelectRef}
                value={newPerson}
                onChange={(e) => setNewPerson(e.target.value)}
                style={field}
                aria-invalid={!!newErrors.person}
                aria-describedby={newErrors.person ? "new-person-err" : undefined}
              >
                <option value="">Select a person</option>
                <optgroup label="My manager">
                  <option value={MY_MANAGER}>
                    {PEOPLE[MY_MANAGER].name} · {PEOPLE[MY_MANAGER].title}
                  </option>
                </optgroup>
                <optgroup label="My direct reports">
                  {MY_REPORTS.map((id) => (
                    <option key={id} value={id}>
                      {PEOPLE[id].name} · {PEOPLE[id].title}
                    </option>
                  ))}
                </optgroup>
              </select>
              {newErrors.person && err(newErrors.person, "new-person-err")}
            </div>
            <div>
              <label htmlFor="new-date" style={label}>
                Date
              </label>
              <input
                id="new-date"
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                style={field}
                aria-invalid={!!newErrors.date}
                aria-describedby={newErrors.date ? "new-date-err" : undefined}
              />
              {newErrors.date && err(newErrors.date, "new-date-err")}
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
            <button type="submit" className="oo-primary" style={btnPrimary}>
              Create 1:1
            </button>
            <button
              type="button"
              className="oo-ghost"
              style={btnGhost}
              onClick={() => {
                setShowNew(false);
                setNewErrors({});
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="oo-grid" style={{ marginTop: 32 }}>
        {/* List */}
        <section aria-labelledby="list-heading" style={{ minWidth: 0 }}>
          <h2 id="list-heading" style={{ ...h3, marginBottom: 16 }}>
            Your 1:1s
          </h2>
          <div
            role="group"
            aria-label="Filter 1:1s by timing"
            style={{
              display: "flex",
              gap: 4,
              padding: 4,
              background: surface,
              border: `1px solid ${line}`,
              borderRadius: brand.radius,
              marginBottom: 16,
            }}
          >
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
          <div style={{ position: "relative", marginBottom: 16 }}>
            <label
              htmlFor="oo-search"
              style={{
                ...label,
                position: "absolute",
                width: 1,
                height: 1,
                overflow: "hidden",
                clip: "rect(0 0 0 0)",
              }}
            >
              Search by person
            </label>
            <span
              aria-hidden="true"
              style={{ position: "absolute", left: 12, top: 14, color: muted }}
            >
              <Icons.Search className="w-4 h-4" aria-hidden="true" />
            </span>
            <input
              id="oo-search"
              type="search"
              placeholder="Search by person"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ ...field, paddingLeft: 36 }}
            />
          </div>

          {visible.length === 0 ? (
            <div style={{ ...panel, padding: 24, textAlign: "left" }}>
              <p style={{ fontFamily: serif, fontSize: 18, margin: 0 }}>
                {q
                  ? `No 1:1s with “${query.trim()}”`
                  : tab === "upcoming"
                    ? "Nothing on the calendar"
                    : "No past 1:1s yet"}
              </p>
              <p style={{ color: muted, fontSize: 14, margin: "8px 0 16px", lineHeight: 1.6 }}>
                {q
                  ? "Check the spelling, or switch to All to search across every date."
                  : tab === "upcoming"
                    ? "Set up your next check-in so the agenda has somewhere to live."
                    : "Completed conversations will collect here with their action items."}
              </p>
              {q ? (
                <button
                  type="button"
                  className="oo-ghost"
                  style={btnGhost}
                  onClick={() => {
                    setQuery("");
                    setTab("all");
                  }}
                >
                  Clear search and show all
                </button>
              ) : (
                <button
                  type="button"
                  className="oo-ghost"
                  style={btnGhost}
                  onClick={() => setShowNew(true)}
                >
                  <Icons.Plus className="w-4 h-4" aria-hidden="true" />
                  New 1:1
                </button>
              )}
            </div>
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: 0, ...panel, overflow: "hidden" }}>
              {visible.map((r, idx) => {
                const o = otherOf(r);
                const open = r.items.filter((i) => !i.completedAt).length;
                const od = r.items.filter(isOverdue).length;
                const sel = r.id === selectedId;
                return (
                  <li
                    key={r.id}
                    className={r.id === newId ? "oo-enter" : ""}
                    style={{ borderTop: idx ? `1px solid ${line}` : "none" }}
                  >
                    <button
                      type="button"
                      className="oo-row"
                      onClick={() => select(r.id)}
                      aria-current={sel ? "true" : undefined}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        display: "flex",
                        gap: 12,
                        padding: 16,
                        background: sel ? surfaceUp : "transparent",
                        border: "none",
                        borderLeft: `2px solid ${sel ? accent : "transparent"}`,
                        color: ink,
                        cursor: "pointer",
                      }}
                    >
                      <span
                        aria-hidden="true"
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          border: `1px solid ${lineStrong}`,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontFamily: serif,
                          fontSize: 14,
                          flexShrink: 0,
                        }}
                      >
                        {initials(o)}
                      </span>
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                          <span style={{ fontWeight: 600, fontSize: 15 }}>{PEOPLE[o].name}</span>
                          <span
                            style={{
                              fontSize: 13,
                              color: r.date >= TODAY ? accent : muted,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {fmtShort(r.date)}
                          </span>
                        </span>
                        <span
                          style={{ display: "block", fontSize: 13, color: muted, marginTop: 2 }}
                        >
                          {iAmManager(r) ? "You manage them" : "Your manager"} · {r.ref}
                        </span>
                        <span
                          style={{ display: "block", fontSize: 13, color: muted, marginTop: 6 }}
                        >
                          {r.points.length} talking {r.points.length === 1 ? "point" : "points"} ·{" "}
                          {open} open {open === 1 ? "action" : "actions"}
                          {od > 0 && (
                            <span style={{ color: ink, fontWeight: 600 }}> · {od} overdue</span>
                          )}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Record */}
        <section aria-label="1:1 record" style={{ minWidth: 0 }}>
          {!selected ? (
            <div style={{ ...panel, padding: 48 }}>
              <p style={{ fontFamily: serif, fontSize: 24, margin: 0 }}>
                Pick a 1:1 to open its record
              </p>
              <p style={{ color: muted, margin: "12px 0 0", lineHeight: 1.6, maxWidth: 480 }}>
                The agenda, action items and anything carried over from last time appear here.
              </p>
            </div>
          ) : (
            <div key={selected.id} className="oo-enter" style={{ display: "grid", gap: 24 }}>
              <div style={{ ...panel, padding: 24 }}>
                <p style={{ ...label, color: accent, marginBottom: 8 }}>
                  {selected.ref} · Last updated {fmtShort(selected.updatedAt)}
                </p>
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
                  1:1 with {PEOPLE[other].name}
                </h2>
                <p style={{ margin: "8px 0 0", color: muted, fontSize: 14 }}>
                  {mgr ? `You manage ${first(other)}` : `${first(other)} is your manager`} ·{" "}
                  {PEOPLE[other].title}
                </p>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 12,
                    alignItems: "flex-end",
                    marginTop: 24,
                  }}
                >
                  <div style={{ flex: "0 1 220px" }}>
                    <label htmlFor="oo-date" style={label}>
                      Meeting date
                    </label>
                    <input
                      id="oo-date"
                      type="date"
                      value={dateDraft}
                      onChange={(e) => setDateDraft(e.target.value)}
                      style={field}
                      aria-invalid={!!dateError}
                      aria-describedby={dateError ? "oo-date-err" : undefined}
                    />
                  </div>
                  <button
                    type="button"
                    className="oo-ghost"
                    style={btnGhost}
                    onClick={saveDate}
                    disabled={dateDraft === selected.date && !dateError}
                  >
                    Save date
                  </button>
                  <span style={{ fontSize: 13, color: muted, paddingBottom: 14 }}>
                    {fmtDay(selected.date)} · {first(other)} sees changes immediately
                  </span>
                </div>
                {dateError && err(dateError, "oo-date-err")}
              </div>

              {carry.length > 0 && (
                <div style={{ ...panel, padding: 24 }}>
                  <h3 style={h3}>Carried over from earlier 1:1s</h3>
                  <p style={{ margin: "4px 0 16px", color: muted, fontSize: 14 }}>
                    Still open from your previous conversations with {first(other)}. Settle these
                    first.
                  </p>
                  <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                    {carry.map((c) => itemRow(c.item, c.recId, { from: c.from }))}
                  </ul>
                </div>
              )}

              {/* Agenda */}
              <div style={{ ...panel, padding: 24 }}>
                <h3 style={h3}>Shared agenda</h3>
                <p style={{ margin: "4px 0 16px", color: muted, fontSize: 14 }}>
                  Both of you can add talking points before and during the meeting. You can change
                  only your own.
                </p>
                {selected.points.length === 0 ? (
                  <div style={{ borderTop: `1px solid ${line}`, padding: "24px 0" }}>
                    <p style={{ fontFamily: serif, fontSize: 18, margin: 0 }}>
                      The agenda is blank
                    </p>
                    <p style={{ color: muted, fontSize: 14, margin: "8px 0 0", lineHeight: 1.6 }}>
                      Add the first thing you want to cover. {first(other)} will see it as soon as
                      you do.
                    </p>
                  </div>
                ) : (
                  <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
                    {selected.points.map((p, i) => {
                      const mine = p.authorId === ME_ID;
                      const editing = editingTp === p.id;
                      return (
                        <li
                          key={p.id}
                          className="oo-enter"
                          style={{
                            display: "flex",
                            gap: 16,
                            padding: "16px 0",
                            borderTop: `1px solid ${line}`,
                            alignItems: "flex-start",
                          }}
                        >
                          <span
                            aria-hidden="true"
                            style={{
                              fontFamily: serif,
                              fontSize: 20,
                              color: accent,
                              width: 24,
                              flexShrink: 0,
                            }}
                          >
                            {i + 1}
                          </span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            {editing ? (
                              <div>
                                <label htmlFor={`edit-${p.id}`} style={label}>
                                  Edit talking point
                                </label>
                                <textarea
                                  id={`edit-${p.id}`}
                                  rows={2}
                                  value={editText}
                                  onChange={(e) => setEditText(e.target.value)}
                                  style={{ ...field, resize: "vertical" }}
                                />
                                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                                  <button
                                    type="button"
                                    className="oo-primary"
                                    style={{ ...btnPrimary, minHeight: 40 }}
                                    onClick={() => savePointEdit(p.id)}
                                    disabled={!editText.trim()}
                                  >
                                    Save
                                  </button>
                                  <button
                                    type="button"
                                    className="oo-ghost"
                                    style={{ ...btnGhost, minHeight: 40 }}
                                    onClick={() => setEditingTp(null)}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: 15,
                                  lineHeight: 1.5,
                                  color: p.discussed ? muted : ink,
                                  textDecoration: p.discussed ? "line-through" : "none",
                                }}
                              >
                                {p.body}
                              </p>
                            )}
                            <div
                              style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 16,
                                alignItems: "center",
                                marginTop: 8,
                              }}
                            >
                              <span style={{ fontSize: 13, color: muted }}>
                                Added by {mine ? "you" : first(p.authorId)}
                                {p.discussed ? " · Discussed" : ""}
                              </span>
                              <label
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 8,
                                  fontSize: 13,
                                  cursor: "pointer",
                                  minHeight: 32,
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={p.discussed}
                                  onChange={() => toggleDiscussed(p.id)}
                                  style={{ width: 18, height: 18, accentColor: accent }}
                                />
                                Mark discussed
                              </label>
                            </div>
                            {confirmTp === p.id && (
                              <div
                                role="alertdialog"
                                aria-label="Confirm delete"
                                style={{
                                  marginTop: 12,
                                  padding: 12,
                                  border: `1px solid ${lineStrong}`,
                                  borderRadius: brand.radius,
                                  display: "flex",
                                  flexWrap: "wrap",
                                  gap: 12,
                                  alignItems: "center",
                                }}
                              >
                                <span style={{ fontSize: 14 }}>
                                  Delete this talking point for both of you?
                                </span>
                                <button
                                  type="button"
                                  className="oo-primary"
                                  style={{ ...btnPrimary, minHeight: 40 }}
                                  onClick={() => deletePoint(p.id)}
                                >
                                  Delete point
                                </button>
                                <button
                                  type="button"
                                  className="oo-ghost"
                                  style={{ ...btnGhost, minHeight: 40 }}
                                  onClick={() => setConfirmTp(null)}
                                >
                                  Keep it
                                </button>
                              </div>
                            )}
                          </div>
                          {mine && !editing && (
                            <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                              <button
                                type="button"
                                className="oo-ico"
                                aria-label={`Move up: ${p.body}`}
                                disabled={i === 0}
                                onClick={() => movePoint(p.id, -1)}
                              >
                                <span
                                  style={{ display: "inline-flex", transform: "rotate(180deg)" }}
                                >
                                  <Icons.ChevronDown className="w-4 h-4" aria-hidden="true" />
                                </span>
                              </button>
                              <button
                                type="button"
                                className="oo-ico"
                                aria-label={`Move down: ${p.body}`}
                                disabled={i === selected.points.length - 1}
                                onClick={() => movePoint(p.id, 1)}
                              >
                                <Icons.ChevronDown className="w-4 h-4" aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                className="oo-ico"
                                aria-label={`Edit: ${p.body}`}
                                onClick={() => {
                                  setEditingTp(p.id);
                                  setEditText(p.body);
                                }}
                              >
                                <Icons.Edit className="w-4 h-4" aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                className="oo-ico"
                                aria-label={`Delete: ${p.body}`}
                                onClick={() => setConfirmTp(p.id)}
                              >
                                <Icons.Trash className="w-4 h-4" aria-hidden="true" />
                              </button>
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ol>
                )}
                <form
                  onSubmit={addPoint}
                  noValidate
                  style={{ borderTop: `1px solid ${line}`, paddingTop: 16 }}
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
                      placeholder="What do you want to make sure you cover?"
                      style={{ ...field, flex: "1 1 260px", width: "auto" }}
                      aria-invalid={!!tpError}
                      aria-describedby={tpError ? "tp-err" : undefined}
                    />
                    <button type="submit" className="oo-primary" style={btnPrimary}>
                      <Icons.Plus className="w-4 h-4" aria-hidden="true" />
                      Add to agenda
                    </button>
                  </div>
                  {tpError && err(tpError, "tp-err")}
                </form>
              </div>

              {/* Action items */}
              <div style={{ ...panel, padding: 24 }}>
                <h3 style={h3}>Action items</h3>
                <p style={{ margin: "4px 0 16px", color: muted, fontSize: 14 }}>
                  What the two of you agreed to do. Each item has one owner and a due date.
                </p>
                {selected.items.length === 0 ? (
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
                    {selected.items.map((it) => itemRow(it, selected.id))}
                  </ul>
                )}
                <form
                  onSubmit={addItem}
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
                        placeholder="e.g. Share the draft with the platform group"
                        aria-invalid={!!aiErrors.desc}
                        aria-describedby={aiErrors.desc ? "ai-desc-err" : undefined}
                      />
                      {aiErrors.desc && err(aiErrors.desc, "ai-desc-err")}
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
                      >
                        <option value={ME_ID}>You ({first(ME_ID)})</option>
                        <option value={other}>{PEOPLE[other].name}</option>
                      </select>
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
                        aria-invalid={!!aiErrors.due}
                        aria-describedby={aiErrors.due ? "ai-due-err" : undefined}
                      />
                      {aiErrors.due && err(aiErrors.due, "ai-due-err")}
                    </div>
                  </div>
                  <div style={{ marginTop: 16 }}>
                    <button type="submit" className="oo-primary" style={btnPrimary}>
                      <Icons.Plus className="w-4 h-4" aria-hidden="true" />
                      Add action item
                    </button>
                  </div>
                </form>
              </div>

              {/* Private notes: manager only, never rendered for the report */}
              {mgr && (
                <div style={{ ...panel, padding: 24, borderColor: lineStrong }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <h3 style={h3}>Private notes</h3>
                    <span
                      style={{
                        display: "inline-flex",
                        gap: 6,
                        alignItems: "center",
                        fontSize: 12,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: accent,
                        border: `1px solid ${accent}`,
                        borderRadius: brand.radius,
                        padding: "2px 8px",
                      }}
                    >
                      <Icons.User className="w-3 h-3" aria-hidden="true" />
                      Visible only to you
                    </span>
                  </div>
                  <p style={{ margin: "8px 0 16px", color: muted, fontSize: 14, lineHeight: 1.6 }}>
                    {first(other)} cannot see these notes anywhere in the product.{" "}
                    {HR_CAN_READ_PRIVATE_NOTES
                      ? "Under the current HR setting, HR Admins can read private notes."
                      : "Under the current HR setting, HR Admins cannot read private notes either."}
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
                      setNoteSavedAt(null);
                    }}
                    style={{ ...field, resize: "vertical", lineHeight: 1.5 }}
                    placeholder="Observations to bring into a performance conversation"
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
                      onClick={saveNote}
                      disabled={noteDraft === selected.note}
                    >
                      Save private note
                    </button>
                    {noteSavedAt ? (
                      <span
                        className="oo-enter"
                        style={{
                          display: "inline-flex",
                          gap: 6,
                          alignItems: "center",
                          fontSize: 13,
                          color: accent,
                        }}
                      >
                        <Icons.CheckCircle className="w-4 h-4" aria-hidden="true" />
                        Saved, visible only to you
                      </span>
                    ) : (
                      <span style={{ fontSize: 13, color: muted }}>
                        {noteDraft === selected.note ? "No unsaved changes" : "Unsaved changes"}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
