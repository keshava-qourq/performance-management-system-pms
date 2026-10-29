"""Session authentication helpers: hashing, sessions, settings, require_role."""

import hashlib
import secrets
from datetime import UTC, datetime, timedelta

from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError
from fastapi import Cookie, Depends, Request
from fastapi.responses import Response
from sqlalchemy import select, update
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Employee, SystemSetting, UserSession

COOKIE_NAME = "session"
CUSTOM_HEADER = "X-Requested-With"  # must be present on every mutating request
MUTATING = {"POST", "PUT", "PATCH", "DELETE"}
_hasher = PasswordHasher()
DUMMY_HASH = _hasher.hash("not-a-real-password")


class PolicyRefusal(Exception):
    """Handled as 403 with an empty body."""


class Unauthenticated(Exception):
    """Handled as 401 with an empty body."""


def refusal_response(_request: Request, _exc: Exception) -> Response:
    return Response(status_code=403)


def unauthenticated_response(_request: Request, _exc: Exception) -> Response:
    return Response(status_code=401)


def require_custom_header(request: Request) -> None:
    if request.method in MUTATING and CUSTOM_HEADER not in request.headers:
        raise PolicyRefusal


def hash_password(password: str) -> str:
    return _hasher.hash(password)


def verify_password(stored: str | None, password: str) -> bool:
    """Always runs one argon2 verify so timing does not reveal unknown emails."""
    try:
        return _hasher.verify(stored or DUMMY_HASH, password) and stored is not None
    except (VerificationError, InvalidHashError):
        return False


def get_setting(db: Session, key: str):
    row = db.get(SystemSetting, key)
    return row.value if row else None


def _token_hash(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def create_session(db: Session, employee: Employee) -> str:
    token = secrets.token_urlsafe(32)
    db.add(UserSession(employee_id=employee.id, token_hash=_token_hash(token)))
    db.commit()
    return token


def revoke_session(db: Session, token: str) -> None:
    db.execute(
        update(UserSession)
        .where(UserSession.token_hash == _token_hash(token), UserSession.revoked_at.is_(None))
        .values(revoked_at=datetime.now(UTC))
    )
    db.commit()


def deactivate_employee(db: Session, employee: Employee) -> None:
    """Deactivate an account and end all its sessions immediately (NFR-003)."""
    employee.deactivated = True
    employee.status = "deactivated"
    db.execute(
        update(UserSession)
        .where(UserSession.employee_id == employee.id, UserSession.revoked_at.is_(None))
        .values(revoked_at=datetime.now(UTC))
    )
    db.commit()


def current_employee(
    db: Session = Depends(get_db),
    token: str | None = Cookie(default=None, alias=COOKIE_NAME),
) -> Employee:
    """The signed-in employee, or 401. Fails closed; enforces idle timeout."""
    if not token:
        raise Unauthenticated
    sess = db.scalar(select(UserSession).where(UserSession.token_hash == _token_hash(token)))
    if sess is None or sess.revoked_at is not None:
        raise Unauthenticated
    now = datetime.now(UTC)
    idle = get_setting(db, "session_idle_minutes")
    if idle is None or now - sess.last_seen_at > timedelta(minutes=float(idle)):
        sess.revoked_at = now
        db.commit()
        raise Unauthenticated
    employee = db.get(Employee, sess.employee_id)
    if employee is None or employee.deactivated or employee.status != "active":
        raise Unauthenticated
    sess.last_seen_at = now
    db.commit()
    return employee


def require_role(*roles: str):
    """Dependency: signed in, role allowed, and executives never mutate."""

    def dependency(request: Request, employee: Employee = Depends(current_employee)) -> Employee:
        if employee.role not in roles:
            raise PolicyRefusal
        if employee.role == "executive" and request.method in MUTATING:
            raise PolicyRefusal
        return employee

    return dependency
