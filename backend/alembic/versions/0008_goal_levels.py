"""goal level (personal|company|department) and department

Revision ID: 0008
Revises: 0007
"""

import sqlalchemy as sa

from alembic import op

revision = "0008"
down_revision = "0007"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "goal",
        sa.Column("level", sa.String(20), nullable=False, server_default="personal"),
    )
    op.add_column(
        "goal", sa.Column("department_id", sa.Uuid, sa.ForeignKey("department.id"), nullable=True)
    )
    op.create_index("ix_goal_parent_goal_id", "goal", ["parent_goal_id"])


def downgrade() -> None:
    op.drop_index("ix_goal_parent_goal_id", table_name="goal")
    op.drop_column("goal", "department_id")
    op.drop_column("goal", "level")
