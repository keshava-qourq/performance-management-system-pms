// @ts-nocheck -- generated from the approved design under its JS runtime contract; not hand-written TypeScript.
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";

import * as UI from "@/lib/ui";
import { Icons } from "@/lib/icons";
import { useNavigate } from "@/lib/navigate";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { Label, Select, Separator } = UI;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { Bell, Edit } = Icons;

const C = { bg: '#16211c', surface: '#1c2b25', raised: '#223229', line: 'rgba(255,255,255,0.1)', ink: '#e9ede9', muted: '#8ba095', accent: '#8fae8b', warn: '#d9b27c', bad: '#e69a8e' };
const TODAY = '2026-10-29';
const NOW_LABEL = '29 Oct 2026, 14:20';
const HEAD = { fontFamily: '"Baskerville", "Libre Baskerville", "Times New Roman", Georgia, serif', color: C.ink };
const INPUT = 'w-full rounded-md px-3 py-2 text-sm border text-[#e9ede9] placeholder:text-[#8ba095] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8fae8b]';
const INPUT_STYLE = { backgroundColor: C.bg, borderColor: C.line };

const PEOPLE = {
  e1: { name: 'Amara Okafor', title: 'Product Designer', dept: 'Design' },
  r1: { name: 'Priya Nair', title: 'Senior Engineer', dept: 'Engineering' },
  r2: { name: 'Tomas Lindqvist', title: 'Engineer', dept: 'Engineering' },
  r3: { name: 'Hana Sato', title: 'Product Analyst', dept: 'Product' },
  r4: { name: 'Marcus Bell', title: 'Support Lead', dept: 'Customer Success' },
  e6: { name: 'Elena Vasquez', title: 'Finance Controller', dept: 'Finance' },
};
const MY_ID = 'e1';
const REPORTS = ['r1', 'r2', 'r3', 'r4'];
const OUTSIDE = ['e6'];

const SCALES0 = [{ id: 's1', name: 'Five-point proficiency', labels: ['Developing', 'Emerging', 'Proficient', 'Strong', 'Exemplary'] }];
const TEMPLATES0 = [{
  id: 't1', name: 'Annual competency review 2026', status: 'published', scaleId: 's1',
  competencies: [
    { id: 'c1', name: 'Delivery', questions: [
      { id: 'q1', text: 'How consistently did you deliver against your agreed goals this period?', type: 'both', mandatory: true },
      { id: 'q2', text: 'Which outcome are you most proud of, and why?', type: 'text', mandatory: false },
    ] },
    { id: 'c2', name: 'Collaboration', questions: [
      { id: 'q3', text: 'How well did you work across teams to unblock others?', type: 'rated', mandatory: true },
      { id: 'q4', text: 'Describe a moment you changed your approach after colleague feedback.', type: 'both', mandatory: true },
    ] },
    { id: 'c3', name: 'Craft and growth', questions: [
      { id: 'q5', text: 'How would you rate your growth in your core craft this period?', type: 'rated', mandatory: true },
    ] },
  ],
}];

const mkSnap = (tpl, scale) => ({ tplId: tpl.id, name: tpl.name, scale: { name: scale.name, labels: scale.labels.slice() }, competencies: JSON.parse(JSON.stringify(tpl.competencies)) });
const SNAP0 = mkSnap(TEMPLATES0[0], SCALES0[0]);
const FULL = {
  q1: { rating: 4, comment: 'Shipped the onboarding rebuild two weeks early and closed all four quarterly targets.' },
  q2: { rating: null, comment: 'Mentoring two new joiners through their first release.' },
  q3: { rating: 5, comment: '' },
  q4: { rating: 3, comment: 'I stopped sending long design documents after a colleague said they were not being read; short videos worked better.' },
  q5: { rating: 4, comment: '' },
};
const REVIEWS0 = {
  'p1:e1': { status: 'draft', answers: { q1: { rating: 4, comment: 'Delivered the settings redesign and the new empty states ahead of plan.' } }, submittedAt: null, snapshot: null, history: [] },
  'p1:r1': { status: 'submitted', answers: FULL, submittedAt: '22 Oct 2026, 09:12', snapshot: SNAP0, history: [{ action: 'Submitted', actor: 'Priya Nair', reason: '', at: '22 Oct 2026, 09:12' }] },
  'p1:r2': { status: 'draft', answers: { q1: { rating: 3, comment: 'Private draft text that my manager must not see.' } }, submittedAt: null, snapshot: null, history: [] },
  'p1:r3': { status: 'submitted', answers: FULL, submittedAt: '27 Oct 2026, 16:40', snapshot: SNAP0, history: [
    { action: 'Submitted', actor: 'Hana Sato', reason: '', at: '20 Oct 2026, 11:05' },
    { action: 'Reopened for editing', actor: 'Grace Mwangi (HR Admin)', reason: 'Employee asked to correct a rating typed against the wrong competency.', at: '24 Oct 2026, 10:30' },
    { action: 'Re-submitted', actor: 'Hana Sato', reason: '', at: '27 Oct 2026, 16:40' },
  ] },
  'p1:r4': { status: 'not_started', answers: {}, submittedAt: null, snapshot: null, history: [] },
};
const PERIODS0 = [{ id: 'p1', name: 'H2 2026 Self-Review', templateId: 't1', start: '2026-07-01', end: '2026-12-31', deadline: '2026-11-13', status: 'open', participants: ['e1', 'r1', 'r2', 'r3', 'r4'] }];

const isAnswered = (q, a) => {
  const x = a || {};
  const hasR = x.rating !== null && x.rating !== undefined;
  const hasC = !!(x.comment && x.comment.trim());
  if (q.type === 'rated') return hasR;
  if (q.type === 'text') return hasC;
  return hasR && hasC;
};
const allQs = (snap) => snap.competencies.reduce((acc, c) => acc.concat(c.questions), []);
const fmt = (d) => { if (!d) return ''; const p = d.split('-'); const m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']; return Number(p[2]) + ' ' + m[Number(p[1]) - 1] + ' ' + p[0]; };

function Pill({ tone, children }) {
  const col = tone === 'ok' ? C.accent : tone === 'warn' ? C.warn : tone === 'bad' ? C.bad : C.muted;
  return <span className="inline-flex items-center rounded px-2 py-0.5 text-[11px] uppercase tracking-widest border" style={{ color: col, borderColor: col }}>{children}</span>;
}
function Btn({ kind, children, className, ...rest }) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-md px-4 text-sm min-h-11 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8fae8b] focus-visible:ring-offset-2 focus-visible:ring-offset-[#16211c] disabled:opacity-40 disabled:cursor-not-allowed ';
  const st = kind === 'primary' ? { backgroundColor: C.accent, color: C.bg, fontWeight: 600 } : { backgroundColor: 'transparent', color: C.ink, border: '1px solid ' + C.line };
  return <button type="button" className={base + (kind === 'primary' ? 'hover:brightness-110 ' : 'hover:bg-white/5 ') + (className || '')} style={st} {...rest}>{children}</button>;
}
function Panel({ title, eyebrow, action, children }) {
  return (
    <section className="rounded-md border mb-6" style={{ backgroundColor: C.surface, borderColor: C.line }}>
      {(title || action) && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 pt-5 pb-4 border-b" style={{ borderColor: C.line }}>
          <div>
            {eyebrow && <div className="text-[11px] uppercase tracking-widest mb-1" style={{ color: C.accent }}>{eyebrow}</div>}
            <h2 className="text-xl" style={HEAD}>{title}</h2>
          </div>
          {action}
        </div>
      )}
      <div className="p-6">{children}</div>
    </section>
  );
}
function Field({ label, error, children }) {
  return (
    <div className="mb-4">
      <label className="block text-[11px] uppercase tracking-widest mb-2" style={{ color: C.muted }}>{label}</label>
      {children}
      {error && <p className="mt-1 text-xs flex items-center gap-1" style={{ color: C.bad }} role="alert"><Icons.AlertCircle size={14} /> {error}</p>}
    </div>
  );
}
function Notice({ tone, children }) {
  const col = tone === 'bad' ? C.bad : tone === 'ok' ? C.accent : C.warn;
  const Ic = tone === 'ok' ? Icons.CheckCircle : Icons.AlertCircle;
  return <div role="status" className="flex items-start gap-2 rounded-md border px-4 py-3 text-sm mb-4" style={{ borderColor: col, color: C.ink, backgroundColor: C.bg }}><span style={{ color: col }}><Ic size={16} /></span><span>{children}</span></div>;
}

function ReviewBody({ snap, answers, editable, onChange, errors }) {
  const labels = snap.scale.labels;
  return (
    <div>
      {snap.competencies.map((c, ci) => (
        <div key={c.id} className="mb-8">
          <div className="flex items-baseline gap-3 border-b pb-2 mb-4" style={{ borderColor: C.accent }}>
            <span className="text-xs tracking-widest" style={{ color: C.accent }}>{String(ci + 1).padStart(2, '0')}</span>
            <h3 className="text-lg" style={HEAD}>{c.name}</h3>
          </div>
          {c.questions.map((q) => {
            const a = answers[q.id] || {};
            const err = errors && errors[q.id];
            return (
              <div key={q.id} className="mb-6 rounded-md border p-4" style={{ borderColor: err ? C.bad : C.line, backgroundColor: C.bg }}>
                <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                  <p className="text-sm max-w-xl" style={{ color: C.ink, lineHeight: 1.5 }}>{q.text}</p>
                  <Pill tone={q.mandatory ? 'warn' : 'muted'}>{q.mandatory ? 'Required' : 'Optional'}</Pill>
                </div>
                {(q.type === 'rated' || q.type === 'both') && (
                  editable ? (
                    <div role="radiogroup" aria-label="Rating" className="flex flex-wrap gap-2 mb-3">
                      {labels.map((l, i) => {
                        const on = a.rating === i + 1;
                        return (
                          <button key={i} type="button" role="radio" aria-checked={on} onClick={() => onChange(q.id, { rating: i + 1 })}
                            className="rounded-md border px-3 py-2 text-sm min-h-11 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8fae8b] hover:bg-white/5"
                            style={{ borderColor: on ? C.accent : C.line, backgroundColor: on ? C.accent : 'transparent', color: on ? C.bg : C.ink, fontWeight: on ? 600 : 400 }}>
                            {i + 1} · {l}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm mb-3" style={{ color: C.ink }}>
                      <span className="text-[11px] uppercase tracking-widest mr-2" style={{ color: C.muted }}>Rating</span>
                      {a.rating ? <span style={{ color: C.accent }}>{a.rating} of {labels.length} · {labels[a.rating - 1]}</span> : <span style={{ color: C.muted }}>No rating given</span>}
                    </p>
                  )
                )}
                {(q.type === 'text' || q.type === 'both') && (
                  editable ? (
                    <textarea rows={3} className={INPUT} style={INPUT_STYLE} aria-label={'Comment for: ' + q.text} placeholder="Write your reflection here" value={a.comment || ''} onChange={(e) => onChange(q.id, { comment: e.target.value })} />
                  ) : (
                    <p className="text-sm" style={{ color: a.comment ? C.ink : C.muted, lineHeight: 1.6 }}>{a.comment || 'No comment given'}</p>
                  )
                )}
                {err && <p className="mt-2 text-xs flex items-center gap-1" style={{ color: C.bad }} role="alert"><Icons.AlertCircle size={14} /> This question needs an answer before you can submit.</p>}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function HistoryList({ history }) {
  if (!history.length) return <p className="text-sm" style={{ color: C.muted }}>No history yet. Entries appear here when the review is submitted or reopened.</p>;
  return (
    <ol className="border-l pl-5" style={{ borderColor: C.line }}>
      {history.map((h, i) => (
        <li key={i} className="mb-4 relative">
          <span className="absolute -left-[25px] top-1.5 w-2 h-2 rounded-full" style={{ backgroundColor: C.accent }} />
          <div className="text-sm" style={{ color: C.ink }}>{h.action} <span style={{ color: C.muted }}>· {h.actor}</span></div>
          <div className="text-xs" style={{ color: C.muted }}>{h.at}</div>
          {h.reason && <div className="text-sm mt-1" style={{ color: C.ink }}>Reason: {h.reason}</div>}
        </li>
      ))}
    </ol>
  );
}

export default function Screen() {
  const navigate = useNavigate();
  const [role, setRole] = React.useState('employee');
  const [hrTab, setHrTab] = React.useState('periods');
  const [scales, setScales] = React.useState(SCALES0);
  const [templates, setTemplates] = React.useState(TEMPLATES0);
  const [periods, setPeriods] = React.useState(PERIODS0);
  const [reviews, setReviews] = React.useState(REVIEWS0);

  const [errors, setErrors] = React.useState({});
  const [msg, setMsg] = React.useState(null);
  const [confirming, setConfirming] = React.useState(false);
  const [mgrSel, setMgrSel] = React.useState(null);
  const [outsideId, setOutsideId] = React.useState('e6');
  const [outsideMsg, setOutsideMsg] = React.useState(null);

  const [scName, setScName] = React.useState('');
  const [scPoints, setScPoints] = React.useState(5);
  const [scLabels, setScLabels] = React.useState(['', '', '', '', '']);
  const [scMsg, setScMsg] = React.useState(null);

  const [tplName, setTplName] = React.useState('');
  const [tplScale, setTplScale] = React.useState('s1');
  const [tplSel, setTplSel] = React.useState('t1');
  const [tplMsg, setTplMsg] = React.useState(null);
  const [compName, setCompName] = React.useState('');
  const [qComp, setQComp] = React.useState('');
  const [qText, setQText] = React.useState('');
  const [qType, setQType] = React.useState('rated');
  const [qMand, setQMand] = React.useState(true);

  const emptyPf = { name: '', templateId: 't1', start: '', end: '', deadline: '', participants: [] };
  const [pf, setPf] = React.useState(emptyPf);
  const [pfEdit, setPfEdit] = React.useState(null);
  const [pfErr, setPfErr] = React.useState({});
  const [trackId, setTrackId] = React.useState('p1');
  const [trackMsg, setTrackMsg] = React.useState(null);
  const [reopenFor, setReopenFor] = React.useState(null);
  const [reopenReason, setReopenReason] = React.useState('');
  const [reopenErr, setReopenErr] = React.useState('');

  const tplById = (id) => templates.find((t) => t.id === id);
  const scaleById = (id) => scales.find((s) => s.id === id) || scales[0];
  const liveSnap = (tid) => { const t = tplById(tid); return mkSnap(t, scaleById(t.scaleId)); };

  const myPeriod = periods.find((p) => p.status === 'open' && p.participants.indexOf(MY_ID) > -1);
  const myKey = myPeriod ? myPeriod.id + ':' + MY_ID : null;
  const myRev = myKey ? reviews[myKey] : null;

  const setRev = (key, patch) => setReviews((r) => Object.assign({}, r, { [key]: Object.assign({}, r[key], patch) }));

  const changeAnswer = (qid, patch) => {
    const cur = myRev.answers[qid] || { rating: null, comment: '' };
    setRev(myKey, { answers: Object.assign({}, myRev.answers, { [qid]: Object.assign({}, cur, patch) }) });
    setMsg(null);
    if (errors[qid]) { const n = Object.assign({}, errors); delete n[qid]; setErrors(n); }
  };
  const saveDraft = () => { setRev(myKey, { status: 'draft' }); setMsg({ tone: 'ok', text: 'Draft saved at ' + NOW_LABEL + '. Your ratings and comments will be here when you return.' }); };
  const trySubmit = () => {
    const snap = liveSnap(myPeriod.templateId);
    const miss = {};
    allQs(snap).forEach((q) => { if (q.mandatory && !isAnswered(q, myRev.answers[q.id])) miss[q.id] = true; });
    setErrors(miss);
    if (Object.keys(miss).length) { setConfirming(false); setMsg({ tone: 'bad', text: 'Submission blocked: ' + Object.keys(miss).length + ' required question' + (Object.keys(miss).length > 1 ? 's are' : ' is') + ' unanswered and highlighted below.' }); return; }
    setMsg(null); setConfirming(true);
  };
  const confirmSubmit = () => {
    const snap = liveSnap(myPeriod.templateId);
    const had = myRev.history.length > 0;
    setRev(myKey, { status: 'submitted', submittedAt: NOW_LABEL, snapshot: snap, history: myRev.history.concat([{ action: had ? 'Re-submitted' : 'Submitted', actor: PEOPLE[MY_ID].name, reason: '', at: NOW_LABEL }]) });
    setConfirming(false); setMsg(null);
  };

  /* HR: rating scale */
  const setPoints = (n) => { setScPoints(n); setScLabels((l) => Array.from({ length: n }, (_, i) => l[i] || '')); };
  const saveScale = () => {
    if (!scName.trim()) { setScMsg({ tone: 'bad', text: 'Name the rating scale before saving.' }); return; }
    if (scLabels.some((l) => !l.trim())) { setScMsg({ tone: 'bad', text: 'Every point on the scale needs a label.' }); return; }
    const id = 's' + (scales.length + 1);
    setScales(scales.concat([{ id, name: scName.trim(), labels: scLabels.map((l) => l.trim()) }]));
    setScMsg({ tone: 'ok', text: '"' + scName.trim() + '" saved. Its ' + scPoints + ' labels now appear on rated questions that use it.' });
    setScName(''); setPoints(5); setScLabels(['', '', '', '', '']);
  };

  /* HR: questionnaire */
  const sel = tplById(tplSel);
  const createTemplate = () => {
    if (!tplName.trim()) { setTplMsg({ tone: 'bad', text: 'A questionnaire template needs a name.' }); return; }
    const id = 't' + (templates.length + 1);
    setTemplates(templates.concat([{ id, name: tplName.trim(), status: 'draft', scaleId: tplScale, competencies: [] }]));
    setTplSel(id); setTplName(''); setQComp('');
    setTplMsg({ tone: 'ok', text: 'Template created as a draft. Add competencies and questions, then publish it.' });
  };
  const patchTpl = (id, fn) => setTemplates((ts) => ts.map((t) => (t.id === id ? fn(t) : t)));
  const addCompetency = () => {
    if (!compName.trim()) { setTplMsg({ tone: 'bad', text: 'Enter a competency name.' }); return; }
    const id = 'c' + Date.now();
    patchTpl(sel.id, (t) => Object.assign({}, t, { competencies: t.competencies.concat([{ id, name: compName.trim(), questions: [] }]) }));
    setQComp(id); setCompName(''); setTplMsg(null);
  };
  const addQuestion = () => {
    const cid = qComp || (sel.competencies[0] && sel.competencies[0].id);
    if (!cid) { setTplMsg({ tone: 'bad', text: 'Add a competency first, then add questions to it.' }); return; }
    if (!qText.trim()) { setTplMsg({ tone: 'bad', text: 'Write the question text.' }); return; }
    const q = { id: 'q' + Date.now(), text: qText.trim(), type: qType, mandatory: qMand };
    patchTpl(sel.id, (t) => Object.assign({}, t, { competencies: t.competencies.map((c) => (c.id === cid ? Object.assign({}, c, { questions: c.questions.concat([q]) }) : c)) }));
    setQText(''); setTplMsg({ tone: 'ok', text: 'Question added. Reviews already submitted keep the wording they were answered against.' });
  };
  const publishTpl = () => {
    const n = sel.competencies.reduce((a, c) => a + c.questions.length, 0);
    if (n === 0) { setTplMsg({ tone: 'bad', text: 'Cannot publish: at least one question is required.' }); return; }
    patchTpl(sel.id, (t) => Object.assign({}, t, { status: 'published' }));
    setTplMsg({ tone: 'ok', text: '"' + sel.name + '" is published and available for review periods.' });
  };

  /* HR: periods */
  const toggleP = (id) => setPf((f) => Object.assign({}, f, { participants: f.participants.indexOf(id) > -1 ? f.participants.filter((x) => x !== id) : f.participants.concat([id]) }));
  const savePeriod = (openNow) => {
    const e = {};
    if (!pf.name.trim()) e.name = 'Give the review period a name.';
    if (!pf.templateId) e.templateId = 'Choose a published questionnaire.';
    if (!pf.start) e.start = 'Set a start date.';
    if (!pf.end) e.end = 'Set an end date.';
    if (pf.start && pf.end && pf.end < pf.start) e.end = 'The end date cannot be before the start date.';
    if (!pf.deadline) e.deadline = 'Set a submission deadline.';
    if (!pf.participants.length) e.participants = 'Select at least one participant.';
    setPfErr(e);
    if (Object.keys(e).length) return;
    const id = pfEdit || 'p' + (periods.length + 1);
    const rec = Object.assign({}, pf, { id, name: pf.name.trim(), status: openNow ? 'open' : 'draft' });
    setPeriods(pfEdit ? periods.map((p) => (p.id === pfEdit ? rec : p)) : periods.concat([rec]));
    if (openNow) {
      setReviews((r) => { const n = Object.assign({}, r); pf.participants.forEach((eid) => { if (!n[id + ':' + eid]) n[id + ':' + eid] = { status: 'not_started', answers: {}, submittedAt: null, snapshot: null, history: [] }; }); return n; });
      setTrackId(id);
    }
    setTrackMsg({ tone: 'ok', text: openNow ? '"' + rec.name + '" is open. A self-review task now exists on the dashboard of each of its ' + pf.participants.length + ' participants.' : '"' + rec.name + '" saved as a draft. No self-review tasks exist until you open it.' });
    setPf(emptyPf); setPfEdit(null);
  };
  const openDraft = (p) => {
    setReviews((r) => { const n = Object.assign({}, r); p.participants.forEach((eid) => { if (!n[p.id + ':' + eid]) n[p.id + ':' + eid] = { status: 'not_started', answers: {}, submittedAt: null, snapshot: null, history: [] }; }); return n; });
    setPeriods((ps) => ps.map((x) => (x.id === p.id ? Object.assign({}, x, { status: 'open' }) : x)));
    setTrackId(p.id);
    setTrackMsg({ tone: 'ok', text: '"' + p.name + '" is open and self-review tasks have been created.' });
  };
  const track = periods.find((p) => p.id === trackId) || null;
  const removeParticipant = (eid) => {
    const r = reviews[track.id + ':' + eid];
    if (r && r.status === 'submitted') { setTrackMsg({ tone: 'bad', text: 'Cannot remove ' + PEOPLE[eid].name + ': their submitted review must be preserved.' }); return; }
    setPeriods((ps) => ps.map((x) => (x.id === track.id ? Object.assign({}, x, { participants: x.participants.filter((y) => y !== eid) }) : x)));
    setTrackMsg({ tone: 'ok', text: PEOPLE[eid].name + ' was removed from "' + track.name + '".' });
  };
  const doReopen = (key) => {
    if (!reopenReason.trim()) { setReopenErr('A stated reason is required to reopen a submitted review.'); return; }
    const r = reviews[key];
    setRev(key, { status: 'draft', history: r.history.concat([{ action: 'Reopened for editing', actor: 'Grace Mwangi (HR Admin)', reason: reopenReason.trim(), at: NOW_LABEL }]) });
    setReopenFor(null); setReopenReason(''); setReopenErr('');
    setTrackMsg({ tone: 'ok', text: 'Review reopened. The reason, your identity and the time are recorded in its history.' });
  };

  const statusPill = (r, deadline) => {
    if (!r || r.status === 'not_started') return deadline < TODAY ? <Pill tone="bad">Overdue · not started</Pill> : <Pill tone="muted">Not started</Pill>;
    if (r.status === 'submitted') return <Pill tone="ok">Submitted</Pill>;
    return deadline < TODAY ? <Pill tone="bad">Overdue · draft</Pill> : <Pill tone="warn">Draft</Pill>;
  };

  const roleTabs = [{ k: 'employee', l: 'Employee' }, { k: 'manager', l: 'Manager' }, { k: 'hr', l: 'HR Admin' }];
  const hrTabs = [{ k: 'periods', l: 'Review periods' }, { k: 'questionnaires', l: 'Questionnaires' }, { k: 'scales', l: 'Rating scales' }];
  const tabBtn = (active) => ({ borderBottom: '2px solid ' + (active ? C.accent : 'transparent'), color: active ? C.ink : C.muted });

  const mgrKey = mgrSel ? 'p1:' + mgrSel : null;
  const mgrRev = mgrKey ? reviews[mgrKey] : null;
  const myDays = myPeriod ? Math.round((new Date(myPeriod.deadline) - new Date(TODAY)) / 86400000) : 0;
  const mandTotal = myPeriod ? allQs(liveSnap(myPeriod.templateId)).filter((q) => q.mandatory) : [];
  const mandDone = myPeriod && myRev ? mandTotal.filter((q) => isAnswered(q, myRev.answers[q.id])).length : 0;

  return (
    <div className="min-h-full p-6 md:p-10" style={{ backgroundColor: C.bg, color: C.ink, fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-[11px] uppercase tracking-widest mb-2" style={{ color: C.accent }}>Performance · Self-review</div>
        <div className="flex flex-wrap items-end justify-between gap-4 pb-4 border-b" style={{ borderColor: C.accent }}>
          <div>
            <h1 className="text-4xl font-bold" style={HEAD}>Reviews</h1>
            <p className="text-sm mt-2 max-w-xl" style={{ color: C.muted, lineHeight: 1.6 }}>Complete your self-review, read submitted reviews from your reporting line, and manage questionnaires and review periods.</p>
          </div>
          <Btn onClick={() => navigate('my-performance')}><Icons.ArrowLeft size={16} /> My performance</Btn>
        </div>

        <div className="flex items-center gap-2 mt-6 mb-8 flex-wrap" role="tablist" aria-label="Viewing as">
          <span className="text-[11px] uppercase tracking-widest mr-3" style={{ color: C.muted }}>Viewing as</span>
          {roleTabs.map((t) => (
            <button key={t.k} role="tab" aria-selected={role === t.k} type="button" onClick={() => { setRole(t.k); setMsg(null); }}
              className="px-4 min-h-11 text-sm rounded-md border focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8fae8b] hover:bg-white/5"
              style={{ borderColor: role === t.k ? C.accent : C.line, color: role === t.k ? C.accent : C.ink, backgroundColor: role === t.k ? C.surface : 'transparent' }}>{t.l}</button>
          ))}
        </div>

        {role === 'employee' && (
          !myPeriod ? (
            <Panel><UI.Empty title="No self-review is open for you" description="When HR opens a review period that includes you, your self-review task will appear here and on your dashboard." /></Panel>
          ) : (
            <div>
              <Panel eyebrow="Your self-review task" title={myPeriod.name}
                action={statusPill(myRev, myPeriod.deadline)}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div><div className="text-[11px] uppercase tracking-widest mb-1" style={{ color: C.muted }}>Questionnaire</div><div className="text-sm">{liveSnap(myPeriod.templateId).name}</div></div>
                  <div><div className="text-[11px] uppercase tracking-widest mb-1" style={{ color: C.muted }}>Submission deadline</div><div className="text-sm">{fmt(myPeriod.deadline)}{myRev.status !== 'submitted' && <span style={{ color: myDays < 0 ? C.bad : C.muted }}> · {myDays < 0 ? Math.abs(myDays) + ' days overdue' : myDays + ' days left'}</span>}</div></div>
                  <div><div className="text-[11px] uppercase tracking-widest mb-1" style={{ color: C.muted }}>Required answered</div><div className="text-2xl" style={Object.assign({}, HEAD, { color: C.accent })}>{myRev.status === 'submitted' ? mandTotal.length : mandDone} / {mandTotal.length}</div></div>
                </div>
              </Panel>

              {myRev.status === 'submitted' ? (
                <div>
                  <Notice tone="ok">Submitted by {PEOPLE[MY_ID].name} on {myRev.submittedAt}. This review is locked and read-only. If something needs correcting, ask HR to reopen it.</Notice>
                  <Panel title="Your submitted answers"><ReviewBody snap={myRev.snapshot} answers={myRev.answers} editable={false} /></Panel>
                  <Panel title="Review history"><HistoryList history={myRev.history} /></Panel>
                </div>
              ) : (
                <div>
                  {myDays < 0 && <Notice tone="bad">This task is overdue. You can still submit unless HR has closed the period.</Notice>}
                  {myRev.history.length > 0 && <Notice tone="warn">HR reopened this review for editing. Update your answers and submit again.</Notice>}
                  {msg && <Notice tone={msg.tone}>{msg.text}</Notice>}
                  <Panel title="Your answers"><ReviewBody snap={liveSnap(myPeriod.templateId)} answers={myRev.answers} editable={true} onChange={changeAnswer} errors={errors} /></Panel>
                  {confirming ? (
                    <div className="rounded-md border p-5 mb-6" style={{ borderColor: C.accent, backgroundColor: C.surface }}>
                      <h3 className="text-lg mb-2" style={HEAD}>Submit your self-review?</h3>
                      <p className="text-sm mb-4" style={{ color: C.muted }}>Once submitted it is recorded with your name and a timestamp, and it can no longer be edited.</p>
                      <div className="flex gap-3 flex-wrap"><Btn kind="primary" onClick={confirmSubmit}><Icons.Check size={16} /> Confirm and submit</Btn><Btn onClick={() => setConfirming(false)}>Keep editing</Btn></div>
                    </div>
                  ) : (
                    <div className="flex gap-3 flex-wrap mb-6"><Btn kind="primary" onClick={trySubmit}><Icons.Check size={16} /> Submit self-review</Btn><Btn onClick={saveDraft}>Save as draft</Btn></div>
                  )}
                  <Panel title="Review history"><HistoryList history={myRev.history} /></Panel>
                </div>
              )}
            </div>
          )
        )}

        {role === 'manager' && (
          <div>
            <Panel eyebrow="Your reporting line" title="Direct reports' self-reviews">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-[11px] uppercase tracking-widest" style={{ color: C.muted }}>
                    <th className="py-2 pr-4 font-normal">Employee</th><th className="py-2 pr-4 font-normal">Status</th><th className="py-2 pr-4 font-normal">Submitted</th><th className="py-2 font-normal"><span className="sr-only">Action</span></th>
                  </tr></thead>
                  <tbody>
                    {REPORTS.map((id) => {
                      const r = reviews['p1:' + id];
                      return (
                        <tr key={id} className="border-t" style={{ borderColor: C.line }}>
                          <td className="py-3 pr-4"><div className="flex items-center gap-3"><UI.Avatar name={PEOPLE[id].name} /><div><div>{PEOPLE[id].name}</div><div className="text-xs" style={{ color: C.muted }}>{PEOPLE[id].title}</div></div></div></td>
                          <td className="py-3 pr-4">{r.status === 'submitted' ? <Pill tone="ok">Submitted</Pill> : <Pill tone="muted">Not yet submitted</Pill>}</td>
                          <td className="py-3 pr-4" style={{ color: C.muted }}>{r.status === 'submitted' ? r.submittedAt : '—'}</td>
                          <td className="py-3 text-right">{r.status === 'submitted' ? <Btn onClick={() => setMgrSel(id)}>Read review <Icons.ChevronRight size={16} /></Btn> : <Btn onClick={() => setMgrSel(id)}>Open record</Btn>}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Panel>

            {mgrSel && mgrRev && (
              <Panel eyebrow="Read-only" title={PEOPLE[mgrSel].name + ' · ' + reviews['p1:' + mgrSel].status.replace('_', ' ')}>
                {mgrRev.status === 'submitted' ? (
                  <div>
                    <Notice tone="ok">Submitted on {mgrRev.submittedAt}. You are reading this exactly as it was submitted.</Notice>
                    <ReviewBody snap={mgrRev.snapshot} answers={mgrRev.answers} editable={false} />
                    <h3 className="text-lg mb-3" style={HEAD}>History</h3>
                    <HistoryList history={mgrRev.history} />
                  </div>
                ) : (
                  <UI.Empty title="Not yet submitted" description={PEOPLE[mgrSel].name + ' has not submitted a self-review. Draft content is private to them and is not shown here.'} />
                )}
              </Panel>
            )}

            <Panel title="Open someone outside your line">
              <p className="text-sm mb-4" style={{ color: C.muted }}>Use this to check that access outside your reporting line is refused.</p>
              <div className="flex flex-wrap gap-3 items-end">
                <div className="w-64"><label className="block text-[11px] uppercase tracking-widest mb-2" style={{ color: C.muted }}>Employee</label>
                  <select className={INPUT} style={INPUT_STYLE} value={outsideId} onChange={(e) => { setOutsideId(e.target.value); setOutsideMsg(null); }}>
                    {OUTSIDE.map((id) => <option key={id} value={id}>{PEOPLE[id].name} · {PEOPLE[id].dept}</option>)}
                  </select></div>
                <Btn onClick={() => setOutsideMsg('Access refused. ' + PEOPLE[outsideId].name + ' is not in your reporting line, so their self-review cannot be opened.')}>Open review</Btn>
              </div>
              {outsideMsg && <div className="mt-4"><Notice tone="bad">{outsideMsg}</Notice></div>}
            </Panel>
          </div>
        )}

        {role === 'hr' && (
          <div>
            <div className="flex gap-6 border-b mb-6 overflow-x-auto" style={{ borderColor: C.line }} role="tablist">
              {hrTabs.map((t) => (
                <button key={t.k} role="tab" aria-selected={hrTab === t.k} type="button" onClick={() => setHrTab(t.k)} className="pb-3 pt-2 min-h-11 text-sm whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8fae8b]" style={tabBtn(hrTab === t.k)}>{t.l}</button>
              ))}
            </div>

            {hrTab === 'scales' && (
              <div>
                <Panel eyebrow="Existing" title="Rating scales">
                  {scales.map((s) => (
                    <div key={s.id} className="py-3 border-b last:border-b-0" style={{ borderColor: C.line }}>
                      <div className="text-sm mb-2">{s.name} <span style={{ color: C.muted }}>· {s.labels.length} points</span></div>
                      <div className="flex flex-wrap gap-2">{s.labels.map((l, i) => <Pill key={i} tone="muted">{i + 1} {l}</Pill>)}</div>
                    </div>
                  ))}
                </Panel>
                <Panel eyebrow="New" title="Define a rating scale">
                  {scMsg && <Notice tone={scMsg.tone}>{scMsg.text}</Notice>}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Scale name"><input className={INPUT} style={INPUT_STYLE} value={scName} onChange={(e) => setScName(e.target.value)} placeholder="e.g. Four-point expectations" /></Field>
                    <Field label="Number of points"><select className={INPUT} style={INPUT_STYLE} value={scPoints} onChange={(e) => setPoints(Number(e.target.value))}>{[3, 4, 5, 6, 7].map((n) => <option key={n} value={n}>{n} points</option>)}</select></Field>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {scLabels.map((l, i) => (
                      <Field key={i} label={'Label for point ' + (i + 1)}><input className={INPUT} style={INPUT_STYLE} value={l} onChange={(e) => setScLabels(scLabels.map((x, j) => (j === i ? e.target.value : x)))} /></Field>
                    ))}
                  </div>
                  <Btn kind="primary" onClick={saveScale}><Icons.Plus size={16} /> Save rating scale</Btn>
                </Panel>
              </div>
            )}

            {hrTab === 'questionnaires' && (
              <div>
                {tplMsg && <Notice tone={tplMsg.tone}>{tplMsg.text}</Notice>}
                <Panel eyebrow="Library" title="Questionnaire templates">
                  {templates.map((t) => {
                    const nq = t.competencies.reduce((a, c) => a + c.questions.length, 0);
                    const used = Object.keys(reviews).filter((k) => reviews[k].status === 'submitted' && reviews[k].snapshot && reviews[k].snapshot.tplId === t.id).length;
                    return (
                      <div key={t.id} className="flex flex-wrap items-center justify-between gap-3 py-3 border-b last:border-b-0" style={{ borderColor: C.line }}>
                        <div><div className="text-sm">{t.name}</div><div className="text-xs" style={{ color: C.muted }}>{t.competencies.length} competencies · {nq} questions · {scaleById(t.scaleId).name}{used > 0 ? ' · used by ' + used + ' submitted reviews' : ''}</div></div>
                        <div className="flex items-center gap-3"><Pill tone={t.status === 'published' ? 'ok' : 'warn'}>{t.status === 'published' ? 'Published' : 'Draft'}</Pill><Btn onClick={() => { setTplSel(t.id); setQComp(''); setTplMsg(null); }}><Icons.Edit size={16} /> {tplSel === t.id ? 'Editing' : 'Edit'}</Btn></div>
                      </div>
                    );
                  })}
                  <Separator className="my-4" />
                  <div className="grid sm:grid-cols-3 gap-4 items-end">
                    <Field label="New template name"><input className={INPUT} style={INPUT_STYLE} value={tplName} onChange={(e) => setTplName(e.target.value)} placeholder="e.g. Mid-year check" /></Field>
                    <Field label="Rating scale"><select className={INPUT} style={INPUT_STYLE} value={tplScale} onChange={(e) => setTplScale(e.target.value)}>{scales.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></Field>
                    <div className="mb-4"><Btn onClick={createTemplate}><Icons.Plus size={16} /> Create template</Btn></div>
                  </div>
                </Panel>

                {sel && (
                  <Panel eyebrow={sel.status === 'published' ? 'Published' : 'Draft'} title={sel.name}
                    action={sel.status !== 'published' ? <Btn kind="primary" onClick={publishTpl}>Publish for use</Btn> : <Pill tone="ok">Available for review periods</Pill>}>
                    {sel.competencies.length === 0 ? (
                      <UI.Empty title="No competencies yet" description="Add a competency below, then add one or more questions to it." />
                    ) : sel.competencies.map((c) => (
                      <div key={c.id} className="mb-5">
                        <div className="text-sm font-semibold mb-2" style={{ color: C.accent }}>{c.name}</div>
                        {c.questions.length === 0 && <p className="text-xs" style={{ color: C.muted }}>No questions in this competency yet.</p>}
                        {c.questions.map((q) => (
                          <div key={q.id} className="flex flex-wrap items-center justify-between gap-2 py-2 border-t" style={{ borderColor: C.line }}>
                            <span className="text-sm max-w-xl">{q.text}</span>
                            <span className="flex gap-2"><Pill tone="muted">{q.type === 'both' ? 'Rated + text' : q.type === 'rated' ? 'Rated' : 'Free text'}</Pill><Pill tone={q.mandatory ? 'warn' : 'muted'}>{q.mandatory ? 'Required' : 'Optional'}</Pill></span>
                          </div>
                        ))}
                      </div>
                    ))}
                    <Separator className="my-4" />
                    <div className="grid sm:grid-cols-3 gap-4 items-end">
                      <div className="sm:col-span-2"><Field label="Competency name"><input className={INPUT} style={INPUT_STYLE} value={compName} onChange={(e) => setCompName(e.target.value)} placeholder="e.g. Leadership" /></Field></div>
                      <div className="mb-4"><Btn onClick={addCompetency}><Icons.Plus size={16} /> Add competency</Btn></div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Field label="Add to competency"><select className={INPUT} style={INPUT_STYLE} value={qComp || (sel.competencies[0] ? sel.competencies[0].id : '')} onChange={(e) => setQComp(e.target.value)}>{sel.competencies.length === 0 && <option value="">No competencies yet</option>}{sel.competencies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
                      <Field label="Question type"><select className={INPUT} style={INPUT_STYLE} value={qType} onChange={(e) => setQType(e.target.value)}><option value="rated">Rated</option><option value="text">Free text</option><option value="both">Rated and free text</option></select></Field>
                    </div>
                    <Field label="Question text"><textarea rows={2} className={INPUT} style={INPUT_STYLE} value={qText} onChange={(e) => setQText(e.target.value)} placeholder="What should the employee reflect on?" /></Field>
                    <label className="flex items-center gap-2 text-sm mb-4 min-h-11"><input type="checkbox" checked={qMand} onChange={(e) => setQMand(e.target.checked)} style={{ accentColor: C.accent, width: 18, height: 18 }} /> Employees must answer this question</label>
                    <Btn onClick={addQuestion}><Icons.Plus size={16} /> Add question</Btn>
                  </Panel>
                )}
              </div>
            )}

            {hrTab === 'periods' && (
              <div>
                {trackMsg && <Notice tone={trackMsg.tone}>{trackMsg.text}</Notice>}
                <Panel eyebrow="All periods" title="Review periods">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="text-left text-[11px] uppercase tracking-widest" style={{ color: C.muted }}><th className="py-2 pr-4 font-normal">Period</th><th className="py-2 pr-4 font-normal">Deadline</th><th className="py-2 pr-4 font-normal">Participants</th><th className="py-2 pr-4 font-normal">Status</th><th className="py-2 font-normal"><span className="sr-only">Actions</span></th></tr></thead>
                      <tbody>
                        {periods.map((p) => (
                          <tr key={p.id} className="border-t" style={{ borderColor: C.line }}>
                            <td className="py-3 pr-4">{p.name}<div className="text-xs" style={{ color: C.muted }}>{fmt(p.start)} – {fmt(p.end)}</div></td>
                            <td className="py-3 pr-4">{fmt(p.deadline)}</td>
                            <td className="py-3 pr-4">{p.participants.length}</td>
                            <td className="py-3 pr-4"><Pill tone={p.status === 'open' ? 'ok' : 'warn'}>{p.status === 'open' ? 'Open' : 'Draft'}</Pill></td>
                            <td className="py-3 text-right"><div className="flex gap-2 justify-end flex-wrap">
                              {p.status === 'draft' && <Btn onClick={() => { setPf({ name: p.name, templateId: p.templateId, start: p.start, end: p.end, deadline: p.deadline, participants: p.participants.slice() }); setPfEdit(p.id); setPfErr({}); }}><Icons.Edit size={16} /> Edit</Btn>}
                              {p.status === 'draft' ? <Btn kind="primary" onClick={() => openDraft(p)}>Open period</Btn> : <Btn onClick={() => setTrackId(p.id)}>Track</Btn>}
                            </div></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Panel>

                {track && track.status === 'open' && (
                  <Panel eyebrow={'Deadline ' + fmt(track.deadline)} title={'Submission tracker · ' + track.name}>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      {[['Submitted', track.participants.filter((e) => reviews[track.id + ':' + e] && reviews[track.id + ':' + e].status === 'submitted').length], ['Outstanding', track.participants.filter((e) => !reviews[track.id + ':' + e] || reviews[track.id + ':' + e].status !== 'submitted').length], ['Participants', track.participants.length]].map((s) => (
                        <div key={s[0]} className="border-t pt-3" style={{ borderColor: C.accent }}><div className="text-[11px] uppercase tracking-widest" style={{ color: C.muted }}>{s[0]}</div><div className="text-3xl" style={Object.assign({}, HEAD, { color: C.accent })}>{s[1]}</div></div>
                      ))}
                    </div>
                    {track.deadline < TODAY && <Notice tone="bad">The submission deadline has passed. Outstanding participants are marked overdue.</Notice>}
                    {track.participants.map((eid) => {
                      const key = track.id + ':' + eid;
                      const r = reviews[key];
                      return (
                        <div key={eid} className="py-3 border-t" style={{ borderColor: C.line }}>
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-3"><UI.Avatar name={PEOPLE[eid].name} /><div><div className="text-sm">{PEOPLE[eid].name}</div><div className="text-xs" style={{ color: C.muted }}>{PEOPLE[eid].dept}{r && r.submittedAt ? ' · submitted ' + r.submittedAt : ''}</div></div></div>
                            <div className="flex items-center gap-2 flex-wrap">
                              {statusPill(r, track.deadline)}
                              {r && r.status === 'submitted' && <Btn onClick={() => { setReopenFor(reopenFor === key ? null : key); setReopenReason(''); setReopenErr(''); }}>Reopen</Btn>}
                              <Btn onClick={() => removeParticipant(eid)}><Icons.X size={16} /> Remove</Btn>
                            </div>
                          </div>
                          {reopenFor === key && (
                            <div className="mt-3 rounded-md border p-4" style={{ borderColor: C.line, backgroundColor: C.bg }}>
                              <Field label="Reason for reopening (recorded in history)" error={reopenErr}><textarea rows={2} className={INPUT} style={INPUT_STYLE} value={reopenReason} onChange={(e) => setReopenReason(e.target.value)} /></Field>
                              <div className="flex gap-2"><Btn kind="primary" onClick={() => doReopen(key)}>Reopen for editing</Btn><Btn onClick={() => setReopenFor(null)}>Cancel</Btn></div>
                            </div>
                          )}
                          {r && r.history.length > 0 && <details className="mt-2"><summary className="text-xs cursor-pointer" style={{ color: C.muted }}>History ({r.history.length})</summary><div className="mt-3"><HistoryList history={r.history} /></div></details>}
                        </div>
                      );
                    })}
                  </Panel>
                )}

                <Panel eyebrow={pfEdit ? 'Editing draft' : 'New'} title={pfEdit ? 'Edit review period' : 'Create a review period'}>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Period name" error={pfErr.name}><input className={INPUT} style={INPUT_STYLE} value={pf.name} onChange={(e) => setPf(Object.assign({}, pf, { name: e.target.value }))} placeholder="e.g. H1 2027 Self-Review" /></Field>
                    <Field label="Questionnaire" error={pfErr.templateId}><select className={INPUT} style={INPUT_STYLE} value={pf.templateId} onChange={(e) => setPf(Object.assign({}, pf, { templateId: e.target.value }))}>{templates.filter((t) => t.status === 'published').map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></Field>
                    <Field label="Start date" error={pfErr.start}><input type="date" className={INPUT} style={INPUT_STYLE} value={pf.start} onChange={(e) => setPf(Object.assign({}, pf, { start: e.target.value }))} /></Field>
                    <Field label="End date" error={pfErr.end}><input type="date" className={INPUT} style={INPUT_STYLE} value={pf.end} onChange={(e) => setPf(Object.assign({}, pf, { end: e.target.value }))} /></Field>
                    <Field label="Submission deadline" error={pfErr.deadline}><input type="date" className={INPUT} style={INPUT_STYLE} value={pf.deadline} onChange={(e) => setPf(Object.assign({}, pf, { deadline: e.target.value }))} /></Field>
                  </div>
                  <Field label="Participants" error={pfErr.participants}>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {Object.keys(PEOPLE).map((id) => (
                        <label key={id} className="flex items-center gap-3 rounded-md border px-3 min-h-11 text-sm cursor-pointer" style={{ borderColor: C.line, backgroundColor: C.bg }}>
                          <input type="checkbox" checked={pf.participants.indexOf(id) > -1} onChange={() => toggleP(id)} style={{ accentColor: C.accent, width: 18, height: 18 }} />
                          <span>{PEOPLE[id].name}</span><span className="text-xs" style={{ color: C.muted }}>{PEOPLE[id].dept}</span>
                        </label>
                      ))}
                    </div>
                  </Field>
                  <div className="flex gap-3 flex-wrap">
                    <Btn kind="primary" onClick={() => savePeriod(true)}>Save and open period</Btn>
                    <Btn onClick={() => savePeriod(false)}>Save as draft</Btn>
                    {pfEdit && <Btn onClick={() => { setPf(emptyPf); setPfEdit(null); setPfErr({}); }}>Cancel editing</Btn>}
                  </div>
                </Panel>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
