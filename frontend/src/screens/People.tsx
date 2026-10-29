// @ts-nocheck -- generated from the approved design under its JS runtime contract; not hand-written TypeScript.
import React from "react";

import * as UI from "@/lib/ui";
import { Icons } from "@/lib/icons";
import { brand } from "@/lib/brand";
import { useNavigate } from "@/lib/navigate";
import { useSession } from "@/lib/session";
import DirectoryTab from "@/screens/PeopleDirectory";

const SURF = "#1d2b25";
const LINE = "rgba(255,255,255,0.1)";
const FOCUS = "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8fae8b]";
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
export default function Screen() {
  const navigate = useNavigate();
  const { Button, Input, Switch, Tabs } = UI;
  const { Plus, ArrowRight, Edit, AlertCircle, CheckCircle, Trash } = Icons;

  const { role: sessionRole } = useSession();
  const viewAs =
    { hr_admin: "HR Admin", manager: "Manager", executive: "Executive" }[sessionRole || ""] ||
    "Employee";
  const [tab, setTab] = React.useState("directory");
  const [depts, setDepts] = React.useState(DEPTS0);
  const [titles, setTitles] = React.useState(TITLES0);
  const [mgrSeesFeedback, setMgrSeesFeedback] = React.useState(false);
  const [settingSaved, setSettingSaved] = React.useState("");
  const [newDept, setNewDept] = React.useState("");
  const [deptMsg, setDeptMsg] = React.useState({ kind: "", text: "" });
  const [newTitle, setNewTitle] = React.useState("");
  const [renaming, setRenaming] = React.useState(null);
  const [renameVal, setRenameVal] = React.useState("");

  const isHR = viewAs === "HR Admin";

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
    const c = EMPS0.filter((e) => e.department_id === d.id && e.status === "Active").length;
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
  const togglePref = (v) => {
    const next = typeof v === "boolean" ? v : v && v.target ? v.target.checked : !mgrSeesFeedback;
    setMgrSeesFeedback(next);
    setSettingSaved(
      next
        ? "Saved. Managers can now read feedback addressed to people in their reporting line."
        : "Saved. Managers can no longer see feedback addressed to their direct reports.",
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
              const c = EMPS0.filter(
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
              const c = EMPS0.filter((e) => e.job_title_id === t.id).length;
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

      {!isHR ? (
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
