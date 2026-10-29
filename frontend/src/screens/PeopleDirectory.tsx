import { useState } from "react";
import { useForm } from "react-hook-form";

import { ApiError } from "@/lib/api";
import { brand } from "@/lib/brand";
import {
  FieldErrors,
  useCreateEmployee,
  useDepartments,
  useEmployees,
  useJobTitles,
  useUpdateEmployee,
  type Department,
  type Employee,
  type EmployeeInput,
  type JobTitle,
} from "@/lib/employees";
import { Icons } from "@/lib/icons";
import { useSession } from "@/lib/session";
import { Avatar, Button, Empty, Input, Label, Select, Table, TBody, TD, TH, THead, TR } from "@/lib/ui";

const LINE = "rgba(255,255,255,0.1)";
const box = { backgroundColor: "#1d2b25", border: "1px solid " + LINE, borderRadius: 6 };
const field = { backgroundColor: "#16211c", color: brand.primaryColor, borderColor: LINE };
const muted = { color: brand.neutralColor };
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
}
const FIELDS: Array<keyof FormValues> = [
  "full_name",
  "work_email",
  "job_title_id",
  "department_id",
  "role",
];

export const isHrAdmin = (role: string | null) =>
  (role ?? "").toLowerCase().replace(/[\s-]+/g, "_") === "hr_admin";

function FieldError({ id, text }: { id: string; text?: string }) {
  if (!text) return null;
  return (
    <p id={id} role="alert" className="mt-1 text-xs" style={{ color: "#e8a29a" }}>
      {text}
    </p>
  );
}

function EmployeePanel({
  employee,
  departments,
  titles,
  onClose,
  onSaved,
}: {
  employee: Employee | null;
  departments: Department[];
  titles: JobTitle[];
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const create = useCreateEmployee();
  const update = useUpdateEmployee(departments, titles);
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
      job_title_id:
        employee?.job_title_id ?? titles.find((t) => t.name === employee?.job_title)?.id ?? "",
      department_id:
        employee?.department_id ??
        departments.find((d) => d.name === employee?.department)?.id ??
        "",
      role: "employee",
    },
  });

  const submit = handleSubmit(async (values) => {
    setFormError("");
    try {
      if (employee) {
        const input: EmployeeInput = {};
        for (const key of FIELDS) if (dirtyFields[key]) input[key] = values[key];
        await update.mutateAsync({ id: employee.id, input });
        onSaved(`${values.full_name} was updated.`);
      } else {
        const input: EmployeeInput = { full_name: values.full_name, work_email: values.work_email, role: values.role };
        if (values.job_title_id) input.job_title_id = values.job_title_id;
        if (values.department_id) input.department_id = values.department_id;
        await create.mutateAsync(input);
        onSaved(`${values.full_name} was added to the directory.`);
        onClose();
      }
    } catch (error) {
      if (error instanceof FieldErrors) {
        const unplaced: string[] = [];
        for (const [key, message] of Object.entries(error.errors)) {
          const name = key === "email" ? "work_email" : key;
          if ((FIELDS as string[]).includes(name))
            setError(name as keyof FormValues, { type: "server", message });
          else unplaced.push(message);
        }
        if (unplaced.length) setFormError(unplaced.join(" "));
      } else if (error instanceof ApiError && error.status === 403) {
        setFormError("You do not have permission to change employee records.");
      } else {
        setFormError(error instanceof ApiError && error.message ? error.message : "The employee could not be saved. Try again.");
      }
    }
  });

  const invalid = (name: keyof FormValues) => (errors[name] ? true : undefined);
  const describedBy = (name: keyof FormValues) => (errors[name] ? `${name}-error` : undefined);
  const placeholder = (label: string) => [{ value: "", label: `Choose ${label}` }];

  return (
    <aside aria-label="Employee record form" className="p-5 space-y-4" style={box}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.16em]" style={{ color: brand.accentColor }}>
            {employee ? "Employee record" : "New employee"}
          </div>
          <h2 className="text-xl" style={{ fontFamily: brand.fontHeading, color: brand.primaryColor }}>
            {employee ? employee.full_name : "Add an employee"}
          </h2>
          {employee && (
            <p className="text-sm" style={muted}>
              {employee.job_title ?? "No job title"} · {employee.department ?? "No department"}
            </p>
          )}
        </div>
        <Button size="sm" variant="secondary" aria-label="Close panel" onClick={onClose}>
          <Icons.X className="w-4 h-4" />
        </Button>
      </div>
      <form onSubmit={submit} noValidate className="space-y-4">
        <div>
          <Label htmlFor="full_name" className={eyebrow} style={muted}>Full name</Label>
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
          <Label htmlFor="work_email" className={eyebrow} style={muted}>Work email</Label>
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
          <Label htmlFor="job_title_id" className={eyebrow} style={muted}>Job title</Label>
          <Select
            id="job_title_id"
            {...register("job_title_id")}
            style={field}
            options={[...placeholder("a job title"), ...titles.map((t) => ({ value: t.id, label: t.name }))]}
            aria-invalid={invalid("job_title_id")}
            aria-describedby={describedBy("job_title_id")}
          />
          <FieldError id="job_title_id-error" text={errors.job_title_id?.message} />
        </div>
        <div>
          <Label htmlFor="department_id" className={eyebrow} style={muted}>Department</Label>
          <Select
            id="department_id"
            {...register("department_id")}
            style={field}
            options={[...placeholder("a department"), ...departments.map((d) => ({ value: d.id, label: d.name }))]}
            aria-invalid={invalid("department_id")}
            aria-describedby={describedBy("department_id")}
          />
          <FieldError id="department_id-error" text={errors.department_id?.message} />
        </div>
        {!employee && (
          <div>
            <Label htmlFor="role" className={eyebrow} style={muted}>Role</Label>
            <Select id="role" {...register("role")} style={field} options={ROLES} aria-invalid={invalid("role")} />
            <FieldError id="role-error" text={errors.role?.message} />
          </div>
        )}
        {formError && (
          <p role="alert" className="text-sm" style={{ color: "#e8a29a" }}>
            {formError}
          </p>
        )}
        <Button type="submit" disabled={isSubmitting} className="w-full" style={{ backgroundColor: brand.accentColor, color: "#16211c" }}>
          {employee ? "Save changes" : "Create employee"}
        </Button>
      </form>
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
        description="Your role is not permitted to view employee records, so no data is shown."
      />
    );
  if (failure) return <p role="alert" style={muted}>The directory could not be loaded. Try again shortly.</p>;
  if (employees.isLoading || !employees.data) return <p style={muted}>Loading the directory…</p>;

  const rows = employees.data;
  const needle = query.trim().toLowerCase();
  const shown = rows.filter(
    (e) =>
      !needle ||
      [e.full_name, e.work_email ?? "", e.job_title ?? "", e.department ?? ""].some((v) =>
        v.toLowerCase().includes(needle),
      ),
  );
  const editing = panel?.id ? rows.find((e) => e.id === panel.id) ?? null : null;

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
                  ? "Employees you add will be listed here with their job title and department. Choose Add employee to create the first one."
                  : "Employees will be listed here with their job title and department once HR adds them."
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
                    {["Employee", "Job title", "Department", "Manager", "Status", ""].map((h, i) => (
                      <TH key={i} style={muted}>{h}</TH>
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
                            {e.work_email && <div className="text-xs" style={muted}>{e.work_email}</div>}
                          </div>
                        </div>
                      </TD>
                      <TD>{e.job_title ?? "—"}</TD>
                      <TD>{e.department ?? "—"}</TD>
                      <TD>{e.manager ?? (e.missing_manager ? "No manager assigned" : "—")}</TD>
                      <TD>{e.status}</TD>
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
