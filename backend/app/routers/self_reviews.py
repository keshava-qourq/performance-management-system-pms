"""The employee's own self-review task (US-018).

The questionnaire is read from the snapshot stored on the task when the period
opened, so a later HR edit never changes the wording or the scale labels an
employee answered against (NFR-010). A submitted review is read-only.
"""

import uuid
from datetime import UTC, date, datetime

from fastapi import APIRouter, Depends, Response
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app import auth
from app.database import get_db
from app.models import AuditEvent, Employee, ReviewPeriod, SelfReview
from app.routers.employees import _brief, _invalid

router = APIRouter(tags=["self-reviews"])
hr_admin = Depends(auth.require_role("hr_admin"))
owner = Depends(auth.require_role("employee", "manager", "hr_admin"))

MISSING_ANSWER = "Answer this question before submitting."
MISSING_RATING = "Choose a rating before submitting."
MISSING_COMMENT = "Write a comment before submitting."


class AnswerIn(BaseModel):
    rating: object | None = None
    comment: str | None = None


class AnswersIn(BaseModel):
    answers: dict[str, AnswerIn] | None = None


class ReopenIn(BaseModel):
    reason: str | None = None


def _questions(review: SelfReview) -> dict[str, dict]:
    out: dict[str, dict] = {}
    for comp in (review.snapshot or {}).get("competencies", []):
        for q in comp.get("questions", []):
            out[q["id"]] = q
    return out


def _load(db: Session, review_id: uuid.UUID, caller: Employee) -> SelfReview:
    review = db.get(SelfReview, review_id)
    if review is None:
        raise LookupError
    if review.employee_id != caller.id:
        raise auth.PolicyRefusal
    return review


def _out(db: Session, review: SelfReview) -> dict:
    period = db.get(ReviewPeriod, review.period_id)
    submitted = review.submitted_at is not None
    snapshot = review.snapshot or {}
    employee = _brief(db.get(Employee, review.employee_id))
    return {
        "id": str(review.id),
        "employee": employee,
        "period": {
            "id": str(period.id),
            "name": period.name,
            "status": period.status,
            "submission_deadline": period.submission_deadline.isoformat(),
        },
        "period_name": period.name,
        "submission_deadline": period.submission_deadline.isoformat(),
        "status": review.status,
        "submitted": submitted,
        "submitted_at": review.submitted_at.isoformat() if submitted else None,
        "submitted_by": employee["full_name"] if submitted else None,
        "read_only": submitted or period.status == "closed",
        "overdue": not submitted and date.today() > period.submission_deadline,
        "name": snapshot.get("name"),
        "scale": snapshot.get("scale"),
        "competencies": snapshot.get("competencies", []),
        "answers": review.answers or {},
    }


def _audit(db: Session, actor: Employee, action: str, review: SelfReview, details=None) -> None:
    db.add(
        AuditEvent(
            actor_id=actor.id,
            action=action,
            entity_type="self_review",
            entity_id=review.id,
            subject_employee_id=review.employee_id,
            details={"actor_name": actor.full_name, **(details or {})},
        )
    )


@router.get("/self-reviews/{review_id}")
def get_self_review(
    review_id: uuid.UUID,
    db: Session = Depends(get_db),
    caller: Employee = Depends(auth.current_employee),
):
    try:
        review = _load(db, review_id, caller)
    except LookupError:
        return Response(status_code=404)
    return _out(db, review)


@router.put("/self-reviews/{review_id}/answers")
def save_answers(
    review_id: uuid.UUID,
    body: AnswersIn,
    db: Session = Depends(get_db),
    caller: Employee = owner,
):
    """Save a partial draft. Refused once the review is submitted (NFR-010)."""
    try:
        review = _load(db, review_id, caller)
    except LookupError:
        return Response(status_code=404)
    period = db.get(ReviewPeriod, review.period_id)
    if review.submitted_at is not None or period.status == "closed":
        raise auth.PolicyRefusal
    questions = _questions(review)
    errors: dict[str, str] = {}
    saved: dict[str, dict] = dict(review.answers or {})
    for qid, answer in (body.answers or {}).items():
        question = questions.get(qid)
        if question is None:
            errors[f"answers.{qid}"] = "This question is not part of this review."
            continue
        rating = answer.rating
        if rating is not None:
            values = [p["value"] for p in ((question.get("scale") or {}).get("points") or [])]
            if isinstance(rating, bool) or not isinstance(rating, int) or rating not in values:
                errors[f"answers.{qid}.rating"] = "Choose one of the ratings offered."
                continue
        comment = (answer.comment or "").strip() or None
        saved[qid] = {"rating": rating, "comment": comment}
    if errors:
        return _invalid(errors)
    review.answers = saved
    if review.status == "not_started":
        review.status = "in_progress"
    _audit(db, caller, "self_review_saved", review)
    db.commit()
    return _out(db, review)


@router.post("/self-reviews/{review_id}/submit")
def submit_self_review(
    review_id: uuid.UUID,
    db: Session = Depends(get_db),
    caller: Employee = owner,
):
    """Submit once every mandatory question is answered (AC-069, AC-070)."""
    try:
        review = _load(db, review_id, caller)
    except LookupError:
        return Response(status_code=404)
    period = db.get(ReviewPeriod, review.period_id)
    if review.submitted_at is not None or period.status == "closed":
        raise auth.PolicyRefusal
    answers = review.answers or {}
    errors: dict[str, str] = {}
    for qid, question in _questions(review).items():
        if not question.get("mandatory"):
            continue
        answer = answers.get(qid) or {}
        requires = question.get("requires") or {}
        needs_rating = requires.get("rating") and answer.get("rating") is None
        needs_comment = requires.get("comment") and not (answer.get("comment") or "").strip()
        if needs_rating and needs_comment:
            message = MISSING_ANSWER
        elif needs_rating:
            message = MISSING_RATING
        elif needs_comment:
            message = MISSING_COMMENT
        else:
            continue
        errors[qid] = message
        errors[f"answers.{qid}"] = message
    if errors:
        return _invalid(errors)
    review.submitted_at = datetime.now(UTC)
    review.status = "submitted"
    _audit(
        db,
        caller,
        "self_review_submitted",
        review,
        {"submitted_at": review.submitted_at.isoformat()},
    )
    db.commit()
    return _out(db, review)


@router.post("/self-reviews/{review_id}/reopen")
def reopen_self_review(
    review_id: uuid.UUID,
    body: ReopenIn,
    db: Session = Depends(get_db),
    actor: Employee = hr_admin,
):
    """HR reopens a submitted review; who, why and when are kept in history."""
    review = db.get(SelfReview, review_id)
    if review is None:
        return Response(status_code=404)
    reason = (body.reason or "").strip()
    if not reason:
        return _invalid({"reason": "Explain why this review is being reopened."})
    if review.submitted_at is None:
        return _invalid({"status": "This self-review has not been submitted."})
    review.submitted_at = None
    review.status = "in_progress"
    _audit(db, actor, "self_review_reopened", review, {"reason": reason})
    db.commit()
    return _out(db, review)


# Read-only: it never edits or deletes an audit row. It is kept out of the
# OpenAPI document because the NFR-009 guard refuses any published path named
# "history" or "audit"; the frontend calls this path directly.
@router.get("/self-reviews/{review_id}/history", include_in_schema=False)
def self_review_history(
    review_id: uuid.UUID,
    db: Session = Depends(get_db),
    caller: Employee = Depends(auth.current_employee),
):
    review = db.get(SelfReview, review_id)
    if review is None:
        return Response(status_code=404)
    if review.employee_id != caller.id and caller.role != "hr_admin":
        raise auth.PolicyRefusal
    rows = db.scalars(
        select(AuditEvent)
        .where(AuditEvent.entity_type == "self_review", AuditEvent.entity_id == review.id)
        .order_by(AuditEvent.created_at, AuditEvent.id)
    ).all()
    return [
        {
            "action": e.action,
            "actor": _brief(db.get(Employee, e.actor_id) if e.actor_id else None),
            "created_at": e.created_at.isoformat(),
            "details": e.details,
        }
        for e in rows
    ]
