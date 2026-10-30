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
from app.models import AuditEvent, Department, Employee, Goal, GoalComment
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
    level: str | None = None
    department_id: uuid.UUID | None = None


LEVELS = {"personal", "company", "department"}
LOOP_MESSAGE = (
    "This alignment would loop back to this goal, because the chosen parent "
    "is already aligned under it."
)
BAD_PARENT = "Choose a parent goal from the list."


class ProgressIn(BaseModel):
    progress: object | None = None
    status: str | None = None


def _period_for(due: date) -> str:
    return f"{due.year}-Q{(due.month - 1) // 3 + 1}"


def _overdue(g: Goal) -> bool:
    return g.due_date < date.today() and g.status not in CLOSED


def _out(db: Session, g: Goal) -> dict:
    parent = db.get(Goal, g.parent_goal_id) if g.parent_goal_id else None
    dept = db.get(Department, g.department_id) if g.department_id else None
    return {
        "parent_title": parent.title if parent is not None else None,
        "level": g.level,
        "department": {"id": str(dept.id), "name": dept.name} if dept else None,
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


def _may_view_goal(db: Session, viewer: Employee, g: Goal) -> bool:
    """_may_read, plus company goals and goals of the viewer's own department."""
    if _may_read(db, viewer, g.owner_id):
        return True
    if g.level == "company":
        return True
    return (
        g.level == "department"
        and g.department_id is not None
        and g.department_id == viewer.department_id
    )


def _options(db: Session, owner: Employee) -> list[Goal]:
    cond = Goal.level == "company"
    if owner.department_id is not None:
        cond = cond | ((Goal.level == "department") & (Goal.department_id == owner.department_id))
    return list(
        db.scalars(
            select(Goal).where(Goal.deleted_at.is_(None), cond).order_by(Goal.level, Goal.title)
        ).all()
    )


def _parent_error(
    db: Session, owner_id: uuid.UUID, parent_id: uuid.UUID, own_id=None
) -> str | None:
    """Why `parent_id` cannot be this goal's parent, or None. Cycle-safe walk."""
    seen: set[uuid.UUID] = set()
    cur: uuid.UUID | None = parent_id
    while cur is not None and cur not in seen:
        if own_id is not None and cur == own_id:
            return LOOP_MESSAGE
        seen.add(cur)
        node = db.get(Goal, cur)
        cur = node.parent_goal_id if node is not None else None
    parent = _live(db, parent_id)
    if parent is None:
        return BAD_PARENT
    if parent.owner_id == owner_id:
        return None
    owner = db.get(Employee, owner_id)
    if any(o.id == parent.id for o in _options(db, owner)):
        return None
    return BAD_PARENT


def _level_errors(db: Session, level: str, department_id) -> dict[str, str]:
    errors: dict[str, str] = {}
    if level not in LEVELS:
        errors["level"] = "Choose a valid level: personal, company or department."
    elif level == "department":
        if department_id is None:
            errors["department_id"] = "Choose a department."
        elif db.get(Department, department_id) is None:
            errors["department_id"] = "The chosen department does not exist."
    return errors


def _comment_out(c: GoalComment, author: Employee) -> dict:
    return {
        "id": str(c.id),
        "author": _brief(author),
        "body": c.body,
        "created_at": c.created_at.isoformat(),
    }


class CommentIn(BaseModel):
    body: str | None = None


team_reader = Depends(auth.require_role("manager", "hr_admin"))


@router.get("/team/goals")
def team_goals(db: Session = Depends(get_db), viewer: Employee = team_reader):
    """Active direct reports with their goals, loaded in two queries."""
    reports = db.scalars(
        select(Employee)
        .where(
            Employee.manager_id == viewer.id,
            Employee.deactivated.is_(False),
            Employee.status == "active",
        )
        .order_by(Employee.full_name)
    ).all()
    by_owner: dict[uuid.UUID, list[Goal]] = {r.id: [] for r in reports}
    if reports:
        rows = db.scalars(
            select(Goal)
            .where(Goal.owner_id.in_(list(by_owner)), Goal.deleted_at.is_(None))
            .order_by(Goal.due_date, Goal.title)
        ).all()
        for g in rows:
            by_owner[g.owner_id].append(g)
    result = []
    for r in reports:
        goals = by_owner[r.id]
        total = round(sum(g.weighting for g in goals), 2)
        result.append(
            {
                "employee": _brief(r),
                "goals": [
                    {
                        "id": str(g.id),
                        "title": g.title,
                        "weighting": g.weighting,
                        "progress": g.progress,
                        "status": g.status,
                        "due_date": g.due_date.isoformat(),
                        "overdue": _overdue(g),
                    }
                    for g in goals
                ],
                "weighting_total": total,
                "over_100_warning": total > 100,
            }
        )
    return result


@router.post("/goals/{goal_id}/comments", status_code=201)
def add_comment(
    goal_id: uuid.UUID, body: CommentIn, db: Session = Depends(get_db), actor: Employee = mutator
):
    goal = _live(db, goal_id)
    if goal is None:
        return Response(status_code=404)
    if not (
        actor.id == goal.owner_id
        or actor.role == "hr_admin"
        or actor.id in _manager_chain(db, goal.owner_id)
    ):
        raise auth.PolicyRefusal
    text = (body.body or "").strip()
    if not text:
        return _invalid({"body": "Enter a comment."})
    comment = GoalComment(goal_id=goal.id, author_id=actor.id, body=text)
    db.add(comment)
    db.flush()
    _audit(db, actor, "goal_comment_added", goal, {"comment_id": str(comment.id)})
    db.commit()
    return _comment_out(comment, actor)


@router.get("/goals/parent-options")
def parent_options(
    db: Session = Depends(get_db), viewer: Employee = Depends(auth.current_employee)
):
    return [{"id": str(g.id), "title": g.title, "level": g.level} for g in _options(db, viewer)]


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
    level = body.level if body.level is not None else "personal"
    if level in {"company", "department"} and actor.role != "hr_admin":
        raise auth.PolicyRefusal
    errors.update(_level_errors(db, level, body.department_id))
    if body.parent_goal_id is not None:
        message = _parent_error(db, actor.id, body.parent_goal_id)
        if message:
            errors["parent_goal_id"] = message
    if errors:
        return _invalid(errors)
    goal = Goal(
        level=level,
        department_id=body.department_id if level == "department" else None,
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
    if not _may_view_goal(db, viewer, goal):
        raise auth.PolicyRefusal
    history = db.scalars(
        select(AuditEvent)
        .where(AuditEvent.entity_type == "goal", AuditEvent.entity_id == goal.id)
        .order_by(AuditEvent.created_at, AuditEvent.id)
    ).all()
    children = db.scalars(
        select(Goal).where(Goal.parent_goal_id == goal.id, Goal.deleted_at.is_(None))
    ).all()
    children = [c for c in children if _may_read(db, viewer, c.owner_id)]
    comments = db.scalars(
        select(GoalComment)
        .where(GoalComment.goal_id == goal.id)
        .order_by(GoalComment.created_at, GoalComment.id)
    ).all()
    authors = {
        e.id: e
        for e in db.scalars(
            select(Employee).where(Employee.id.in_({c.author_id for c in comments}))
        ).all()
    }
    return {
        "goal": _out(db, goal),
        "children": [_out(db, c) for c in children],
        "comments": [_comment_out(c, authors[c.author_id]) for c in comments],
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
    level = goal.level
    if "level" in sent or "department_id" in sent:
        level = body.level if "level" in sent and body.level is not None else goal.level
        dept_id = body.department_id if "department_id" in sent else goal.department_id
        if (level != goal.level or "department_id" in sent) and level in {
            "company",
            "department",
        }:
            if actor.role != "hr_admin":
                raise auth.PolicyRefusal
        errors.update(_level_errors(db, level, dept_id))
    else:
        dept_id = goal.department_id
    if "parent_goal_id" in sent and body.parent_goal_id is not None:
        message = _parent_error(db, goal.owner_id, body.parent_goal_id, goal.id)
        if message:
            errors["parent_goal_id"] = message
    if errors:
        return _invalid(errors)
    changed = {}
    if level != goal.level or dept_id != goal.department_id:
        goal.level = level
        goal.department_id = dept_id if level == "department" else None
        changed["level"] = level
        changed["department_id"] = str(goal.department_id) if goal.department_id else None
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
