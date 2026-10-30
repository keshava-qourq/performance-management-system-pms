"""name the competency and question tables as the data model does

Revision ID: 0013
Revises: 0012
"""

from alembic import op

revision = "0013"
down_revision = "0012"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.rename_table("questionnaire_competency", "competency")
    op.rename_table("questionnaire_question", "question")


def downgrade() -> None:
    op.rename_table("question", "questionnaire_question")
    op.rename_table("competency", "questionnaire_competency")
