"""self-owned profile fields: display name, pronouns, photo key

Revision ID: 0007
Revises: 0006
"""

import sqlalchemy as sa

from alembic import op

revision = "0007"
down_revision = "0006"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("employee", sa.Column("display_name", sa.String(200), nullable=True))
    op.add_column("employee", sa.Column("pronouns", sa.String(40), nullable=True))
    op.add_column("employee", sa.Column("photo_key", sa.String(300), nullable=True))


def downgrade() -> None:
    op.drop_column("employee", "photo_key")
    op.drop_column("employee", "pronouns")
    op.drop_column("employee", "display_name")
