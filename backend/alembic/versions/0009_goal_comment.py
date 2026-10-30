"""comments on goals

Revision ID: 0009
Revises: 0008
"""

import sqlalchemy as sa

from alembic import op

revision = "0009"
down_revision = "0008"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "goal_comment",
        sa.Column("id", sa.Uuid, primary_key=True),
        sa.Column("goal_id", sa.Uuid, sa.ForeignKey("goal.id", ondelete="CASCADE"), nullable=False),
        sa.Column(
            "author_id", sa.Uuid, sa.ForeignKey("employee.id", ondelete="CASCADE"), nullable=False
        ),
        sa.Column("body", sa.Text, nullable=False),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()
        ),
    )
    op.create_index("ix_goal_comment_goal_id", "goal_comment", ["goal_id"])


def downgrade() -> None:
    op.drop_index("ix_goal_comment_goal_id", table_name="goal_comment")
    op.drop_table("goal_comment")
