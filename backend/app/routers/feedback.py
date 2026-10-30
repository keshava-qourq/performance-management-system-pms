"""Praise: send it, read what you received or gave, and the personal dashboard (US-021)."""

import uuid

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app import auth
from app.database import get_db
from app.models import Employee, Feedback, Goal
from app.routers.employees import _brief, _invalid
from app.routers.goals import _out as _goal_out

router = APIRouter(tags=["feedback"])
mutator = Depends(auth.require_role("employee", "manager", "hr_admin", "executive"))


class FeedbackIn(BaseModel):
    recipient_id: uuid.UUID | None = None
    type: str | None = None
    body: str | None = None


def _out(db: Session, f: Feedback) -> dict:
    return {
        "id": str(f.id),
        "type": f.type,
        "body": f.body,
        "author": _brief(db.get(Employee, f.author_id)),
        "recipient": _brief(db.get(Employee, f.recipient_id)),
        "created_at": f.created_at.isoformat(),
        "read_at": f.read_at.isoformat() if f.read_at else None,
    }


def _list(db: Session, caller: Employee, direction: str) -> list[Feedback]:
    col = Feedback.author_id if direction == "given" else Feedback.recipient_id
    return list(
        db.scalars(
            select(Feedback)
            .where(col == caller.id, Feedback.withdrawn_at.is_(None))
            .order_by(Feedback.created_at.desc(), Feedback.id)
        ).all()
    )


@router.post("/feedback", status_code=201)
def send_feedback(body: FeedbackIn, db: Session = Depends(get_db), actor: Employee = mutator):
    errors: dict[str, str] = {}
    if not (body.body or "").strip():
        errors["body"] = "Write a message before sending."
    if body.type is not None and body.type != "praise":
        errors["type"] = "Choose a valid feedback type."
    if body.recipient_id is None:
        errors["recipient_id"] = "Choose who this praise is for."
    elif body.recipient_id == actor.id:
        errors["recipient_id"] = "Praise must be addressed to someone else."
    else:
        r = db.get(Employee, body.recipient_id)
        if r is None or r.deactivated or r.status != "active":
            errors["recipient_id"] = "Choose an active colleague."
    if errors:
        return _invalid(errors)
    f = Feedback(
        author_id=actor.id,
        recipient_id=body.recipient_id,
        type="praise",
        body=body.body.strip(),
    )
    db.add(f)
    db.commit()
    return _out(db, f)


OFF_STATEMENT = "Feedback is readable only by its author, its recipient and HR Admins."


@router.get("/feedback/audience")
def audience(
    recipient_id: uuid.UUID | None = None,
    db: Session = Depends(get_db),
    _caller: Employee = Depends(auth.current_employee),
):
    visible = auth.get_setting(db, "manager_feedback_visible") is True
    if not visible:
        statement = OFF_STATEMENT
    else:
        statement = "Feedback is readable by its author, its recipient, HR Admins and the "
        recipient = db.get(Employee, recipient_id) if recipient_id else None
        manager = (
            db.get(Employee, recipient.manager_id) if recipient and recipient.manager_id else None
        )
        statement += (
            f"recipient's manager ({manager.full_name})." if manager else "recipient's manager."
        )
    return {"manager_feedback_visible": visible, "readers_statement": statement}


@router.get("/feedback")
def list_feedback(
    direction: str = "received",
    db: Session = Depends(get_db),
    caller: Employee = Depends(auth.current_employee),
):
    if direction not in {"received", "given"}:
        return _invalid({"direction": "Choose received or given."})
    return [_out(db, f) for f in _list(db, caller, direction)]


@router.get("/me/dashboard")
def dashboard(db: Session = Depends(get_db), caller: Employee = Depends(auth.current_employee)):
    goals = db.scalars(
        select(Goal)
        .where(Goal.owner_id == caller.id, Goal.deleted_at.is_(None))
        .order_by(Goal.due_date, Goal.title)
    ).all()
    unread = db.scalar(
        select(func.count())
        .select_from(Feedback)
        .where(
            Feedback.recipient_id == caller.id,
            Feedback.withdrawn_at.is_(None),
            Feedback.read_at.is_(None),
        )
    )
    return {
        "goals": [_goal_out(db, g) for g in goals],
        "feedback": [_out(db, f) for f in _list(db, caller, "received")],
        "unread_feedback": unread,
        "reviews": [],
        "attention": [],
    }
