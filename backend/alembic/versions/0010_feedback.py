"""feedback (praise)

Revision ID: 0010
Revises: 0009
"""

import sqlalchemy as sa

from alembic import op

revision = "0010"
down_revision = "0009"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "feedback",
        sa.Column("id", sa.Uuid, primary_key=True),
        sa.Column("author_id", sa.Uuid, sa.ForeignKey("employee.id"), nullable=False),
        sa.Column("recipient_id", sa.Uuid, sa.ForeignKey("employee.id"), nullable=False),
        sa.Column("type", sa.String(20), nullable=False),
        sa.Column("body", sa.Text, nullable=False),
        sa.Column("goal_id", sa.Uuid, sa.ForeignKey("goal.id")),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()
        ),
        sa.Column("read_at", sa.DateTime(timezone=True)),
        sa.Column("withdrawn_at", sa.DateTime(timezone=True)),
        sa.Column("withdrawn_by", sa.Uuid, sa.ForeignKey("employee.id")),
    )
    op.create_index("ix_feedback_author_id", "feedback", ["author_id"])
    op.create_index("ix_feedback_recipient_id", "feedback", ["recipient_id"])


def downgrade() -> None:
    op.drop_index("ix_feedback_recipient_id", table_name="feedback")
    op.drop_index("ix_feedback_author_id", table_name="feedback")
    op.drop_table("feedback")
