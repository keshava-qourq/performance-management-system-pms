import * as React from "react";
import { useForm } from "react-hook-form";

import * as UI from "@/lib/ui";
import { Icons } from "@/lib/icons";
import { brand } from "@/lib/brand";
import { ApiError } from "@/lib/api";
import { FieldErrors, useDepartments } from "@/lib/employees";
import { formatDate } from "@/lib/dateFormat";
import { useSession } from "@/lib/session";
import {
  GOAL_STATUSES,
  type Goal,
  type GoalInput,
  HasChildren,
  useCreateGoal,
  useDeleteGoal,
  useParentOptions,
  useGoal,
  useGoals,
  useRecordProgress,
  useUpdateGoal,
} from "@/lib/goals";

const { Empty } = UI;

const ink = brand.primaryColor;
const bg = brand.backgroundColor;
const accent = brand.accentColor;
const muted = brand.neutralColor;
const mix = (c: string, p: number, base: string) => `color-mix(in srgb, ${c} ${p}%, ${base})`;
const hair = mix(ink, 13, "transparent");
const warn = "goldenrod";
const bad = "indianred";

const S: Record<string, React.CSSProperties> = {
  panel: {
    background: mix(ink, 5, bg),
    border: `1px solid ${hair}`,
    borderRadius: brand.radius,
  },
  label: {
    fontSize: 12,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: muted,
    fontWeight: 500,
  },
  heading: { fontFamily: brand.fontHeading, color: ink, fontWeight: 400 },
  input: {
    background: bg,
    border: `1px solid ${mix(ink, 22, "transparent")}`,
    color: ink,
    borderRadius: brand.radius,
    padding: "10px 12px",
    minHeight: 44,
    width: "100%",
    fontSize: 15,
    fontFamily: brand.fontBody,
  },
  primary: {
    background: accent,
    color: bg,
    border: `1px solid ${accent}`,
    borderRadius: brand.radius,
    fontWeight: 600,
    minHeight: 44,
    padding: "0 20px",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    fontSize: 14,
  },
  ghost: {
    background: "transparent",
    color: ink,
    border: `1px solid ${mix(ink, 25, "transparent")}`,
    borderRadius: brand.radius,
    minHeight: 44,
    padding: "0 16px",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    fontSize: 14,
  },
  num: { fontVariantNumeric: "tabular-nums" },
};

const STATUS_LOOK: Record<string, { c: string; icon: React.FC<{ className?: string }> }> = {
  "Not started": { c: muted, icon: Icons.Clock },
  "On track": { c: accent, icon: Icons.CheckCircle },
  "At risk": { c: warn, icon: Icons.AlertCircle },
  "Off track": { c: bad, icon: Icons.AlertCircle },
  Achieved: { c: accent, icon: Icons.Check },
  Cancelled: { c: muted, icon: Icons.X },
};

function Pill({ status }: { status: string }) {
  const look = STATUS_LOOK[status] ?? STATUS_LOOK["Not started"];
  const I = look.icon;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 12,
        padding: "3px 10px",
        borderRadius: 999,
        border: `1px solid ${mix(look.c, 55, "transparent")}`,
        color: look.c,
        background: mix(look.c, 10, "transparent"),
        whiteSpace: "nowrap",
      }}
    >
      <I className="h-3.5 w-3.5" />
      {status}
    </span>
  );
}

const OverdueTag = () => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      fontSize: 12,
      color: bad,
      fontWeight: 600,
    }}
  >
    <Icons.Calendar className="h-3.5 w-3.5" />
    Overdue
  </span>
);

function Bar({ value, label }: { value: number; label: string }) {
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      style={{ height: 4, background: hair, borderRadius: 2, overflow: "hidden" }}
    >
      <div style={{ width: `${value}%`, height: "100%", background: accent }} />
    </div>
  );
}

function Field({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <UI.Label htmlFor={id} style={S.label}>
        {label}
      </UI.Label>
      {children}
      {hint && !error ? <span style={{ fontSize: 13, color: muted }}>{hint}</span> : null}
      {error ? (
        <span
          id={`${id}-e`}
          role="alert"
          style={{ fontSize: 13, color: bad, display: "flex", gap: 6, alignItems: "flex-start" }}
        >
          <Icons.AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </span>
      ) : null}
    </div>
  );
}

type FormValues = {
  title: string;
  description: string;
  target: string;
  due_date: string;
  weighting: string;
  parent_goal_id: string;
  level: string;
  department_id: string;
};

const EMPTY_FORM: FormValues = {
  title: "",
  description: "",
  target: "",
  due_date: "",
  weighting: "",
  parent_goal_id: "",
  level: "personal",
  department_id: "",
};

const changedBy = (goal: Goal) =>
  goal.updated_by
    ? `Last changed by ${goal.updated_by.full_name}${
        goal.updated_at ? ` on ${formatDate(goal.updated_at.slice(0, 10))}` : ""
      }.`
    : "";

export default function Screen() {
  const { user, role } = useSession();
  const list = useGoals();
  const goals = React.useMemo(() => list.data?.goals ?? [], [list.data]);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [mode, setMode] = React.useState<"view" | "create" | "edit">("view");
  const [notice, setNotice] = React.useState<{ text: string; kind: string } | null>(null);
  const [formError, setFormError] = React.useState("");
  const [progressDraft, setProgressDraft] = React.useState("");
  const [statusDraft, setStatusDraft] = React.useState(GOAL_STATUSES[0] as string);
  const [progressError, setProgressError] = React.useState("");
  const [refusedIds, setRefusedIds] = React.useState<string[]>([]);

  const detail = useGoal(mode === "view" ? selectedId : null);
  const create = useCreateGoal();
  const remove = useDeleteGoal();
  const parentOptions = useParentOptions();
  const departments = useDepartments();
  const isHr = role === "hr_admin" || role === "HR Admin";
  const [deleteError, setDeleteError] = React.useState("");
  const update = useUpdateGoal();
  const recordProgress = useRecordProgress();
  const form = useForm<FormValues>({ defaultValues: EMPTY_FORM });

  const selected: Goal | null = detail.data?.goal ?? goals.find((g) => g.id === selectedId) ?? null;

  // Ownership comes from what the API returns on the goal, never from the UI's
  // own guess; a 403 on a save also turns the fields read-only (AC-047).
  const mayWrite = (goal: Goal | null) =>
    Boolean(
      goal &&
      !refusedIds.includes(goal.id) &&
      (goal.owner?.id === user?.id || role === "hr_admin" || role === "HR Admin"),
    );

  const onRefusal = (goalId: string | null, error: unknown) => {
    if (error instanceof ApiError && error.status === 403 && goalId)
      setRefusedIds((ids) => (ids.includes(goalId) ? ids : [...ids, goalId]));
  };

  // Re-seed the progress form whenever another goal, or a fresh copy, is shown.
  const shown = mode === "view" ? selected : null;
  const shownKey = shown ? `${shown.id}:${shown.progress}:${shown.status}` : "";
  React.useEffect(() => {
    if (!shown) return;
    setProgressDraft(String(shown.progress));
    setStatusDraft(shown.status);
    setProgressError("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shownKey]);

  const startCreate = () => {
    form.reset(EMPTY_FORM);
    setFormError("");
    setMode("create");
  };

  const startEdit = (goal: Goal) => {
    form.reset({
      title: goal.title,
      description: goal.description ?? "",
      target: goal.target,
      due_date: goal.due_date,
      weighting: String(goal.weighting),
      parent_goal_id: goal.parent_goal_id ?? "",
      level: goal.level ?? "personal",
      department_id: "",
    });
    setFormError("");
    setMode("edit");
  };

  const applyFieldErrors = (error: unknown) => {
    if (error instanceof FieldErrors) {
      for (const [field, message] of Object.entries(error.errors))
        form.setError(field as keyof FormValues, { message });
      setFormError("Goal not saved. Check the highlighted fields.");
      return true;
    }
    setFormError(
      error instanceof Error && error.message ? error.message : "The goal could not be saved.",
    );
    return false;
  };

  const submitForm = form.handleSubmit(async (values) => {
    setFormError("");
    const input: GoalInput = {
      title: values.title,
      description: values.description,
      target: values.target,
      due_date: values.due_date,
      weighting: values.weighting,
      parent_goal_id: values.parent_goal_id || null,
    };
    // Only HR may set a level; everyone else always sends personal.
    if (isHr) {
      input.level = values.level;
      if (values.level === "department") {
        if (!values.department_id) {
          form.setError("department_id", { message: "Choose a department for this goal." });
          return;
        }
        input.department_id = values.department_id;
      }
    }
    try {
      if (mode === "edit" && selectedId) {
        const saved = await update.mutateAsync({ id: selectedId, input });
        setNotice({ text: changedBy(saved), kind: "ok" });
      } else {
        const saved = await create.mutateAsync(input);
        setSelectedId(saved.id);
        setNotice({ text: `“${saved.title}” added at ${saved.progress}% progress.`, kind: "ok" });
      }
      setMode("view");
    } catch (error) {
      onRefusal(selectedId, error);
      applyFieldErrors(error);
    }
  });

  const deleteGoal = async (goal: Goal) => {
    setDeleteError("");
    try {
      await remove.mutateAsync(goal.id);
      setSelectedId(null);
      setNotice({ text: `“${goal.title}” was deleted.`, kind: "ok" });
    } catch (error) {
      if (error instanceof HasChildren)
        setDeleteError(
          `${error.childCount} aligned goal(s) must be re-aligned or unlinked before this goal can be deleted.`,
        );
      else if (error instanceof ApiError && error.status === 403)
        setDeleteError("You do not have permission to delete this goal.");
      else setDeleteError("The goal could not be deleted.");
    }
  };

  const submitProgress = async (event: React.FormEvent, goal: Goal) => {
    event.preventDefault();
    setProgressError("");
    try {
      const saved = await recordProgress.mutateAsync({
        id: goal.id,
        input: { progress: progressDraft, status: statusDraft },
      });
      setNotice({
        text: `Progress recorded: ${saved.progress}% · ${saved.status}.`,
        kind: "ok",
      });
    } catch (error) {
      onRefusal(goal.id, error);
      if (error instanceof FieldErrors)
        setProgressError(error.errors.progress ?? error.errors.status ?? error.message);
      else
        setProgressError(
          error instanceof Error && error.message
            ? error.message
            : "That progress update could not be saved.",
        );
      // The stored percentage is unchanged, so the detail still shows it (AC-044).
      setProgressDraft(String(goal.progress));
    }
  };

  const total = list.data?.weighting_total ?? 0;
  const over = Boolean(list.data?.over_100_warning);

  const renderList = () => {
    if (list.isLoading)
      return (
        <p role="status" style={{ padding: 24, color: muted }}>
          Loading your goals…
        </p>
      );
    if (list.isError)
      return (
        <p role="alert" style={{ padding: 24, color: bad }}>
          Your goals could not be loaded. Try again.
        </p>
      );
    if (goals.length === 0)
      return (
        <div style={{ padding: 24 }}>
          <Empty
            title="No goals yet"
            description="Goals you write for this period will be listed here with their measurable target, due date, weighting and the progress you record against them."
            action={
              <button type="button" style={S.primary} onClick={startCreate}>
                <Icons.Plus className="h-4 w-4" />
                New goal
              </button>
            }
          />
        </div>
      );
    return (
      <>
        <div
          style={{
            padding: "16px 24px",
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <span style={{ ...S.num, fontSize: 14, color: muted }}>
            {goals.length} goal{goals.length === 1 ? "" : "s"}
          </span>
          <span
            style={{
              ...S.num,
              fontSize: 13,
              color: over ? warn : muted,
              display: "inline-flex",
              gap: 6,
              alignItems: "center",
            }}
          >
            {over ? <Icons.AlertCircle className="h-4 w-4" /> : null}
            Total weighting {total}%
          </span>
        </div>
        {over ? (
          <div
            role="status"
            style={{
              margin: "0 24px 16px",
              padding: "12px 16px",
              border: `1px solid ${mix(warn, 50, "transparent")}`,
              background: mix(warn, 8, "transparent"),
              borderRadius: brand.radius,
              fontSize: 14,
            }}
          >
            {list.data?.warning ??
              `These goals add up to ${total}% for this period, which is over 100%.`}{" "}
            You can still save them.
          </div>
        ) : null}
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {goals.map((g) => (
            <li key={g.id} style={{ borderTop: `1px solid ${hair}` }}>
              <button
                type="button"
                onClick={() => {
                  setSelectedId(g.id);
                  setMode("view");
                }}
                aria-current={g.id === selectedId ? "true" : undefined}
                style={{
                  width: "100%",
                  textAlign: "left",
                  background: g.id === selectedId ? mix(ink, 9, bg) : "transparent",
                  border: 0,
                  color: ink,
                  padding: "16px 24px",
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <span style={{ fontSize: 16 }}>{g.title}</span>
                  <span
                    style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "end" }}
                  >
                    <span style={{ ...S.heading, ...S.num, fontSize: 24, lineHeight: 1 }}>
                      {g.progress}
                      <span style={{ fontSize: 14, color: muted }}>%</span>
                    </span>
                    <Pill status={g.status} />
                    {g.overdue ? <OverdueTag /> : null}
                  </span>
                </div>
                {g.parent_title ? (
                  <div style={{ fontSize: 13, color: muted, marginTop: 6 }}>
                    Aligned to: {g.parent_title}
                  </div>
                ) : null}
                <div style={{ ...S.num, fontSize: 13, color: muted, marginTop: 6 }}>
                  Due {formatDate(g.due_date)} · Weighting {g.weighting}%
                </div>
                <div style={{ marginTop: 12 }}>
                  <Bar value={g.progress} label={`${g.title} progress`} />
                </div>
              </button>
            </li>
          ))}
        </ul>
      </>
    );
  };

  const renderForm = () => {
    const creating = mode === "create";
    const errors = form.formState.errors;
    const parents = (parentOptions.data ?? []).filter((g) => g.id !== selectedId);
    const level = form.watch("level");
    return (
      <form
        onSubmit={submitForm}
        noValidate
        aria-label={creating ? "New goal" : "Edit goal"}
        style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}
      >
        <div>
          <div style={S.label}>{creating ? "New goal" : "Edit goal"}</div>
          <h2 style={{ ...S.heading, fontSize: 24, margin: "4px 0 0" }}>
            {creating ? "Write a goal you can measure" : (selected?.title ?? "Edit goal")}
          </h2>
        </div>
        {formError ? (
          <p role="alert" style={{ margin: 0, fontSize: 14, color: bad }}>
            {formError}
          </p>
        ) : null}
        <Field id="title" label="Title" error={errors.title?.message}>
          <UI.Input
            id="title"
            style={S.input}
            aria-invalid={errors.title ? true : undefined}
            {...form.register("title")}
          />
        </Field>
        <Field id="description" label="Description">
          <UI.Textarea id="description" style={S.input} {...form.register("description")} />
        </Field>
        <Field
          id="target"
          label="Measurable target"
          error={errors.target?.message}
          hint="A number, a date or a deliverable."
        >
          <UI.Input
            id="target"
            style={S.input}
            aria-invalid={errors.target ? true : undefined}
            {...form.register("target")}
          />
        </Field>
        <Field id="due_date" label="Due date" error={errors.due_date?.message}>
          <UI.Input
            id="due_date"
            type="date"
            style={S.input}
            aria-invalid={errors.due_date ? true : undefined}
            {...form.register("due_date")}
          />
        </Field>
        <Field
          id="weighting"
          label="Weighting (0–100)"
          error={errors.weighting?.message}
          hint="Share of your period this goal carries."
        >
          <UI.Input
            id="weighting"
            inputMode="decimal"
            style={S.input}
            aria-invalid={errors.weighting ? true : undefined}
            {...form.register("weighting")}
          />
        </Field>
        {isHr ? (
          <Field id="level" label="Level">
            <select id="level" style={S.input} {...form.register("level")}>
              <option value="personal">Personal</option>
              <option value="company">Company</option>
              <option value="department">Department</option>
            </select>
          </Field>
        ) : null}
        {isHr && level === "department" ? (
          <Field id="department_id" label="Department" error={errors.department_id?.message}>
            <select id="department_id" style={S.input} {...form.register("department_id")}>
              <option value="">Choose a department</option>
              {(departments.data ?? []).map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </Field>
        ) : null}
        <Field
          id="parent_goal_id"
          label="Aligned to"
          error={errors.parent_goal_id?.message}
          hint={
            parents.length === 0
              ? "No company or department goals are available to align to."
              : undefined
          }
        >
          <select id="parent_goal_id" style={S.input} {...form.register("parent_goal_id")}>
            <option value="">Not aligned to a parent goal</option>
            {parents.map((g) => (
              <option key={g.id} value={g.id}>
                {g.title} ({g.level})
              </option>
            ))}
          </select>
        </Field>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button type="submit" style={S.primary} disabled={form.formState.isSubmitting}>
            <Icons.Check className="h-4 w-4" />
            {creating ? "Save goal" : "Save changes"}
          </button>
          <button type="button" style={S.ghost} onClick={() => setMode("view")}>
            Cancel
          </button>
        </div>
      </form>
    );
  };

  const renderDetail = () => {
    if (!selected)
      return (
        <div style={{ padding: 24 }}>
          <Empty
            title="Pick a goal to open it"
            description="You will see its target, due date, weighting and the progress recorded against it here. Progress is typed in by the goal owner — it is never calculated."
          />
        </div>
      );
    const g = selected;
    const editable = mayWrite(g);
    return (
      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 24 }}>
        <div>
          <h2 style={{ ...S.heading, fontSize: 28, lineHeight: 1.2, margin: "0 0 12px" }}>
            {g.title}
          </h2>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <Pill status={g.status} />
            {g.overdue ? <OverdueTag /> : null}
          </div>
          {g.description ? (
            <p style={{ margin: "16px 0 0", fontSize: 15, lineHeight: 1.6, maxWidth: "62ch" }}>
              {g.description}
            </p>
          ) : null}
        </div>
        <dl style={{ margin: 0, paddingTop: 16, borderTop: `1px solid ${hair}` }}>
          <dt style={S.label}>Target</dt>
          <dd style={{ margin: "0 0 12px", fontSize: 15 }}>{g.target}</dd>
          <dt style={S.label}>Due</dt>
          <dd style={{ margin: "0 0 12px", fontSize: 15, ...S.num }}>{formatDate(g.due_date)}</dd>
          <dt style={S.label}>Weighting</dt>
          <dd style={{ margin: "0 0 12px", fontSize: 15, ...S.num }}>{g.weighting}%</dd>
          {g.parent_title ? (
            <>
              <dt style={S.label}>Alignment</dt>
              <dd style={{ margin: "0 0 12px", fontSize: 15 }}>Aligned to: {g.parent_title}</dd>
            </>
          ) : null}
          <dt style={S.label}>Owner</dt>
          <dd style={{ margin: 0, fontSize: 15 }}>{g.owner?.full_name ?? "—"}</dd>
        </dl>
        <p style={{ margin: 0, fontSize: 13, color: muted }}>{changedBy(g)}</p>

        <section
          aria-labelledby="prog-h"
          style={{ paddingTop: 16, borderTop: `1px solid ${hair}` }}
        >
          <h3 id="prog-h" style={{ ...S.heading, fontSize: 18, margin: "0 0 12px" }}>
            Progress &amp; status
          </h3>
          <p style={{ ...S.num, margin: "0 0 12px", fontSize: 15 }}>
            {`${g.progress}% · ${g.status}` +
              (g.progress_updated_by && g.progress_updated_at
                ? ` · recorded by ${g.progress_updated_by.full_name} on ${formatDate(
                    g.progress_updated_at.slice(0, 10),
                  )}`
                : "")}
          </p>
          <form onSubmit={(e) => submitProgress(e, g)} noValidate>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <Field id="p-val" label="Progress (%)" error={progressError}>
                <UI.Input
                  id="p-val"
                  inputMode="numeric"
                  value={progressDraft}
                  readOnly={!editable}
                  disabled={!editable}
                  aria-invalid={progressError ? true : undefined}
                  aria-describedby={progressError ? "p-val-e" : undefined}
                  onChange={(e) => setProgressDraft(e.target.value)}
                  style={S.input}
                />
              </Field>
              <Field id="p-status" label="Status">
                <select
                  id="p-status"
                  value={statusDraft}
                  disabled={!editable}
                  onChange={(e) => setStatusDraft(e.target.value)}
                  style={S.input}
                >
                  {GOAL_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            {editable ? (
              <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
                <button type="submit" style={S.primary}>
                  <Icons.Check className="h-4 w-4" />
                  Save progress
                </button>
                <button type="button" style={S.ghost} onClick={() => startEdit(g)}>
                  <Icons.Edit className="h-4 w-4" />
                  Edit goal
                </button>
              </div>
            ) : (
              <p style={{ marginTop: 12, fontSize: 13, color: muted }}>
                Only {g.owner?.full_name ?? "the goal owner"} and HR Admins can record progress on
                this goal.
              </p>
            )}
          </form>
        </section>

        <section
          aria-labelledby="aligned-h"
          style={{ paddingTop: 16, borderTop: `1px solid ${hair}` }}
        >
          <h3 id="aligned-h" style={{ ...S.heading, fontSize: 18, margin: "0 0 12px" }}>
            Aligned goals
          </h3>
          {(detail.data?.children ?? []).length === 0 ? (
            <p style={{ margin: 0, fontSize: 14, color: muted }}>
              No goals are aligned to this one yet. Goals that name it as their parent will be
              listed here.
            </p>
          ) : (
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14 }}>
              {(detail.data?.children ?? []).map((c) => (
                <li key={c.id}>
                  {c.title} — {c.owner?.full_name ?? "—"} · {c.progress}% · {c.status}
                </li>
              ))}
            </ul>
          )}
        </section>

        {isHr ? (
          <section style={{ paddingTop: 16, borderTop: `1px solid ${hair}` }}>
            {deleteError ? (
              <p role="alert" style={{ margin: "0 0 12px", fontSize: 14, color: bad }}>
                {deleteError}
              </p>
            ) : null}
            <button type="button" style={S.ghost} onClick={() => deleteGoal(g)}>
              <Icons.Trash className="h-4 w-4" />
              Delete
            </button>
          </section>
        ) : null}
      </div>
    );
  };

  return (
    <div style={{ padding: 24, color: ink, fontFamily: brand.fontBody }}>
      <header
        style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}
      >
        <h1 style={{ ...S.heading, fontSize: 32, margin: 0 }}>My goals</h1>
        <button type="button" style={S.primary} onClick={startCreate}>
          <Icons.Plus className="h-4 w-4" />
          New goal
        </button>
      </header>

      <div aria-live="polite" style={{ minHeight: 8 }}>
        {notice ? (
          <div
            role="status"
            style={{
              margin: "16px 0 0",
              padding: "12px 16px",
              borderRadius: brand.radius,
              border: `1px solid ${mix(accent, 60, "transparent")}`,
              background: mix(accent, 10, "transparent"),
              fontSize: 14,
            }}
          >
            {notice.text}
          </div>
        ) : null}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
          gap: 24,
          marginTop: 24,
        }}
      >
        <section aria-label="My goals" style={{ ...S.panel, overflow: "hidden" }}>
          {renderList()}
        </section>
        <section aria-label="Goal detail" style={S.panel}>
          {mode === "view" ? renderDetail() : renderForm()}
        </section>
      </div>
    </div>
  );
}
