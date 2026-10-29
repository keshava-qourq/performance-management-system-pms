// @ts-nocheck -- generated from the approved design under its JS runtime contract; not hand-written TypeScript.
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";

import * as UI from "@/lib/ui";
import { Icons } from "@/lib/icons";
import { brand } from "@/lib/brand";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { Avatar, Tabs, Empty } = UI;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { Search, Check, Edit } = Icons;

const TODAY = '2026-10-29';
const STATUSES = ['Not started', 'On track', 'At risk', 'Off track', 'Achieved', 'Cancelled'];
const DEPARTMENTS = [
  { id: 'd1', name: 'Product' },
  { id: 'd2', name: 'Engineering' },
  { id: 'd3', name: 'People' },
];
const PEOPLE = [
  { id: 'e1', name: 'Marta Lindqvist', role: 'HR Admin', title: 'Head of People', dept: 'd3', manager: null },
  { id: 'e2', name: 'Priya Raman', role: 'Manager', title: 'Product Design Lead', dept: 'd1', manager: 'e1' },
  { id: 'e3', name: 'Daniel Okafor', role: 'Employee', title: 'Senior Product Designer', dept: 'd1', manager: 'e2' },
  { id: 'e4', name: 'Sofia Brandt', role: 'Employee', title: 'Product Analyst', dept: 'd1', manager: 'e2' },
  { id: 'e5', name: 'Tomás Herrera', role: 'Employee', title: 'Product Designer', dept: 'd1', manager: 'e2' },
  { id: 'e6', name: 'Noor Ahmed', role: 'Employee', title: 'Junior Designer', dept: 'd1', manager: 'e2' },
  { id: 'e7', name: 'Aisha Rahman', role: 'Employee', title: 'Staff Engineer', dept: 'd2', manager: null },
];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const fmt = (d) => {
  if (!d) return '—';
  const [y, m, day] = d.split('-');
  return `${parseInt(day, 10)} ${MONTHS[parseInt(m, 10) - 1]} ${y}`;
};
const SEED_GOALS = [
  { id: 'g1', ref: 'G-001', level: 'Company', ownerId: 'e1', dept: null, parent: null, title: 'Reach 92% customer retention by year end', description: 'Retention across all paying accounts, measured on the 31 December cohort.', target: '92% twelve-month retention', due: '2026-12-31', weighting: 100, progress: 78, status: 'On track', updatedBy: 'Marta Lindqvist', updatedAt: '2026-10-22', history: [{ progress: 78, status: 'On track', by: 'Marta Lindqvist', date: '2026-10-22' }, { progress: 70, status: 'On track', by: 'Marta Lindqvist', date: '2026-09-24' }] },
  { id: 'g2', ref: 'G-002', level: 'Department', ownerId: 'e1', dept: 'd1', parent: 'g1', title: 'Ship self-serve onboarding to every new account', description: 'New accounts reach first value without a call with customer success.', target: '100% of new accounts onboarded self-serve', due: '2026-12-11', weighting: 100, progress: 58, status: 'At risk', updatedBy: 'Marta Lindqvist', updatedAt: '2026-10-26', history: [{ progress: 58, status: 'At risk', by: 'Marta Lindqvist', date: '2026-10-26' }, { progress: 45, status: 'On track', by: 'Marta Lindqvist', date: '2026-10-01' }] },
  { id: 'g3', ref: 'G-003', level: 'Department', ownerId: 'e1', dept: 'd2', parent: 'g1', title: 'Bring p95 API latency under 400 ms', description: 'Measured on the production dashboard over a rolling 14 days.', target: 'p95 latency below 400 ms', due: '2026-11-27', weighting: 100, progress: 82, status: 'On track', updatedBy: 'Marta Lindqvist', updatedAt: '2026-10-20', history: [{ progress: 82, status: 'On track', by: 'Marta Lindqvist', date: '2026-10-20' }] },
  { id: 'g4', ref: 'G-004', level: 'Department', ownerId: 'e1', dept: 'd3', parent: null, title: 'Cut average time-to-hire to 35 days', description: 'From requisition approval to signed offer, all open roles.', target: 'Average of 35 days or fewer', due: '2026-12-18', weighting: 100, progress: 40, status: 'Off track', updatedBy: 'Marta Lindqvist', updatedAt: '2026-10-15', history: [{ progress: 40, status: 'Off track', by: 'Marta Lindqvist', date: '2026-10-15' }] },
  { id: 'g5', ref: 'G-005', level: 'Personal', ownerId: 'e2', dept: 'd1', parent: 'g2', title: 'Launch onboarding v2 to all new accounts', description: 'Replace the setup wizard with the guided checklist and roll out in two waves.', target: 'Onboarding v2 live for 100% of new sign-ups', due: '2026-11-30', weighting: 40, progress: 65, status: 'At risk', updatedBy: 'Priya Raman', updatedAt: '2026-10-27', history: [{ progress: 65, status: 'At risk', by: 'Priya Raman', date: '2026-10-27' }, { progress: 50, status: 'On track', by: 'Priya Raman', date: '2026-10-06' }] },
  { id: 'g6', ref: 'G-006', level: 'Personal', ownerId: 'e2', dept: 'd1', parent: null, title: 'Hire two senior product designers', description: 'Both roles filled and started before the Q1 planning cycle.', target: '2 signed offers accepted', due: '2026-10-15', weighting: 30, progress: 50, status: 'Off track', updatedBy: 'Priya Raman', updatedAt: '2026-10-14', history: [{ progress: 50, status: 'Off track', by: 'Priya Raman', date: '2026-10-14' }] },
  { id: 'g7', ref: 'G-007', level: 'Personal', ownerId: 'e2', dept: 'd1', parent: null, title: 'Run the quarterly roadmap review', description: 'Facilitate the Q4 review with product, engineering and customer success leads.', target: 'Review held, decisions published', due: '2026-10-09', weighting: 20, progress: 100, status: 'Achieved', updatedBy: 'Priya Raman', updatedAt: '2026-10-09', history: [{ progress: 100, status: 'Achieved', by: 'Priya Raman', date: '2026-10-09' }] },
  { id: 'g8', ref: 'G-008', level: 'Personal', ownerId: 'e3', dept: 'd1', parent: 'g2', title: 'Rewrite the onboarding checklist flows', description: 'Redesign the five checklist steps with the research findings from September.', target: 'Five flows shipped and usability-tested', due: '2026-11-20', weighting: 50, progress: 60, status: 'On track', updatedBy: 'Daniel Okafor', updatedAt: '2026-10-25', history: [{ progress: 60, status: 'On track', by: 'Daniel Okafor', date: '2026-10-25' }, { progress: 35, status: 'On track', by: 'Daniel Okafor', date: '2026-10-04' }] },
  { id: 'g9', ref: 'G-009', level: 'Personal', ownerId: 'e3', dept: 'd1', parent: null, title: 'Complete 12 customer discovery interviews', description: 'Interview admins at mid-size accounts about their first week.', target: '12 interviews recorded and tagged', due: '2026-10-20', weighting: 40, progress: 75, status: 'At risk', updatedBy: 'Daniel Okafor', updatedAt: '2026-10-18', history: [{ progress: 75, status: 'At risk', by: 'Daniel Okafor', date: '2026-10-18' }] },
  { id: 'g10', ref: 'G-010', level: 'Personal', ownerId: 'e3', dept: 'd1', parent: null, title: 'Document the design token system', description: 'Colour, type and spacing tokens with usage guidance for engineers.', target: 'Published guide, adopted by two squads', due: '2026-12-04', weighting: 30, progress: 10, status: 'Not started', updatedBy: 'Daniel Okafor', updatedAt: '2026-10-12', history: [{ progress: 10, status: 'Not started', by: 'Daniel Okafor', date: '2026-10-12' }] },
  { id: 'g11', ref: 'G-011', level: 'Personal', ownerId: 'e4', dept: 'd1', parent: 'g2', title: 'Reduce onboarding drop-off by 15%', description: 'Drop-off between sign-up and the first completed project.', target: 'Drop-off at or below 34% from 40%', due: '2026-12-11', weighting: 60, progress: 40, status: 'On track', updatedBy: 'Sofia Brandt', updatedAt: '2026-10-23', history: [{ progress: 40, status: 'On track', by: 'Sofia Brandt', date: '2026-10-23' }] },
  { id: 'g12', ref: 'G-012', level: 'Personal', ownerId: 'e4', dept: 'd1', parent: null, title: 'Publish the accessibility audit', description: 'Audit the five highest-traffic screens against WCAG 2.2 AA.', target: 'Audit published with owners per finding', due: '2026-12-12', weighting: 40, progress: 0, status: 'Not started', updatedBy: 'Sofia Brandt', updatedAt: '2026-10-08', history: [] },
  { id: 'g13', ref: 'G-013', level: 'Personal', ownerId: 'e5', dept: 'd1', parent: 'g2', title: 'Instrument the activation funnel', description: 'Event tracking for every step between sign-up and first value.', target: '14 events live and verified', due: '2026-11-05', weighting: 50, progress: 90, status: 'On track', updatedBy: 'Tomás Herrera', updatedAt: '2026-10-28', history: [{ progress: 90, status: 'On track', by: 'Tomás Herrera', date: '2026-10-28' }] },
  { id: 'g14', ref: 'G-014', level: 'Personal', ownerId: 'e5', dept: 'd1', parent: null, title: 'Prototype in-app guidance tooltips', description: 'Dropped after the research review showed the checklist covers the need.', target: 'Clickable prototype tested with 5 users', due: '2026-11-13', weighting: 50, progress: 20, status: 'Cancelled', updatedBy: 'Tomás Herrera', updatedAt: '2026-10-19', history: [{ progress: 20, status: 'Cancelled', by: 'Tomás Herrera', date: '2026-10-19' }] },
  { id: 'g15', ref: 'G-015', level: 'Personal', ownerId: 'e1', dept: 'd3', parent: 'g4', title: 'Roll out the competency framework', description: 'Questionnaire and rating scale agreed with department heads.', target: 'Framework approved by all five heads', due: '2026-11-15', weighting: 100, progress: 70, status: 'On track', updatedBy: 'Marta Lindqvist', updatedAt: '2026-10-21', history: [{ progress: 70, status: 'On track', by: 'Marta Lindqvist', date: '2026-10-21' }] },
  { id: 'g16', ref: 'G-016', level: 'Personal', ownerId: 'e7', dept: 'd2', parent: 'g3', title: 'Move session lookups to the read replica', description: 'Largest contributor to p95 latency on authenticated routes.', target: 'Lookups off primary, p95 down 120 ms', due: '2026-11-13', weighting: 100, progress: 85, status: 'On track', updatedBy: 'Aisha Rahman', updatedAt: '2026-10-27', history: [{ progress: 85, status: 'On track', by: 'Aisha Rahman', date: '2026-10-27' }] },
];
const SEED_COMMENTS = {
  g8: [{ id: 'c1', author: 'Priya Raman', body: 'The step-three copy test is the one to watch. Can we get it in front of users before the 12th?', date: '2026-10-26' }],
  g9: [{ id: 'c2', author: 'Priya Raman', body: 'Three interviews short with the date gone. Let us pick the remaining slots on Thursday.', date: '2026-10-21' }],
};

const person = (id) => PEOPLE.find((p) => p.id === id);
const deptName = (id) => (DEPARTMENTS.find((d) => d.id === id) || {}).name || '';
const emptyForm = (level) => ({ id: null, level, dept: 'd1', title: '', description: '', target: '', due: '', weighting: '', parent: '' });

export default function Screen() {
  const [viewerId, setViewerId] = React.useState('e2');
  const [goals, setGoals] = React.useState(SEED_GOALS);
  const [comments, setComments] = React.useState(SEED_COMMENTS);
  const [tab, setTab] = React.useState('mine');
  const [query, setQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [selectedId, setSelectedId] = React.useState('g5');
  const [mode, setMode] = React.useState('view');
  const [form, setForm] = React.useState(emptyForm('Personal'));
  const [errors, setErrors] = React.useState({});
  const [progressDraft, setProgressDraft] = React.useState('');
  const [statusDraft, setStatusDraft] = React.useState('');
  const [progressError, setProgressError] = React.useState('');
  const [commentDraft, setCommentDraft] = React.useState('');
  const [commentError, setCommentError] = React.useState('');
  const [notice, setNotice] = React.useState(null);
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  const viewer = person(viewerId);
  const isHR = viewer.role === 'HR Admin';
  const isManager = PEOPLE.some((p) => p.manager === viewer.id);
  const reports = PEOPLE.filter((p) => p.manager === viewer.id);

  const bg = brand.backgroundColor;
  const ink = brand.primaryColor;
  const accent = brand.accentColor;
  const muted = brand.neutralColor;
  const mix = (c, p, base) => `color-mix(in srgb, ${c} ${p}%, ${base})`;
  const panel = mix(ink, 5, bg);
  const panelHigh = mix(ink, 9, bg);
  const hair = mix(ink, 13, 'transparent');
  const warn = 'goldenrod';
  const bad = 'indianred';

  const S = {
    panel: { background: panel, border: `1px solid ${hair}`, borderRadius: brand.radius },
    label: { fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: muted, fontWeight: 500 },
    heading: { fontFamily: brand.fontHeading, color: ink, fontWeight: 400 },
    input: { background: bg, border: `1px solid ${mix(ink, 22, 'transparent')}`, color: ink, borderRadius: brand.radius, padding: '10px 12px', minHeight: 44, width: '100%', fontSize: 15, fontFamily: brand.fontBody },
    primary: { background: accent, color: bg, border: `1px solid ${accent}`, borderRadius: brand.radius, fontWeight: 600, minHeight: 44, padding: '0 20px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14 },
    ghost: { background: 'transparent', color: ink, border: `1px solid ${mix(ink, 25, 'transparent')}`, borderRadius: brand.radius, minHeight: 44, padding: '0 16px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14 },
    num: { fontVariantNumeric: 'tabular-nums' },
  };

  const isOverdue = (g) => g.due < TODAY && g.status !== 'Achieved' && g.status !== 'Cancelled';
  const managerOf = (ownerId) => (person(ownerId) || {}).manager;
  const canView = (g) => isHR || g.ownerId === viewer.id || managerOf(g.ownerId) === viewer.id || g.level !== 'Personal';
  const canEditProgress = (g) => g.ownerId === viewer.id || isHR;
  const canEdit = (g) => g.ownerId === viewer.id || isHR;
  const canComment = (g) => isHR || managerOf(g.ownerId) === viewer.id;
  const goalById = (id) => goals.find((g) => g.id === id);
  const children = (id) => goals.filter((g) => g.parent === id);

  const say = (text, kind) => setNotice({ text, kind: kind || 'ok', key: Date.now() });

  const tabs = [{ key: 'mine', label: 'My goals' }];
  if (isManager || isHR) tabs.push({ key: 'team', label: isHR ? 'Everyone’s goals' : 'Team goals' });
  tabs.push({ key: 'org', label: 'Company & department' });
  const activeTab = tabs.some((t) => t.key === tab) ? tab : 'mine';

  const switchViewer = (id) => {
    setViewerId(id);
    setTab('mine');
    setMode('view');
    setQuery('');
    setStatusFilter('all');
    setNotice(null);
    const first = goals.find((g) => g.ownerId === id && g.level === 'Personal');
    setSelectedId(first ? first.id : null);
    setConfirmDelete(false);
  };

  const select = (id) => {
    const g = goalById(id);
    setSelectedId(id);
    setMode('view');
    setProgressDraft(String(g.progress));
    setStatusDraft(g.status);
    setProgressError('');
    setCommentDraft('');
    setCommentError('');
    setConfirmDelete(false);
  };

  React.useEffect(() => {
    const g = goalById(selectedId);
    if (g) {
      setProgressDraft(String(g.progress));
      setStatusDraft(g.status);
    }
  }, [selectedId]);

  const matches = (g) => {
    const q = query.trim().toLowerCase();
    const okQ = !q || g.title.toLowerCase().includes(q) || g.ref.toLowerCase().includes(q) || g.target.toLowerCase().includes(q);
    const okS = statusFilter === 'all' || g.status === statusFilter || (statusFilter === 'Overdue' && isOverdue(g));
    return okQ && okS;
  };

  const startCreate = () => {
    const level = activeTab === 'org' && isHR ? 'Company' : 'Personal';
    setForm({ ...emptyForm(level), dept: viewer.dept });
    setErrors({});
    setMode('create');
    setConfirmDelete(false);
  };
  const startEdit = (g) => {
    setForm({ id: g.id, level: g.level, dept: g.dept || 'd1', title: g.title, description: g.description, target: g.target, due: g.due, weighting: String(g.weighting), parent: g.parent || '' });
    setErrors({});
    setMode('edit');
    setConfirmDelete(false);
  };

  const orgGoals = goals.filter((g) => g.level !== 'Personal');
  const parentOptions = () => {
    if (form.level === 'Personal') {
      const ownerDept = form.id ? goalById(form.id).dept : viewer.dept;
      return orgGoals.filter((g) => g.level === 'Company' || g.dept === ownerDept);
    }
    return orgGoals.filter((g) => g.id !== form.id);
  };

  const wouldCycle = (goalId, parentId) => {
    let cur = parentId;
    let guard = 0;
    while (cur && guard < 50) {
      if (cur === goalId) return true;
      const g = goalById(cur);
      cur = g ? g.parent : null;
      guard += 1;
    }
    return false;
  };

  const saveForm = (e) => {
    e.preventDefault();
    const err = {};
    if (!form.title.trim()) err.title = 'Give the goal a title.';
    if (!form.target.trim()) err.target = 'Say how this will be measured — a number, a date or a deliverable.';
    if (!form.due) err.due = 'Choose a due date.';
    const w = form.weighting.toString().trim();
    if (w === '') err.weighting = 'Enter a weighting between 0 and 100.';
    else if (!/^\d+(\.\d+)?$/.test(w) || Number(w) < 0 || Number(w) > 100) err.weighting = 'Weighting must be a number from 0 to 100.';
    if (form.level === 'Department' && !form.dept) err.dept = 'Choose the department this goal belongs to.';
    if (form.id && form.parent && wouldCycle(form.id, form.parent)) {
      const p = goalById(form.parent);
      err.parent = `That alignment would loop back on itself: “${p.title}” already rolls up to this goal. Pick a different parent.`;
    }
    setErrors(err);
    if (Object.keys(err).length) {
      say('Goal not saved. Check the highlighted fields.', 'error');
      return;
    }
    if (form.id) {
      setGoals((gs) => gs.map((g) => g.id === form.id ? { ...g, level: form.level, dept: form.level === 'Company' ? null : form.dept, title: form.title.trim(), description: form.description.trim(), target: form.target.trim(), due: form.due, weighting: Number(w), parent: form.parent || null, updatedBy: viewer.name, updatedAt: TODAY } : g));
      say(`Changes saved. Last changed by ${viewer.name} today.`);
      setSelectedId(form.id);
    } else {
      const n = goals.length + 1;
      const id = 'g' + n;
      const g = {
        id, ref: 'G-' + String(n).padStart(3, '0'), level: form.level, ownerId: viewer.id,
        dept: form.level === 'Company' ? null : (form.level === 'Department' ? form.dept : viewer.dept),
        parent: form.parent || null, title: form.title.trim(), description: form.description.trim(), target: form.target.trim(),
        due: form.due, weighting: Number(w), progress: 0, status: 'Not started', updatedBy: viewer.name, updatedAt: TODAY, history: [],
      };
      setGoals((gs) => [g, ...gs]);
      setSelectedId(id);
      setTab(form.level === 'Personal' ? 'mine' : 'org');
      setQuery('');
      setStatusFilter('all');
      say(`“${g.title}” added at 0% progress.`);
    }
    setMode('view');
  };

  const saveProgress = (e, g) => {
    e.preventDefault();
    const raw = progressDraft.toString().trim();
    const n = Number(raw);
    if (raw === '' || Number.isNaN(n) || n < 0 || n > 100) {
      setProgressError(`Progress must be a number from 0 to 100. Your previous value of ${g.progress}% is kept.`);
      return;
    }
    setProgressError('');
    setGoals((gs) => gs.map((x) => x.id === g.id ? { ...x, progress: n, status: statusDraft, updatedBy: viewer.name, updatedAt: TODAY, history: [{ progress: n, status: statusDraft, by: viewer.name, date: TODAY }, ...x.history] } : x));
    say(`Progress recorded: ${n}% · ${statusDraft}.`);
  };

  const postComment = (e, g) => {
    e.preventDefault();
    if (!commentDraft.trim()) { setCommentError('Write a comment before posting.'); return; }
    setCommentError('');
    setComments((c) => ({ ...c, [g.id]: [...(c[g.id] || []), { id: 'c' + Date.now(), author: viewer.name, body: commentDraft.trim(), date: TODAY }] }));
    setCommentDraft('');
    say('Comment posted. The goal owner can read it.');
  };

  const deleteGoal = (g) => {
    const kids = children(g.id);
    if (kids.length) {
      setConfirmDelete(false);
      say(`Can’t delete “${g.title}”: ${kids.length} goal${kids.length > 1 ? 's are' : ' is'} still aligned to it. Re-align or unlink them first.`, 'error');
      return;
    }
    setGoals((gs) => gs.filter((x) => x.id !== g.id));
    setSelectedId(null);
    setConfirmDelete(false);
    say(`“${g.title}” deleted.`);
  };

  const statusStyle = (s) => {
    const map = {
      'Not started': { c: muted, icon: Icons.Clock },
      'On track': { c: accent, icon: Icons.CheckCircle },
      'At risk': { c: warn, icon: Icons.AlertCircle },
      'Off track': { c: bad, icon: Icons.AlertCircle },
      'Achieved': { c: accent, icon: Icons.Check },
      'Cancelled': { c: muted, icon: Icons.X },
    };
    return map[s];
  };
  const pill = (s) => {
    const m = statusStyle(s);
    const I = m.icon;
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '3px 10px', borderRadius: 999, border: `1px solid ${mix(m.c, 55, 'transparent')}`, color: m.c, background: mix(m.c, 10, 'transparent'), whiteSpace: 'nowrap', textDecoration: s === 'Cancelled' ? 'line-through' : 'none' }}>
        <I className="h-3.5 w-3.5" aria-hidden="true" />{s}
      </span>
    );
  };
  const overdueTag = (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: bad, fontWeight: 600 }}>
      <Icons.Calendar className="h-3.5 w-3.5" aria-hidden="true" />Overdue
    </span>
  );
  const bar = (v, label) => (
    <div role="progressbar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100} aria-label={label} style={{ height: 4, background: mix(ink, 12, 'transparent'), borderRadius: 2, overflow: 'hidden' }}>
      <div className="gl-fill" style={{ width: `${v}%`, height: '100%', background: accent }} />
    </div>
  );

  const renderRow = (g, showOwner) => {
    const sel = selectedId === g.id && mode !== 'create';
    const kids = children(g.id).length;
    return (
      <li key={g.id} className="gl-row" style={{ borderTop: `1px solid ${hair}` }}>
        <button type="button" onClick={() => select(g.id)} aria-pressed={sel} aria-label={`Open ${g.ref} ${g.title}`} className="gl-rowbtn" style={{ background: sel ? panelHigh : 'transparent', color: ink, borderLeft: `2px solid ${sel ? accent : 'transparent'}` }}>
          <div className="gl-rowgrid">
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', flexWrap: 'wrap' }}>
                <span style={{ ...S.num, color: accent, fontSize: 12, letterSpacing: '0.08em' }}>{g.ref}</span>
                {g.level !== 'Personal' && <span style={{ ...S.label, fontSize: 11 }}>{g.level === 'Company' ? 'Company' : deptName(g.dept)}</span>}
                {showOwner && <span style={{ fontSize: 12, color: muted }}>{person(g.ownerId).name}</span>}
              </div>
              <div style={{ fontSize: 16, lineHeight: 1.4, marginTop: 2 }}>{g.title}</div>
              <div style={{ fontSize: 13, color: muted, marginTop: 4, display: 'flex', gap: 12, flexWrap: 'wrap', ...S.num }}>
                <span>Due {fmt(g.due)}</span>
                <span>Weight {g.weighting}%</span>
                {g.parent && <span>↳ {goalById(g.parent) ? goalById(g.parent).ref : ''}</span>}
                {kids > 0 && <span>{kids} aligned</span>}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
              <span style={{ ...S.heading, ...S.num, fontSize: 26, lineHeight: 1 }}>{g.progress}<span style={{ fontSize: 14, color: muted }}>%</span></span>
              {pill(g.status)}
              {isOverdue(g) && overdueTag}
            </div>
          </div>
          <div style={{ marginTop: 12 }}>{bar(g.progress, `${g.title} progress`)}</div>
        </button>
      </li>
    );
  };

  const field = (id, label, control, error, hint) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <UI.Label htmlFor={id} style={S.label}>{label}</UI.Label>
      {control}
      {hint && !error && <span id={id + '-h'} style={{ fontSize: 13, color: muted }}>{hint}</span>}
      {error && <span id={id + '-e'} role="alert" style={{ fontSize: 13, color: bad, display: 'flex', gap: 6, alignItems: 'flex-start' }}><Icons.AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" /><span>{error}</span></span>}
    </div>
  );
  const invalid = (k) => ({ 'aria-invalid': errors[k] ? true : undefined, 'aria-describedby': errors[k] ? form.id + '' && k + '-e' : undefined, style: { ...S.input, borderColor: errors[k] ? bad : mix(ink, 22, 'transparent') } });

  const weightTotal = (ownerId) => goals.filter((g) => g.ownerId === ownerId && g.level === 'Personal').reduce((s, g) => s + g.weighting, 0);
  const totalBadge = (ownerId) => {
    const t = weightTotal(ownerId);
    const over = t > 100;
    return (
      <span style={{ ...S.num, fontSize: 13, color: over ? warn : muted, display: 'inline-flex', gap: 6, alignItems: 'center' }}>
        {over && <Icons.AlertCircle className="h-4 w-4" aria-hidden="true" />}
        Total weighting {t}%{over ? ' — over 100%' : ''}
      </span>
    );
  };

  // ---------- list panes ----------
  const myGoals = goals.filter((g) => g.level === 'Personal' && g.ownerId === viewer.id);
  const filteredMine = myGoals.filter(matches);

  const emptyFilter = (
    <Empty title="No goals match those filters" description="Try a different word, or clear the status filter to see everything on this list." action={<button type="button" onClick={() => { setQuery(''); setStatusFilter('all'); }} style={S.ghost}>Clear filters</button>} />
  );

  const renderMine = () => (
    <div>
      <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ ...S.num, fontSize: 14, color: muted }}>{myGoals.length} goal{myGoals.length === 1 ? '' : 's'} · 2026 H2</span>
        {myGoals.length > 0 && totalBadge(viewer.id)}
      </div>
      {weightTotal(viewer.id) > 100 && myGoals.length > 0 && (
        <div role="status" style={{ margin: '0 24px 16px', padding: '12px 16px', border: `1px solid ${mix(warn, 50, 'transparent')}`, background: mix(warn, 8, 'transparent'), borderRadius: brand.radius, fontSize: 14, display: 'flex', gap: 10 }}>
          <Icons.AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" style={{ color: warn }} />
          <span>Your weightings add up to {weightTotal(viewer.id)}%, which is more than 100%. You can keep saving — adjust a weighting when it suits you.</span>
        </div>
      )}
      {myGoals.length === 0 ? (
        <Empty title="No goals written yet" description="Your goals will live here: what you will achieve this period, how it is measured and how it contributes to the company. Start with one." action={<button type="button" onClick={startCreate} style={S.primary}><Icons.Plus className="h-4 w-4" aria-hidden="true" />Create your first goal</button>} />
      ) : filteredMine.length === 0 ? emptyFilter : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>{filteredMine.map((g) => renderRow(g, false))}</ul>
      )}
    </div>
  );

  const renderTeam = () => {
    const people = isHR ? PEOPLE.filter((p) => p.id !== viewer.id) : reports;
    const blocks = people.map((p) => ({ p, list: goals.filter((g) => g.level === 'Personal' && g.ownerId === p.id) }));
    const visible = blocks.map((b) => ({ ...b, shown: b.list.filter(matches) }));
    const anyShown = visible.some((b) => b.shown.length) || (!query && statusFilter === 'all');
    return (
      <div>
        <p style={{ padding: '16px 24px 8px', margin: 0, fontSize: 14, color: muted }}>
          {isHR ? 'As HR Admin you can open every employee’s goals.' : `Only people who report to you are listed — ${reports.length} direct report${reports.length === 1 ? '' : 's'}.`}
        </p>
        {!anyShown ? emptyFilter : visible.map(({ p, list, shown }) => {
          if ((query || statusFilter !== 'all') && !shown.length) return null;
          return (
            <section key={p.id} aria-labelledby={'t-' + p.id} style={{ borderTop: `1px solid ${hair}`, marginTop: 8 }}>
              <div style={{ padding: '16px 24px 12px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <Avatar name={p.name} />
                <div style={{ flex: 1, minWidth: 160 }}>
                  <h3 id={'t-' + p.id} style={{ ...S.heading, fontSize: 18, margin: 0 }}>{p.name}</h3>
                  <div style={{ fontSize: 13, color: muted }}>{p.title} · {deptName(p.dept)}</div>
                </div>
                {list.length > 0 && totalBadge(p.id)}
              </div>
              {list.length === 0 ? (
                <p style={{ margin: 0, padding: '0 24px 20px', color: muted, fontSize: 14 }}>{p.name.split(' ')[0]} hasn’t written any goals yet. Nothing to review until they do.</p>
              ) : (
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>{shown.map((g) => renderRow(g, false))}</ul>
              )}
            </section>
          );
        })}
      </div>
    );
  };

  const renderOrg = () => {
    const list = orgGoals.filter(matches);
    const groups = [{ key: 'c', title: 'Company goals', items: list.filter((g) => g.level === 'Company') }].concat(
      DEPARTMENTS.map((d) => ({ key: d.id, title: `${d.name} department`, items: list.filter((g) => g.level === 'Department' && g.dept === d.id) }))
    );
    return (
      <div>
        <p style={{ padding: '16px 24px 8px', margin: 0, fontSize: 14, color: muted }}>
          {isHR ? 'You own these goals. Employees can align to company goals and to goals of their own department.' : 'Maintained by HR. You can align your goals to company goals and to goals of your own department.'}
        </p>
        {list.length === 0 ? emptyFilter : groups.filter((gr) => gr.items.length).map((gr) => (
          <section key={gr.key} style={{ borderTop: `1px solid ${hair}`, marginTop: 8 }}>
            <h3 style={{ ...S.label, padding: '16px 24px 8px', margin: 0 }}>{gr.title}</h3>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>{gr.items.map((g) => renderRow(g, false))}</ul>
          </section>
        ))}
      </div>
    );
  };

  // ---------- detail pane ----------
  const renderForm = () => {
    const opts = parentOptions();
    const creating = !form.id;
    const levelLocked = !isHR;
    return (
      <form onSubmit={saveForm} noValidate style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <div style={S.label}>{creating ? 'New goal' : 'Edit goal'}</div>
          <h2 style={{ ...S.heading, fontSize: 24, margin: '4px 0 0' }}>{creating ? (form.level === 'Personal' ? 'Write a goal you can measure' : `New ${form.level.toLowerCase()} goal`) : goalById(form.id).ref}</h2>
        </div>
        {isHR ? field('f-level', 'Level',
          <select id="f-level" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value, parent: '' })} style={S.input}>
            <option value="Personal">Personal — owned by me</option>
            <option value="Company">Company</option>
            <option value="Department">Department</option>
          </select>, null, 'Company and department goals become available as parents for everyone’s goals.') : null}
        {isHR && form.level === 'Department' && field('f-dept', 'Department',
          <select id="f-dept" value={form.dept} onChange={(e) => setForm({ ...form, dept: e.target.value, parent: '' })} {...invalid('dept')}>
            {DEPARTMENTS.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>, errors.dept)}
        {field('title', 'Title', <UI.Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Shorten onboarding to under 10 minutes" required {...invalid('title')} />, errors.title)}
        {field('description', 'Description', <UI.Textarea id="description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={S.input} />, null, 'Optional context for your manager and anyone aligned to this goal.')}
        {field('target', 'Measurable target', <UI.Input id="target" value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })} placeholder="e.g. 12 interviews recorded and tagged" required {...invalid('target')} />, errors.target)}
        <div className="gl-two">
          {field('due', 'Due date', <UI.Input id="due" type="date" value={form.due} onChange={(e) => setForm({ ...form, due: e.target.value })} required {...invalid('due')} />, errors.due)}
          {field('weighting', 'Weighting (0–100)', <UI.Input id="weighting" inputMode="decimal" value={form.weighting} onChange={(e) => setForm({ ...form, weighting: e.target.value })} placeholder="e.g. 40" required {...invalid('weighting')} />, errors.weighting, 'Share of your period this goal carries.')}
        </div>
        {field('parent', 'Aligned to', <select id="parent" value={form.parent} onChange={(e) => setForm({ ...form, parent: e.target.value })} {...invalid('parent')}>
          <option value="">Not aligned to a parent goal</option>
          {opts.map((g) => <option key={g.id} value={g.id}>{g.ref} · {g.level === 'Company' ? 'Company' : deptName(g.dept)} · {g.title}</option>)}
        </select>, errors.parent, form.level === 'Personal' ? 'Company goals and goals of your own department.' : 'Choose a goal this one rolls up to.')}
        {!creating && <p style={{ margin: 0, fontSize: 13, color: muted }}>Last changed by {goalById(form.id).updatedBy} on {fmt(goalById(form.id).updatedAt)}. Saving records you and today’s date.</p>}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button type="submit" style={S.primary}><Icons.Check className="h-4 w-4" aria-hidden="true" />{creating ? 'Save goal' : 'Save changes'}</button>
          <button type="button" style={S.ghost} onClick={() => setMode('view')}>Cancel</button>
        </div>
      </form>
    );
  };

  const kv = (k, v) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <dt style={S.label}>{k}</dt>
      <dd style={{ margin: 0, fontSize: 15, ...S.num }}>{v}</dd>
    </div>
  );

  const renderDetail = () => {
    const g = goalById(selectedId);
    if (!g || !canView(g)) {
      return (
        <div style={{ padding: 24 }}>
          <Empty title="Pick a goal to open it" description="You will see its target, progress history, alignment and any comments here. Progress is typed in by the goal owner — it is never calculated." />
        </div>
      );
    }
    const owner = person(g.ownerId);
    const parent = g.parent ? goalById(g.parent) : null;
    const kids = children(g.id).filter(canView);
    const editableProgress = canEditProgress(g);
    const list = comments[g.id] || [];
    return (
      <div key={g.id} className="gl-enter" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ ...S.num, color: accent, fontSize: 13, letterSpacing: '0.08em' }}>{g.ref}</span>
            <span style={S.label}>{g.level === 'Personal' ? 'Personal goal' : g.level === 'Company' ? 'Company goal' : `${deptName(g.dept)} goal`}</span>
          </div>
          <h2 style={{ ...S.heading, fontSize: 28, lineHeight: 1.2, margin: '8px 0 12px' }}>{g.title}</h2>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            {pill(g.status)}
            {isOverdue(g) && overdueTag}
          </div>
          {g.description && <p style={{ margin: '16px 0 0', fontSize: 15, lineHeight: 1.6, color: mix(ink, 85, 'transparent'), maxWidth: '62ch' }}>{g.description}</p>}
        </div>

        <dl className="gl-two" style={{ margin: 0, paddingTop: 16, borderTop: `1px solid ${hair}` }}>
          {kv('Target', g.target)}
          {kv('Due', fmt(g.due))}
          {kv('Weighting', g.weighting + '%')}
          {kv('Owner', owner.name)}
          <div style={{ gridColumn: '1 / -1' }}>{kv('Aligned to', parent ? <span>{parent.ref} · {parent.title}</span> : <span style={{ color: muted }}>Not aligned to a parent goal</span>)}</div>
        </dl>
        <p style={{ margin: 0, fontSize: 13, color: muted }}>Last changed by {g.updatedBy} on {fmt(g.updatedAt)}.</p>

        <section aria-labelledby="prog-h" style={{ paddingTop: 16, borderTop: `1px solid ${hair}` }}>
          <h3 id="prog-h" style={{ ...S.heading, fontSize: 18, margin: '0 0 12px' }}>Progress &amp; status</h3>
          {editableProgress ? (
            <form onSubmit={(e) => saveProgress(e, g)} noValidate>
              <div className="gl-two" style={{ alignItems: 'start' }}>
                {field('p-val', 'Progress (%)', <UI.Input id="p-val" inputMode="numeric" value={progressDraft} onChange={(e) => setProgressDraft(e.target.value)} aria-invalid={progressError ? true : undefined} aria-describedby={progressError ? 'p-val-e' : undefined} style={{ ...S.input, ...S.num, borderColor: progressError ? bad : mix(ink, 22, 'transparent') }} />, progressError)}
                {field('p-status', 'Status', <select id="p-status" value={statusDraft} onChange={(e) => setStatusDraft(e.target.value)} style={S.input}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>)}
              </div>
              <div style={{ marginTop: 16 }}><button type="submit" style={S.primary}>Record progress</button></div>
              <p style={{ fontSize: 13, color: muted, margin: '12px 0 0' }}>You type this in yourself. It is stored with your name and today’s date.</p>
            </form>
          ) : (
            <div style={{ padding: 16, background: panelHigh, borderRadius: brand.radius, border: `1px solid ${hair}`, display: 'flex', gap: 12 }}>
              <Icons.User className="h-5 w-5 shrink-0" aria-hidden="true" style={{ color: muted }} />
              <div>
                <div style={{ ...S.heading, ...S.num, fontSize: 28 }}>{g.progress}%</div>
                <div style={{ fontSize: 14, color: muted, marginTop: 4 }}>Read-only for you. Only {owner.name} or an HR Admin can change progress and status.</div>
              </div>
            </div>
          )}
          <h4 style={{ ...S.label, margin: '20px 0 8px' }}>Progress history</h4>
          {g.history.length === 0 ? <p style={{ margin: 0, fontSize: 14, color: muted }}>No updates yet. The first one you record will appear here.</p> : (
            <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {g.history.map((h, i) => (
                <li key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '8px 0', borderTop: i ? `1px solid ${hair}` : 'none', fontSize: 14, ...S.num }}>
                  <span><span style={{ color: accent }}>{h.progress}%</span> · {h.status}</span>
                  <span style={{ color: muted }}>{h.by} · {fmt(h.date)}</span>
                </li>
              ))}
            </ol>
          )}
        </section>

        {g.level !== 'Personal' && (
          <section aria-labelledby="al-h" style={{ paddingTop: 16, borderTop: `1px solid ${hair}` }}>
            <h3 id="al-h" style={{ ...S.heading, fontSize: 18, margin: '0 0 12px' }}>Aligned goals</h3>
            {kids.length === 0 ? <p style={{ margin: 0, fontSize: 14, color: muted }}>Nothing you can view is aligned to this goal yet.</p> : (
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {kids.map((k, i) => (
                  <li key={k.id} style={{ borderTop: i ? `1px solid ${hair}` : 'none' }}>
                    <button type="button" onClick={() => select(k.id)} style={{ width: '100%', textAlign: 'left', background: 'transparent', color: ink, border: 0, padding: '12px 0', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', minHeight: 44 }}>
                      <span><span style={{ ...S.num, color: accent, fontSize: 12 }}>{k.ref}</span> {k.title}<br /><span style={{ fontSize: 13, color: muted }}>{person(k.ownerId).name}</span></span>
                      <span style={{ display: 'flex', gap: 8, alignItems: 'center', flexDirection: 'column' }}><span style={{ ...S.num }}>{k.progress}%</span>{pill(k.status)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {(list.length > 0 || canComment(g) || g.ownerId === viewer.id) && (
          <section aria-labelledby="cm-h" style={{ paddingTop: 16, borderTop: `1px solid ${hair}` }}>
            <h3 id="cm-h" style={{ ...S.heading, fontSize: 18, margin: '0 0 12px' }}>Comments</h3>
            {list.length === 0 ? <p style={{ margin: '0 0 12px', fontSize: 14, color: muted }}>No comments yet. Comments are visible to the goal owner and the manager.</p> : (
              <ul style={{ listStyle: 'none', margin: '0 0 16px', padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {list.map((c) => (
                  <li key={c.id} style={{ padding: '12px 16px', background: panelHigh, border: `1px solid ${hair}`, borderRadius: brand.radius }}>
                    <div style={{ fontSize: 13, color: muted, ...S.num }}><strong style={{ color: ink, fontWeight: 600 }}>{c.author}</strong> · {fmt(c.date)}</div>
                    <div style={{ fontSize: 15, lineHeight: 1.5, marginTop: 4 }}>{c.body}</div>
                  </li>
                ))}
              </ul>
            )}
            {canComment(g) && (
              <form onSubmit={(e) => postComment(e, g)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {field('c-body', `Comment for ${owner.name.split(' ')[0]}`, <UI.Textarea id="c-body" rows={3} value={commentDraft} onChange={(e) => setCommentDraft(e.target.value)} aria-invalid={commentError ? true : undefined} aria-describedby={commentError ? 'c-body-e' : undefined} style={{ ...S.input, borderColor: commentError ? bad : mix(ink, 22, 'transparent') }} />, commentError)}
                <div><button type="submit" style={S.ghost}><Icons.Plus className="h-4 w-4" aria-hidden="true" />Post comment</button></div>
              </form>
            )}
          </section>
        )}

        {(canEdit(g)) && (
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', paddingTop: 16, borderTop: `1px solid ${hair}`, alignItems: 'center' }}>
            <button type="button" style={S.ghost} onClick={() => startEdit(g)}><Icons.Edit className="h-4 w-4" aria-hidden="true" />Edit goal</button>
            {isHR && g.level !== 'Personal' && !confirmDelete && <button type="button" style={{ ...S.ghost, color: bad }} onClick={() => setConfirmDelete(true)}><Icons.Trash className="h-4 w-4" aria-hidden="true" />Delete goal</button>}
            {isHR && g.level !== 'Personal' && confirmDelete && (
              <span role="alertdialog" aria-label="Confirm delete" style={{ display: 'inline-flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', fontSize: 14 }}>
                Delete {g.ref} for good?
                <button type="button" style={{ ...S.ghost, color: bad, borderColor: bad }} onClick={() => deleteGoal(g)}>Yes, delete</button>
                <button type="button" style={S.ghost} onClick={() => setConfirmDelete(false)}>Keep it</button>
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  const canCreateHere = true;
  const statusOptions = ['all', ...STATUSES, 'Overdue'];

  return (
    <div className="gl" style={{ color: ink, fontFamily: brand.fontBody, background: bg, minHeight: '100%', padding: '32px 24px 64px' }}>
      <style>{`
        .gl *:focus-visible{outline:2px solid ${accent};outline-offset:2px}
        .gl button{font-family:inherit}
        .gl button:hover:not(:disabled){filter:brightness(1.12)}
        .gl select option{background:${bg};color:${ink}}
        .gl-main{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:24px;align-items:start}
        .gl-two{display:grid;grid-template-columns:1fr 1fr;gap:16px}
        .gl-rowbtn{display:block;width:100%;text-align:left;border:0;padding:16px 24px;cursor:pointer}
        .gl-rowbtn:hover{background:${panelHigh} !important;filter:none !important}
        .gl-rowgrid{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:16px;align-items:start}
        .gl-fill{transition:width .4s ease}
        .gl-enter{animation:glIn .25s ease both}
        .gl-toast{animation:glIn .25s ease both}
        @keyframes glIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
        @media (max-width:1023px){.gl-main{grid-template-columns:1fr}}
        @media (max-width:639px){.gl-two{grid-template-columns:1fr}.gl-rowbtn{padding:16px}}
        @media (prefers-reduced-motion:reduce){.gl-fill,.gl-enter,.gl-toast{animation:none !important;transition:none !important}}
      `}</style>

      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap', paddingBottom: 24, borderBottom: `1px solid ${accent}` }}>
        <div>
          <div style={{ ...S.label, color: accent }}>2026 H2 · Goals &amp; OKRs</div>
          <h1 style={{ ...S.heading, fontSize: 40, lineHeight: 1.1, margin: '8px 0 8px' }}>Goals</h1>
          <p style={{ margin: 0, color: muted, fontSize: 15, maxWidth: '58ch', lineHeight: 1.5 }}>
            What you are aiming for, how it is measured, and the company goal it feeds. Progress is typed in by each goal’s owner.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <UI.Label htmlFor="viewer" style={S.label}>Preview as</UI.Label>
            <select id="viewer" value={viewerId} onChange={(e) => switchViewer(e.target.value)} style={{ ...S.input, width: 'auto', minWidth: 220 }}>
              <option value="e3">Daniel Okafor · Employee</option>
              <option value="e6">Noor Ahmed · Employee (new)</option>
              <option value="e2">Priya Raman · Manager</option>
              <option value="e1">Marta Lindqvist · HR Admin</option>
            </select>
          </div>
          {canCreateHere && <button type="button" onClick={startCreate} style={S.primary}><Icons.Plus className="h-4 w-4" aria-hidden="true" />{activeTab === 'org' && isHR ? 'New company or department goal' : 'New goal'}</button>}
        </div>
      </header>

      <div aria-live="polite" style={{ minHeight: 8 }}>
        {notice && (
          <div key={notice.key} className="gl-toast" role="status" style={{ margin: '16px 0 0', padding: '12px 16px', borderRadius: brand.radius, border: `1px solid ${notice.kind === 'error' ? mix(bad, 60, 'transparent') : mix(accent, 60, 'transparent')}`, background: notice.kind === 'error' ? mix(bad, 10, 'transparent') : mix(accent, 10, 'transparent'), display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'space-between', fontSize: 14 }}>
            <span style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              {notice.kind === 'error' ? <Icons.AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" /> : <Icons.CheckCircle className="h-5 w-5 shrink-0" aria-hidden="true" />}
              {notice.text}
            </span>
            <button type="button" aria-label="Dismiss message" onClick={() => setNotice(null)} style={{ background: 'transparent', border: 0, color: ink, cursor: 'pointer', minHeight: 44, minWidth: 44 }}><Icons.X className="h-4 w-4" aria-hidden="true" /></button>
          </div>
        )}
      </div>

      <div style={{ margin: '24px 0 16px' }}>
        <Tabs tabs={tabs} active={activeTab} onChange={(k) => { setTab(k); setQuery(''); setStatusFilter('all'); }} />
      </div>

      <div className="gl-main">
        <section aria-label="Goal list" style={{ ...S.panel, overflow: 'hidden' }}>
          <div style={{ padding: 24, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <UI.Label htmlFor="q" style={S.label}>Search goals</UI.Label>
              <UI.Input id="q" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Title, target or G-number" style={S.input} />
            </div>
            <div style={{ flex: '0 1 180px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <UI.Label htmlFor="sf" style={S.label}>Status</UI.Label>
              <select id="sf" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={S.input}>
                {statusOptions.map((s) => <option key={s} value={s}>{s === 'all' ? 'All statuses' : s}</option>)}
              </select>
            </div>
          </div>
          {activeTab === 'mine' && renderMine()}
          {activeTab === 'team' && renderTeam()}
          {activeTab === 'org' && renderOrg()}
        </section>

        <section aria-label="Goal detail" style={{ ...S.panel, position: 'relative' }}>
          {mode === 'view' ? renderDetail() : renderForm()}
        </section>
      </div>
    </div>
  );
}
