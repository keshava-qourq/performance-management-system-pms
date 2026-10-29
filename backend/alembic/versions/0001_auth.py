"""accounts, sessions, settings, audit

Revision ID: 0001
Revises:
"""
import uuid

import sqlalchemy as sa

from alembic import op

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None

TS = sa.DateTime(timezone=True)

SETTINGS = {
    "login_max_failed_attempts": 5,
    "login_block_minutes": 15,
    "session_idle_minutes": 30,
}
DEPARTMENTS = ["Engineering", "People", "Sales", "Operations", "Executive"]
TITLES = ["Software Engineer", "Engineering Manager", "HR Manager", "Chief Executive Officer"]


def upgrade() -> None:
    department = op.create_table(
        "department",
        sa.Column("id", sa.Uuid, primary_key=True),
        sa.Column("name", sa.String(120), nullable=False, unique=True),
        sa.Column("created_at", TS, nullable=False, server_default=sa.func.now()),
    )
    job_title = op.create_table(
        "job_title",
        sa.Column("id", sa.Uuid, primary_key=True),
        sa.Column("name", sa.String(120), nullable=False, unique=True),
    )
    op.create_table(
        "employee",
        sa.Column("id", sa.Uuid, primary_key=True),
        sa.Column("full_name", sa.String(200), nullable=False),
        sa.Column("work_email", sa.String(320), nullable=False, unique=True),
        sa.Column("job_title_id", sa.Uuid, sa.ForeignKey("job_title.id")),
        sa.Column("department_id", sa.Uuid, sa.ForeignKey("department.id")),
        sa.Column("manager_id", sa.Uuid, sa.ForeignKey("employee.id")),
        sa.Column("role", sa.String(20), nullable=False),
        sa.Column("status", sa.String(20), nullable=False, server_default="active"),
        sa.Column("deactivated", sa.Boolean, nullable=False, server_default=sa.false()),
        sa.Column("password_hash", sa.String),
        sa.Column("updated_at", TS, nullable=False, server_default=sa.func.now()),
    )
    op.create_table(
        "session",
        sa.Column("id", sa.Uuid, primary_key=True),
        sa.Column("employee_id", sa.Uuid, sa.ForeignKey("employee.id"), nullable=False, index=True),
        sa.Column("token_hash", sa.String(64), nullable=False, unique=True),
        sa.Column("last_seen_at", TS, nullable=False),
        sa.Column("revoked_at", TS),
    )
    op.create_table(
        "failed_login_attempt",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("employee_id", sa.Uuid, sa.ForeignKey("employee.id"), nullable=False, index=True),
        sa.Column("created_at", TS, nullable=False),
    )
    settings = op.create_table(
        "system_setting",
        sa.Column("key", sa.String(80), primary_key=True),
        sa.Column("value", sa.JSON, nullable=False),
        sa.Column("updated_at", TS, nullable=False, server_default=sa.func.now()),
    )
    op.create_table(
        "audit_event",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("actor_id", sa.Uuid, sa.ForeignKey("employee.id")),
        sa.Column("action", sa.String(60), nullable=False),
        sa.Column("entity_type", sa.String(40), nullable=False),
        sa.Column("entity_id", sa.Uuid),
        sa.Column("subject_employee_id", sa.Uuid, sa.ForeignKey("employee.id")),
        sa.Column("details", sa.JSON),
        sa.Column("created_at", TS, nullable=False),
    )
    op.bulk_insert(department, [{"id": uuid.uuid4(), "name": n} for n in DEPARTMENTS])
    op.bulk_insert(job_title, [{"id": uuid.uuid4(), "name": n} for n in TITLES])
    op.bulk_insert(settings, [{"key": k, "value": v} for k, v in SETTINGS.items()])


def downgrade() -> None:
    for t in ("audit_event", "system_setting", "failed_login_attempt", "session",
              "employee", "job_title", "department"):
        op.drop_table(t)
