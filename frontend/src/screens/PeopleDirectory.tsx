import { useState, type FormEvent } from "react";
import { useForm } from "react-hook-form";

import {
  useIssueInvitation,
  useIssuePasswordReset,
  useRevokeInvitation,
  type IssuedLink,
} from "@/lib/account";
import { ApiError } from "@/lib/api";
import { brand } from "@/lib/brand";
import { formatDate } from "@/lib/dateFormat";
import {
  FieldErrors,
  activeOnly,
  isDeactivated,
  useCreateEmployee,
  useDeactivateEmployee,
  useDepartments,
  useEmployeeRecord,
  useEmployees,
  useJobTitles,
  useSetManager,
  useUpdateEmployee,
  type Department,
  type Employee,
  type EmployeeInput,
  type JobTitle,
} from "@/lib/employees";
import { Icons } from "@/lib/icons";
import { useSession } from "@/lib/session";
import {
  Avatar,
  Button,
  Empty,
  Input,
  Label,
  Select,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from "@/lib/ui";

const LINE = "rgba(255,255,255,0.1)";
const box = { backgroundColor: "#1d2b25", border: "1px solid " + LINE, borderRadius: 6 };
const field = { backgroundColor: "#16211c", color: brand.primaryColor, borderColor: LINE };
const muted = { color: brand.neutralColor };
const warn = { color: "#e8a29a" };
const eyebrow = "block mb-1 text-[11px] uppercase tracking-[0.16em]";

const ROLES = [
  { value: "employee", label: "Employee" },
  { value: "manager", label: "Manager" },
  { value: "hr_admin", label: "HR Admin" },
  { value: "executive", label: "Executive (read-only)" },
];

interface FormValues {
  full_name: string;
  work_email: string;
  job_title_id: string;
  department_id: string;
  role: string;
  manager_id: string;
}
// Fields carried by POST/PATCH /employees. `manager_id` has its own endpoint.
const FIELDS: Array<keyof EmployeeInput> = [
  "full_name",
  "work_email",
  "job_title_id",
  "department_id",
  "role",
];
const FORM_FIELDS: Array<keyof FormValues> = [...FIELDS, "manager_id"];

const isHrAdmin = (role: string | null) =>
  (role ?? "").toLowerCase().replace(/[\s-]+/g, "_") === "hr_admin";

function FieldError({ id, text }: { id: string; text?: string }) {
  if (!text) return null;
  return (
    <p id={id} role="alert" className="mt-1 text-xs" style={warn}>
      {text}
    </p>
  );
}

function DirectReports({ employee }: { employee: Employee }) {
  const record = useEmployeeRecord(employee.id);
  const reports = record.data?.direct_reports ?? [];
  return (
    <section
      aria-label="Direct reports"
      className="pt-2"
      style={{ borderTop: "1px solid " + LINE }}
    >
      <h3 className={eyebrow} style={muted}>
        Direct reports
      </h3>
      {record.isLoading ? (
        <p className="text-sm" style={muted}>
          Loading direct reports…
        </p>
      ) : reports.length === 0 ? (
        <p className="text-sm" style={muted}>
          No one reports to {employee.full_name} yet. Anyone whose manager is set to them will be
          listed here.
        </p>
      ) : (
        <ul className="text-sm space-y-1" style={{ color: brand.primaryColor }}>
          {reports.map((r) => (
            <li key={r.id}>{r.full_name}</li>
          ))}
        </ul>
      )}
    </section>
  );
}

// Everything the record keeps once someone has left (NFR-010): read-only, and
// with no delete control anywhere in it.
function RecordHistory({ employee }: { employee: Employee }) {
  const record = useEmployeeRecord(employee.id);
  const sections: Array<{ key: string; label: string; items: string[] }> = [
    { key: "goals", label: "Goals", items: (record.data?.goals ?? []).map((g) => g.title) },
    {
      key: "reviews",
      label: "Submitted reviews",
      items: (record.data?.self_reviews ?? []).map((r) => r.period),
    },
    {
      key: "feedback",
      label: "Feedback",
      items: (record.data?.feedback ?? []).map((f) => f.body),
    },
  ];
  const total = sections.reduce((sum, s) => sum + s.items.length, 0);
  return (
    <section
      aria-label="History"
      className="pt-3 space-y-3"
      style={{ borderTop: "1px solid " + LINE }}
    >
      <h3 className={eyebrow} style={muted}>
        History
      </h3>
      {record.isLoading ? (
        <p className="text-sm" style={muted}>
          Loading this record…
        </p>
      ) : total === 0 ? (
        <p className="text-sm" style={muted}>
          Nothing has been recorded for {employee.full_name} yet. Goals, feedback and reviews from
          their time here would be kept and shown here, and are never deleted.
        </p>
      ) : (
        sections.map((s) => (
          <div key={s.key}>
            <h4 className="text-sm" style={{ color: brand.primaryColor }}>
              {s.label}
            </h4>
            {s.items.length === 0 ? (
              <p className="text-sm" style={muted}>
                No {s.label.toLowerCase()} were recorded.
              </p>
            ) : (
              <ul className="text-sm space-y-1" style={{ color: brand.primaryColor }}>
                {s.items.map((text, i) => (
                  <li key={i}>{text}</li>
                ))}
              </ul>
            )}
          </div>
        ))
      )}
    </section>
  );
}

// One issued link, shown so HR can copy it and pass it on by hand. Only the
// newest link works (NFR-005), so the panel says so next to it.
function LinkDisplay({ link, label }: { link: IssuedLink; label: string }) {
  const [copied, setCopied] = useState("");
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link.link);
      setCopied("Link copied to your clipboard.");
    } catch {
      setCopied("Copying failed. Select the link above and copy it yourself.");
    }
  };
  return (
    <div className="space-y-2">
      <Label htmlFor="issued-link" className={eyebrow} style={muted}>
        {label}
      </Label>
      <Input id="issued-link" readOnly value={link.link} style={field} />
      <div className="flex items-center gap-2">
        <Button size="sm" variant="secondary" type="button" onClick={copy}>
          Copy link
        </Button>
        <span className="text-xs" style={muted}>
          {link.expires_at ? `Expires ${formatDate(link.expires_at.slice(0, 10))}` : ""}
        </span>
      </div>
      <p role="status" className="text-xs" style={muted}>
        {copied}
      </p>
      <p className="text-xs" style={muted}>
        This link works once and only the newest link works: issuing or revoking another stops this
        one immediately.
      </p>
    </div>
  );
}

// Invitations and password-reset links (AC-018, AC-021, AC-029). Both kinds of
// link are shown the same way.
function AccountSection({ employee }: { employee: Employee }) {
  const invite = useIssueInvitation();
  const revoke = useRevokeInvitation();
  const reset = useIssuePasswordReset();
  const [link, setLink] = useState<{ value: IssuedLink; label: string } | null>(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const accountStatus = employee.account_status ?? "No account";
  const invited = accountStatus.toLowerCase() === "invited";
  const hasAccount = accountStatus.toLowerCase() === "active";

  const run = async (
    action: () => Promise<IssuedLink | void>,
    label: string,
    message: string,
    clears?: boolean,
  ) => {
    setError("");
    setStatus("");
    try {
      const result = await action();
      setLink(clears ? null : result ? { value: result, label } : null);
      setStatus(message);
    } catch (caught) {
      setError(
        caught instanceof ApiError && caught.message
          ? caught.message
          : "That could not be done. Try again.",
      );
    }
  };

  return (
    <section
      aria-label="Account access"
      className="pt-3 space-y-3"
      style={{ borderTop: "1px solid " + LINE }}
    >
      <h3 className={eyebrow} style={muted}>
        Account access
      </h3>
      <p className="text-sm" style={{ color: brand.primaryColor }}>
        Account status: {accountStatus}
      </p>
      <div className="flex flex-wrap gap-2">
        {!hasAccount && (
          <Button
            size="sm"
            variant="secondary"
            type="button"
            disabled={invite.isPending}
            onClick={() =>
              run(
                () => invite.mutateAsync(employee.id),
                "Invitation link",
                invited
                  ? "A new invitation link was issued. The previous link no longer works."
                  : `${employee.full_name} was invited.`,
              )
            }
          >
            {invited ? "Reissue invitation" : "Invite"}
          </Button>
        )}
        {invited && (
          <Button
            size="sm"
            variant="secondary"
            type="button"
            disabled={revoke.isPending}
            onClick={() =>
              run(
                () => revoke.mutateAsync(employee.id),
                "",
                "The invitation was revoked. That link no longer works.",
                true,
              )
            }
          >
            Revoke invitation
          </Button>
        )}
        <Button
          size="sm"
          variant="secondary"
          type="button"
          disabled={reset.isPending}
          onClick={() =>
            run(
              () => reset.mutateAsync(employee.id),
              "Password-reset link",
              "A password-reset link was issued. Any earlier link no longer works.",
            )
          }
        >
          Issue password-reset link
        </Button>
      </div>
      {status && (
        <p role="status" className="text-sm" style={{ color: brand.primaryColor }}>
          {status}
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm" style={warn}>
          {error}
        </p>
      )}
      {link && <LinkDisplay link={link.value} label={link.label} />}
    </section>
  );
}

// The leaver flow. Step one asks only for the leaving date; if the API refuses
// because the leaver still manages people, step two lists them and asks for the
// new manager before resubmitting.
function DeactivateSection({
  employee,
  people,
  onSaved,
}: {
  employee: Employee;
  people: Employee[];
  onSaved: (message: string) => void;
}) {
  const deactivate = useDeactivateEmployee();
  const record = useEmployeeRecord(employee.id);
  const [open, setOpen] = useState(false);
  const [leavingDate, setLeavingDate] = useState("");
  const [dateError, setDateError] = useState("");
  const [managerError, setManagerError] = useState("");
  const [reassign, setReassign] = useState("");
  const [needsReassign, setNeedsReassign] = useState(false);
  const [formError, setFormError] = useState("");

  const reports = record.data?.direct_reports ?? [];

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError("");
    setDateError("");
    setManagerError("");
    if (!leavingDate) {
      setDateError("Enter the date this employee is leaving.");
      return;
    }
    if (needsReassign && !reassign) {
      setManagerError("Choose the manager who will take on these direct reports.");
      return;
    }
    try {
      await deactivate.mutateAsync({
        id: employee.id,
        input: {
          leaving_date: leavingDate,
          ...(needsReassign && reassign ? { reassign_manager_id: reassign } : {}),
        },
      });
      onSaved(
        `${employee.full_name} was deactivated. Their goals, feedback and reviews are kept on their record.`,
      );
      setOpen(false);
      setNeedsReassign(false);
    } catch (error) {
      if (error instanceof FieldErrors) {
        const { reassign_manager_id: manager, leaving_date: when, ...rest } = error.errors;
        if (manager) {
          setNeedsReassign(true);
          setManagerError(manager);
        }
        if (when) setDateError(when);
        const other = Object.values(rest);
        if (other.length) setFormError(other.join(" "));
      } else if (error instanceof ApiError && error.status === 403) {
        setFormError("Only HR Admins can deactivate an employee, so nothing was changed.");
      } else {
        setFormError("The employee could not be deactivated. Try again.");
      }
    }
  };

  if (!open)
    return (
      <section className="pt-3" style={{ borderTop: "1px solid " + LINE }}>
        <Button size="sm" variant="secondary" onClick={() => setOpen(true)}>
          Deactivate employee
        </Button>
        <p className="mt-1 text-xs" style={muted}>
          Leavers are deactivated, never deleted: their goals, feedback and reviews stay on their
          record.
        </p>
      </section>
    );

  return (
    <form
      onSubmit={submit}
      noValidate
      aria-label="Deactivate employee"
      className="pt-3 space-y-3"
      style={{ borderTop: "1px solid " + LINE }}
    >
      <div>
        <Label htmlFor="leaving_date" className={eyebrow} style={muted}>
          Leaving date
        </Label>
        <Input
          id="leaving_date"
          type="date"
          value={leavingDate}
          onChange={(e) => setLeavingDate(e.target.value)}
          style={field}
          aria-invalid={dateError ? true : undefined}
          aria-describedby={dateError ? "leaving_date-error" : undefined}
        />
        <FieldError id="leaving_date-error" text={dateError} />
      </div>
      {needsReassign && (
        <div>
          <p className="text-sm" style={{ color: brand.primaryColor }}>
            {employee.full_name} still manages{" "}
            {reports.length === 1 ? "one person" : `${reports.length} people`}. Choose who they
            report to from now on, then confirm the deactivation.
          </p>
          <ul className="my-2 text-sm space-y-1" style={muted} aria-label="Affected direct reports">
            {reports.map((r) => (
              <li key={r.id}>{r.full_name}</li>
            ))}
          </ul>
          <Label htmlFor="reassign_manager_id" className={eyebrow} style={muted}>
            New manager
          </Label>
          <Select
            id="reassign_manager_id"
            value={reassign}
            onChange={(e) => setReassign(e.target.value)}
            style={field}
            options={[
              { value: "", label: "Choose a new manager" },
              ...activeOnly(people)
                .filter((p) => p.id !== employee.id)
                .map((p) => ({ value: p.id, label: p.full_name })),
            ]}
            aria-invalid={managerError ? true : undefined}
            aria-describedby={managerError ? "reassign_manager_id-error" : undefined}
          />
          <FieldError id="reassign_manager_id-error" text={managerError} />
        </div>
      )}
      {formError && (
        <p role="alert" className="text-sm" style={warn}>
          {formError}
        </p>
      )}
      <div className="flex gap-2">
        <Button type="submit" variant="secondary" disabled={deactivate.isPending}>
          {needsReassign ? "Reassign and deactivate" : "Confirm deactivation"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function EmployeePanel({
  employee,
  people,
  departments,
  titles,
  onClose,
  onSaved,
}: {
  employee: Employee | null;
  people: Employee[];
  departments: Department[];
  titles: JobTitle[];
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const create = useCreateEmployee();
  const update = useUpdateEmployee();
  const setManager = useSetManager();
  const [formError, setFormError] = useState("");
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, dirtyFields, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      full_name: employee?.full_name ?? "",
      work_email: employee?.work_email ?? "",
      job_title_id: employee?.job_title?.id ?? "",
      department_id: employee?.department?.id ?? "",
      role: employee?.role ?? "employee",
      manager_id: employee?.manager?.id ?? "",
    },
  });

  // Each server message goes against the field it names; anything we have no
  // field for is shown above the save button rather than dropped.
  const place = (error: FieldErrors) => {
    const unplaced: string[] = [];
    for (const [key, message] of Object.entries(error.errors)) {
      const name = (key === "email" ? "work_email" : key) as keyof FormValues;
      if (FORM_FIELDS.includes(name)) setError(name, { type: "server", message });
      else unplaced.push(message);
    }
    if (unplaced.length) setFormError(unplaced.join(" "));
  };

  const report = (error: unknown) => {
    if (error instanceof FieldErrors) place(error);
    else if (error instanceof ApiError && error.status === 403)
      setFormError(
        "Your role can view employee records but not change them, so nothing was saved.",
      );
    else
      setFormError(
        error instanceof ApiError && error.message
          ? error.message
          : "The employee could not be saved. Try again.",
      );
  };

  const submit = handleSubmit(async (values) => {
    setFormError("");
    try {
      if (!employee) {
        const input: EmployeeInput = {
          full_name: values.full_name,
          work_email: values.work_email,
          role: values.role,
        };
        if (values.job_title_id) input.job_title_id = values.job_title_id;
        if (values.department_id) input.department_id = values.department_id;
        await create.mutateAsync(input);
        onSaved(`${values.full_name} was added to the directory.`);
        onClose();
        return;
      }
      // The reporting line goes first: if it would be circular the API refuses
      // and nothing else is saved either.
      if (dirtyFields.manager_id)
        await setManager.mutateAsync({ id: employee.id, manager_id: values.manager_id || null });
      const input: EmployeeInput = {};
      for (const key of FIELDS) if (dirtyFields[key]) input[key] = values[key];
      if (Object.keys(input).length) await update.mutateAsync({ id: employee.id, input });
      onSaved(`${values.full_name} was updated.`);
    } catch (error) {
      report(error);
    }
  });

  const invalid = (name: keyof FormValues) => (errors[name] ? true : undefined);
  const describedBy = (name: keyof FormValues) => (errors[name] ? `${name}-error` : undefined);
  const placeholder = (label: string) => [{ value: "", label: `Choose ${label}` }];

  return (
    <aside aria-label="Employee record form" className="p-5 space-y-4" style={box}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div
            className="text-[11px] uppercase tracking-[0.16em]"
            style={{ color: brand.accentColor }}
          >
            {employee ? "Employee record" : "New employee"}
          </div>
          <h2
            className="text-xl"
            style={{ fontFamily: brand.fontHeading, color: brand.primaryColor }}
          >
            {employee ? employee.full_name : "Add an employee"}
          </h2>
          {employee && (
            <p className="text-sm" style={muted}>
              {employee.job_title?.name ?? "No job title"} ·{" "}
              {employee.department?.name ?? "No department"}
            </p>
          )}
        </div>
        <Button size="sm" variant="secondary" aria-label="Close panel" onClick={onClose}>
          <Icons.X className="w-4 h-4" />
        </Button>
      </div>
      <form onSubmit={submit} noValidate className="space-y-4">
        <div>
          <Label htmlFor="full_name" className={eyebrow} style={muted}>
            Full name
          </Label>
          <Input
            id="full_name"
            {...register("full_name")}
            style={field}
            aria-invalid={invalid("full_name")}
            aria-describedby={describedBy("full_name")}
          />
          <FieldError id="full_name-error" text={errors.full_name?.message} />
        </div>
        <div>
          <Label htmlFor="work_email" className={eyebrow} style={muted}>
            Work email
          </Label>
          <Input
            id="work_email"
            type="email"
            {...register("work_email")}
            style={field}
            aria-invalid={invalid("work_email")}
            aria-describedby={describedBy("work_email")}
          />
          <FieldError id="work_email-error" text={errors.work_email?.message} />
        </div>
        <div>
          <Label htmlFor="job_title_id" className={eyebrow} style={muted}>
            Job title
          </Label>
          <Select
            id="job_title_id"
            {...register("job_title_id")}
            style={field}
            options={[
              ...placeholder("a job title"),
              ...titles.map((t) => ({ value: t.id, label: t.name })),
            ]}
            aria-invalid={invalid("job_title_id")}
            aria-describedby={describedBy("job_title_id")}
          />
          <FieldError id="job_title_id-error" text={errors.job_title_id?.message} />
        </div>
        <div>
          <Label htmlFor="department_id" className={eyebrow} style={muted}>
            Department
          </Label>
          <Select
            id="department_id"
            {...register("department_id")}
            style={field}
            options={[
              ...placeholder("a department"),
              ...departments.map((d) => ({ value: d.id, label: d.name })),
            ]}
            aria-invalid={invalid("department_id")}
            aria-describedby={describedBy("department_id")}
          />
          <FieldError id="department_id-error" text={errors.department_id?.message} />
        </div>
        <div>
          <Label htmlFor="role" className={eyebrow} style={muted}>
            Role
          </Label>
          <Select
            id="role"
            {...register("role")}
            style={field}
            options={ROLES}
            aria-invalid={invalid("role")}
            aria-describedby={describedBy("role")}
          />
          <FieldError id="role-error" text={errors.role?.message} />
        </div>
        {employee && (
          <div>
            <Label htmlFor="manager_id" className={eyebrow} style={muted}>
              Manager
            </Label>
            <Select
              id="manager_id"
              {...register("manager_id")}
              style={field}
              options={[
                { value: "", label: "No manager" },
                ...activeOnly(people)
                  .filter((p) => p.id !== employee.id)
                  .map((p) => ({ value: p.id, label: p.full_name })),
              ]}
              aria-invalid={invalid("manager_id")}
              aria-describedby={describedBy("manager_id")}
            />
            <FieldError id="manager_id-error" text={errors.manager_id?.message} />
          </div>
        )}
        {formError && (
          <p role="alert" className="text-sm" style={warn}>
            {formError}
          </p>
        )}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full"
          style={{ backgroundColor: brand.accentColor, color: "#16211c" }}
        >
          {employee ? "Save changes" : "Create employee"}
        </Button>
      </form>
      {employee && !isDeactivated(employee) && <AccountSection employee={employee} />}
      {employee && <DirectReports employee={employee} />}
      {employee && isDeactivated(employee) && (
        <p className="text-sm" style={muted}>
          {`Deactivated${
            employee.leaving_date ? ` · left on ${formatDate(employee.leaving_date)}` : ""
          }. Their record is kept as employment evidence and cannot be deleted.`}
        </p>
      )}
      {employee && <RecordHistory employee={employee} />}
      {employee && !isDeactivated(employee) && (
        <DeactivateSection employee={employee} people={people} onSaved={onSaved} />
      )}
    </aside>
  );
}

export default function DirectoryTab() {
  const { role, isLoading: sessionLoading } = useSession();
  const employees = useEmployees();
  const departments = useDepartments();
  const titles = useJobTitles();
  const [query, setQuery] = useState("");
  const [panel, setPanel] = useState<{ id: string | null } | null>(null);
  const [message, setMessage] = useState("");

  if (sessionLoading) return null;
  const canManage = isHrAdmin(role);

  const failure = employees.error;
  if (failure instanceof ApiError && failure.status === 403)
    return (
      <Empty
        title="You do not have access to the employee directory"
        description="Your role can read the parts of the product shared with you, but not employee records, so nothing is shown here."
      />
    );
  if (failure)
    return (
      <p role="alert" style={muted}>
        The directory could not be loaded. Try again shortly.
      </p>
    );
  if (employees.isLoading || !employees.data) return <p style={muted}>Loading the directory…</p>;

  const rows = employees.data;
  const needle = query.trim().toLowerCase();
  const shown = rows.filter(
    (e) =>
      !needle ||
      [e.full_name, e.work_email ?? "", e.job_title?.name ?? "", e.department?.name ?? ""].some(
        (v) => v.toLowerCase().includes(needle),
      ),
  );
  const editing = panel?.id ? (rows.find((e) => e.id === panel.id) ?? null) : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <Input
          aria-label="Search people"
          placeholder="Search by name, email or job title"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={field}
          className="sm:max-w-md"
        />
        {canManage && (
          <Button
            onClick={() => {
              setMessage("");
              setPanel({ id: null });
            }}
            style={{ backgroundColor: brand.accentColor, color: "#16211c" }}
          >
            <Icons.Plus className="w-4 h-4" />
            Add employee
          </Button>
        )}
      </div>
      {!canManage && (
        <p className="text-sm" style={muted}>
          You can read the directory. Only HR Admins can add or change employee records.
        </p>
      )}
      {message && (
        <p role="status" className="p-3 text-sm" style={{ ...box, color: brand.primaryColor }}>
          {message}
        </p>
      )}
      <div className={canManage && panel ? "grid gap-6 xl:grid-cols-[1fr_400px] items-start" : ""}>
        <div className="min-w-0">
          {rows.length === 0 ? (
            <Empty
              title="No employees yet"
              description={
                canManage
                  ? "Employees you add will be listed here with their job title, department and manager. Choose Add employee to create the first one."
                  : "Employees will be listed here with their job title, department and manager once HR adds them."
              }
            />
          ) : shown.length === 0 ? (
            <Empty
              title="No one matches that search"
              description="Clear the search to see the full directory."
            />
          ) : (
            <div className="overflow-x-auto" style={box}>
              <Table>
                <THead>
                  <TR>
                    {[
                      "Employee",
                      "Job title",
                      "Department",
                      "Manager",
                      "Status",
                      "Account",
                      "",
                    ].map((h, i) => (
                      <TH key={i} style={muted}>
                        {h}
                      </TH>
                    ))}
                  </TR>
                </THead>
                <TBody>
                  {shown.map((e) => (
                    <TR key={e.id}>
                      <TD>
                        <div className="flex items-center gap-3">
                          <Avatar name={e.full_name} />
                          <div>
                            <div style={{ color: brand.primaryColor }}>{e.full_name}</div>
                            {e.work_email && (
                              <div className="text-xs" style={muted}>
                                {e.work_email}
                              </div>
                            )}
                          </div>
                        </div>
                      </TD>
                      <TD>{e.job_title?.name ?? "—"}</TD>
                      <TD>{e.department?.name ?? "—"}</TD>
                      <TD>
                        {e.manager ? (
                          e.manager.full_name
                        ) : (
                          <span
                            className="inline-flex items-center gap-1 text-xs"
                            style={warn}
                            title="This employee has no manager set."
                          >
                            <Icons.AlertCircle className="w-3 h-3" />
                            Missing a reporting line
                          </span>
                        )}
                      </TD>
                      <TD>{e.status}</TD>
                      <TD>{e.account_status ?? "No account"}</TD>
                      <TD>
                        {canManage && (
                          <Button
                            size="sm"
                            variant="secondary"
                            aria-label={"Manage " + e.full_name}
                            onClick={() => {
                              setMessage("");
                              setPanel({ id: e.id });
                            }}
                          >
                            <Icons.Edit className="w-3 h-3" />
                            Manage
                          </Button>
                        )}
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </div>
          )}
        </div>
        {canManage && panel && (
          <EmployeePanel
            key={panel.id ?? "new"}
            employee={editing}
            people={rows}
            departments={departments.data ?? []}
            titles={titles.data ?? []}
            onClose={() => setPanel(null)}
            onSaved={setMessage}
          />
        )}
      </div>
    </div>
  );
}
