"""SQLAlchemy models for accounts, sessions, settings and audit."""

import uuid
from datetime import UTC, date, datetime

from sqlalchemy import JSON, Boolean, Date, DateTime, Float, ForeignKey, Integer, String, Text
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
    manager_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("employee.id"), index=True)
    role: Mapped[str] = mapped_column(String(20))  # employee|manager|hr_admin|executive
    status: Mapped[str] = mapped_column(String(20), default="active")  # active|deactivated
    deactivated: Mapped[bool] = mapped_column(Boolean, default=False)
    leaving_date: Mapped[date | None] = mapped_column(Date)
    deactivated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    password_hash: Mapped[str | None] = mapped_column(String)
    # Self-service profile fields (US-009): the employee owns these, HR owns the rest.
    display_name: Mapped[str | None] = mapped_column(String(200))
    pronouns: Mapped[str | None] = mapped_column(String(40))
    photo_key: Mapped[str | None] = mapped_column(String(300))
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


class Goal(Base):
    __tablename__ = "goal"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=_id)
    owner_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("employee.id"), index=True)
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str | None] = mapped_column(Text)
    target: Mapped[str] = mapped_column(Text)
    due_date: Mapped[date] = mapped_column(Date, index=True)
    period: Mapped[str] = mapped_column(String(40))
    weighting: Mapped[float] = mapped_column(Float, default=0)
    progress: Mapped[int] = mapped_column(Integer, default=0)  # typed in, never calculated
    status: Mapped[str] = mapped_column(String(20), default="Not started")
    parent_goal_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("goal.id"), index=True)
    level: Mapped[str] = mapped_column(String(20), default="personal")  # personal|company|dept
    department_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("department.id"))
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    updated_by_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("employee.id"))
    progress_updated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    progress_updated_by_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("employee.id"))


class GoalComment(Base):
    __tablename__ = "goal_comment"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=_id)
    goal_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("goal.id"), index=True)
    author_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("employee.id"))
    body: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class Feedback(Base):
    __tablename__ = "feedback"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=_id)
    author_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("employee.id"), index=True)
    recipient_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("employee.id"), index=True)
    type: Mapped[str] = mapped_column(String(20))
    body: Mapped[str] = mapped_column(Text)
    goal_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("goal.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    read_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    withdrawn_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    withdrawn_by: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("employee.id"))


class RatingScale(Base):
    __tablename__ = "rating_scale"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=_id)
    name: Mapped[str] = mapped_column(String(120))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class RatingScalePoint(Base):
    __tablename__ = "rating_scale_point"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=_id)
    scale_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("rating_scale.id"), index=True)
    value: Mapped[int] = mapped_column(Integer)
    label: Mapped[str] = mapped_column(String(200))


class QuestionnaireTemplate(Base):
    __tablename__ = "questionnaire_template"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=_id)
    name: Mapped[str] = mapped_column(String(200))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class QuestionnaireVersion(Base):
    """An immutable snapshot of a template: edits add a version (NFR-010)."""

    __tablename__ = "questionnaire_version"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=_id)
    template_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("questionnaire_template.id"), index=True
    )
    version: Mapped[int] = mapped_column(Integer, default=1)
    name: Mapped[str] = mapped_column(String(200))
    status: Mapped[str] = mapped_column(String(20), default="draft")  # draft|published
    rating_scale_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("rating_scale.id"))
    # The scale labels as they were when this version was created; a later edit
    # of the scale never changes what a submitted review shows (NFR-010).
    scale_snapshot: Mapped[dict | None] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    used_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class QuestionnaireCompetency(Base):
    __tablename__ = "questionnaire_competency"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=_id)
    version_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("questionnaire_version.id"), index=True
    )
    name: Mapped[str] = mapped_column(String(200))
    position: Mapped[int] = mapped_column(Integer, default=0)


class QuestionnaireQuestion(Base):
    __tablename__ = "questionnaire_question"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=_id)
    competency_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("questionnaire_competency.id"), index=True
    )
    text: Mapped[str] = mapped_column(Text)
    type: Mapped[str] = mapped_column(String(10))  # rated|text|both
    mandatory: Mapped[bool] = mapped_column(Boolean, default=True)
    position: Mapped[int] = mapped_column(Integer, default=0)


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
