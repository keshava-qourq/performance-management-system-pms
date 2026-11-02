"""review periods, their participants and the self-review tasks they create

Revision ID: 0014
Revises: 0013
"""

import sqlalchemy as sa

from alembic import op

revision = "0014"
down_revision = "0013"
branch_labels = None
depends_on = None

TS = sa.DateTime(timezone=True)


def upgrade() -> None:
    op.create_table(
        "review_period",
        sa.Column("id", sa.Uuid, primary_key=True),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column(
            "questionnaire_version_id",
            sa.Uuid,
            sa.ForeignKey("questionnaire_version.id"),
            nullable=False,
        ),
        sa.Column("start_date", sa.Date, nullable=False),
        sa.Column("end_date", sa.Date, nullable=False),
        sa.Column("submission_deadline", sa.Date, nullable=False),
        sa.Column("status", sa.String(20), nullable=False, server_default="draft"),
        sa.Column("created_at", TS, nullable=False, server_default=sa.func.now()),
        sa.Column("opened_at", TS),
        sa.Column("closed_at", TS),
    )
    op.create_table(
        "review_period_participant",
        sa.Column("id", sa.Uuid, primary_key=True),
        sa.Column(
            "period_id",
            sa.Uuid,
            sa.ForeignKey("review_period.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        ),
        sa.Column(
            "employee_id",
            sa.Uuid,
            sa.ForeignKey("employee.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.UniqueConstraint("period_id", "employee_id", name="uq_period_participant"),
    )
    op.create_table(
        "self_review",
        sa.Column("id", sa.Uuid, primary_key=True),
        sa.Column(
            "period_id",
            sa.Uuid,
            sa.ForeignKey("review_period.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        ),
        sa.Column(
            "employee_id",
            sa.Uuid,
            sa.ForeignKey("employee.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        ),
        sa.Column(
            "questionnaire_version_id",
            sa.Uuid,
            sa.ForeignKey("questionnaire_version.id"),
            nullable=False,
        ),
        # The questions and rating scale as they were when the task was created,
        # so a later HR edit never changes what this review shows (NFR-010).
        sa.Column("snapshot", sa.JSON, nullable=False),
        sa.Column("answers", sa.JSON),
        sa.Column("status", sa.String(20), nullable=False, server_default="not_started"),
        sa.Column("submitted_at", TS),
        sa.Column("created_at", TS, nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint("period_id", "employee_id", name="uq_self_review_participant"),
    )


def downgrade() -> None:
    for t in ("self_review", "review_period_participant", "review_period"):
        op.drop_table(t)
