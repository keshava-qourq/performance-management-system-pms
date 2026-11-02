/**
 * The employee's own self-review task (US-018): the questionnaire, the ratings
 * and comments, draft saving and submission all come from the API. Nothing on
 * this path is seeded.
 */
import * as React from "react";
import { useForm } from "react-hook-form";

import * as UI from "@/lib/ui";
import { Icons } from "@/lib/icons";
import { formatDate, formatDateTime } from "@/lib/dateFormat";
import { useSession } from "@/lib/session";
import {
  Unanswered,
  allQuestions,
  isAnswered,
  needsComment,
  needsRating,
  scalePoints,
  useMyReviewTasks,
  useSaveAnswers,
  useSelfReview,
  useSubmitSelfReview,
  type SelfReview as SelfReviewData,
  type SelfReviewAnswer,
  type SelfReviewQuestion,
} from "@/lib/reviews";

const C = {
  bg: "#16211c",
  surface: "#1c2b25",
  line: "rgba(255,255,255,0.1)",
  ink: "#e9ede9",
  muted: "#8ba095",
  accent: "#8fae8b",
  warn: "#d9b27c",
  bad: "#e69a8e",
};
const HEAD = {
  fontFamily: '"Baskerville", "Libre Baskerville", "Times New Roman", Georgia, serif',
  color: C.ink,
};

type Draft = Record<string, { rating: string; comment: string }>;
type FormValues = { a: Draft };

const draftOf = (review: SelfReviewData | undefined): Draft => {
  const draft: Draft = {};
  for (const question of allQuestions(review?.questionnaire)) {
    const saved = (review?.answers ?? []).find((a) => a.question_id === question.id);
    draft[question.id] = {
      rating: saved?.rating == null ? "" : String(saved.rating),
      comment: saved?.comment ?? "",
    };
  }
  return draft;
};

const answerOf = (draft: Draft, id: string): SelfReviewAnswer => ({
  question_id: id,
  rating: draft[id]?.rating ? Number(draft[id].rating) : null,
  comment: draft[id]?.comment ?? "",
});

const toAnswers = (draft: Draft): SelfReviewAnswer[] =>
  Object.keys(draft).map((id) => answerOf(draft, id));

function Notice({ tone, children }: { tone: string; children: React.ReactNode }) {
  const col = tone === "bad" ? C.bad : tone === "ok" ? C.accent : C.warn;
  const Ic = tone === "ok" ? Icons.CheckCircle : Icons.AlertCircle;
  return (
    <div
      role={tone === "bad" ? "alert" : "status"}
      className="flex items-start gap-2 rounded-md border px-4 py-3 text-sm mb-4"
      style={{ borderColor: col, color: C.ink, backgroundColor: C.bg }}
    >
      <span style={{ color: col }}>
        <Ic size={16} />
      </span>
      <span>{children}</span>
    </div>
  );
}

function Panel({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <section
      className="rounded-md border p-5 mb-6"
      style={{ borderColor: C.line, backgroundColor: C.surface }}
      aria-label={title}
    >
      {title ? (
        <h2 className="text-lg mb-4" style={HEAD}>
          {title}
        </h2>
      ) : null}
      {children}
    </section>
  );
}

function Question({
  question,
  value,
  editable,
  error,
  onChange,
}: {
  question: SelfReviewQuestion;
  value: { rating: string; comment: string };
  editable: boolean;
  error?: string;
  onChange: (patch: Partial<{ rating: string; comment: string }>) => void;
}) {
  const points = scalePoints(question.scale);
  const chosen = points.find((p) => String(p.value) === value.rating);
  return (
    <div
      className="mb-6 rounded-md border p-4"
      style={{ borderColor: error ? C.bad : C.line, backgroundColor: C.bg }}
    >
      <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
        <p className="text-sm max-w-xl" style={{ color: C.ink, lineHeight: 1.5 }}>
          {question.text}
        </p>
        <span className="text-xs" style={{ color: question.mandatory ? C.warn : C.muted }}>
          {question.mandatory ? "Required" : "Optional"}
        </span>
      </div>
      {needsRating(question) &&
        (editable ? (
          <div
            role="radiogroup"
            aria-label={`Rating for: ${question.text}`}
            className="flex flex-wrap gap-2 mb-3"
          >
            {points.map((point) => {
              const on = String(point.value) === value.rating;
              return (
                <button
                  key={point.value}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  aria-label={`${point.value} · ${point.label}`}
                  onClick={() => onChange({ rating: String(point.value) })}
                  className="rounded-md border px-3 py-2 text-sm min-h-11"
                  style={{
                    borderColor: on ? C.accent : C.line,
                    backgroundColor: on ? C.accent : "transparent",
                    color: on ? C.bg : C.ink,
                  }}
                >
                  {point.value} · {point.label}
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-sm mb-3" style={{ color: C.ink }}>
            <span className="mr-2" style={{ color: C.muted }}>
              Rating
            </span>
            {chosen ? `${chosen.value} · ${chosen.label}` : "No rating given"}
          </p>
        ))}
      {needsComment(question) &&
        (editable ? (
          <UI.Textarea
            rows={3}
            aria-label={`Comment for: ${question.text}`}
            aria-invalid={error ? true : undefined}
            placeholder="Write your reflection here"
            value={value.comment}
            onChange={(e) => onChange({ comment: e.target.value })}
            style={{ backgroundColor: C.bg, borderColor: C.line, color: C.ink }}
          />
        ) : (
          <p className="text-sm" style={{ color: value.comment ? C.ink : C.muted }}>
            {value.comment || "No comment given"}
          </p>
        ))}
      {error ? (
        <p className="mt-2 text-xs flex items-center gap-1" style={{ color: C.bad }} role="alert">
          <Icons.AlertCircle size={14} /> {error}
        </p>
      ) : null}
    </div>
  );
}

export default function SelfReviewSection() {
  const { user } = useSession();
  const tasks = useMyReviewTasks();
  const taskList = tasks.data ?? [];
  // The open task if there is one, otherwise the review already submitted.
  const task = taskList.find((t) => t.status !== "submitted") ?? taskList[0] ?? null;
  const review = useSelfReview(task ? task.id : null);
  const data = review.data;

  const save = useSaveAnswers();
  const submit = useSubmitSelfReview();
  const form = useForm<FormValues>({ defaultValues: { a: {} } });

  const [questionErrors, setQuestionErrors] = React.useState<Record<string, string>>({});
  const [notice, setNotice] = React.useState<{ tone: string; text: string } | null>(null);
  const [confirming, setConfirming] = React.useState(false);

  // Every rating and comment the API has is what the form starts from, so a
  // reload restores exactly what was saved (AC-068).
  const loadedKey = data ? `${data.id}:${data.status}:${data.answers?.length ?? 0}` : "";
  React.useEffect(() => {
    if (data) form.reset({ a: draftOf(data) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadedKey]);

  const draft = form.watch("a") ?? {};
  const setAnswer = (id: string, patch: Partial<{ rating: string; comment: string }>) => {
    const current = draft[id] ?? { rating: "", comment: "" };
    form.setValue(`a.${id}`, { ...current, ...patch }, { shouldDirty: true });
    setQuestionErrors((errors) => {
      if (!errors[id]) return errors;
      const next = { ...errors };
      delete next[id];
      return next;
    });
  };

  if (tasks.isLoading || review.isLoading)
    return (
      <p role="status" style={{ color: C.muted }}>
        Loading your self-review…
      </p>
    );

  if (!task)
    return (
      <Panel>
        <UI.Empty
          title="No self-review is open for you"
          description="When HR opens a review period that includes you, your self-review task will appear here and on your dashboard."
        />
      </Panel>
    );

  if (review.isError || !data)
    return (
      <p role="alert" style={{ color: C.bad }}>
        Your self-review could not be loaded. Try again.
      </p>
    );

  const questions = allQuestions(data.questionnaire);
  const mandatory = questions.filter((q) => q.mandatory);
  const answeredCount = mandatory.filter((q) => isAnswered(q, answerOf(draft, q.id))).length;
  const submitted = (data.status ?? "").toLowerCase() === "submitted";
  const overdue = Boolean(data.overdue ?? task.overdue);
  const periodClosed = (data.period_status ?? "").toLowerCase() === "closed";
  const deadline = data.submission_deadline ?? task.submission_deadline;
  const name = data.submitted_by?.full_name ?? user?.full_name ?? "you";

  const saveDraft = async () => {
    setNotice(null);
    try {
      await save.mutateAsync({ id: data.id, answers: toAnswers(draft) });
      setNotice({
        tone: "ok",
        text: "Draft saved. Your ratings and comments will be here when you return.",
      });
    } catch (error) {
      setNotice({
        tone: "bad",
        text:
          (error instanceof Error && error.message) || "Your draft could not be saved. Try again.",
      });
    }
  };

  const describeMissing = (count: number) =>
    `Submission blocked: ${count} required question${count === 1 ? " is" : "s are"} still unanswered. ` +
    "Each one is highlighted below — add the rating or comment it asks for and submit again.";

  const trySubmit = () => {
    const missing = mandatory.filter((q) => !isAnswered(q, answerOf(draft, q.id)));
    if (missing.length) {
      const errors: Record<string, string> = {};
      for (const q of missing)
        errors[q.id] = needsRating(q)
          ? needsComment(q)
            ? "Choose a rating and write a comment before submitting."
            : "Choose a rating before submitting."
          : "Write a comment before submitting.";
      setQuestionErrors(errors);
      setConfirming(false);
      setNotice({ tone: "bad", text: describeMissing(missing.length) });
      return;
    }
    setQuestionErrors({});
    setNotice(null);
    setConfirming(true);
  };

  const confirmSubmit = async () => {
    setConfirming(false);
    try {
      await save.mutateAsync({ id: data.id, answers: toAnswers(draft) });
      await submit.mutateAsync(data.id);
      setQuestionErrors({});
      setNotice(null);
    } catch (error) {
      if (error instanceof Unanswered) {
        const errors: Record<string, string> = {};
        for (const id of error.questionIds)
          errors[id] = error.messages[id] ?? "This question needs an answer before you can submit.";
        setQuestionErrors(errors);
        setNotice({
          tone: "bad",
          text: error.message || describeMissing(error.questionIds.length),
        });
        return;
      }
      setNotice({
        tone: "bad",
        text:
          (error instanceof Error && error.message) ||
          "Your self-review could not be submitted. Try again.",
      });
    }
  };

  const body = (editable: boolean) => (
    <div>
      {(data.questionnaire?.competencies ?? []).map((competency) => (
        <div key={competency.id} className="mb-8">
          <h3 className="text-lg border-b pb-2 mb-4" style={{ ...HEAD, borderColor: C.accent }}>
            {competency.name}
          </h3>
          {(competency.questions ?? []).map((question) => (
            <Question
              key={question.id}
              question={question}
              editable={editable}
              error={questionErrors[question.id]}
              value={draft[question.id] ?? { rating: "", comment: "" }}
              onChange={(patch) => setAnswer(question.id, patch)}
            />
          ))}
        </div>
      ))}
      {questions.length === 0 ? (
        <UI.Empty
          title="This questionnaire has no questions yet"
          description="The competencies and questions HR publishes for this review period will appear here."
        />
      ) : null}
    </div>
  );

  return (
    <div>
      <Panel title={task.period_name}>
        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm" style={{ color: C.ink }}>
          <div>
            <dt style={{ color: C.muted }}>Questionnaire</dt>
            <dd>{data.questionnaire?.name}</dd>
          </div>
          <div>
            <dt style={{ color: C.muted }}>Submission deadline</dt>
            <dd>
              {formatDate(deadline)}
              {overdue && !submitted ? <span style={{ color: C.bad }}> · Overdue</span> : null}
            </dd>
          </div>
          <div>
            <dt style={{ color: C.muted }}>Required answered</dt>
            <dd>
              {submitted ? mandatory.length : answeredCount} / {mandatory.length}
            </dd>
          </div>
        </dl>
      </Panel>

      {submitted ? (
        <div>
          <Notice tone="ok">
            Submitted by {name}
            {data.submitted_at ? ` on ${formatDateTime(new Date(data.submitted_at))}` : ""}. This
            review is locked and read-only. If something needs correcting, ask HR to reopen it.
          </Notice>
          <Panel title="Your submitted answers">{body(false)}</Panel>
        </div>
      ) : (
        <div>
          {overdue && !periodClosed ? (
            <Notice tone="bad">
              This task is overdue. You can still submit it unless HR has closed the period.
            </Notice>
          ) : null}
          {periodClosed ? (
            <Notice tone="warn">
              This review period is closed, so this self-review can no longer be submitted.
            </Notice>
          ) : null}
          {notice ? <Notice tone={notice.tone}>{notice.text}</Notice> : null}
          <Panel title="Your answers">{body(true)}</Panel>
          {confirming ? (
            <div
              className="rounded-md border p-5 mb-6"
              style={{ borderColor: C.accent, backgroundColor: C.surface }}
            >
              <h3 className="text-lg mb-2" style={HEAD}>
                Submit your self-review?
              </h3>
              <p className="text-sm mb-4" style={{ color: C.muted }}>
                Once submitted it is recorded with your name and a timestamp, and it can no longer
                be edited.
              </p>
              <div className="flex gap-3 flex-wrap">
                <UI.Button type="button" onClick={confirmSubmit}>
                  Confirm and submit
                </UI.Button>
                <UI.Button type="button" variant="secondary" onClick={() => setConfirming(false)}>
                  Keep editing
                </UI.Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-3 flex-wrap mb-6">
              {periodClosed ? null : (
                <UI.Button type="button" onClick={trySubmit}>
                  Submit self-review
                </UI.Button>
              )}
              <UI.Button type="button" variant="secondary" onClick={saveDraft}>
                Save as draft
              </UI.Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
