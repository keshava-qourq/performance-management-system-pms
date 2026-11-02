"""1:1 records between a manager and a direct report, with action items (US-027).

Only the two participants may read or write a 1:1; everyone else, HR included,
gets 403 with an empty body. An action item belongs to one of those two people,
stays open until someone completes it, and is carried over to their next 1:1
while it is still open (AC-100 to AC-103).
"""

import uuid
from datetime import UTC, date, datetime

from fastapi import APIRouter, Depends, Response
from pydantic import BaseModel
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app import auth
from app.database import get_db
from app.models import ActionItem, AuditEvent, Employee, OneOnOne
from app.routers.employees import _brief, _invalid

router = APIRouter(tags=["one-on-ones"])
# Executives are refused on every mutating route by require_role itself.
mutator = Depends(auth.require_role("employee", "manager", "hr_admin", "executive"))

BAD_OWNER = "Choose one of the two people in this 1:1."
BAD_DATE = "Enter a date as YYYY-MM-DD."


class OneOnOneIn(BaseModel):
    report_id: uuid.UUID | None = None
    meeting_date: str | None = None
    reference: str | None = None


class ActionItemIn(BaseModel):
    description: str | None = None
    owner_id: uuid.UUID | None = None
    due_date: str | None = None


class PrivateNoteIn(BaseModel):
    body: str | None = None


NOTE_SETTING = "hr_private_notes_visible"
NOTE_READERS_OFF = "Only you, the manager, can read this private note."
NOTE_READERS_ON = "Only you, the manager, and HR Admins can read this private note."


def _hr_may_read(db: Session) -> bool:
    """Visibility is a stored system setting, never a constant here (NFR-020)."""
    return auth.get_setting(db, NOTE_SETTING) is True


def _readers_statement(hr_may_read: bool) -> str:
    return NOTE_READERS_ON if hr_may_read else NOTE_READERS_OFF


def _parse(raw) -> date | None:
    try:
        return date.fromisoformat(str(raw))
    except (ValueError, TypeError):
        return None


def _overdue(item: ActionItem) -> bool:
    return item.completed_at is None and item.due_date < date.today()


def _item_out(db: Session, item: ActionItem, meeting: OneOnOne | None = None) -> dict:
    return {
        "id": str(item.id),
        "one_on_one_id": str(item.one_on_one_id),
        "meeting_date": meeting.meeting_date.isoformat() if meeting else None,
        "description": item.description,
        "owner": _brief(db.get(Employee, item.owner_id)),
        "owner_id": str(item.owner_id),
        "due_date": item.due_date.isoformat(),
        "overdue": _overdue(item),
        "completed_at": item.completed_at.isoformat() if item.completed_at else None,
        "completed_by": _brief(db.get(Employee, item.completed_by) if item.completed_by else None),
    }


def _items(db: Session, one_on_one_id: uuid.UUID) -> list[ActionItem]:
    return list(
        db.scalars(
            select(ActionItem)
            .where(ActionItem.one_on_one_id == one_on_one_id)
            .order_by(ActionItem.due_date, ActionItem.created_at)
        ).all()
    )


def _is_participant(meeting: OneOnOne, employee: Employee) -> bool:
    return employee.id in {meeting.manager_id, meeting.report_id}


def _load(db: Session, one_on_one_id: uuid.UUID, caller: Employee) -> OneOnOne:
    meeting = db.get(OneOnOne, one_on_one_id)
    if meeting is None:
        raise _NotFound
    if not _is_participant(meeting, caller):
        raise auth.PolicyRefusal
    return meeting


class _NotFound(Exception):
    """Internal: turned into a 404 by the routes below."""


def _mine(caller: Employee):
    return or_(OneOnOne.manager_id == caller.id, OneOnOne.report_id == caller.id)


def _summary(db: Session, meeting: OneOnOne, caller: Employee) -> dict:
    other_id = meeting.report_id if meeting.manager_id == caller.id else meeting.manager_id
    items = _items(db, meeting.id)
    open_items = [i for i in items if i.completed_at is None]
    return {
        "id": str(meeting.id),
        "counterpart": _brief(db.get(Employee, other_id)),
        "meeting_date": meeting.meeting_date.isoformat(),
        "reference": meeting.reference,
        "i_am_manager": meeting.manager_id == caller.id,
        "talking_point_count": 0,
        "open_action_item_count": len(open_items),
        "overdue_action_item_count": len([i for i in open_items if _overdue(i)]),
    }


def open_action_items(db: Session, caller: Employee) -> list[dict]:
    """Every still-open item the caller owns, flagged overdue (AC-100, AC-102)."""
    rows = db.execute(
        select(ActionItem, OneOnOne)
        .join(OneOnOne, OneOnOne.id == ActionItem.one_on_one_id)
        .where(
            _mine(caller),
            ActionItem.owner_id == caller.id,
            ActionItem.completed_at.is_(None),
        )
        .order_by(ActionItem.due_date)
    ).all()
    return [_item_out(db, item, meeting) for item, meeting in rows]


@router.get("/one-on-ones")
def list_one_on_ones(
    db: Session = Depends(get_db), caller: Employee = Depends(auth.current_employee)
):
    meetings = db.scalars(
        select(OneOnOne).where(_mine(caller)).order_by(OneOnOne.meeting_date.desc())
    ).all()
    return {
        "one_on_ones": [_summary(db, m, caller) for m in meetings],
        "open_action_items": open_action_items(db, caller),
    }


@router.post("/one-on-ones", status_code=201)
def create_one_on_one(body: OneOnOneIn, db: Session = Depends(get_db), caller: Employee = mutator):
    """A manager names the report; a report is paired with their own manager."""
    errors: dict[str, str] = {}
    meeting_date = None
    if not (body.meeting_date or "").strip():
        errors["meeting_date"] = "Choose a date for this 1:1."
    else:
        meeting_date = _parse(body.meeting_date)
        if meeting_date is None:
            errors["meeting_date"] = BAD_DATE
    manager_id = report_id = None
    if body.report_id is None:
        if caller.manager_id is None:
            errors["report_id"] = "You have no manager recorded, so choose a direct report."
        else:
            manager_id, report_id = caller.manager_id, caller.id
    else:
        report = db.get(Employee, body.report_id)
        if report is None or report.deactivated or report.status != "active":
            errors["report_id"] = "Choose an active direct report."
        elif report.manager_id != caller.id:
            errors["report_id"] = "A 1:1 is between a manager and their own direct report."
        else:
            manager_id, report_id = caller.id, report.id
    if errors:
        return _invalid(errors)
    meeting = OneOnOne(
        manager_id=manager_id,
        report_id=report_id,
        meeting_date=meeting_date,
        reference=(body.reference or "").strip() or None,
        created_by=caller.id,
    )
    db.add(meeting)
    db.commit()
    return _detail(db, meeting, caller)


def _carry_over(db: Session, meeting: OneOnOne) -> list[dict]:
    """Still-open items from earlier 1:1s between the same two people (AC-103)."""
    rows = db.execute(
        select(ActionItem, OneOnOne)
        .join(OneOnOne, OneOnOne.id == ActionItem.one_on_one_id)
        .where(
            OneOnOne.manager_id == meeting.manager_id,
            OneOnOne.report_id == meeting.report_id,
            OneOnOne.id != meeting.id,
            OneOnOne.meeting_date <= meeting.meeting_date,
            ActionItem.completed_at.is_(None),
        )
        .order_by(ActionItem.due_date)
    ).all()
    return [_item_out(db, item, earlier) for item, earlier in rows]


def _detail(db: Session, meeting: OneOnOne, caller: Employee) -> dict:
    """The private note is serialised only for the manager, and for an HR Admin
    while the stored setting allows it. The direct report never sees it (NFR-007)."""
    hr_may_read = _hr_may_read(db)
    is_manager = meeting.manager_id == caller.id
    may_read_note = is_manager or (caller.role == "hr_admin" and hr_may_read)
    return {
        **_summary(db, meeting, caller),
        "updated_at": meeting.updated_at.isoformat() if meeting.updated_at else None,
        "talking_points": [],
        "action_items": [_item_out(db, i, meeting) for i in _items(db, meeting.id)],
        "carry_over": _carry_over(db, meeting),
        "private_note": meeting.private_note if may_read_note else None,
        "hr_can_read_private_notes": hr_may_read,
        "private_note_readers": _readers_statement(hr_may_read),
    }


@router.get("/one-on-ones/{one_on_one_id}")
def get_one_on_one(
    one_on_one_id: uuid.UUID,
    db: Session = Depends(get_db),
    caller: Employee = Depends(auth.current_employee),
):
    meeting = db.get(OneOnOne, one_on_one_id)
    if meeting is None:
        return Response(status_code=404)
    # The two participants always; an HR Admin only while the setting allows it (AC-106).
    if not _is_participant(meeting, caller) and not (
        caller.role == "hr_admin" and _hr_may_read(db)
    ):
        raise auth.PolicyRefusal
    return _detail(db, meeting, caller)


@router.patch("/one-on-ones/{one_on_one_id}")
def update_one_on_one(
    one_on_one_id: uuid.UUID,
    body: OneOnOneIn,
    db: Session = Depends(get_db),
    caller: Employee = mutator,
):
    try:
        meeting = _load(db, one_on_one_id, caller)
    except _NotFound:
        return Response(status_code=404)
    sent = body.model_fields_set
    if "meeting_date" in sent:
        meeting_date = _parse(body.meeting_date)
        if meeting_date is None:
            return _invalid({"meeting_date": BAD_DATE})
        meeting.meeting_date = meeting_date
    if "reference" in sent:
        meeting.reference = (body.reference or "").strip() or None
    meeting.updated_at = datetime.now(UTC)
    db.commit()
    return _detail(db, meeting, caller)


@router.put("/one-on-ones/{one_on_one_id}/private-note")
def save_private_note(
    one_on_one_id: uuid.UUID,
    body: PrivateNoteIn,
    db: Session = Depends(get_db),
    caller: Employee = mutator,
):
    """Only the manager on this 1:1 may write it; the report is refused (AC-104, AC-105)."""
    meeting = db.get(OneOnOne, one_on_one_id)
    if meeting is None:
        return Response(status_code=404)
    if meeting.manager_id != caller.id:
        raise auth.PolicyRefusal
    meeting.private_note = (body.body or "").strip() or None
    meeting.updated_at = datetime.now(UTC)
    db.add(
        AuditEvent(
            actor_id=caller.id,
            action="private_note_saved",
            entity_type="one_on_one",
            entity_id=meeting.id,
            subject_employee_id=meeting.report_id,
        )
    )
    db.commit()
    hr_may_read = _hr_may_read(db)
    return {
        "id": str(meeting.id),
        "hr_can_read_private_notes": hr_may_read,
        "private_note_readers": _readers_statement(hr_may_read),
    }


@router.post("/one-on-ones/{one_on_one_id}/action-items", status_code=201)
def add_action_item(
    one_on_one_id: uuid.UUID,
    body: ActionItemIn,
    db: Session = Depends(get_db),
    caller: Employee = mutator,
):
    try:
        meeting = _load(db, one_on_one_id, caller)
    except _NotFound:
        return Response(status_code=404)
    errors: dict[str, str] = {}
    if not (body.description or "").strip():
        errors["description"] = "Describe what needs to be done."
    if body.owner_id is None:
        errors["owner_id"] = BAD_OWNER
    elif body.owner_id not in {meeting.manager_id, meeting.report_id}:
        errors["owner_id"] = BAD_OWNER
    due = None
    if not (body.due_date or "").strip():
        errors["due_date"] = "Choose a due date."
    else:
        due = _parse(body.due_date)
        if due is None:
            errors["due_date"] = BAD_DATE
    if errors:
        return _invalid(errors)
    item = ActionItem(
        one_on_one_id=meeting.id,
        owner_id=body.owner_id,
        description=body.description.strip(),
        due_date=due,
    )
    db.add(item)
    meeting.updated_at = datetime.now(UTC)
    db.commit()
    return _item_out(db, item, meeting)


@router.post("/action-items/{item_id}/complete")
def complete_action_item(
    item_id: uuid.UUID, db: Session = Depends(get_db), caller: Employee = mutator
):
    item = db.get(ActionItem, item_id)
    if item is None:
        return Response(status_code=404)
    meeting = db.get(OneOnOne, item.one_on_one_id)
    if meeting is None or not _is_participant(meeting, caller):
        raise auth.PolicyRefusal
    if item.completed_at is None:
        item.completed_at = datetime.now(UTC)
        item.completed_by = caller.id
        meeting.updated_at = item.completed_at
        db.commit()
    return _item_out(db, item, meeting)
