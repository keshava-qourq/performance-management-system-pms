"""seed hr_private_notes_visible=false

Revision ID: 0016
Revises: 0015
"""

import sqlalchemy as sa

from alembic import op

revision = "0016"
down_revision = "0015"
branch_labels = None
depends_on = None

KEY = "hr_private_notes_visible"


def upgrade() -> None:
    conn = op.get_bind()
    exists = conn.execute(
        sa.text("SELECT 1 FROM system_setting WHERE key = :k"), {"k": KEY}
    ).first()
    if exists is None:
        settings = sa.table(
            "system_setting", sa.column("key", sa.String), sa.column("value", sa.JSON)
        )
        op.bulk_insert(settings, [{"key": KEY, "value": False}])


def downgrade() -> None:
    op.execute(sa.text("DELETE FROM system_setting WHERE key = 'hr_private_notes_visible'"))
