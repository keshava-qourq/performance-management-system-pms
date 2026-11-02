"""1:1 records, their action items and the manager's private note

Revision ID: 0015
Revises: 0014
"""

import sqlalchemy as sa

from alembic import op

revision = "0015"
down_revision = "0014"
branch_labels = None
depends_on = None

TS = sa.DateTime(timezone=True)


def upgrade() -> None:
    op.create_table(
        "one_on_one",
        sa.Column("id", sa.Uuid, primary_key=True),
        sa.Column(
            "manager_id",
            sa.Uuid,
            sa.ForeignKey("employee.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "report_id",
            sa.Uuid,
            sa.ForeignKey("employee.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("meeting_date", sa.Date, nullable=False),
        sa.Column("reference", sa.String(200)),
        # The manager's private note (US-027-2 adds the endpoint that writes it).
        sa.Column("private_note", sa.Text),
        sa.Column("created_by", sa.Uuid, sa.ForeignKey("employee.id", ondelete="SET NULL")),
        sa.Column("created_at", TS, nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", TS, nullable=False, server_default=sa.func.now()),
    )
    # The list and carry-over queries filter on a participant, newest first (NFR-015).
    op.create_index("ix_one_on_one_manager_id", "one_on_one", ["manager_id", "meeting_date"])
    op.create_index("ix_one_on_one_report_id", "one_on_one", ["report_id", "meeting_date"])
    op.create_table(
        "action_item",
        sa.Column("id", sa.Uuid, primary_key=True),
        sa.Column(
            "one_on_one_id",
            sa.Uuid,
            sa.ForeignKey("one_on_one.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "owner_id",
            sa.Uuid,
            sa.ForeignKey("employee.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("description", sa.Text, nullable=False),
        sa.Column("due_date", sa.Date, nullable=False),
        sa.Column("completed_at", TS),
        sa.Column("completed_by", sa.Uuid, sa.ForeignKey("employee.id", ondelete="SET NULL")),
        sa.Column("created_at", TS, nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_action_item_one_on_one_id", "action_item", ["one_on_one_id"])
    op.create_index("ix_action_item_owner_id", "action_item", ["owner_id", "completed_at"])


def downgrade() -> None:
    op.drop_index("ix_action_item_owner_id", table_name="action_item")
    op.drop_index("ix_action_item_one_on_one_id", table_name="action_item")
    op.drop_table("action_item")
    op.drop_index("ix_one_on_one_report_id", table_name="one_on_one")
    op.drop_index("ix_one_on_one_manager_id", table_name="one_on_one")
    op.drop_table("one_on_one")
