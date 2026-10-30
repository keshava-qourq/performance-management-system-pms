"""rating scales and immutable questionnaire template versions

Revision ID: 0012
Revises: 0011
"""

import sqlalchemy as sa

from alembic import op

revision = "0012"
down_revision = "0011"
branch_labels = None
depends_on = None

TS = sa.DateTime(timezone=True)


def upgrade() -> None:
    op.create_table(
        "rating_scale",
        sa.Column("id", sa.Uuid, primary_key=True),
        sa.Column("name", sa.String(120), nullable=False),
        sa.Column("created_at", TS, nullable=False, server_default=sa.func.now()),
    )
    op.create_table(
        "rating_scale_point",
        sa.Column("id", sa.Uuid, primary_key=True),
        sa.Column(
            "scale_id",
            sa.Uuid,
            sa.ForeignKey("rating_scale.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        ),
        sa.Column("value", sa.Integer, nullable=False),
        sa.Column("label", sa.String(200), nullable=False),
    )
    op.create_table(
        "questionnaire_template",
        sa.Column("id", sa.Uuid, primary_key=True),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("created_at", TS, nullable=False, server_default=sa.func.now()),
    )
    op.create_table(
        "questionnaire_version",
        sa.Column("id", sa.Uuid, primary_key=True),
        sa.Column(
            "template_id",
            sa.Uuid,
            sa.ForeignKey("questionnaire_template.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        ),
        sa.Column("version", sa.Integer, nullable=False),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("status", sa.String(20), nullable=False, server_default="draft"),
        sa.Column("rating_scale_id", sa.Uuid, sa.ForeignKey("rating_scale.id")),
        sa.Column("scale_snapshot", sa.JSON),
        sa.Column("created_at", TS, nullable=False, server_default=sa.func.now()),
        sa.Column("published_at", TS),
        sa.Column("used_at", TS),
    )
    op.create_table(
        "questionnaire_competency",
        sa.Column("id", sa.Uuid, primary_key=True),
        sa.Column(
            "version_id",
            sa.Uuid,
            sa.ForeignKey("questionnaire_version.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        ),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("position", sa.Integer, nullable=False, server_default="0"),
    )
    op.create_table(
        "questionnaire_question",
        sa.Column("id", sa.Uuid, primary_key=True),
        sa.Column(
            "competency_id",
            sa.Uuid,
            sa.ForeignKey("questionnaire_competency.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        ),
        sa.Column("text", sa.Text, nullable=False),
        sa.Column("type", sa.String(10), nullable=False),  # rated|text|both
        sa.Column("mandatory", sa.Boolean, nullable=False, server_default=sa.true()),
        sa.Column("position", sa.Integer, nullable=False, server_default="0"),
    )


def downgrade() -> None:
    for t in (
        "questionnaire_question",
        "questionnaire_competency",
        "questionnaire_version",
        "questionnaire_template",
        "rating_scale_point",
        "rating_scale",
    ):
        op.drop_table(t)
