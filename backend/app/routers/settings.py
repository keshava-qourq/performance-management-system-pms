"""HR-configurable settings (US-024). Stored as system_setting rows (NFR-020)."""

from datetime import UTC, datetime

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import auth, tokens
from app.database import get_db
from app.models import AuditEvent, Employee, SystemSetting
from app.routers.employees import _invalid

router = APIRouter(tags=["settings"])
hr_admin = Depends(auth.require_role("hr_admin"))

BOOLEAN_KEYS = ("manager_feedback_visible", "hr_private_notes_visible")  # default false


def manager_feedback_visible(db: Session) -> bool:
    return auth.get_setting(db, "manager_feedback_visible") is True


def _current(db: Session) -> dict:
    idle = auth.get_setting(db, "session_idle_minutes")
    lock = auth.get_setting(db, "login_max_failed_attempts")
    return {
        "password_rules": tokens.password_rules(db),
        "session_idle_minutes": int(30 if idle is None else idle),
        "login_lock_threshold": int(5 if lock is None else lock),
        "manager_feedback_visible": manager_feedback_visible(db),
        "hr_private_notes_visible": auth.get_setting(db, "hr_private_notes_visible") is True,
    }


@router.get("/settings")
def get_settings(db: Session = Depends(get_db), _hr=hr_admin):
    return _current(db)


@router.put("/settings")
def put_settings(body: dict, db: Session = Depends(get_db), actor: Employee = hr_admin):
    errors: dict[str, str] = {}
    for key, value in body.items():
        if key not in BOOLEAN_KEYS:
            errors[key] = "This setting is not recognised."
        elif not isinstance(value, bool):
            errors[key] = "Choose on or off."
    if errors:
        return _invalid(errors)
    for key, value in body.items():
        row = db.get(SystemSetting, key)
        old = row.value if row else False
        if row is None:
            db.add(SystemSetting(key=key, value=value))
        else:
            row.value = value
            row.updated_at = datetime.now(UTC)
        db.add(
            AuditEvent(
                actor_id=actor.id,
                action="setting_changed",
                entity_type="setting",
                details={"key": key, "old": old, "new": value},
            )
        )
    db.commit()
    return _current(db)
