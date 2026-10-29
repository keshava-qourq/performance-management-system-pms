// @ts-nocheck -- generated from the approved design under its JS runtime contract; not hand-written TypeScript.
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";

import * as UI from "@/lib/ui";
import { Icons } from "@/lib/icons";
import { brand } from "@/lib/brand";
import { useNavigate } from "@/lib/navigate";
import { useSession } from "@/lib/session";
import DirectoryTab from "@/screens/PeopleDirectory";
import { formatDateTime } from "@/lib/dateFormat";

const {
  Button,
  Input,
  Label,
  Switch,
  Badge,
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
  Avatar,
  Separator,
  Tabs,
  Stat,
  Empty,
} = UI;

const {
  Plus,
  Search,
  Check,
  X,
  ChevronRight,
  Settings,
  Clock,
  Trash,
  Edit,
  Filter,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  CheckCircle,
} = Icons;

const SURF = "#1d2b25";
const SURF2 = "#223229";
const LINE = "rgba(255,255,255,0.1)";
const FOCUS = "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8fae8b]";
const ROLES = ["Employee", "Manager", "HR Admin", "Executive"];
const PERSONAS = {
  "HR Admin": { id: "e1", label: "Amara Okafor · HR Admin" },
  Manager: { id: "e2", label: "Daniel Reyes · Manager" },
  Employee: { id: "e3", label: "Priya Nair · Employee" },
  Executive: { id: "e7", label: "Helena Voss · Executive (read-only)" },
};
const DEPTS0 = [
  { id: "d1", name: "Engineering" },
  { id: "d2", name: "Design" },
  { id: "d3", name: "Sales" },
  { id: "d4", name: "People & Culture" },
  { id: "d5", name: "Executive Office" },
];
const TITLES0 = [
  { id: "t1", name: "HR Director" },
  { id: "t2", name: "Engineering Manager" },
  { id: "t3", name: "Senior Software Engineer" },
  { id: "t4", name: "Software Engineer" },
  { id: "t5", name: "Product Designer" },
  { id: "t6", name: "Head of Design" },
  { id: "t7", name: "Revenue Operations Analyst" },
  { id: "t8", name: "Chief Operating Officer" },
  { id: "t9", name: "Customer Success Manager" },
];
const EMPS0 = [
  {
    id: "e1",
    full_name: "Amara Okafor",
    work_email: "amara.okafor@halden.co",
    job_title_id: "t1",
    department_id: "d4",
    manager_id: "e7",
    role: "HR Admin",
    status: "Active",
    leaving_date: "",
    account_status: "Active",
  },
  {
    id: "e2",
    full_name: "Daniel Reyes",
    work_email: "daniel.reyes@halden.co",
    job_title_id: "t2",
    department_id: "d1",
    manager_id: "e7",
    role: "Manager",
    status: "Active",
    leaving_date: "",
    account_status: "Active",
  },
  {
    id: "e3",
    full_name: "Priya Nair",
    work_email: "priya.nair@halden.co",
    job_title_id: "t3",
    department_id: "d1",
    manager_id: "e2",
    role: "Employee",
    status: "Active",
    leaving_date: "",
    account_status: "Active",
  },
  {
    id: "e4",
    full_name: "Marcus Webb",
    work_email: "marcus.webb@halden.co",
    job_title_id: "t5",
    department_id: "d2",
    manager_id: "e5",
    role: "Employee",
    status: "Active",
    leaving_date: "",
    account_status: "Active",
  },
  {
    id: "e5",
    full_name: "Sofia Lindqvist",
    work_email: "sofia.lindqvist@halden.co",
    job_title_id: "t6",
    department_id: "d2",
    manager_id: "e7",
    role: "Manager",
    status: "Active",
    leaving_date: "",
    account_status: "Active",
  },
  {
    id: "e6",
    full_name: "Jonas Albrecht",
    work_email: "jonas.albrecht@halden.co",
    job_title_id: "t7",
    department_id: "d3",
    manager_id: "e7",
    role: "Employee",
    status: "Active",
    leaving_date: "",
    account_status: "Invited",
  },
  {
    id: "e7",
    full_name: "Helena Voss",
    work_email: "helena.voss@halden.co",
    job_title_id: "t8",
    department_id: "d5",
    manager_id: "",
    role: "Executive",
    status: "Active",
    leaving_date: "",
    account_status: "Active",
  },
  {
    id: "e8",
    full_name: "Tomas Lindgren",
    work_email: "tomas.lindgren@halden.co",
    job_title_id: "t4",
    department_id: "d1",
    manager_id: "",
    role: "Employee",
    status: "Active",
    leaving_date: "",
    account_status: "No account",
  },
  {
    id: "e9",
    full_name: "Ingrid Solheim",
    work_email: "ingrid.solheim@halden.co",
    job_title_id: "t9",
    department_id: "d3",
    manager_id: "e7",
    role: "Employee",
    status: "Deactivated",
    leaving_date: "2026-09-30",
    account_status: "Deactivated",
  },
];
const RECORDS = {
  e3: {
    goals: [
      {
        t: "Cut p95 checkout API latency to 300 ms",
        target: "p95 ≤ 300 ms",
        due: "2026-12-15",
        w: 40,
        p: 65,
        s: "On track",
        parent: "Company: Make checkout instant",
      },
      {
        t: "Mentor two junior engineers through onboarding",
        target: "Both sign off the 90-day plan",
        due: "2026-11-30",
        w: 20,
        p: 50,
        s: "On track",
        parent: "Engineering: Grow the bench",
      },
      {
        t: "Retire the legacy nightly export jobs",
        target: "12 of 12 jobs migrated",
        due: "2026-12-01",
        w: 30,
        p: 25,
        s: "At risk",
        parent: "Engineering: Reduce operational toil",
      },
    ],
    reviews: [
      {
        period: "H1 2026",
        submitted: "2026-07-08",
        answers: [
          {
            q: "Delivers results: I met the commitments I set for the period.",
            r: "4 – Exceeds",
            c: "Shipped the cart service rewrite two weeks early.",
          },
          {
            q: "Collaboration: I help colleagues succeed.",
            r: "4 – Exceeds",
            c: "Ran the weekly pairing hour for the platform squad.",
          },
          {
            q: "Growth: I act on feedback.",
            r: "3 – Meets",
            c: "Working on writing shorter design docs.",
          },
        ],
      },
      {
        period: "H2 2025",
        submitted: "2026-01-12",
        answers: [
          {
            q: "Delivers results: I met the commitments I set for the period.",
            r: "3 – Meets",
            c: "Hit most targets; the search migration slipped a month.",
          },
          {
            q: "Collaboration: I help colleagues succeed.",
            r: "3 – Meets",
            c: "Reviewed code promptly, could mentor more.",
          },
          {
            q: "Growth: I act on feedback.",
            r: "4 – Exceeds",
            c: "Adopted the feedback from Daniel on estimation.",
          },
        ],
      },
    ],
    feedback: [
      {
        type: "Praise",
        from: "Marcus Webb",
        date: "2026-10-02",
        body: "Thank you for staying late to unblock the checkout redesign handoff. It made the launch.",
      },
      {
        type: "Constructive",
        from: "Daniel Reyes",
        date: "2026-09-18",
        body: "Your incident write-ups are thorough; keep the summary to one paragraph so leadership reads it.",
      },
    ],
  },
  e4: {
    goals: [
      {
        t: "Ship the redesigned onboarding flow",
        target: "Activation rate +8 points",
        due: "2026-12-10",
        w: 60,
        p: 40,
        s: "On track",
        parent: "Company: Make checkout instant",
      },
      {
        t: "Publish the component guidelines v2",
        target: "Adopted by 3 squads",
        due: "2026-11-20",
        w: 40,
        p: 80,
        s: "On track",
        parent: "Design: One system, every surface",
      },
    ],
    reviews: [
      {
        period: "H1 2026",
        submitted: "2026-07-10",
        answers: [
          {
            q: "Delivers results: I met the commitments I set for the period.",
            r: "3 – Meets",
            c: "Delivered the settings redesign on schedule.",
          },
          {
            q: "Collaboration: I help colleagues succeed.",
            r: "4 – Exceeds",
            c: "Co-ran two cross-team workshops.",
          },
        ],
      },
    ],
    feedback: [
      {
        type: "Praise",
        from: "Priya Nair",
        date: "2026-10-14",
        body: "Your annotated specs saved us a full sprint of back-and-forth.",
      },
    ],
  },
};

export default function Screen() {
  const navigate = useNavigate();
  const {
    Button,
    Input,
    Label,
    Badge,
    Table,
    THead,
    TBody,
    TR,
    TH,
    TD,
    Switch,
    Tabs,
    Empty,
    Separator,
  } = UI;
  const {
    Plus,
    Search,
    Check,
    X,
    ChevronRight,
    ArrowLeft,
    ArrowRight,
    Edit,
    Users,
    AlertCircle,
    CheckCircle,
    Trash,
    FileText,
    Clock,
  } = Icons;

  const { role: sessionRole } = useSession();
  const viewAs =
    { hr_admin: "HR Admin", manager: "Manager", executive: "Executive" }[sessionRole || ""] ||
    "Employee";
  const [tab, setTab] = React.useState("directory");
  const [emps, setEmps] = React.useState(EMPS0);
  const [depts, setDepts] = React.useState(DEPTS0);
  const [titles, setTitles] = React.useState(TITLES0);
  const [mgrSeesFeedback, setMgrSeesFeedback] = React.useState(false);
  const [settingSaved, setSettingSaved] = React.useState("");
  const [q, setQ] = React.useState("");
  const [deptFilter, setDeptFilter] = React.useState("all");
  const [panel, setPanel] = React.useState(null); // { mode: 'create'|'edit', id }
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    titleId: "t4",
    deptId: "d1",
    managerId: "",
    role: "Employee",
  });
  const [errs, setErrs] = React.useState({});
  const [msg, setMsg] = React.useState("");
  const [links, setLinks] = React.useState({});
  const [deact, setDeact] = React.useState({
    open: false,
    leave: "2026-10-29",
    reassign: "",
    err: "",
  });
  const [newDept, setNewDept] = React.useState("");
  const [deptMsg, setDeptMsg] = React.useState({ kind: "", text: "" });
  const [newTitle, setNewTitle] = React.useState("");
  const [renaming, setRenaming] = React.useState(null);
  const [renameVal, setRenameVal] = React.useState("");
  const [recordId, setRecordId] = React.useState(null);
  const [recTab, setRecTab] = React.useState("goals");
  const [period, setPeriod] = React.useState("");
  const [viewLog, setViewLog] = React.useState("");
  const tokenN = React.useRef(41);

  const viewer = PERSONAS[viewAs];
  const isHR = viewAs === "HR Admin";
  const byId = (id) => emps.find((e) => e.id === id);
  const nameOf = (id) => (byId(id) ? byId(id).full_name : "");
  const titleName = (id) => (titles.find((t) => t.id === id) || {}).name || "—";
  const deptName = (id) => (depts.find((d) => d.id === id) || {}).name || "—";
  const activeReports = (id) => emps.filter((e) => e.manager_id === id && e.status === "Active");
  const chainIncludes = (empId, ancestorId) => {
    let cur = byId(empId);
    let guard = 0;
    while (cur && cur.manager_id && guard < 50) {
      if (cur.manager_id === ancestorId) return true;
      cur = byId(cur.manager_id);
      guard++;
    }
    return false;
  };
  const canView = (id) => isHR || (viewAs === "Manager" && chainIncludes(id, viewer.id));
  const derivedRole = (e) =>
    e.role === "Employee" && activeReports(e.id).length > 0 ? "Manager" : e.role;
  const flash = (t) => setMsg(t);

  const inputStyle = { backgroundColor: "#16211c", color: brand.primaryColor, borderColor: LINE };
  const prim = { backgroundColor: brand.accentColor, color: "#16211c" };
  const sec = {
    backgroundColor: "transparent",
    color: brand.primaryColor,
    border: "1px solid " + LINE,
  };
  const muted = { color: brand.neutralColor };
  const eyebrow = "text-[11px] uppercase tracking-[0.16em]";
  const panelBox = { backgroundColor: SURF, border: "1px solid " + LINE, borderRadius: 6 };

  const sel = (value, onChange, options, id, extra) => (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={"w-full h-10 px-3 border text-sm " + FOCUS}
      style={{ ...inputStyle, borderRadius: 6 }}
      {...(extra || {})}
    >
      {options.map((o) => (
        <option key={o.v} value={o.v}>
          {o.l}
        </option>
      ))}
    </select>
  );
  const errLine = (t) =>
    t ? (
      <p className="mt-1 text-xs flex items-start gap-1" role="alert" style={{ color: "#e8a29a" }}>
        <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
        <span>{t}</span>
      </p>
    ) : null;

  const statusBadge = (e) => {
    if (e.status === "Deactivated")
      return (
        <Badge variant="outline" style={{ color: brand.neutralColor, borderColor: LINE }}>
          Deactivated
        </Badge>
      );
    const c =
      e.account_status === "Active"
        ? brand.accentColor
        : e.account_status === "Invited"
          ? "#d9bf84"
          : brand.neutralColor;
    return (
      <Badge variant="outline" style={{ color: c, borderColor: c }}>
        {e.account_status}
      </Badge>
    );
  };

  // ---------- actions ----------
  const openCreate = () => {
    setForm({
      name: "",
      email: "",
      titleId: titles[0].id,
      deptId: depts[0].id,
      managerId: "",
      role: "Employee",
    });
    setErrs({});
    setMsg("");
    setDeact({ open: false, leave: "2026-10-29", reassign: "", err: "" });
    setPanel({ mode: "create", id: null });
  };
  const openEdit = (e) => {
    setForm({
      name: e.full_name,
      email: e.work_email,
      titleId: e.job_title_id,
      deptId: e.department_id,
      managerId: e.manager_id,
      role: e.role,
    });
    setErrs({});
    setMsg("");
    setDeact({ open: false, leave: "2026-10-29", reassign: "", err: "" });
    setPanel({ mode: "edit", id: e.id });
  };
  const saveEmployee = (ev) => {
    if (ev) ev.preventDefault();
    if (!isHR) return;
    const editId = panel.mode === "edit" ? panel.id : null;
    const er = {};
    if (!form.name.trim()) er.name = "Full name is required. Enter the employee’s full name.";
    if (!form.email.trim())
      er.email = "Work email is required. Enter a work email such as name@halden.co.";
    else {
      const dup = emps.find(
        (e) => e.id !== editId && e.work_email.toLowerCase() === form.email.trim().toLowerCase(),
      );
      if (dup)
        er.email =
          "This work email is already used by " +
          dup.full_name +
          ". Each employee needs a unique work email.";
    }
    if (form.managerId) {
      if (editId && form.managerId === editId)
        er.manager =
          "The reporting line would be circular: an employee cannot be their own manager.";
      else if (editId && chainIncludes(form.managerId, editId))
        er.manager =
          "The reporting line would be circular: " +
          nameOf(form.managerId) +
          " already reports, directly or indirectly, to " +
          nameOf(editId) +
          ".";
    }
    if (editId) {
      const cur = byId(editId);
      const hrCount = emps.filter((e) => e.role === "HR Admin" && e.status === "Active").length;
      if (cur.role === "HR Admin" && form.role !== "HR Admin" && hrCount <= 1)
        er.role =
          "At least one HR Admin must remain. Assign another HR Admin before changing this role.";
    }
    setErrs(er);
    if (Object.keys(er).length) return;
    if (editId) {
      setEmps(
        emps.map((e) =>
          e.id === editId
            ? {
                ...e,
                full_name: form.name.trim(),
                work_email: form.email.trim(),
                job_title_id: form.titleId,
                department_id: form.deptId,
                manager_id: form.managerId,
                role: form.role,
              }
            : e,
        ),
      );
      flash(form.name.trim() + " was updated. The directory shows the new details.");
    } else {
      const id = "e" + (emps.length + 1);
      setEmps([
        ...emps,
        {
          id,
          full_name: form.name.trim(),
          work_email: form.email.trim(),
          job_title_id: form.titleId,
          department_id: form.deptId,
          manager_id: form.managerId,
          role: form.role,
          status: "Active",
          leaving_date: "",
          account_status: "No account",
        },
      ]);
      flash(form.name.trim() + " was added to the directory.");
      setPanel({ mode: "edit", id });
    }
  };
  const setAccount = (id, st) =>
    setEmps((list) => list.map((e) => (e.id === id ? { ...e, account_status: st } : e)));
  const issueLink = (id, kind) => {
    tokenN.current += 1;
    const token =
      (kind === "invite" ? "inv_" : "rst_") +
      tokenN.current.toString(36) +
      "k" +
      (tokenN.current * 7919).toString(36);
    setLinks((l) => ({
      ...l,
      [id]: {
        kind,
        url: "https://people.halden.co/" + (kind === "invite" ? "accept" : "reset") + "/" + token,
        expires: kind === "invite" ? "5 Nov 2026" : "30 Oct 2026",
      },
    }));
    if (kind === "invite") setAccount(id, "Invited");
    flash(
      kind === "invite"
        ? "Invitation link generated for " + nameOf(id) + ". Any earlier link no longer works."
        : "Password-reset link generated for " + nameOf(id) + ". It works once.",
    );
  };
  const revoke = (id) => {
    setLinks((l) => {
      const n = { ...l };
      delete n[id];
      return n;
    });
    setAccount(id, "No account");
    flash("Invitation revoked. The previous link stopped working immediately.");
  };
  const copyLink = (id) => {
    try {
      if (navigator.clipboard) navigator.clipboard.writeText(links[id].url);
    } catch (e) {
      /* ignore */
    }
    flash(
      "Link copied. Send it to " + nameOf(id) + " directly; no email is sent from this product.",
    );
  };
  const confirmDeactivate = () => {
    const id = panel.id;
    const reports = activeReports(id);
    if (!deact.leave) {
      setDeact({ ...deact, err: "Enter a leaving date." });
      return;
    }
    if (reports.length && !deact.reassign) {
      setDeact({
        ...deact,
        err:
          nameOf(id) +
          " still has " +
          reports.length +
          " direct report" +
          (reports.length > 1 ? "s" : "") +
          ". Choose a new manager for them before deactivating.",
      });
      return;
    }
    setEmps(
      emps.map((e) => {
        if (e.id === id)
          return {
            ...e,
            status: "Deactivated",
            leaving_date: deact.leave,
            account_status: "Deactivated",
          };
        if (e.manager_id === id) return { ...e, manager_id: deact.reassign };
        return e;
      }),
    );
    setDeact({ open: false, leave: "2026-10-29", reassign: "", err: "" });
    flash(nameOf(id) + " was deactivated. Sign-in is refused and their history is preserved.");
  };
  const addDept = (ev) => {
    ev.preventDefault();
    const n = newDept.trim();
    if (!n) {
      setDeptMsg({ kind: "err", text: "Enter a department name." });
      return;
    }
    if (depts.some((d) => d.name.toLowerCase() === n.toLowerCase())) {
      setDeptMsg({
        kind: "err",
        text: "A department named “" + n + "” already exists. Names must be unique.",
      });
      return;
    }
    setDepts([...depts, { id: "d" + (depts.length + 10), name: n }]);
    setNewDept("");
    setDeptMsg({
      kind: "ok",
      text: "“" + n + "” was added and can now be chosen on employee records.",
    });
  };
  const delDept = (d) => {
    const c = emps.filter((e) => e.department_id === d.id && e.status === "Active").length;
    if (c > 0) {
      setDeptMsg({
        kind: "err",
        text:
          "Cannot delete " +
          d.name +
          ": " +
          c +
          " active employee" +
          (c > 1 ? "s are" : " is") +
          " still assigned to it.",
      });
      return;
    }
    setDepts(depts.filter((x) => x.id !== d.id));
    setDeptMsg({ kind: "ok", text: d.name + " was deleted." });
  };
  const addTitle = (ev) => {
    ev.preventDefault();
    const n = newTitle.trim();
    if (!n || titles.some((t) => t.name.toLowerCase() === n.toLowerCase())) {
      setDeptMsg({
        kind: "err",
        text: n ? "The job title “" + n + "” already exists." : "Enter a job title.",
      });
      return;
    }
    setTitles([...titles, { id: "t" + (titles.length + 10), name: n }]);
    setNewTitle("");
    setDeptMsg({ kind: "ok", text: "Job title “" + n + "” was added." });
  };
  const saveRename = (t) => {
    const n = renameVal.trim();
    if (!n) return;
    setTitles(titles.map((x) => (x.id === t.id ? { ...x, name: n } : x)));
    setRenaming(null);
    setDeptMsg({
      kind: "ok",
      text: "“" + t.name + "” is now “" + n + "” on every employee record that uses it.",
    });
  };
  const openRecord = (e) => {
    setRecordId(e.id);
    setRecTab("goals");
    const r = RECORDS[e.id];
    setPeriod(r && r.reviews.length ? r.reviews[0].period : "");
    setViewLog(
      "Access recorded: " +
        viewer.label.split(" · ")[0] +
        " (" +
        viewAs +
        ") opened this record on " +
        formatDateTime(new Date()) +
        ".",
    );
  };
  const togglePref = (v) => {
    const next = typeof v === "boolean" ? v : v && v.target ? v.target.checked : !mgrSeesFeedback;
    setMgrSeesFeedback(next);
    setSettingSaved(
      next
        ? "Saved. Managers can now read feedback addressed to people in their reporting line."
        : "Saved. Managers can no longer see feedback addressed to their direct reports.",
    );
  };

  // ---------- render parts ----------
  const filtered = emps.filter((e) => {
    const s = q.trim().toLowerCase();
    const okQ =
      !s ||
      e.full_name.toLowerCase().includes(s) ||
      e.work_email.toLowerCase().includes(s) ||
      titleName(e.job_title_id).toLowerCase().includes(s);
    return okQ && (deptFilter === "all" || e.department_id === deptFilter);
  });

  const renderDirectory = () => (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3" style={muted} />
          <Input
            aria-label="Search people"
            placeholder="Search by name, email or job title"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className={"pl-9 h-10 " + FOCUS}
            style={inputStyle}
          />
        </div>
        <div className="sm:w-56">
          {sel(
            deptFilter,
            setDeptFilter,
            [{ v: "all", l: "All departments" }, ...depts.map((d) => ({ v: d.id, l: d.name }))],
            "deptf",
            { "aria-label": "Filter by department" },
          )}
        </div>
      </div>
      {filtered.length === 0 ? (
        <Empty
          title="No one matches that search"
          description="Clear the search or choose All departments to see the full directory."
        />
      ) : (
        <div className="overflow-x-auto" style={panelBox}>
          <Table className="w-full text-sm">
            <THead>
              <TR>
                {["Employee", "Job title", "Department", "Manager", "Role", "Account", ""].map(
                  (h, i) => (
                    <TH
                      key={i}
                      className={"text-left px-4 py-3 font-normal " + eyebrow}
                      style={{ ...muted, borderBottom: "1px solid " + LINE }}
                    >
                      {h}
                    </TH>
                  ),
                )}
              </TR>
            </THead>
            <TBody>
              {filtered.map((e) => (
                <TR
                  key={e.id}
                  style={{
                    borderBottom: "1px solid " + LINE,
                    opacity: e.status === "Deactivated" ? 0.7 : 1,
                  }}
                >
                  <TD className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={e.full_name} />
                      <div>
                        <div style={{ color: brand.primaryColor }}>{e.full_name}</div>
                        <div className="text-xs" style={muted}>
                          {e.work_email}
                        </div>
                      </div>
                    </div>
                  </TD>
                  <TD className="px-4 py-3" style={{ color: brand.primaryColor }}>
                    {titleName(e.job_title_id)}
                  </TD>
                  <TD className="px-4 py-3" style={{ color: brand.primaryColor }}>
                    {deptName(e.department_id)}
                  </TD>
                  <TD className="px-4 py-3">
                    {e.manager_id ? (
                      <span style={{ color: brand.primaryColor }}>{nameOf(e.manager_id)}</span>
                    ) : (
                      <span
                        className="inline-flex items-center gap-1 text-xs"
                        style={{ color: "#d9bf84" }}
                      >
                        <AlertCircle className="w-3 h-3" />
                        Missing reporting line
                      </span>
                    )}
                  </TD>
                  <TD className="px-4 py-3" style={{ color: brand.primaryColor }}>
                    {derivedRole(e)}
                  </TD>
                  <TD className="px-4 py-3">{statusBadge(e)}</TD>
                  <TD className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        className={FOCUS}
                        style={sec}
                        onClick={() => openRecord(e)}
                        disabled={!canView(e.id)}
                        aria-label={"Open review record for " + e.full_name}
                      >
                        Record
                      </Button>
                      {isHR && (
                        <Button
                          size="sm"
                          className={FOCUS}
                          style={sec}
                          onClick={() => openEdit(e)}
                          aria-label={"Manage " + e.full_name}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Manage
                        </Button>
                      )}
                    </div>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </div>
      )}
    </div>
  );

  const renderPanel = () => {
    if (!panel) return null;
    const editing = panel.mode === "edit";
    const emp = editing ? byId(panel.id) : null;
    const lk = editing ? links[panel.id] : null;
    const reports = editing ? activeReports(panel.id) : [];
    const mgrOptions = [
      { v: "", l: "No manager" },
      ...emps
        .filter((e) => e.status === "Active")
        .map((e) => ({ v: e.id, l: e.full_name + " · " + titleName(e.job_title_id) })),
    ];
    const fld = (label, id, child, err) => (
      <div>
        <Label htmlFor={id} className={"block mb-1 " + eyebrow} style={muted}>
          {label}
        </Label>
        {child}
        {errLine(err)}
      </div>
    );
    return (
      <aside aria-label="Employee record form" className="p-5 space-y-5" style={panelBox}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className={eyebrow} style={{ color: brand.accentColor }}>
              {editing ? "Employee record" : "New employee"}
            </div>
            <h2
              className="text-xl"
              style={{ fontFamily: brand.fontHeading, color: brand.primaryColor }}
            >
              {editing ? emp.full_name : "Add an employee"}
            </h2>
          </div>
          <Button
            size="sm"
            className={FOCUS}
            style={sec}
            onClick={() => setPanel(null)}
            aria-label="Close panel"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <form onSubmit={saveEmployee} className="space-y-4" noValidate>
          {fld(
            "Full name",
            "f-name",
            <Input
              id="f-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={FOCUS}
              style={inputStyle}
              aria-invalid={!!errs.name}
            />,
            errs.name,
          )}
          {fld(
            "Work email",
            "f-email",
            <Input
              id="f-email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={FOCUS}
              style={inputStyle}
              aria-invalid={!!errs.email}
            />,
            errs.email,
          )}
          {fld(
            "Job title",
            "f-title",
            sel(
              form.titleId,
              (v) => setForm({ ...form, titleId: v }),
              titles.map((t) => ({ v: t.id, l: t.name })),
              "f-title",
            ),
          )}
          {fld(
            "Department",
            "f-dept",
            sel(
              form.deptId,
              (v) => setForm({ ...form, deptId: v }),
              depts.map((d) => ({ v: d.id, l: d.name })),
              "f-dept",
            ),
          )}
          {fld(
            "Manager",
            "f-mgr",
            sel(form.managerId, (v) => setForm({ ...form, managerId: v }), mgrOptions, "f-mgr"),
            errs.manager,
          )}
          {fld(
            "Role",
            "f-role",
            sel(
              form.role,
              (v) => setForm({ ...form, role: v }),
              ROLES.map((r) => ({ v: r, l: r + (r === "Executive" ? " (read-only)" : "") })),
              "f-role",
            ),
            errs.role,
          )}
          <p className="text-xs" style={muted}>
            Manager capability is derived: anyone with at least one direct report becomes a Manager
            automatically.
          </p>
          <Button type="submit" className={"w-full " + FOCUS} style={prim}>
            <Check className="w-4 h-4 mr-1" />
            {editing ? "Save changes" : "Create employee"}
          </Button>
        </form>

        {editing && emp.status === "Active" && (
          <>
            <Separator />
            <section aria-label="Account access" className="space-y-3">
              <div className={eyebrow} style={muted}>
                Account access
              </div>
              <div
                className="flex items-center gap-2 text-sm"
                style={{ color: brand.primaryColor }}
              >
                Account status: {statusBadge(emp)}
              </div>
              {emp.account_status === "No account" && (
                <Button className={FOCUS} style={sec} onClick={() => issueLink(emp.id, "invite")}>
                  Invite {emp.full_name.split(" ")[0]}
                </Button>
              )}
              {emp.account_status === "Active" && (
                <Button className={FOCUS} style={sec} onClick={() => issueLink(emp.id, "reset")}>
                  Issue password-reset link
                </Button>
              )}
              {emp.account_status === "Invited" && !lk && (
                <Button className={FOCUS} style={sec} onClick={() => issueLink(emp.id, "invite")}>
                  Reissue invitation
                </Button>
              )}
              {lk && (
                <div className="space-y-2">
                  <Label htmlFor="link" className={eyebrow} style={muted}>
                    {lk.kind === "invite" ? "Invitation link" : "Password-reset link"} · expires{" "}
                    {lk.expires}
                  </Label>
                  <Input
                    id="link"
                    readOnly
                    value={lk.url}
                    className={FOCUS}
                    style={{ ...inputStyle, color: brand.accentColor }}
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      className={FOCUS}
                      style={prim}
                      onClick={() => copyLink(emp.id)}
                    >
                      Copy link
                    </Button>
                    {lk.kind === "invite" && (
                      <Button
                        size="sm"
                        className={FOCUS}
                        style={sec}
                        onClick={() => issueLink(emp.id, "invite")}
                      >
                        Reissue
                      </Button>
                    )}
                    {lk.kind === "invite" && (
                      <Button
                        size="sm"
                        className={FOCUS}
                        style={sec}
                        onClick={() => revoke(emp.id)}
                      >
                        Revoke
                      </Button>
                    )}
                  </div>
                  <p className="text-xs" style={muted}>
                    Only the newest link works. Share it with the employee yourself; email is not
                    sent from this product.
                  </p>
                </div>
              )}
              {emp.account_status === "Invited" && !lk && (
                <p className="text-xs" style={muted}>
                  An invitation is outstanding. Reissue it to get a fresh link; the old one stops
                  working.
                </p>
              )}
            </section>
            <Separator />
            <section aria-label="Deactivate employee" className="space-y-3">
              <div className={eyebrow} style={muted}>
                Deactivation
              </div>
              {!deact.open ? (
                <Button
                  className={FOCUS}
                  style={sec}
                  onClick={() => setDeact({ ...deact, open: true, err: "" })}
                >
                  Deactivate employee…
                </Button>
              ) : (
                <div
                  className="space-y-3 p-3"
                  style={{ backgroundColor: SURF2, border: "1px solid " + LINE, borderRadius: 6 }}
                >
                  <p className="text-sm" style={{ color: brand.primaryColor }}>
                    Deactivating ends {emp.full_name.split(" ")[0]}’s sign-in immediately. Goals,
                    feedback and reviews are kept as employment evidence.
                  </p>
                  <div>
                    <Label htmlFor="leave" className={"block mb-1 " + eyebrow} style={muted}>
                      Leaving date
                    </Label>
                    <Input
                      id="leave"
                      type="date"
                      value={deact.leave}
                      onChange={(e) => setDeact({ ...deact, leave: e.target.value, err: "" })}
                      className={FOCUS}
                      style={inputStyle}
                    />
                  </div>
                  {reports.length > 0 && (
                    <div>
                      <Label htmlFor="reassign" className={"block mb-1 " + eyebrow} style={muted}>
                        Reassign {reports.length} direct report{reports.length > 1 ? "s" : ""} to
                      </Label>
                      {sel(
                        deact.reassign,
                        (v) => setDeact({ ...deact, reassign: v, err: "" }),
                        [
                          { v: "", l: "Choose a manager" },
                          ...emps
                            .filter((e) => e.status === "Active" && e.id !== emp.id)
                            .map((e) => ({ v: e.id, l: e.full_name })),
                        ],
                        "reassign",
                      )}
                      <p className="text-xs mt-1" style={muted}>
                        {reports.map((r) => r.full_name).join(", ")}
                      </p>
                    </div>
                  )}
                  {errLine(deact.err)}
                  <div className="flex gap-2">
                    <Button size="sm" className={FOCUS} style={prim} onClick={confirmDeactivate}>
                      Confirm deactivation
                    </Button>
                    <Button
                      size="sm"
                      className={FOCUS}
                      style={sec}
                      onClick={() => setDeact({ ...deact, open: false, err: "" })}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </section>
          </>
        )}
        {editing && emp.status === "Deactivated" && (
          <p className="text-sm" style={muted}>
            Deactivated on {emp.leaving_date}. Sign-in is refused; their history stays available in
            the review record.
          </p>
        )}
      </aside>
    );
  };

  const renderOrg = () => (
    <div className="space-y-4">
      {deptMsg.text && (
        <div
          role="status"
          className="flex items-start gap-2 p-3 text-sm"
          style={{ ...panelBox, color: deptMsg.kind === "err" ? "#e8a29a" : brand.accentColor }}
        >
          {deptMsg.kind === "err" ? (
            <AlertCircle className="w-4 h-4 mt-0.5" />
          ) : (
            <CheckCircle className="w-4 h-4 mt-0.5" />
          )}
          <span>{deptMsg.text}</span>
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="p-5" style={panelBox} aria-label="Departments">
          <div className={eyebrow} style={{ color: brand.accentColor }}>
            Departments
          </div>
          <ul className="mt-3">
            {depts.map((d) => {
              const c = emps.filter(
                (e) => e.department_id === d.id && e.status === "Active",
              ).length;
              return (
                <li
                  key={d.id}
                  className="flex items-center justify-between py-3"
                  style={{ borderBottom: "1px solid " + LINE }}
                >
                  <div>
                    <div style={{ color: brand.primaryColor }}>{d.name}</div>
                    <div className="text-xs" style={muted}>
                      {c} active employee{c === 1 ? "" : "s"}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className={FOCUS}
                    style={sec}
                    onClick={() => delDept(d)}
                    disabled={!isHR}
                    aria-label={"Delete department " + d.name}
                  >
                    <Trash className="w-3 h-3 mr-1" />
                    Delete
                  </Button>
                </li>
              );
            })}
          </ul>
          {isHR && (
            <form onSubmit={addDept} className="flex gap-2 mt-4">
              <Input
                aria-label="New department name"
                placeholder="New department name"
                value={newDept}
                onChange={(e) => setNewDept(e.target.value)}
                className={FOCUS}
                style={inputStyle}
              />
              <Button type="submit" className={FOCUS} style={prim}>
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </form>
          )}
        </section>
        <section className="p-5" style={panelBox} aria-label="Job titles">
          <div className={eyebrow} style={{ color: brand.accentColor }}>
            Job titles
          </div>
          <ul className="mt-3">
            {titles.map((t) => {
              const c = emps.filter((e) => e.job_title_id === t.id).length;
              return (
                <li
                  key={t.id}
                  className="flex items-center justify-between gap-2 py-3"
                  style={{ borderBottom: "1px solid " + LINE }}
                >
                  {renaming === t.id ? (
                    <form
                      className="flex gap-2 flex-1"
                      onSubmit={(ev) => {
                        ev.preventDefault();
                        saveRename(t);
                      }}
                    >
                      <Input
                        aria-label={"Rename " + t.name}
                        value={renameVal}
                        onChange={(e) => setRenameVal(e.target.value)}
                        className={FOCUS}
                        style={inputStyle}
                      />
                      <Button size="sm" type="submit" className={FOCUS} style={prim}>
                        Save
                      </Button>
                      <Button
                        size="sm"
                        type="button"
                        className={FOCUS}
                        style={sec}
                        onClick={() => setRenaming(null)}
                      >
                        Cancel
                      </Button>
                    </form>
                  ) : (
                    <>
                      <div>
                        <div style={{ color: brand.primaryColor }}>{t.name}</div>
                        <div className="text-xs" style={muted}>
                          Used by {c} employee{c === 1 ? "" : "s"}
                        </div>
                      </div>
                      {isHR && (
                        <Button
                          size="sm"
                          className={FOCUS}
                          style={sec}
                          onClick={() => {
                            setRenaming(t.id);
                            setRenameVal(t.name);
                          }}
                          aria-label={"Rename " + t.name}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Rename
                        </Button>
                      )}
                    </>
                  )}
                </li>
              );
            })}
          </ul>
          {isHR && (
            <form onSubmit={addTitle} className="flex gap-2 mt-4">
              <Input
                aria-label="New job title"
                placeholder="New job title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className={FOCUS}
                style={inputStyle}
              />
              <Button type="submit" className={FOCUS} style={prim}>
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </form>
          )}
        </section>
      </div>
    </div>
  );

  const renderSettings = () => (
    <section className="p-5 max-w-2xl" style={panelBox} aria-label="Visibility settings">
      <div className={eyebrow} style={{ color: brand.accentColor }}>
        Organisation-wide setting
      </div>
      <div className="flex items-start justify-between gap-6 mt-3">
        <div>
          <h3
            className="text-lg"
            style={{ fontFamily: brand.fontHeading, color: brand.primaryColor }}
          >
            Managers can see feedback about their direct reports
          </h3>
          <p className="text-sm mt-1" style={muted}>
            {mgrSeesFeedback
              ? "On: feedback is readable by its author, its recipient, HR Admins and the recipient’s manager."
              : "Off: feedback is readable only by its author, its recipient and HR Admins. Managers do not see it on a direct report’s record."}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-sm" style={{ color: brand.primaryColor }}>
            {mgrSeesFeedback ? "On" : "Off"}
          </span>
          <Switch
            checked={mgrSeesFeedback}
            onChange={isHR ? togglePref : () => {}}
            className={FOCUS}
          />
        </div>
      </div>
      {!isHR && (
        <p className="text-xs mt-3" style={muted}>
          Only HR Admins can change this setting.
        </p>
      )}
      {settingSaved && (
        <p
          role="status"
          className="text-sm mt-4 flex items-center gap-2"
          style={{ color: brand.accentColor }}
        >
          <CheckCircle className="w-4 h-4" />
          {settingSaved}
        </p>
      )}
    </section>
  );

  const renderRecord = () => {
    const e = byId(recordId);
    const r = RECORDS[recordId] || { goals: [], reviews: [], feedback: [] };
    const rev = r.reviews.find((x) => x.period === period);
    const hideFeedback = viewAs === "Manager" && !mgrSeesFeedback;
    return (
      <div className="space-y-6">
        <Button className={FOCUS} style={sec} onClick={() => setRecordId(null)}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to people
        </Button>
        <div className="flex items-center gap-4 p-5" style={panelBox}>
          <Avatar name={e.full_name} />
          <div className="flex-1">
            <div className={eyebrow} style={{ color: brand.accentColor }}>
              Review record
            </div>
            <h2
              className="text-2xl"
              style={{ fontFamily: brand.fontHeading, color: brand.primaryColor }}
            >
              {e.full_name}
            </h2>
            <div className="text-sm" style={muted}>
              {titleName(e.job_title_id)} · {deptName(e.department_id)} · Reports to{" "}
              {e.manager_id ? nameOf(e.manager_id) : "no one yet"}
            </div>
          </div>
          {statusBadge(e)}
        </div>
        <p className="text-xs flex items-center gap-2" style={muted}>
          <Clock className="w-3 h-3" />
          {viewLog}
        </p>
        <Tabs
          tabs={[
            { key: "goals", label: "Goals" },
            { key: "reviews", label: "Submitted reviews" },
            { key: "feedback", label: "Feedback" },
          ]}
          active={recTab}
          onChange={(k) => setRecTab(typeof k === "string" ? k : k && k.key)}
        />
        {recTab === "goals" &&
          (r.goals.length === 0 ? (
            <Empty
              title="No goals yet"
              description={
                e.full_name +
                " has not set any goals. They will appear here with progress and status once created."
              }
            />
          ) : (
            <div className="space-y-3">
              {r.goals.map((g, i) => (
                <div key={i} className="p-4" style={panelBox}>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div style={{ color: brand.primaryColor }}>{g.t}</div>
                      <div className="text-xs mt-1" style={muted}>
                        Target: {g.target} · Due {g.due} · Weighting {g.w}%
                      </div>
                      <div className="text-xs mt-1" style={muted}>
                        Aligned to {g.parent}
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      style={{
                        color: g.s === "At risk" ? "#d9bf84" : brand.accentColor,
                        borderColor: g.s === "At risk" ? "#d9bf84" : brand.accentColor,
                      }}
                    >
                      {g.s}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    <div
                      className="flex-1 h-1"
                      style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                    >
                      <div
                        className="h-1"
                        style={{ width: g.p + "%", backgroundColor: brand.accentColor }}
                      />
                    </div>
                    <span className="text-sm" style={{ color: brand.accentColor }}>
                      {g.p}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        {recTab === "reviews" &&
          (r.reviews.length === 0 ? (
            <Empty
              title="No submitted self-reviews"
              description="Submitted self-reviews appear here by review period. Drafts are never shown."
            />
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2" role="group" aria-label="Review period">
                {r.reviews.map((x) => (
                  <Button
                    key={x.period}
                    size="sm"
                    className={FOCUS}
                    onClick={() => setPeriod(x.period)}
                    aria-pressed={period === x.period}
                    style={period === x.period ? prim : sec}
                  >
                    {x.period}
                  </Button>
                ))}
              </div>
              {rev && (
                <div className="p-5 space-y-4" style={panelBox}>
                  <div className="text-xs" style={muted}>
                    Self-review for {rev.period} · submitted {rev.submitted} · read-only, shown
                    exactly as submitted
                  </div>
                  {rev.answers.map((a, i) => (
                    <div key={i} className="pb-3" style={{ borderBottom: "1px solid " + LINE }}>
                      <div className="text-sm" style={{ color: brand.primaryColor }}>
                        {a.q}
                      </div>
                      <div className="text-sm mt-1" style={{ color: brand.accentColor }}>
                        Rating: {a.r}
                      </div>
                      <div className="text-sm mt-1" style={muted}>
                        {a.c}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        {recTab === "feedback" &&
          (hideFeedback ? (
            <Empty
              title="Feedback is not shown to managers"
              description="HR has switched off manager visibility of feedback, so feedback addressed to this person is hidden from you."
            />
          ) : r.feedback.length === 0 ? (
            <Empty
              title="No feedback yet"
              description="Praise and written feedback addressed to this person will appear here, newest first."
            />
          ) : (
            <div className="space-y-3">
              {r.feedback.map((f, i) => (
                <div key={i} className="p-4" style={panelBox}>
                  <div className="flex items-center gap-2 text-xs" style={muted}>
                    <Badge
                      variant="outline"
                      style={{
                        color: f.type === "Praise" ? brand.accentColor : "#d9bf84",
                        borderColor: LINE,
                      }}
                    >
                      {f.type}
                    </Badge>
                    <span>
                      From {f.from} · {f.date}
                    </span>
                  </div>
                  <p className="text-sm mt-2" style={{ color: brand.primaryColor }}>
                    {f.body}
                  </p>
                </div>
              ))}
            </div>
          ))}
      </div>
    );
  };

  const renderNonHR = () => {
    if (viewAs === "Employee") {
      return (
        <Empty
          title="People records are not available to your role"
          description="Employees see their own data on My performance. Another person’s goals, reviews and 1:1s are refused."
          action={
            <Button className={FOCUS} style={prim} onClick={() => navigate("my-performance")}>
              Go to My performance
            </Button>
          }
        />
      );
    }
    if (viewAs === "Executive") {
      return (
        <div className="space-y-4">
          <p className="text-sm" style={muted}>
            Executives see aggregate information only. Individual records are not available.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            <Stat
              label="Active employees"
              value={String(emps.filter((e) => e.status === "Active").length)}
            />
            <Stat label="Departments" value={String(depts.length)} />
            <Stat
              label="Missing a reporting line"
              value={String(emps.filter((e) => e.status === "Active" && !e.manager_id).length)}
            />
          </div>
          <div style={panelBox}>
            {depts.map((d) => (
              <div
                key={d.id}
                className="flex justify-between px-4 py-3 text-sm"
                style={{ borderBottom: "1px solid " + LINE, color: brand.primaryColor }}
              >
                <span>{d.name}</span>
                <span style={{ color: brand.accentColor }}>
                  {emps.filter((e) => e.department_id === d.id && e.status === "Active").length}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    const line = emps.filter((e) => chainIncludes(e.id, viewer.id));
    return (
      <div className="space-y-4">
        <p className="text-sm" style={muted}>
          Creating and editing employee records is available to HR Admins only. You can open the
          review record of anyone in your reporting line.
        </p>
        {line.length === 0 ? (
          <Empty
            title="No one reports to you yet"
            description="When HR assigns you direct reports they will be listed here."
          />
        ) : (
          <div style={panelBox}>
            {line.map((e) => (
              <div
                key={e.id}
                className="flex items-center justify-between gap-3 px-4 py-3"
                style={{ borderBottom: "1px solid " + LINE }}
              >
                <div className="flex items-center gap-3">
                  <Avatar name={e.full_name} />
                  <div>
                    <div style={{ color: brand.primaryColor }}>{e.full_name}</div>
                    <div className="text-xs" style={muted}>
                      {titleName(e.job_title_id)} · {deptName(e.department_id)}
                    </div>
                  </div>
                </div>
                <Button size="sm" className={FOCUS} style={prim} onClick={() => openRecord(e)}>
                  Open record
                  <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs" style={muted}>
          People outside your reporting line are not listed and their records are refused.
        </p>
      </div>
    );
  };

  const missing = emps.filter((e) => e.status === "Active" && !e.manager_id).length;

  return (
    <div
      className="min-h-full p-6 md:p-8 space-y-6"
      style={{
        backgroundColor: brand.backgroundColor,
        color: brand.primaryColor,
        fontFamily: brand.fontBody,
      }}
    >
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className={eyebrow} style={{ color: brand.accentColor }}>
            HR · Halden &amp; Co.
          </div>
          <h1
            className="text-3xl md:text-4xl mt-1"
            style={{ fontFamily: brand.fontHeading, color: brand.primaryColor }}
          >
            People
          </h1>
          <div className="mt-3 h-px w-16" style={{ backgroundColor: brand.accentColor }} />
          <p className="text-sm mt-3 max-w-xl" style={muted}>
            Employee records, reporting lines, roles and access, kept by HR. Open any person’s
            record to read their goals, submitted reviews and feedback.
          </p>
        </div>
      </header>

      {msg && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-center justify-between gap-3 p-3 text-sm"
          style={{ ...panelBox, borderColor: brand.accentColor, color: brand.primaryColor }}
        >
          <span className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" style={{ color: brand.accentColor }} />
            {msg}
          </span>
          <Button
            size="sm"
            className={FOCUS}
            style={sec}
            onClick={() => setMsg("")}
            aria-label="Dismiss message"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      )}

      {recordId ? (
        renderRecord()
      ) : !isHR ? (
        <DirectoryTab />
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <Tabs
              tabs={[
                { key: "directory", label: "Directory" },
                { key: "org", label: "Departments & titles" },
                { key: "settings", label: "Settings" },
              ]}
              active={tab}
              onChange={(k) => setTab(typeof k === "string" ? k : k && k.key)}
            />
          </div>
          {tab === "directory" && <DirectoryTab />}
          {tab === "org" && renderOrg()}
          {tab === "settings" && renderSettings()}
        </div>
      )}

      <footer className="pt-4 flex flex-wrap gap-2" style={{ borderTop: "1px solid " + LINE }}>
        <span className={"self-center mr-2 " + eyebrow} style={muted}>
          Related
        </span>
        <Button size="sm" className={FOCUS} style={sec} onClick={() => navigate("goals")}>
          Goals
          <ArrowRight className="w-3 h-3 ml-1" />
        </Button>
        <Button size="sm" className={FOCUS} style={sec} onClick={() => navigate("reviews")}>
          Reviews
          <ArrowRight className="w-3 h-3 ml-1" />
        </Button>
        <Button size="sm" className={FOCUS} style={sec} onClick={() => navigate("one-on-ones")}>
          1:1 check-ins
          <ArrowRight className="w-3 h-3 ml-1" />
        </Button>
      </footer>
    </div>
  );
}
