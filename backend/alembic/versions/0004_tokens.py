"""single-use invitation and password-reset tokens, password rule settings

Revision ID: 0004
Revises: 0003
"""

import sqlalchemy as sa

from alembic import op

revision = "0004"
down_revision = "0003"
branch_labels = None
depends_on = None

TS = sa.DateTime(timezone=True)

SETTINGS = {
    "password_min_length": 12,
    "password_require_uppercase": True,
    "password_require_lowercase": True,
    "password_require_digit": True,
    "password_require_symbol": True,
    "reset_link_minutes": 1440,
}


def upgrade() -> None:
    op.create_table(
        "auth_token",
        sa.Column("id", sa.Uuid, primary_key=True),
        sa.Column("employee_id", sa.Uuid, sa.ForeignKey("employee.id"), nullable=False, index=True),
        sa.Column("purpose", sa.String(20), nullable=False),
        sa.Column("token_hash", sa.String(64), nullable=False, unique=True),
        sa.Column("created_at", TS, nullable=False, server_default=sa.func.now()),
        sa.Column("expires_at", TS, nullable=False),
        sa.Column("used_at", TS),
        sa.Column("revoked_at", TS),
        sa.Column("created_by_id", sa.Uuid, sa.ForeignKey("employee.id")),
    )
    settings = sa.table("system_setting", sa.column("key", sa.String), sa.column("value", sa.JSON))
    op.bulk_insert(settings, [{"key": k, "value": v} for k, v in SETTINGS.items()])


def downgrade() -> None:
    op.execute(
        "DELETE FROM system_setting WHERE key IN (" + ", ".join(f"'{k}'" for k in SETTINGS) + ")"
    )
    op.drop_table("auth_token")
