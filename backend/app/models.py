"""SQLAlchemy models for accounts, sessions, settings and audit."""

import uuid
from datetime import UTC, datetime

from sqlalchemy import JSON, Boolean, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


def _now() -> datetime:
    return datetime.now(UTC)


def _id() -> uuid.UUID:
    return uuid.uuid4()


class Department(Base):
    __tablename__ = "department"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=_id)
    name: Mapped[str] = mapped_column(String(120), unique=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class JobTitle(Base):
    __tablename__ = "job_title"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=_id)
    name: Mapped[str] = mapped_column(String(120), unique=True)


class Employee(Base):
    __tablename__ = "employee"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=_id)
    full_name: Mapped[str] = mapped_column(String(200))
    work_email: Mapped[str] = mapped_column(String(320), unique=True)  # stored lower-case
    job_title_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("job_title.id"))
    department_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("department.id"))
    manager_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("employee.id"))
    role: Mapped[str] = mapped_column(String(20))  # employee|manager|hr_admin|executive
    status: Mapped[str] = mapped_column(String(20), default="active")  # active|deactivated
    deactivated: Mapped[bool] = mapped_column(Boolean, default=False)
    password_hash: Mapped[str | None] = mapped_column(String)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class UserSession(Base):
    __tablename__ = "session"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=_id)
    employee_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("employee.id"), index=True)
    token_hash: Mapped[str] = mapped_column(String(64), unique=True)
    last_seen_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class FailedLoginAttempt(Base):
    __tablename__ = "failed_login_attempt"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    employee_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("employee.id"), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class SystemSetting(Base):
    __tablename__ = "system_setting"
    key: Mapped[str] = mapped_column(String(80), primary_key=True)
    value: Mapped[object] = mapped_column(JSON)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class AuditEvent(Base):
    __tablename__ = "audit_event"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    actor_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("employee.id"))
    action: Mapped[str] = mapped_column(String(60))
    entity_type: Mapped[str] = mapped_column(String(40))
    entity_id: Mapped[uuid.UUID | None] = mapped_column()
    subject_employee_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("employee.id"))
    details: Mapped[dict | None] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
