"""Goals: create, read, edit, manual progress and status (US-011).

Progress is always typed in by a person and never calculated. Every create,
edit and progress update appends an audit_event row; nothing here updates or
deletes one (NFR-009).
"""

import uuid
from datetime import UTC, date, datetime

from fastapi import APIRouter, Depends, Response
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app import auth
from app.database import get_db
from app.models import AuditEvent, Employee, Goal
from app.routers.employees import _brief, _invalid, _manager_chain

router = APIRouter(tags=["goals"])

# Executives are refused on every mutating route by require_role itself (AC-013).
mutator = Depends(auth.require_role("employee", "manager", "hr_admin", "executive"))

STATUSES = ["Not started", "On track", "At risk", "Off track", "Achieved", "Cancelled"]
CLOSED = {"Achieved", "Cancelled"}


class GoalIn(BaseModel):
    title: str | None = None
    description: str | None = None
    target: str | None = None
    due_date: str | None = None
    period: str | None = None
    weighting: object | None = None
    parent_goal_id: uuid.UUID | None = None


class ProgressIn(BaseModel):
    progress: object | None = None
    status: str | None = None


def _period_for(due: date) -> str:
    return f"{due.year}-Q{(due.month - 1) // 3 + 1}"


def _overdue(g: Goal) -> bool:
    return g.due_date < date.today() and g.status not in CLOSED


def _out(db: Session, g: Goal) -> dict:
    return {
        "id": str(g.id),
        "owner": _brief(db.get(Employee, g.owner_id)),
        "title": g.title,
        "description": g.description,
        "target": g.target,
        "due_date": g.due_date.isoformat(),
        "period": g.period,
        "weighting": g.weighting,
        "progress": g.progress,
        "status": g.status,
        "parent_goal_id": str(g.parent_goal_id) if g.parent_goal_id else None,
        "overdue": _overdue(g),
        "updated_at": g.updated_at.isoformat() if g.updated_at else None,
        "updated_by": _brief(db.get(Employee, g.updated_by_id) if g.updated_by_id else None),
        "progress_updated_at": (
            g.progress_updated_at.isoformat() if g.progress_updated_at else None
        ),
        "progress_updated_by": _brief(
            db.get(Employee, g.progress_updated_by_id) if g.progress_updated_by_id else None
        ),
    }


def _parse_date(raw) -> date | None:
    try:
        return date.fromisoformat(str(raw))
    except ValueError:
        return None


def _weighting(raw) -> tuple[float | None, str | None]:
    """The weighting as a number, or an English message explaining why not."""
    if isinstance(raw, bool) or not isinstance(raw, int | float | str):
        return None, "Enter a weighting between 0 and 100."
    try:
        value = float(raw)
    except ValueError:
        return None, "Enter a weighting between 0 and 100."
    if value < 0 or value > 100:
        return None, "Enter a weighting between 0 and 100."
    return value, None


def _audit(db: Session, actor: Employee, action: str, g: Goal, details: dict | None = None) -> None:
    db.add(
        AuditEvent(
            actor_id=actor.id,
            action=action,
            entity_type="goal",
            entity_id=g.id,
            subject_employee_id=g.owner_id,
            details={"actor_name": actor.full_name, **(details or {})},
        )
    )


def _may_write(actor: Employee, g: Goal) -> bool:
    return actor.id == g.owner_id or actor.role == "hr_admin"


def _may_read(db: Session, viewer: Employee, owner_id: uuid.UUID) -> bool:
    if viewer.id == owner_id or viewer.role in {"hr_admin", "executive"}:
        return True
    return viewer.id in _manager_chain(db, owner_id)


def _live(db: Session, goal_id: uuid.UUID) -> Goal | None:
    g = db.get(Goal, goal_id)
    return None if g is None or g.deleted_at is not None else g


@router.get("/goals")
def list_goals(
    employee_id: uuid.UUID | None = None,
    period: str | None = None,
    db: Session = Depends(get_db),
    viewer: Employee = Depends(auth.current_employee),
):
    """The owner's goals for a period, with the total weighting and its warning."""
    owner_id = employee_id or viewer.id
    if not _may_read(db, viewer, owner_id):
        raise auth.PolicyRefusal
    query = select(Goal).where(Goal.owner_id == owner_id, Goal.deleted_at.is_(None))
    if period:
        query = query.where(Goal.period == period)
    rows = db.scalars(query.order_by(Goal.due_date, Goal.title)).all()
    total = round(sum(g.weighting for g in rows), 2)
    over = total > 100
    return {
        "goals": [_out(db, g) for g in rows],
        "weighting_total": total,
        "over_100_warning": over,
        "warning": (
            f"These goals add up to {total:g}% for this period, which is over 100%."
            if over
            else None
        ),
    }


@router.post("/goals", status_code=201)
def create_goal(body: GoalIn, db: Session = Depends(get_db), actor: Employee = mutator):
    errors: dict[str, str] = {}
    if not (body.title or "").strip():
        errors["title"] = "Enter a title for this goal."
    if not (body.target or "").strip():
        errors["target"] = "Enter a measurable target."
    due = None
    if not (body.due_date or "").strip():
        errors["due_date"] = "Choose a due date."
    else:
        due = _parse_date(body.due_date)
        if due is None:
            errors["due_date"] = "Enter a due date as YYYY-MM-DD."
    weighting = 0.0
    if body.weighting is not None:
        weighting, message = _weighting(body.weighting)
        if message:
            errors["weighting"] = message
    if body.parent_goal_id is not None and _live(db, body.parent_goal_id) is None:
        errors["parent_goal_id"] = "The chosen parent goal does not exist."
    if errors:
        return _invalid(errors)
    goal = Goal(
        owner_id=actor.id,
        title=body.title.strip(),
        description=(body.description or "").strip() or None,
        target=body.target.strip(),
        due_date=due,
        period=(body.period or "").strip() or _period_for(due),
        weighting=weighting,
        progress=0,
        status="Not started",
        parent_goal_id=body.parent_goal_id,
        updated_by_id=actor.id,
    )
    db.add(goal)
    db.flush()
    _audit(db, actor, "goal_created", goal, {"title": goal.title})
    db.commit()
    return _out(db, goal)


@router.get("/goals/{goal_id}")
def get_goal(
    goal_id: uuid.UUID,
    db: Session = Depends(get_db),
    viewer: Employee = Depends(auth.current_employee),
):
    goal = _live(db, goal_id)
    if goal is None:
        return Response(status_code=404)
    if not _may_read(db, viewer, goal.owner_id):
        raise auth.PolicyRefusal
    history = db.scalars(
        select(AuditEvent)
        .where(AuditEvent.entity_type == "goal", AuditEvent.entity_id == goal.id)
        .order_by(AuditEvent.created_at, AuditEvent.id)
    ).all()
    children = db.scalars(
        select(Goal).where(Goal.parent_goal_id == goal.id, Goal.deleted_at.is_(None))
    ).all()
    return {
        "goal": _out(db, goal),
        "children": [_out(db, c) for c in children],
        "comments": [],
        "history": [
            {
                "action": e.action,
                "actor": _brief(db.get(Employee, e.actor_id) if e.actor_id else None),
                "created_at": e.created_at.isoformat(),
                "details": e.details,
            }
            for e in history
        ],
    }


@router.patch("/goals/{goal_id}")
def update_goal(
    goal_id: uuid.UUID, body: GoalIn, db: Session = Depends(get_db), actor: Employee = mutator
):
    goal = _live(db, goal_id)
    if goal is None:
        return Response(status_code=404)
    if not _may_write(actor, goal):
        raise auth.PolicyRefusal
    sent = body.model_fields_set
    errors: dict[str, str] = {}
    due = goal.due_date
    if "title" in sent and not (body.title or "").strip():
        errors["title"] = "Enter a title for this goal."
    if "target" in sent and not (body.target or "").strip():
        errors["target"] = "Enter a measurable target."
    if "due_date" in sent:
        due = _parse_date(body.due_date) if (body.due_date or "").strip() else None
        if due is None:
            errors["due_date"] = "Enter a due date as YYYY-MM-DD."
    weighting = goal.weighting
    if "weighting" in sent:
        weighting, message = _weighting(body.weighting)
        if message:
            errors["weighting"] = message
    if "parent_goal_id" in sent and body.parent_goal_id is not None:
        if body.parent_goal_id == goal.id or _live(db, body.parent_goal_id) is None:
            errors["parent_goal_id"] = "Choose a different parent goal."
    if errors:
        return _invalid(errors)
    changed = {}
    if "title" in sent:
        changed["title"] = goal.title = body.title.strip()
    if "description" in sent:
        changed["description"] = goal.description = (body.description or "").strip() or None
    if "target" in sent:
        changed["target"] = goal.target = body.target.strip()
    if "due_date" in sent:
        goal.due_date = due
        changed["due_date"] = due.isoformat()
    if "period" in sent and (body.period or "").strip():
        changed["period"] = goal.period = body.period.strip()
    if "weighting" in sent:
        changed["weighting"] = goal.weighting = weighting
    if "parent_goal_id" in sent:
        goal.parent_goal_id = body.parent_goal_id
        changed["parent_goal_id"] = str(body.parent_goal_id) if body.parent_goal_id else None
    goal.updated_at = datetime.now(UTC)
    goal.updated_by_id = actor.id
    _audit(db, actor, "goal_edited", goal, {"changed": changed})
    db.commit()
    return _out(db, goal)


@router.post("/goals/{goal_id}/progress")
def record_progress(
    goal_id: uuid.UUID, body: ProgressIn, db: Session = Depends(get_db), actor: Employee = mutator
):
    """Store the percentage the owner typed in; never calculate it."""
    goal = _live(db, goal_id)
    if goal is None:
        return Response(status_code=404)
    if not _may_write(actor, goal):
        raise auth.PolicyRefusal
    sent = body.model_fields_set
    errors: dict[str, str] = {}
    progress = goal.progress
    if "progress" in sent:
        raw = body.progress
        if isinstance(raw, bool) or not isinstance(raw, int | float | str):
            errors["progress"] = "Enter progress as a percentage between 0 and 100."
        else:
            try:
                progress = int(round(float(raw)))
            except ValueError:
                errors["progress"] = "Enter progress as a percentage between 0 and 100."
            else:
                if progress < 0 or progress > 100:
                    errors["progress"] = "Enter progress as a percentage between 0 and 100."
    if body.status is not None and body.status not in STATUSES:
        errors["status"] = "Choose one of: " + ", ".join(STATUSES) + "."
    if errors:
        return _invalid(errors)
    now = datetime.now(UTC)
    details: dict[str, object] = {}
    if "progress" in sent:
        goal.progress = progress
        goal.progress_updated_at = now
        goal.progress_updated_by_id = actor.id
        details["progress"] = progress
    if body.status is not None:
        goal.status = body.status
        details["status"] = body.status
    goal.updated_at = now
    goal.updated_by_id = actor.id
    _audit(db, actor, "goal_progress_updated", goal, details)
    db.commit()
    return _out(db, goal)


@router.delete("/goals/{goal_id}", status_code=204)
def delete_goal(goal_id: uuid.UUID, db: Session = Depends(get_db), actor: Employee = mutator):
    """Soft-delete; blocked while child goals are aligned to it."""
    goal = _live(db, goal_id)
    if goal is None:
        return Response(status_code=404)
    if not _may_write(actor, goal):
        raise auth.PolicyRefusal
    children = db.scalar(
        select(func.count())
        .select_from(Goal)
        .where(Goal.parent_goal_id == goal.id, Goal.deleted_at.is_(None))
    )
    if children:
        return JSONResponse(status_code=409, content={"child_count": children})
    goal.deleted_at = datetime.now(UTC)
    goal.updated_at = goal.deleted_at
    goal.updated_by_id = actor.id
    _audit(db, actor, "goal_deleted", goal)
    db.commit()
    return Response(status_code=204)
