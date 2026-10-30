"""seed manager_feedback_visible=false

Revision ID: 0011
Revises: 0010
"""

import sqlalchemy as sa

from alembic import op

revision = "0011"
down_revision = "0010"
branch_labels = None
depends_on = None


def upgrade() -> None:
    conn = op.get_bind()
    exists = conn.execute(
        sa.text("SELECT 1 FROM system_setting WHERE key = 'manager_feedback_visible'")
    ).first()
    if exists is None:
        settings = sa.table(
            "system_setting", sa.column("key", sa.String), sa.column("value", sa.JSON)
        )
        op.bulk_insert(settings, [{"key": "manager_feedback_visible", "value": False}])


def downgrade() -> None:
    op.execute("DELETE FROM system_setting WHERE key = 'manager_feedback_visible'")
