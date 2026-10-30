"""goals with manual progress, status and weighting

Revision ID: 0006
Revises: 0005
"""

import sqlalchemy as sa

from alembic import op

revision = "0006"
down_revision = "0005"
branch_labels = None
depends_on = None

TS = sa.DateTime(timezone=True)


def upgrade() -> None:
    op.create_table(
        "goal",
        sa.Column("id", sa.Uuid, primary_key=True),
        sa.Column(
            "owner_id",
            sa.Uuid,
            sa.ForeignKey("employee.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("title", sa.String(200), nullable=False),
        sa.Column("description", sa.Text),
        sa.Column("target", sa.Text, nullable=False),
        sa.Column("due_date", sa.Date, nullable=False),
        sa.Column("period", sa.String(40), nullable=False),
        sa.Column("weighting", sa.Float, nullable=False, server_default="0"),
        sa.Column("progress", sa.Integer, nullable=False, server_default="0"),
        sa.Column("status", sa.String(20), nullable=False, server_default="Not started"),
        sa.Column("parent_goal_id", sa.Uuid, sa.ForeignKey("goal.id")),
        sa.Column("deleted_at", TS),
        sa.Column("created_at", TS, nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", TS, nullable=False, server_default=sa.func.now()),
        sa.Column("updated_by_id", sa.Uuid, sa.ForeignKey("employee.id", ondelete="SET NULL")),
        sa.Column("progress_updated_at", TS),
        sa.Column(
            "progress_updated_by_id",
            sa.Uuid,
            sa.ForeignKey("employee.id", ondelete="SET NULL"),
        ),
    )
    op.create_index("ix_goal_owner_id", "goal", ["owner_id"])
    op.create_index("ix_goal_due_date", "goal", ["due_date"])


def downgrade() -> None:
    op.drop_index("ix_goal_due_date", table_name="goal")
    op.drop_index("ix_goal_owner_id", table_name="goal")
    op.drop_table("goal")
