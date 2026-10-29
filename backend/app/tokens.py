"""Single-use, time-limited invitation and password-reset links, and the
configurable password rules both of them enforce (NFR-005, NFR-020).

The token itself is only ever returned once, in the link HR copies; the table
keeps a sha256 of it, exactly as sessions do, so a leaked row cannot be
replayed. Issuing a new token for a purpose revokes every earlier one.
"""

import hashlib
import secrets
import uuid
from datetime import UTC, datetime, timedelta

from sqlalchemy import DateTime, ForeignKey, String, select, update
from sqlalchemy.orm import Mapped, Session, mapped_column

from app.auth import get_setting
from app.config import ALLOWED_ORIGINS
from app.database import Base
from app.models import UserSession, _id, _now

TOKEN_BYTES = 32


class AuthToken(Base):
    __tablename__ = "auth_token"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=_id)
    employee_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("employee.id"), index=True)
    purpose: Mapped[str] = mapped_column(String(20))  # invitation|password_reset
    token_hash: Mapped[str] = mapped_column(String(64), unique=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    used_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_by_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("employee.id"))


def token_hash(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def issue_token(
    db: Session, employee_id: uuid.UUID, purpose: str, actor_id: uuid.UUID | None = None
) -> tuple[str, AuthToken]:
    """Revoke any outstanding link of this purpose and issue a fresh one."""
    now = datetime.now(UTC)
    db.execute(
        update(AuthToken)
        .where(
            AuthToken.employee_id == employee_id,
            AuthToken.purpose == purpose,
            AuthToken.used_at.is_(None),
            AuthToken.revoked_at.is_(None),
        )
        .values(revoked_at=now)
    )
    minutes = float(get_setting(db, "reset_link_minutes") or 1440)
    raw = secrets.token_urlsafe(TOKEN_BYTES)
    row = AuthToken(
        employee_id=employee_id,
        purpose=purpose,
        token_hash=token_hash(raw),
        expires_at=now + timedelta(minutes=minutes),
        created_by_id=actor_id,
    )
    db.add(row)
    db.commit()
    return raw, row


def valid_token(db: Session, raw: str) -> AuthToken | None:
    """The live token behind `raw`, or None when unknown, used, revoked or expired."""
    row = db.scalar(select(AuthToken).where(AuthToken.token_hash == token_hash(raw)))
    if row is None or row.used_at is not None or row.revoked_at is not None:
        return None
    expires = row.expires_at
    if expires.tzinfo is None:
        expires = expires.replace(tzinfo=UTC)
    return None if expires <= datetime.now(UTC) else row


def consume_token(db: Session, row: AuthToken) -> None:
    row.used_at = datetime.now(UTC)
    db.commit()


def revoke_sessions(
    db: Session, employee_id: uuid.UUID, keep_token_hash: str | None = None
) -> None:
    """End every other active session for the account (changed password)."""
    stmt = update(UserSession).where(
        UserSession.employee_id == employee_id, UserSession.revoked_at.is_(None)
    )
    if keep_token_hash is not None:
        stmt = stmt.where(UserSession.token_hash != keep_token_hash)
    db.execute(stmt.values(revoked_at=datetime.now(UTC)))
    db.commit()


def password_rules(db: Session) -> dict:
    """The rules HR configured, as SystemSetting rows (NFR-020)."""
    min_length = int(get_setting(db, "password_min_length") or 12)
    return {
        "min_length": min_length,
        "require_uppercase": bool(get_setting(db, "password_require_uppercase")),
        "require_lowercase": bool(get_setting(db, "password_require_lowercase")),
        "require_digit": bool(get_setting(db, "password_require_digit")),
        "require_symbol": bool(get_setting(db, "password_require_symbol")),
    }


def unmet_rules(db: Session, password: str) -> list[str]:
    """Every configured rule the password fails, as English sentences."""
    rules = password_rules(db)
    failures: list[str] = []
    if len(password or "") < rules["min_length"]:
        failures.append(f"Use at least {rules['min_length']} characters.")
    if rules["require_uppercase"] and not any(c.isupper() for c in password):
        failures.append("Include at least one uppercase letter.")
    if rules["require_lowercase"] and not any(c.islower() for c in password):
        failures.append("Include at least one lowercase letter.")
    if rules["require_digit"] and not any(c.isdigit() for c in password):
        failures.append("Include at least one number.")
    if rules["require_symbol"] and not any(not c.isalnum() for c in password):
        failures.append("Include at least one symbol.")
    return failures


def link_for(token: str) -> str:
    return f"{ALLOWED_ORIGINS[0].rstrip('/')}/set-password?token={token}"
