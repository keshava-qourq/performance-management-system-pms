"""Review periods and the self-review tasks opening one creates (US-017).

HR builds a draft period, then opens it: the open route returns at once and an
rq job creates one self-review task per participant (NFR-014, NFR-015). Each
task keeps the questionnaire as it was when it was created (NFR-010).
"""

import uuid
from datetime import UTC, date, datetime

from fastapi import APIRouter, Depends, Response
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app import auth, jobs
from app.database import get_db
from app.models import (
    AuditEvent,
    Employee,
    QuestionnaireVersion,
    ReviewPeriod,
    ReviewPeriodParticipant,
    SelfReview,
)
from app.routers.employees import _brief, _invalid

router = APIRouter(tags=["review-periods"])
hr_admin = Depends(auth.require_role("hr_admin"))


class PeriodIn(BaseModel):
    name: str | None = None
    questionnaire_version_id: uuid.UUID | None = None
    start_date: str | None = None
    end_date: str | None = None
    submission_deadline: str | None = None
    participant_ids: list[uuid.UUID] | None = None


def _parse(raw) -> date | None:
    try:
        return date.fromisoformat(str(raw))
    except ValueError:
        return None


def _participants(db: Session, period_id: uuid.UUID) -> list[ReviewPeriodParticipant]:
    return list(
        db.scalars(
            select(ReviewPeriodParticipant).where(ReviewPeriodParticipant.period_id == period_id)
        ).all()
    )


def _out(db: Session, period: ReviewPeriod) -> dict:
    rows = _participants(db, period.id)
    people = {
        e.id: e
        for e in db.scalars(
            select(Employee).where(Employee.id.in_([r.employee_id for r in rows] or [None]))
        ).all()
    }
    return {
        "id": str(period.id),
        "name": period.name,
        "questionnaire_version_id": str(period.questionnaire_version_id),
        "start_date": period.start_date.isoformat(),
        "end_date": period.end_date.isoformat(),
        "submission_deadline": period.submission_deadline.isoformat(),
        "status": period.status,
        "opened_at": period.opened_at.isoformat() if period.opened_at else None,
        "closed_at": period.closed_at.isoformat() if period.closed_at else None,
        "participants": [_brief(people[r.employee_id]) for r in rows if r.employee_id in people],
        "participant_ids": [str(r.employee_id) for r in rows],
    }


def _validate(db: Session, body: PeriodIn, creating: bool, period: ReviewPeriod | None = None):
    """Field-level English messages, plus the parsed values when there are none."""
    sent = body.model_fields_set
    errors: dict[str, str] = {}
    values: dict[str, object] = {}
    if creating or "name" in sent:
        if not (body.name or "").strip():
            errors["name"] = "Enter a name for this review period."
        else:
            values["name"] = body.name.strip()
    if creating or "questionnaire_version_id" in sent:
        version = (
            db.get(QuestionnaireVersion, body.questionnaire_version_id)
            if body.questionnaire_version_id
            else None
        )
        if version is None:
            errors["questionnaire_version_id"] = "Choose a published questionnaire."
        elif version.status != "published":
            errors["questionnaire_version_id"] = (
                "That questionnaire is not published yet; publish it first."
            )
        else:
            values["questionnaire_version_id"] = version.id
    for field, label in (
        ("start_date", "start date"),
        ("end_date", "end date"),
        ("submission_deadline", "submission deadline"),
    ):
        if not creating and field not in sent:
            continue
        raw = getattr(body, field)
        parsed = _parse(raw) if (raw or "") else None
        if parsed is None:
            errors[field] = f"Enter a {label} as YYYY-MM-DD."
        else:
            values[field] = parsed
    start = values.get("start_date", period.start_date if period else None)
    end = values.get("end_date", period.end_date if period else None)
    if "start_date" not in errors and "end_date" not in errors and start and end and end < start:
        errors["end_date"] = "The end date must be on or after the start date."
    if creating or "participant_ids" in sent:
        ids = body.participant_ids or []
        if not ids:
            errors["participant_ids"] = "Choose at least one participant."
        else:
            found = {
                e.id
                for e in db.scalars(
                    select(Employee).where(
                        Employee.id.in_(ids),
                        Employee.deactivated.is_(False),
                        Employee.status == "active",
                    )
                ).all()
            }
            if len(found) != len(set(ids)):
                errors["participant_ids"] = "Choose active employees as participants."
            else:
                values["participant_ids"] = list(dict.fromkeys(ids))
    return errors, values


def _set_participants(db: Session, period: ReviewPeriod, ids: list[uuid.UUID]) -> None:
    rows = {r.employee_id: r for r in _participants(db, period.id)}
    for employee_id in ids:
        if employee_id not in rows:
            db.add(ReviewPeriodParticipant(period_id=period.id, employee_id=employee_id))
    for employee_id, row in rows.items():
        if employee_id not in ids:
            db.delete(row)


def _audit(db: Session, actor: Employee, action: str, period: ReviewPeriod, details=None) -> None:
    db.add(
        AuditEvent(
            actor_id=actor.id,
            action=action,
            entity_type="review_period",
            entity_id=period.id,
            details=details,
        )
    )


@router.post("/review-periods", status_code=201)
def create_period(body: PeriodIn, db: Session = Depends(get_db), actor: Employee = hr_admin):
    errors, values = _validate(db, body, creating=True)
    if errors:
        return _invalid(errors)
    period = ReviewPeriod(
        name=values["name"],
        questionnaire_version_id=values["questionnaire_version_id"],
        start_date=values["start_date"],
        end_date=values["end_date"],
        submission_deadline=values["submission_deadline"],
        status="draft",
    )
    db.add(period)
    db.flush()
    _set_participants(db, period, values["participant_ids"])
    _audit(db, actor, "review_period_created", period)
    db.commit()
    return _out(db, period)


@router.get("/review-periods")
def list_periods(db: Session = Depends(get_db), _hr=hr_admin):
    rows = db.scalars(select(ReviewPeriod).order_by(ReviewPeriod.created_at)).all()
    return [_out(db, p) for p in rows]


@router.get("/review-periods/{period_id}")
def get_period(period_id: uuid.UUID, db: Session = Depends(get_db), _hr=hr_admin):
    period = db.get(ReviewPeriod, period_id)
    if period is None:
        return Response(status_code=404)
    return _out(db, period)


@router.patch("/review-periods/{period_id}")
def update_period(
    period_id: uuid.UUID,
    body: PeriodIn,
    db: Session = Depends(get_db),
    actor: Employee = hr_admin,
):
    period = db.get(ReviewPeriod, period_id)
    if period is None:
        return Response(status_code=404)
    if period.status != "draft":
        return _invalid({"status": "Only a draft review period can be edited."})
    errors, values = _validate(db, body, creating=False, period=period)
    if errors:
        return _invalid(errors)
    for field in (
        "name",
        "questionnaire_version_id",
        "start_date",
        "end_date",
        "submission_deadline",
    ):
        if field in values:
            setattr(period, field, values[field])
    if "participant_ids" in values:
        _set_participants(db, period, values["participant_ids"])
    _audit(db, actor, "review_period_edited", period)
    db.commit()
    return _out(db, period)


@router.post("/review-periods/{period_id}/open")
def open_period(period_id: uuid.UUID, db: Session = Depends(get_db), actor: Employee = hr_admin):
    """Mark the period open and hand the task creation to the queue (NFR-014)."""
    period = db.get(ReviewPeriod, period_id)
    if period is None:
        return Response(status_code=404)
    if period.status == "closed":
        return _invalid({"status": "This review period is closed."})
    if period.status != "open":
        period.status = "open"
        period.opened_at = datetime.now(UTC)
        _audit(db, actor, "review_period_opened", period)
        db.commit()
    jobs.enqueue(jobs.open_review_period, str(period.id))
    return _out(db, period)


@router.post("/review-periods/{period_id}/close")
def close_period(period_id: uuid.UUID, db: Session = Depends(get_db), actor: Employee = hr_admin):
    period = db.get(ReviewPeriod, period_id)
    if period is None:
        return Response(status_code=404)
    if period.status != "closed":
        period.status = "closed"
        period.closed_at = datetime.now(UTC)
        _audit(db, actor, "review_period_closed", period)
        db.commit()
    return _out(db, period)


@router.delete("/review-periods/{period_id}/participants/{employee_id}")
def remove_participant(
    period_id: uuid.UUID,
    employee_id: uuid.UUID,
    db: Session = Depends(get_db),
    actor: Employee = hr_admin,
):
    """Remove a participant. Refused once they have submitted (NFR-010)."""
    period = db.get(ReviewPeriod, period_id)
    if period is None:
        return Response(status_code=404)
    row = db.scalar(
        select(ReviewPeriodParticipant).where(
            ReviewPeriodParticipant.period_id == period_id,
            ReviewPeriodParticipant.employee_id == employee_id,
        )
    )
    if row is None:
        return Response(status_code=404)
    review = db.scalar(
        select(SelfReview).where(
            SelfReview.period_id == period_id, SelfReview.employee_id == employee_id
        )
    )
    if review is not None and review.submitted_at is not None:
        return _invalid(
            {
                "employee_id": (
                    "This participant has already submitted their self-review, "
                    "so they cannot be removed from this review period."
                )
            }
        )
    if review is not None:
        db.delete(review)
    db.delete(row)
    _audit(
        db, actor, "review_period_participant_removed", period, {"employee_id": str(employee_id)}
    )
    db.commit()
    return _out(db, period)


@router.get("/review-periods/{period_id}/status")
def period_status(period_id: uuid.UUID, db: Session = Depends(get_db), _hr=hr_admin):
    """Per participant: submitted or outstanding, when, and whether overdue."""
    period = db.get(ReviewPeriod, period_id)
    if period is None:
        return Response(status_code=404)
    rows = _participants(db, period.id)
    people = {
        e.id: e
        for e in db.scalars(
            select(Employee).where(Employee.id.in_([r.employee_id for r in rows] or [None]))
        ).all()
    }
    reviews = {
        r.employee_id: r
        for r in db.scalars(select(SelfReview).where(SelfReview.period_id == period.id)).all()
    }
    past_deadline = date.today() > period.submission_deadline
    out = []
    for r in sorted(
        rows, key=lambda r: people[r.employee_id].full_name if r.employee_id in people else ""
    ):
        review = reviews.get(r.employee_id)
        submitted = review is not None and review.submitted_at is not None
        out.append(
            {
                "employee": _brief(people.get(r.employee_id)),
                "submitted": submitted,
                "status": "submitted" if submitted else "outstanding",
                "submitted_at": review.submitted_at.isoformat() if submitted else None,
                "overdue": past_deadline and not submitted,
            }
        )
    return {
        "period": _out(db, period),
        "submission_deadline": period.submission_deadline.isoformat(),
        "submitted_count": sum(1 for p in out if p["submitted"]),
        "outstanding_count": sum(1 for p in out if not p["submitted"]),
        "participants": out,
    }
