// @ts-nocheck -- generated from the approved design under its JS runtime contract; not hand-written TypeScript.
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";

import * as UI from "@/lib/ui";
import { Icons } from "@/lib/icons";
import { brand } from "@/lib/brand";
import { useNavigate } from "@/lib/navigate";
import { UnmetRules, useChangePassword } from "@/lib/account";
import { FieldErrors } from "@/lib/employees";
import { useAudience, useDashboard, useRecipientPicker, useSendFeedback } from "@/lib/feedback";
import { useSession } from "@/lib/session";

const { Button, Input, Textarea, Label, Switch, Avatar, Tabs, Empty } = UI;

const { User, Settings } = Icons;

const TODAY = "2026-10-29";
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const fmt = (d) => {
  if (!d) return "";
  const p = d.split("-");
  return parseInt(p[2], 10) + " " + MONTHS[parseInt(p[1], 10) - 1] + " " + p[0];
};
const periodOf = (d) => {
  const y = d.slice(0, 4);
  const m = parseInt(d.slice(5, 7), 10);
  return (m <= 6 ? "H1 " : "H2 ") + y;
};

const ME = {
  id: "e-0412",
  name: "Amara Okafor",
  email: "amara.okafor@halden.example",
  title: "Product Designer",
  dept: "Design",
  manager: "Daniel Reyes",
  role: "Employee",
};

const PEOPLE = [
  { id: "p1", name: "Priya Nair", title: "Senior Product Manager" },
  { id: "p2", name: "Tomás Silva", title: "Frontend Engineer" },
  { id: "p3", name: "Daniel Reyes", title: "Head of Design" },
  { id: "p4", name: "Hannah Lindqvist", title: "User Researcher" },
  { id: "p5", name: "Jonas Weber", title: "Engineering Manager" },
  { id: "p6", name: "Mei Tanaka", title: "Content Designer" },
  { id: "p7", name: "Samuel Boateng", title: "Customer Success Lead" },
];
const RECIPIENT_GOALS = {
  p1: ["Raise onboarding completion to 75%", "Define activation metrics for Q4"],
  p2: ["Ship design-system v2 in the web app", "Cut bundle size by 20%"],
  p4: ["Run the Q4 usability study programme"],
};
const MANAGER_CAN_SEE_FEEDBACK = false;

const GOALS = [
  {
    id: "g1",
    title: "Ship the redesigned onboarding flow",
    target: "Onboarding completion rate from 62% to 75%",
    due: "2026-12-11",
    weight: 40,
    progress: 55,
    status: "On track",
    parent: "Company: Get every new customer to first value in under 10 minutes",
  },
  {
    id: "g2",
    title: "Publish design-system v2 tokens",
    target: "All 48 core components migrated to v2 tokens",
    due: "2026-10-16",
    weight: 30,
    progress: 70,
    status: "At risk",
    parent: "Design: One shared component library across every product",
  },
  {
    id: "g3",
    title: "Run the quarterly usability studies",
    target: "4 studies with 6 participants each",
    due: "2026-11-27",
    weight: 20,
    progress: 25,
    status: "On track",
    parent: "Design: Decisions backed by research evidence",
  },
  {
    id: "g4",
    title: "Mentor one junior designer",
    target: "Fortnightly sessions through year end (12 in total)",
    due: "2026-12-18",
    weight: 10,
    progress: 0,
    status: "Not started",
    parent: "",
  },
];

const PAST_GOALS = {
  "H1 2026": [
    {
      id: "h1",
      title: "Redesign settings navigation",
      target: "Task success above 90% in moderated tests",
      weight: 50,
      progress: 100,
      status: "Achieved",
    },
    {
      id: "h2",
      title: "Accessibility audit of checkout",
      target: "All 23 WCAG AA failures resolved",
      weight: 30,
      progress: 100,
      status: "Achieved",
    },
    {
      id: "h3",
      title: "Facilitate two design critiques a month",
      target: "12 critiques held",
      weight: 20,
      progress: 40,
      status: "Cancelled",
    },
  ],
  "H2 2025": [
    {
      id: "h4",
      title: "Launch the component library pilot",
      target: "Adopted by 2 product squads",
      weight: 60,
      progress: 100,
      status: "Achieved",
    },
    {
      id: "h5",
      title: "Complete user-research certification",
      target: "Certificate awarded by December",
      weight: 40,
      progress: 60,
      status: "Off track",
    },
  ],
};

const SCALE = ["Developing", "Emerging", "Proficient", "Strong", "Exceptional"];
const REVIEWS = [
  {
    key: "H2 2026",
    name: "H2 2026 self-review",
    status: "Open",
    deadline: "2026-11-13",
    note: "Draft saved 26 Oct 2026",
    submitted: "",
  },
  {
    key: "H1 2026",
    name: "H1 2026 self-review",
    status: "Submitted",
    deadline: "2026-07-10",
    submitted: "2026-07-09",
    answers: [
      {
        c: "Craft",
        q: "How consistently did your work meet the quality bar?",
        r: 4,
        t: "Settings navigation shipped with no post-launch rework.",
      },
      {
        c: "Collaboration",
        q: "How well did you work across disciplines?",
        r: 4,
        t: "Paired weekly with engineering on the audit fixes.",
      },
      {
        c: "Ownership",
        q: "Where did you take initiative beyond your brief?",
        r: 3,
        t: "Started the critique series, though I let it lapse in May.",
      },
    ],
  },
  {
    key: "H2 2025",
    name: "H2 2025 self-review",
    status: "Submitted",
    deadline: "2026-01-16",
    submitted: "2026-01-14",
    answers: [
      {
        c: "Craft",
        q: "How consistently did your work meet the quality bar?",
        r: 3,
        t: "Strong on visual detail; interaction specs were sometimes late.",
      },
      {
        c: "Collaboration",
        q: "How well did you work across disciplines?",
        r: 4,
        t: "Good working rhythm with Tomás and Priya on the pilot.",
      },
      {
        c: "Ownership",
        q: "Where did you take initiative beyond your brief?",
        r: 3,
        t: "Ran the library pilot retrospective.",
      },
    ],
  },
];

const FEEDBACK_SEED = [
  {
    id: "f1",
    dir: "received",
    type: "Praise",
    person: "Priya Nair",
    date: "2026-10-27",
    body: "The onboarding prototype walkthrough was the clearest I have seen. Sales used your flow diagram in two customer calls this week.",
    goal: "",
    unread: true,
  },
  {
    id: "f2",
    dir: "received",
    type: "Constructive",
    person: "Daniel Reyes",
    date: "2026-10-22",
    body: "The token migration is a good piece of work, but the October date slipped without a heads-up. Flag risk to me as soon as you see it, even when you are still hoping to recover.",
    goal: "Publish design-system v2 tokens",
    unread: true,
  },
  {
    id: "f3",
    dir: "received",
    type: "Praise",
    person: "Tomás Silva",
    date: "2026-10-09",
    body: "Your token documentation made the migration almost mechanical for me. Thank you for the worked examples.",
    goal: "",
    unread: false,
  },
  {
    id: "f4",
    dir: "received",
    type: "Constructive",
    person: "Hannah Lindqvist",
    date: "2026-09-18",
    body: "In the study planning session, a few of your questions to participants were leading. Worth rehearsing neutral phrasing before the next round.",
    goal: "",
    unread: false,
  },
  {
    id: "f5",
    dir: "received",
    type: "Praise",
    person: "Priya Nair",
    date: "2026-08-14",
    body: "Thanks for staying late to rework the pricing-free trial screens before the board demo.",
    goal: "",
    unread: false,
  },
  {
    id: "f6",
    dir: "received",
    type: "Praise",
    person: "Mei Tanaka",
    date: "2026-05-12",
    body: "Your microcopy edits on the settings screens saved me a full review round.",
    goal: "",
    unread: false,
  },
  {
    id: "f7",
    dir: "received",
    type: "Constructive",
    person: "Daniel Reyes",
    date: "2026-03-03",
    body: "Interaction specs need to land a sprint earlier so engineering can estimate properly.",
    goal: "",
    unread: false,
  },
  {
    id: "f8",
    dir: "received",
    type: "Praise",
    person: "Samuel Boateng",
    date: "2025-11-20",
    body: "Support tickets about the library pilot dropped sharply after your guidance notes went out.",
    goal: "",
    unread: false,
  },
  {
    id: "f9",
    dir: "given",
    type: "Praise",
    person: "Tomás Silva",
    date: "2026-10-20",
    body: "Thank you for catching the focus-order bug in the new dialog before release.",
    goal: "",
    withdrawn: "",
  },
  {
    id: "f10",
    dir: "given",
    type: "Constructive",
    person: "Jonas Weber",
    date: "2026-09-30",
    body: "Handoff builds were often missing the latest tokens. A checklist before each handoff would help both of us.",
    goal: "",
    withdrawn: "2026-10-01",
  },
  {
    id: "f11",
    dir: "given",
    type: "Praise",
    person: "Hannah Lindqvist",
    date: "2026-08-26",
    body: "Your synthesis of the interview notes changed how we scoped the onboarding work.",
    goal: "",
    withdrawn: "",
  },
];

const PW_RULES = [
  { k: "len", label: "At least 12 characters", test: (s) => s.length >= 12 },
  {
    k: "case",
    label: "An uppercase and a lowercase letter",
    test: (s) => /[a-z]/.test(s) && /[A-Z]/.test(s),
  },
  { k: "num", label: "At least one number", test: (s) => /[0-9]/.test(s) },
  { k: "sym", label: "At least one symbol, such as ! or #", test: (s) => /[^A-Za-z0-9]/.test(s) },
];

export default function Screen() {
  const navigate = useNavigate();
  const [tab, setTab] = React.useState("overview");
  const [newStarter, setNewStarter] = React.useState(false);
  // Received feedback comes from GET /me/dashboard; only the given list is still seeded.
  const [feedback, setFeedback] = React.useState(FEEDBACK_SEED.filter((f) => f.dir === "given"));
  const { user: sessionUser } = useSession();
  const dashboard = useDashboard();
  const picker = useRecipientPicker();
  const sendFeedback = useSendFeedback();
  const [fbDir, setFbDir] = React.useState("received");
  const [filters, setFilters] = React.useState({ type: "All", from: "", to: "" });
  const [composeOpen, setComposeOpen] = React.useState(false);
  const [form, setForm] = React.useState({ kind: "Praise", to: "", body: "", goal: "" });
  const [errors, setErrors] = React.useState({});
  const [notice, setNotice] = React.useState("");
  const [confirmId, setConfirmId] = React.useState("");
  const [openReview, setOpenReview] = React.useState("");
  const [profile, setProfile] = React.useState({
    display: "Amara",
    pronouns: "she/her",
    photo: "",
  });
  const [profileErr, setProfileErr] = React.useState("");
  const [profileSaved, setProfileSaved] = React.useState("");
  const [pw, setPw] = React.useState({ cur: "", next: "", conf: "" });
  const [pwMsg, setPwMsg] = React.useState({ kind: "", text: "" });
  const [pwUnmet, setPwUnmet] = React.useState([]);
  const changePassword = useChangePassword();

  const B = brand;
  const surface = "color-mix(in srgb, " + B.primaryColor + " 5%, " + B.backgroundColor + ")";
  const field = "color-mix(in srgb, " + B.primaryColor + " 3%, " + B.backgroundColor + ")";
  const line = "color-mix(in srgb, " + B.primaryColor + " 12%, transparent)";
  const warn = "color-mix(in srgb, orange 65%, " + B.primaryColor + ")";
  const panel = { background: surface, border: "1px solid " + line, borderRadius: B.radius };
  const eyebrow = {
    fontSize: 12,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: B.neutralColor,
    fontWeight: 500,
  };
  const serif = { fontFamily: B.fontHeading, fontWeight: 400 };
  const nums = { fontVariantNumeric: "tabular-nums" };
  const btnPrimary = {
    background: B.accentColor,
    color: B.backgroundColor,
    fontWeight: 600,
    border: "1px solid " + B.accentColor,
    borderRadius: B.radius,
    minHeight: 44,
    padding: "0 20px",
  };
  const btnGhost = {
    background: "transparent",
    color: B.primaryColor,
    border: "1px solid " + line,
    borderRadius: B.radius,
    minHeight: 44,
    padding: "0 16px",
  };
  const inputStyle = {
    background: field,
    color: B.primaryColor,
    border: "1px solid " + line,
    borderRadius: B.radius,
    minHeight: 44,
    padding: "0 12px",
    width: "100%",
    fontFamily: B.fontBody,
    fontSize: 15,
  };

  const ownGoals = newStarter ? [] : GOALS;
  const apiReceived = (dashboard.data?.feedback ?? []).map((f) => ({
    id: f.id,
    dir: "received",
    type: f.type.toLowerCase() === "praise" ? "Praise" : "Constructive",
    person: f.author?.full_name ?? "Unknown colleague",
    date: (f.created_at ?? "").slice(0, 10),
    body: f.body,
    goal: f.goal ?? "",
    unread: false,
  }));
  const visibleFeedback = (newStarter ? feedback.filter((f) => f.sentNow) : feedback).concat(
    apiReceived,
  );
  const fbLoading = dashboard.isLoading;
  const fbFailed = dashboard.isError;
  const colleagues = (Array.isArray(picker.data) ? picker.data : []).filter(
    (p) => p.id !== sessionUser?.id,
  );
  const audience = useAudience(form.to, composeOpen);
  const received = visibleFeedback
    .filter((f) => f.dir === "received")
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  const unreadCount = received.filter((f) => f.unread).length;
  const overdueGoals = ownGoals.filter(
    (g) => g.due < TODAY && g.status !== "Achieved" && g.status !== "Cancelled",
  );
  const reviewsList = newStarter ? [] : REVIEWS;
  const openReviewTask = reviewsList.find((r) => r.status === "Open");

  const attention = [];
  if (!newStarter) {
    if (openReviewTask)
      attention.push({
        k: "rev",
        icon: "clock",
        title: "Complete your " + openReviewTask.name,
        meta: "Due " + fmt(openReviewTask.deadline) + " · 15 days left · " + openReviewTask.note,
        action: "Continue review",
        go: () => navigate("reviews"),
      });
    overdueGoals.forEach((g) =>
      attention.push({
        k: g.id,
        icon: "alert",
        title: g.title + " is overdue",
        meta: "Was due " + fmt(g.due) + " · " + g.progress + "% complete · " + g.status,
        action: "Update goal",
        go: () => navigate("goals"),
      }),
    );
    attention.push({
      k: "ai",
      icon: "alert",
      title: "Action item: send Daniel the draft research plan",
      meta: "From your 1:1 on 17 Oct 2026 · overdue since 24 Oct 2026",
      action: "Open 1:1",
      go: () => navigate("one-on-ones"),
    });
    if (unreadCount > 0)
      attention.push({
        k: "fb",
        icon: "bell",
        title:
          unreadCount + " new " + (unreadCount === 1 ? "piece" : "pieces") + " of feedback to read",
        meta: "Latest from " + received[0].person + " on " + fmt(received[0].date),
        action: "Read feedback",
        go: () => {
          setTab("feedback");
          setFbDir("received");
        },
      });
  }

  const statusMark = (s, overdue) => {
    const good = s === "Achieved" || s === "On track";
    const bad = s === "At risk" || s === "Off track";
    const icon = good ? (
      <Icons.CheckCircle size={14} aria-hidden="true" />
    ) : bad ? (
      <Icons.AlertCircle size={14} aria-hidden="true" />
    ) : s === "Cancelled" ? (
      <Icons.X size={14} aria-hidden="true" />
    ) : (
      <Icons.Clock size={14} aria-hidden="true" />
    );
    const color = good ? B.accentColor : bad ? warn : B.neutralColor;
    return (
      <span
        className="inline-flex items-center gap-1"
        style={{
          color: color,
          border: "1px solid " + line,
          borderRadius: 999,
          padding: "2px 10px",
          fontSize: 12,
          fontWeight: 500,
          whiteSpace: "nowrap",
        }}
      >
        {icon}
        {s}
        {overdue ? " · Overdue" : ""}
      </span>
    );
  };

  const bar = (v, label) => (
    <div className="flex items-center gap-3" style={{ minWidth: 140, flex: 1 }}>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={v}
        aria-valuemin={0}
        aria-valuemax={100}
        style={{ height: 4, flex: 1, background: line, borderRadius: 2, overflow: "hidden" }}
      >
        <div
          className="pm-bar"
          style={{ width: v + "%", height: "100%", background: B.accentColor }}
        />
      </div>
      <span style={{ ...nums, fontSize: 13, width: 40, textAlign: "right" }}>{v}%</span>
    </div>
  );

  const sectionHead = (title, right) => (
    <div className="flex items-baseline justify-between gap-4" style={{ marginBottom: 16 }}>
      <h2 style={{ ...serif, fontSize: 24, lineHeight: 1.2 }}>{title}</h2>
      {right}
    </div>
  );

  const typeTag = (t) => (
    <span
      style={{
        ...eyebrow,
        color: t === "Praise" ? B.accentColor : B.neutralColor,
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
      }}
    >
      {t === "Praise" ? (
        <Icons.Check size={12} aria-hidden="true" />
      ) : (
        <Icons.FileText size={12} aria-hidden="true" />
      )}
      {t === "Praise" ? "Praise" : "Constructive feedback"}
    </span>
  );

  // ---------- feedback actions ----------
  const submitFeedback = async (e) => {
    e.preventDefault();
    setErrors({});
    const person = colleagues.find((p) => p.id === form.to);
    try {
      await sendFeedback.mutateAsync({
        recipient_id: form.to || null,
        type: form.kind === "Praise" ? "praise" : "constructive",
        body: form.body,
      });
    } catch (error) {
      if (error instanceof FieldErrors) {
        setErrors({
          to: error.errors.recipient_id ?? error.errors.recipient,
          body: error.errors.body,
        });
      } else {
        setErrors({
          form: error && error.message ? error.message : "It could not be sent. Try again.",
        });
      }
      return;
    }
    setNotice(
      (form.kind === "Praise" ? "Praise" : "Feedback") +
        " sent to " +
        (person ? person.full_name : "your colleague") +
        ".",
    );
    setForm({ kind: form.kind, to: "", body: "", goal: "" });
    setComposeOpen(false);
  };
  const withdraw = (id) => {
    setFeedback(feedback.map((f) => (f.id === id ? { ...f, withdrawn: TODAY } : f)));
    setConfirmId("");
    setNotice("Feedback withdrawn. The withdrawal is recorded with your name and the time.");
  };
  const markAllRead = () => setFeedback(feedback.map((f) => ({ ...f, unread: false })));

  const listForDir = visibleFeedback
    .filter((f) => f.dir === fbDir)
    .filter((f) => filters.type === "All" || f.type === filters.type)
    .filter((f) => !filters.from || f.date >= filters.from)
    .filter((f) => !filters.to || f.date <= filters.to)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  const dirTotal = visibleFeedback.filter((f) => f.dir === fbDir).length;
  const filtersActive = filters.type !== "All" || filters.from || filters.to;

  const recipientGoals = RECIPIENT_GOALS[form.to] || [];
  const readers = audience.data?.readers_statement
    ? audience.data.readers_statement
    : audience.isError
      ? "Who can read this could not be loaded. Try again before sending."
      : "Loading who can read this…";

  // ---------- profile actions ----------
  const saveProfile = (e) => {
    e.preventDefault();
    if (!profile.display.trim()) {
      setProfileErr("Enter the name colleagues should see.");
      setProfileSaved("");
      return;
    }
    setProfileErr("");
    setProfileSaved(
      "Profile saved. Colleagues now see “" +
        profile.display.trim() +
        "” wherever your profile appears.",
    );
  };
  const pwResults = PW_RULES.map((r) => ({ ...r, ok: r.test(pw.next) }));
  // The rules the API said this password failed (AC-027). The client hints
  // above are a courtesy; the server's answer is what is listed on refusal.
  const savePw = async (e) => {
    e.preventDefault();
    setPwUnmet([]);
    if (!pw.cur) {
      setPwMsg({ kind: "error", text: "Enter your current password to change it." });
      return;
    }
    if (pw.next !== pw.conf) {
      setPwMsg({ kind: "error", text: "The two new passwords do not match." });
      return;
    }
    try {
      await changePassword.mutateAsync({ current_password: pw.cur, new_password: pw.next });
      setPwMsg({ kind: "ok", text: "Password changed. Use the new one next time you sign in." });
      setPw({ cur: "", next: "", conf: "" });
    } catch (error) {
      if (error instanceof UnmetRules) {
        setPwUnmet(error.rules);
        setPwMsg({
          kind: "error",
          text: "The new password does not meet every rule listed below. Nothing was changed.",
        });
      } else {
        setPwMsg({
          kind: "error",
          text:
            error && error.message
              ? error.message
              : "Your password could not be changed. Try again.",
        });
      }
    }
  };

  // ---------- panels ----------
  const feedbackRow = (f, compact) => (
    <li
      key={f.id}
      className={f.fresh ? "pm-enter" : ""}
      style={{
        padding: compact ? "16px 0" : "24px 0",
        borderTop: "1px solid " + line,
        opacity: f.withdrawn ? 0.75 : 1,
      }}
    >
      <div className="flex gap-4">
        <Avatar name={f.person} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1" style={{ marginBottom: 4 }}>
            <span style={{ fontWeight: 600 }}>
              {f.dir === "received" ? f.person : "To " + f.person}
            </span>
            {typeTag(f.type)}
            <span style={{ ...nums, fontSize: 13, color: B.neutralColor }}>{fmt(f.date)}</span>
            {f.unread ? (
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: B.backgroundColor,
                  background: B.accentColor,
                  borderRadius: 999,
                  padding: "0 8px",
                }}
              >
                New
              </span>
            ) : null}
            {f.withdrawn ? (
              <span
                style={{
                  fontSize: 12,
                  color: warn,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Icons.AlertCircle size={12} aria-hidden="true" />
                Withdrawn by you on {fmt(f.withdrawn)}
              </span>
            ) : null}
          </div>
          <p
            style={{
              lineHeight: 1.6,
              maxWidth: "68ch",
              textDecoration: f.withdrawn ? "line-through" : "none",
            }}
          >
            {f.body}
          </p>
          {f.goal ? (
            <p style={{ fontSize: 13, color: B.neutralColor, marginTop: 8 }}>
              Linked goal: <span style={{ color: B.primaryColor }}>{f.goal}</span>
            </p>
          ) : null}
          {!compact && f.dir === "given" && !f.withdrawn ? (
            confirmId === f.id ? (
              <div
                className="flex flex-wrap items-center gap-3"
                style={{ marginTop: 12 }}
                role="group"
                aria-label="Confirm withdrawal"
              >
                <span style={{ fontSize: 14 }}>
                  Withdraw this? It can’t be edited, only withdrawn, and the withdrawal is recorded.
                </span>
                <Button
                  type="button"
                  onClick={() => withdraw(f.id)}
                  style={{ ...btnGhost, minHeight: 44, color: warn }}
                >
                  Yes, withdraw
                </Button>
                <Button type="button" onClick={() => setConfirmId("")} style={btnGhost}>
                  Keep it
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                onClick={() => setConfirmId(f.id)}
                aria-label={"Withdraw " + f.type.toLowerCase() + " sent to " + f.person}
                style={{ ...btnGhost, marginTop: 12, fontSize: 14 }}
              >
                Withdraw
              </Button>
            )
          ) : null}
        </div>
      </div>
    </li>
  );

  const overview = (
    <div className="flex flex-col gap-8">
      <section
        aria-labelledby="att-h"
        style={{ ...panel, borderLeft: "1px solid " + B.accentColor, padding: 24 }}
      >
        <div className="flex items-baseline justify-between gap-4" style={{ marginBottom: 8 }}>
          <h2 id="att-h" style={{ ...serif, fontSize: 28, lineHeight: 1.2 }}>
            Needs your attention
          </h2>
          <span style={{ ...eyebrow, ...nums, color: B.accentColor }}>
            {attention.length} {attention.length === 1 ? "item" : "items"}
          </span>
        </div>
        {attention.length === 0 ? (
          <Empty
            title="Nothing is waiting on you"
            description="When a self-review opens, a goal passes its due date or an action item from a 1:1 falls overdue, it will be listed here with a link straight to it."
          />
        ) : (
          <ul>
            {attention.map((a) => (
              <li
                key={a.k}
                className="flex flex-wrap items-center gap-4"
                style={{ padding: "16px 0", borderTop: "1px solid " + line }}
              >
                <span style={{ color: a.icon === "alert" ? warn : B.accentColor }}>
                  {a.icon === "alert" ? (
                    <Icons.AlertCircle size={20} aria-hidden="true" />
                  ) : a.icon === "clock" ? (
                    <Icons.Clock size={20} aria-hidden="true" />
                  ) : (
                    <Icons.Bell size={20} aria-hidden="true" />
                  )}
                </span>
                <div style={{ flex: 1, minWidth: 220 }}>
                  <p style={{ fontWeight: 600 }}>{a.title}</p>
                  <p style={{ fontSize: 14, color: B.neutralColor, ...nums }}>{a.meta}</p>
                </div>
                <Button type="button" onClick={a.go} style={btnGhost}>
                  {a.action}
                  <Icons.ChevronRight size={16} aria-hidden="true" style={{ marginLeft: 4 }} />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <section
          aria-labelledby="goals-h"
          className="lg:col-span-2"
          style={{ ...panel, padding: 24 }}
        >
          {sectionHead(
            <span id="goals-h">My active goals</span>,
            <Button
              type="button"
              onClick={() => navigate("goals")}
              style={{ ...btnGhost, fontSize: 14 }}
            >
              Manage goals
            </Button>,
          )}
          {ownGoals.length === 0 ? (
            <Empty
              title="No goals yet"
              description="Goals you create, with a measurable target, due date and weighting, will show here with their progress and status."
              action={
                <Button type="button" onClick={() => navigate("goals")} style={btnPrimary}>
                  Create your first goal
                </Button>
              }
            />
          ) : (
            <ul>
              {ownGoals.map((g) => {
                const od = g.due < TODAY && g.status !== "Achieved" && g.status !== "Cancelled";
                return (
                  <li key={g.id} style={{ padding: "16px 0", borderTop: "1px solid " + line }}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <h3 style={{ fontSize: 17, fontWeight: 600, flex: 1, minWidth: 200 }}>
                        {g.title}
                      </h3>
                      {statusMark(g.status, od)}
                    </div>
                    <p style={{ fontSize: 14, color: B.neutralColor, marginTop: 4 }}>
                      Target: {g.target}
                    </p>
                    {g.parent ? (
                      <p style={{ fontSize: 13, color: B.neutralColor, marginTop: 4 }}>
                        Aligned to — {g.parent}
                      </p>
                    ) : null}
                    <div
                      className="flex flex-wrap items-center gap-x-6 gap-y-2"
                      style={{ marginTop: 12, fontSize: 13, ...nums }}
                    >
                      {bar(g.progress, "Progress on " + g.title)}
                      <span style={{ color: od ? warn : B.neutralColor }}>Due {fmt(g.due)}</span>
                      <span style={{ color: B.neutralColor }}>
                        Weighting <span style={{ color: B.accentColor }}>{g.weight}%</span>
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <div className="flex flex-col gap-8">
          <section aria-labelledby="fb-h" style={{ ...panel, padding: 24 }}>
            {sectionHead(<span id="fb-h">Latest feedback</span>)}
            {fbLoading ? (
              <p role="status">Loading your feedback…</p>
            ) : fbFailed ? (
              <p role="alert" style={{ color: warn }}>
                Your feedback could not be loaded. Try again.
              </p>
            ) : received.length === 0 ? (
              <Empty
                title="Nothing received yet"
                description="Praise and feedback colleagues write to you will appear here, newest first."
              />
            ) : (
              <ul>
                {received.slice(0, 3).map((f) => (
                  <li key={f.id} style={{ padding: "12px 0", borderTop: "1px solid " + line }}>
                    <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{f.person}</span>
                      <span style={{ ...nums, fontSize: 12, color: B.neutralColor }}>
                        {fmt(f.date)}
                      </span>
                      {f.unread ? (
                        <span style={{ fontSize: 12, fontWeight: 600, color: B.accentColor }}>
                          · New
                        </span>
                      ) : null}
                    </div>
                    <p className="pm-clamp" style={{ fontSize: 14, lineHeight: 1.5 }}>
                      {f.body}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            {received.length > 0 ? (
              <Button
                type="button"
                onClick={() => {
                  setTab("feedback");
                  setFbDir("received");
                }}
                style={{ ...btnGhost, marginTop: 8, width: "100%" }}
              >
                See all feedback
              </Button>
            ) : null}
          </section>

          <section aria-labelledby="rev-h" style={{ ...panel, padding: 24 }}>
            {sectionHead(<span id="rev-h">My reviews</span>)}
            {reviewsList.length === 0 ? (
              <Empty
                title="No reviews yet"
                description="When HR opens a review period for you, your self-review task will show here and your submitted reviews will be kept."
              />
            ) : (
              <ul>
                {reviewsList.map((r) => (
                  <li key={r.key} style={{ padding: "12px 0", borderTop: "1px solid " + line }}>
                    <div className="flex items-center justify-between gap-3">
                      <span style={{ fontWeight: 600, fontSize: 15 }}>{r.name}</span>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 500,
                          color: r.status === "Open" ? B.accentColor : B.neutralColor,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        {r.status === "Open" ? (
                          <Icons.Clock size={12} aria-hidden="true" />
                        ) : (
                          <Icons.CheckCircle size={12} aria-hidden="true" />
                        )}
                        {r.status === "Open" ? "Open" : "Submitted"}
                      </span>
                    </div>
                    <p style={{ ...nums, fontSize: 13, color: B.neutralColor, marginTop: 2 }}>
                      {r.status === "Open"
                        ? "Due " + fmt(r.deadline)
                        : "Submitted " + fmt(r.submitted)}
                    </p>
                    <Button
                      type="button"
                      onClick={() =>
                        r.status === "Open"
                          ? navigate("reviews")
                          : (setTab("record"), setOpenReview(r.key))
                      }
                      style={{ ...btnGhost, marginTop: 8, fontSize: 14 }}
                    >
                      {r.status === "Open" ? "Continue review" : "Read submission"}
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );

  const periodKeys = newStarter ? [] : ["H2 2026", "H1 2026", "H2 2025"];
  const record = (
    <div className="flex flex-col gap-8">
      <p style={{ color: B.neutralColor, maxWidth: "62ch", lineHeight: 1.6 }}>
        Your goals, submitted self-reviews and feedback, grouped by review period with the newest
        first. Submitted reviews are read-only, exactly as you sent them.
      </p>
      {periodKeys.length === 0 ? (
        <div style={{ ...panel, padding: 24 }}>
          <Empty
            title="Your record starts here"
            description="Once you have goals, a submitted self-review or feedback, they are kept here by review period so you can draw on them later."
          />
        </div>
      ) : (
        periodKeys.map((pk) => {
          const goals = pk === "H2 2026" ? GOALS : PAST_GOALS[pk];
          const rev = REVIEWS.find((r) => r.key === pk);
          const fbs = visibleFeedback
            .filter((f) => f.dir === "received" && periodOf(f.date) === pk)
            .sort((a, b) => (a.date < b.date ? 1 : -1));
          const isOpen = openReview === pk;
          return (
            <section
              key={pk}
              aria-labelledby={"rec-" + pk.replace(" ", "-")}
              style={{ ...panel, padding: 24 }}
            >
              <div className="flex items-baseline gap-4" style={{ marginBottom: 16 }}>
                <h2 id={"rec-" + pk.replace(" ", "-")} style={{ ...serif, fontSize: 28 }}>
                  {pk}
                </h2>
                <span style={{ ...eyebrow, color: B.accentColor }}>
                  {pk === "H2 2026" ? "Current period" : "Closed period"}
                </span>
              </div>
              <div style={{ height: 1, background: B.accentColor, width: 48, marginBottom: 24 }} />
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                <div>
                  <h3 style={{ ...eyebrow, marginBottom: 8 }}>Goals</h3>
                  <ul>
                    {goals.map((g) => (
                      <li key={g.id} style={{ padding: "12px 0", borderTop: "1px solid " + line }}>
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <span style={{ fontWeight: 600, flex: 1, minWidth: 160 }}>{g.title}</span>
                          {statusMark(g.status, false)}
                        </div>
                        <div
                          className="flex flex-wrap items-center gap-x-6 gap-y-1"
                          style={{ marginTop: 8, fontSize: 13, ...nums }}
                        >
                          {bar(g.progress, "Progress on " + g.title)}
                          <span style={{ color: B.neutralColor }}>Weighting {g.weight}%</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 style={{ ...eyebrow, marginBottom: 8 }}>Self-review</h3>
                  <div style={{ padding: "12px 0", borderTop: "1px solid " + line }}>
                    {rev ? (
                      <>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p style={{ fontWeight: 600 }}>{rev.name}</p>
                            <p style={{ ...nums, fontSize: 13, color: B.neutralColor }}>
                              {rev.status === "Open"
                                ? "Not yet submitted · due " + fmt(rev.deadline)
                                : "Submitted " + fmt(rev.submitted) + " by " + ME.name}
                            </p>
                          </div>
                          {rev.status === "Open" ? (
                            <Button
                              type="button"
                              onClick={() => navigate("reviews")}
                              style={btnGhost}
                            >
                              Continue review
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              aria-expanded={isOpen}
                              onClick={() => setOpenReview(isOpen ? "" : pk)}
                              style={btnGhost}
                            >
                              {isOpen ? "Hide answers" : "Read answers"}
                              {isOpen ? (
                                <Icons.ChevronDown
                                  size={16}
                                  aria-hidden="true"
                                  style={{ marginLeft: 4 }}
                                />
                              ) : (
                                <Icons.ChevronRight
                                  size={16}
                                  aria-hidden="true"
                                  style={{ marginLeft: 4 }}
                                />
                              )}
                            </Button>
                          )}
                        </div>
                        {isOpen && rev.answers ? (
                          <div
                            className="pm-enter"
                            style={{
                              marginTop: 16,
                              background: field,
                              border: "1px solid " + line,
                              borderRadius: B.radius,
                              padding: 16,
                            }}
                          >
                            <p
                              style={{
                                ...eyebrow,
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                                marginBottom: 12,
                              }}
                            >
                              <Icons.FileText size={12} aria-hidden="true" />
                              Read-only · locked on submission
                            </p>
                            <ol className="flex flex-col gap-4">
                              {rev.answers.map((a, i) => (
                                <li key={i}>
                                  <p
                                    style={{
                                      fontSize: 12,
                                      color: B.neutralColor,
                                      letterSpacing: "0.08em",
                                      textTransform: "uppercase",
                                    }}
                                  >
                                    {a.c}
                                  </p>
                                  <p style={{ fontWeight: 600, fontSize: 14 }}>{a.q}</p>
                                  <p style={{ ...nums, color: B.accentColor, fontSize: 14 }}>
                                    {a.r} of 5 — {SCALE[a.r - 1]}
                                  </p>
                                  <p style={{ fontSize: 14, lineHeight: 1.5 }}>{a.t}</p>
                                </li>
                              ))}
                            </ol>
                          </div>
                        ) : null}
                      </>
                    ) : (
                      <p style={{ color: B.neutralColor }}>
                        No self-review was set for this period.
                      </p>
                    )}
                  </div>
                  <h3 style={{ ...eyebrow, margin: "24px 0 8px" }}>
                    Feedback received · <span style={nums}>{fbs.length}</span>
                  </h3>
                  {fbs.length === 0 ? (
                    <p
                      style={{
                        color: B.neutralColor,
                        borderTop: "1px solid " + line,
                        paddingTop: 12,
                      }}
                    >
                      No feedback received in this period.
                    </p>
                  ) : (
                    <ul>
                      {fbs.map((f) => (
                        <li
                          key={f.id}
                          style={{ padding: "12px 0", borderTop: "1px solid " + line }}
                        >
                          <p style={{ fontSize: 14 }}>
                            <span style={{ fontWeight: 600 }}>{f.person}</span>{" "}
                            <span style={{ color: B.neutralColor, ...nums }}>
                              · {fmt(f.date)} · {f.type === "Praise" ? "Praise" : "Constructive"}
                            </span>
                          </p>
                          <p className="pm-clamp" style={{ fontSize: 14, lineHeight: 1.5 }}>
                            {f.body}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </section>
          );
        })
      )}
    </div>
  );

  const err = (id, text) =>
    text ? (
      <p
        id={id}
        className="inline-flex items-center gap-1"
        style={{ color: warn, fontSize: 13, marginTop: 4 }}
      >
        <Icons.AlertCircle size={14} aria-hidden="true" />
        {text}
      </p>
    ) : null;

  const feedbackPanel = (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p style={{ color: B.neutralColor, maxWidth: "60ch", lineHeight: 1.6 }}>
          Recognise good work when it happens, or write down a development point while it is fresh.
          Everything you send is attributed to you.
        </p>
        {!composeOpen ? (
          <Button
            type="button"
            onClick={() => {
              setComposeOpen(true);
              setNotice("");
            }}
            style={btnPrimary}
          >
            <Icons.Plus size={16} aria-hidden="true" style={{ marginRight: 8 }} />
            Write praise or feedback
          </Button>
        ) : null}
      </div>

      <div role="status" aria-live="polite">
        {notice ? (
          <div
            className="pm-enter flex items-center justify-between gap-4"
            style={{ ...panel, borderLeft: "1px solid " + B.accentColor, padding: "12px 16px" }}
          >
            <span className="inline-flex items-center gap-2">
              <Icons.CheckCircle size={16} aria-hidden="true" style={{ color: B.accentColor }} />
              {notice}
            </span>
            <Button
              type="button"
              aria-label="Dismiss message"
              onClick={() => setNotice("")}
              style={{ ...btnGhost, border: "none", minWidth: 44 }}
            >
              <Icons.X size={16} aria-hidden="true" />
            </Button>
          </div>
        ) : null}
      </div>

      {composeOpen ? (
        <form
          onSubmit={submitFeedback}
          noValidate
          className="pm-enter"
          aria-labelledby="compose-h"
          style={{ ...panel, padding: 24 }}
        >
          <h2 id="compose-h" style={{ ...serif, fontSize: 24, marginBottom: 16 }}>
            New {form.kind === "Praise" ? "praise" : "feedback"}
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="fb-kind" style={eyebrow}>
                Type
              </Label>
              <select
                id="fb-kind"
                value={form.kind}
                onChange={(e) => setForm({ ...form, kind: e.target.value, goal: "" })}
                style={{ ...inputStyle, marginTop: 8 }}
              >
                <option value="Praise">Praise</option>
                <option value="Constructive">Constructive feedback</option>
              </select>
            </div>
            <div>
              <Label htmlFor="fb-to" style={eyebrow}>
                To
              </Label>
              <select
                id="fb-to"
                value={form.to}
                aria-invalid={errors.to ? "true" : "false"}
                aria-describedby={errors.to ? "fb-to-err" : undefined}
                onChange={(e) => setForm({ ...form, to: e.target.value, goal: "" })}
                style={{ ...inputStyle, marginTop: 8, borderColor: errors.to ? warn : undefined }}
              >
                <option value="">Choose a colleague…</option>
                {picker.isLoading ? <option disabled>Loading colleagues…</option> : null}
                {colleagues.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.full_name}
                    {p.job_title ? " — " + p.job_title.name : ""}
                  </option>
                ))}
              </select>
              {picker.isError
                ? err("fb-to-load", "Colleagues could not be loaded. Try again.")
                : null}
              {err("fb-to-err", errors.to)}
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <Label htmlFor="fb-body" style={eyebrow}>
              Message
            </Label>
            <Textarea
              id="fb-body"
              rows={5}
              value={form.body}
              aria-invalid={errors.body ? "true" : "false"}
              aria-describedby={errors.body ? "fb-body-err" : undefined}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              placeholder={
                form.kind === "Praise"
                  ? "What did they do, and what difference did it make?"
                  : "Describe what you saw and what would help."
              }
              style={{
                ...inputStyle,
                marginTop: 8,
                padding: 12,
                lineHeight: 1.5,
                borderColor: errors.body ? warn : undefined,
              }}
            />
            {err("fb-body-err", errors.body)}
          </div>
          {form.kind !== "Praise" ? (
            <div style={{ marginTop: 16 }}>
              <Label htmlFor="fb-goal" style={eyebrow}>
                Link one of their goals (optional)
              </Label>
              <select
                id="fb-goal"
                value={form.goal}
                disabled={recipientGoals.length === 0}
                onChange={(e) => setForm({ ...form, goal: e.target.value })}
                style={{ ...inputStyle, marginTop: 8, opacity: recipientGoals.length ? 1 : 0.6 }}
              >
                <option value="">
                  {!form.to || form.to === "me"
                    ? "Choose a colleague first"
                    : recipientGoals.length
                      ? "No linked goal"
                      : "No goals you are able to view"}
                </option>
                {recipientGoals.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
          <p
            className="flex items-start gap-2"
            style={{ marginTop: 16, fontSize: 14, color: B.neutralColor, lineHeight: 1.5 }}
          >
            <Icons.User size={16} aria-hidden="true" style={{ marginTop: 2, flexShrink: 0 }} />
            <span>
              <span style={{ color: B.primaryColor, fontWeight: 600 }}>Who can read this: </span>
              {readers}
            </span>
          </p>
          {err("fb-form-err", errors.form)}
          <div className="flex flex-wrap gap-3" style={{ marginTop: 24 }}>
            <Button type="submit" style={btnPrimary} disabled={sendFeedback.isPending}>
              Send {form.kind === "Praise" ? "praise" : "feedback"}
            </Button>
            <Button
              type="button"
              onClick={() => {
                setComposeOpen(false);
                setErrors({});
              }}
              style={btnGhost}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : null}

      <section aria-labelledby="fb-list-h" style={{ ...panel, padding: 24 }}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 id="fb-list-h" style={{ ...serif, fontSize: 24 }}>
            {fbDir === "received" ? "Addressed to me" : "Sent by me"}
          </h2>
          {unreadCount > 0 && fbDir === "received" ? (
            <Button type="button" onClick={markAllRead} style={{ ...btnGhost, fontSize: 14 }}>
              Mark {unreadCount} as read
            </Button>
          ) : null}
        </div>
        <div style={{ marginTop: 16 }}>
          <Tabs
            tabs={[
              { key: "received", label: "Received" },
              { key: "given", label: "Given" },
            ]}
            active={fbDir}
            onChange={(k) => {
              setFbDir(k);
              setConfirmId("");
            }}
          />
        </div>
        <div
          className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2 lg:grid-cols-4"
          style={{ margin: "24px 0" }}
        >
          <div>
            <Label htmlFor="f-type" style={eyebrow}>
              Type
            </Label>
            <select
              id="f-type"
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              style={{ ...inputStyle, marginTop: 8 }}
            >
              <option value="All">All types</option>
              <option value="Praise">Praise</option>
              <option value="Constructive">Constructive</option>
            </select>
          </div>
          <div>
            <Label htmlFor="f-from" style={eyebrow}>
              From
            </Label>
            <Input
              id="f-from"
              type="date"
              value={filters.from}
              onChange={(e) => setFilters({ ...filters, from: e.target.value })}
              style={{ ...inputStyle, marginTop: 8, colorScheme: "dark", ...nums }}
            />
          </div>
          <div>
            <Label htmlFor="f-to" style={eyebrow}>
              To
            </Label>
            <Input
              id="f-to"
              type="date"
              value={filters.to}
              onChange={(e) => setFilters({ ...filters, to: e.target.value })}
              style={{ ...inputStyle, marginTop: 8, colorScheme: "dark", ...nums }}
            />
          </div>
          <Button
            type="button"
            disabled={!filtersActive}
            onClick={() => setFilters({ type: "All", from: "", to: "" })}
            style={{ ...btnGhost, opacity: filtersActive ? 1 : 0.5 }}
          >
            Clear filters
          </Button>
        </div>
        <p
          aria-live="polite"
          style={{ ...nums, fontSize: 13, color: B.neutralColor, marginBottom: 8 }}
        >
          Showing {listForDir.length} of {dirTotal}, newest first
        </p>
        {fbDir === "received" && fbLoading ? (
          <p role="status">Loading your feedback…</p>
        ) : fbDir === "received" && fbFailed ? (
          <p role="alert" style={{ color: warn }}>
            Your feedback could not be loaded. Try again.
          </p>
        ) : dirTotal === 0 ? (
          <Empty
            title={
              fbDir === "received" ? "No praise or feedback yet" : "You have not sent anything yet"
            }
            description={
              fbDir === "received"
                ? "When a colleague writes to you, it will appear here with their name and the date. You will also see a marker on your overview."
                : "Praise and feedback you write will be listed here, where you can withdraw it if needed."
            }
          />
        ) : listForDir.length === 0 ? (
          <Empty
            title="Nothing matches those filters"
            description="Try a wider date range or choose all types to see everything again."
            action={
              <Button
                type="button"
                onClick={() => setFilters({ type: "All", from: "", to: "" })}
                style={btnGhost}
              >
                Clear filters
              </Button>
            }
          />
        ) : (
          <ul>{listForDir.map((f) => feedbackRow(f, false))}</ul>
        )}
      </section>
    </div>
  );

  const roField = (label, value, id) => (
    <div>
      <dt style={eyebrow} id={id}>
        {label}
      </dt>
      <dd style={{ marginTop: 4, fontSize: 16 }}>{value}</dd>
    </div>
  );

  const profilePanel = (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <div className="flex flex-col gap-8">
        <section aria-labelledby="hr-h" style={{ ...panel, padding: 24 }}>
          <h2 id="hr-h" style={{ ...serif, fontSize: 24 }}>
            Your details
          </h2>
          <p
            className="inline-flex items-center gap-2"
            style={{ marginTop: 8, fontSize: 14, color: B.neutralColor }}
          >
            <Icons.Settings size={14} aria-hidden="true" />
            Maintained by HR. To change any of these, ask your HR Admin.
          </p>
          <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2" style={{ marginTop: 24 }}>
            {roField("Full name", ME.name)}
            {roField("Work email", ME.email)}
            {roField("Job title", ME.title)}
            {roField("Department", ME.dept)}
            {roField("Manager", ME.manager)}
            {roField("Role", ME.role)}
          </dl>
        </section>

        <form
          onSubmit={saveProfile}
          noValidate
          aria-labelledby="own-h"
          style={{ ...panel, padding: 24 }}
        >
          <h2 id="own-h" style={{ ...serif, fontSize: 24 }}>
            How colleagues see you
          </h2>
          <div className="flex items-center gap-4" style={{ margin: "24px 0" }}>
            <Avatar name={profile.display || ME.name} />
            <div style={{ flex: 1 }}>
              <Label htmlFor="p-photo" style={eyebrow}>
                Profile photo
              </Label>
              <input
                id="p-photo"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files && e.target.files[0];
                  setProfile({ ...profile, photo: f ? f.name : "" });
                  setProfileSaved("");
                }}
                style={{
                  display: "block",
                  marginTop: 8,
                  fontSize: 14,
                  color: B.neutralColor,
                  maxWidth: "100%",
                }}
              />
              {profile.photo ? (
                <p style={{ fontSize: 13, color: B.neutralColor, marginTop: 4 }}>
                  Selected: {profile.photo}. Save to apply it.
                </p>
              ) : null}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="p-display" style={eyebrow}>
                Display name
              </Label>
              <Input
                id="p-display"
                value={profile.display}
                aria-invalid={profileErr ? "true" : "false"}
                aria-describedby={profileErr ? "p-display-err" : undefined}
                onChange={(e) => {
                  setProfile({ ...profile, display: e.target.value });
                  setProfileSaved("");
                }}
                style={{ ...inputStyle, marginTop: 8, borderColor: profileErr ? warn : undefined }}
              />
              {err("p-display-err", profileErr)}
            </div>
            <div>
              <Label htmlFor="p-pron" style={eyebrow}>
                Pronouns
              </Label>
              <Input
                id="p-pron"
                value={profile.pronouns}
                onChange={(e) => {
                  setProfile({ ...profile, pronouns: e.target.value });
                  setProfileSaved("");
                }}
                style={{ ...inputStyle, marginTop: 8 }}
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4" style={{ marginTop: 24 }}>
            <Button type="submit" style={btnPrimary}>
              Save profile
            </Button>
            <span
              role="status"
              aria-live="polite"
              className="inline-flex items-center gap-2"
              style={{ fontSize: 14, color: B.accentColor }}
            >
              {profileSaved ? (
                <>
                  <Icons.CheckCircle size={16} aria-hidden="true" />
                  {profileSaved}
                </>
              ) : null}
            </span>
          </div>
        </form>
      </div>

      <form
        onSubmit={savePw}
        noValidate
        aria-labelledby="pw-h"
        style={{ ...panel, padding: 24, alignSelf: "start" }}
      >
        <h2 id="pw-h" style={{ ...serif, fontSize: 24 }}>
          Change password
        </h2>
        <p style={{ marginTop: 8, fontSize: 14, color: B.neutralColor }}>
          Forgotten it? Ask HR to issue a reset link from your employee record.
        </p>
        <div className="flex flex-col gap-4" style={{ marginTop: 24 }}>
          <div>
            <Label htmlFor="pw-cur" style={eyebrow}>
              Current password
            </Label>
            <Input
              id="pw-cur"
              type="password"
              autoComplete="current-password"
              value={pw.cur}
              onChange={(e) => setPw({ ...pw, cur: e.target.value })}
              style={{ ...inputStyle, marginTop: 8 }}
            />
          </div>
          <div>
            <Label htmlFor="pw-new" style={eyebrow}>
              New password
            </Label>
            <Input
              id="pw-new"
              type="password"
              autoComplete="new-password"
              aria-describedby={pwUnmet.length ? "pw-unmet" : "pw-rules"}
              aria-invalid={pwUnmet.length ? true : undefined}
              value={pw.next}
              onChange={(e) => setPw({ ...pw, next: e.target.value })}
              style={{ ...inputStyle, marginTop: 8 }}
            />
          </div>
          {pwUnmet.length ? (
            <div id="pw-unmet" role="alert">
              <p style={{ color: warn, fontSize: 13 }}>
                That password was not accepted. It still needs to meet:
              </p>
              <ul
                aria-label="Unmet password rules"
                style={{ color: warn, fontSize: 13, listStyle: "disc", paddingLeft: 20 }}
              >
                {pwUnmet.map((rule) => (
                  <li key={rule}>{rule}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <ul id="pw-rules" aria-label="Password rules" className="flex flex-col gap-1">
            {pwResults.map((r) => (
              <li
                key={r.k}
                className="flex items-center gap-2"
                style={{ fontSize: 14, color: r.ok ? B.accentColor : B.neutralColor }}
              >
                {r.ok ? (
                  <Icons.Check size={14} aria-hidden="true" />
                ) : (
                  <Icons.X size={14} aria-hidden="true" />
                )}
                {r.label} <span style={{ fontSize: 12 }}>— {r.ok ? "met" : "not met"}</span>
              </li>
            ))}
          </ul>
          <div>
            <Label htmlFor="pw-conf" style={eyebrow}>
              Confirm new password
            </Label>
            <Input
              id="pw-conf"
              type="password"
              autoComplete="new-password"
              value={pw.conf}
              onChange={(e) => setPw({ ...pw, conf: e.target.value })}
              style={{ ...inputStyle, marginTop: 8 }}
            />
          </div>
        </div>
        <div role="status" aria-live="polite" style={{ marginTop: 16 }}>
          {pwMsg.text ? (
            pwMsg.kind === "ok" ? (
              <p
                className="inline-flex items-center gap-2"
                style={{ color: B.accentColor, fontSize: 14 }}
              >
                <Icons.CheckCircle size={16} aria-hidden="true" />
                {pwMsg.text}
              </p>
            ) : (
              err("pw-err", pwMsg.text)
            )
          ) : null}
        </div>
        <Button type="submit" style={{ ...btnPrimary, marginTop: 16 }}>
          Change password
        </Button>
      </form>
    </div>
  );

  return (
    <div
      style={{
        background: B.backgroundColor,
        color: B.primaryColor,
        fontFamily: B.fontBody,
        fontSize: 15,
        lineHeight: 1.5,
        minHeight: "100%",
        padding: "32px 16px 64px",
      }}
    >
      <style>{`
        .pm-btn:focus-visible, button:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible, [role="tab"]:focus-visible { outline: 2px solid ${B.accentColor}; outline-offset: 2px; }
        button { cursor: pointer; transition: background-color .15s ease, border-color .15s ease, opacity .15s ease; }
        button:hover:not(:disabled) { border-color: ${B.accentColor} !important; }
        button:disabled { cursor: not-allowed; }
        .pm-clamp { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .pm-enter { animation: pmEnter .28s ease both; }
        .pm-bar { transition: width .5s ease; }
        @keyframes pmEnter { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        @media (prefers-reduced-motion: reduce) { .pm-enter { animation: none; } .pm-bar, button { transition: none; } }
      `}</style>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <header
          className="flex flex-wrap items-end justify-between gap-6"
          style={{ marginBottom: 32 }}
        >
          <div>
            <p style={{ ...eyebrow, ...nums }}>
              Thursday 29 October 2026 ·{" "}
              <span style={{ color: B.accentColor }}>Employee № E-0412</span>
            </p>
            <h1 style={{ ...serif, fontSize: 40, lineHeight: 1.15, marginTop: 8 }}>
              Good afternoon, {profile.display.trim() || "there"}.
            </h1>
            <div style={{ height: 1, width: 64, background: B.accentColor, margin: "16px 0" }} />
            <p style={{ color: B.neutralColor }}>
              {ME.title} · {ME.dept} · Reports to {ME.manager}
            </p>
          </div>
          <Button
            type="button"
            onClick={() => {
              setTab("feedback");
              setComposeOpen(true);
              setNotice("");
            }}
            style={btnPrimary}
          >
            <Icons.Plus size={16} aria-hidden="true" style={{ marginRight: 8 }} />
            Give praise or feedback
          </Button>
        </header>

        <div style={{ marginBottom: 24 }}>
          <Tabs
            tabs={[
              { key: "overview", label: "Overview" },
              { key: "record", label: "My record" },
              {
                key: "feedback",
                label: unreadCount > 0 ? "My feedback (" + unreadCount + " new)" : "My feedback",
              },
              { key: "profile", label: "Profile & password" },
            ]}
            active={tab}
            onChange={setTab}
          />
        </div>

        <div
          role="tabpanel"
          aria-label={
            tab === "overview"
              ? "Overview"
              : tab === "record"
                ? "My record"
                : tab === "feedback"
                  ? "My feedback"
                  : "Profile and password"
          }
        >
          {tab === "overview"
            ? overview
            : tab === "record"
              ? record
              : tab === "feedback"
                ? feedbackPanel
                : profilePanel}
        </div>

        <footer
          className="flex flex-wrap items-center justify-between gap-4"
          style={{
            marginTop: 48,
            paddingTop: 16,
            borderTop: "1px solid " + line,
            fontSize: 13,
            color: B.neutralColor,
          }}
        >
          <span>Only you, and people your role entitles, can see this page’s contents.</span>
          <span className="inline-flex items-center gap-3">
            <Label htmlFor="ns-switch" style={{ fontSize: 13 }}>
              Preview first-week empty states
            </Label>
            <Switch
              checked={newStarter}
              onChange={(v) => {
                setNewStarter(typeof v === "boolean" ? v : !newStarter);
              }}
            />
          </span>
        </footer>
      </div>
    </div>
  );
}
