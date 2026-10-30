"""delete an employee's sessions, attempts, audit rows and tokens with them

Revision ID: 0005
Revises: 0004
"""

from alembic import op

revision = "0005"
down_revision = "0004"
branch_labels = None
depends_on = None

# (table, column, constraint name)
LINKS = [
    ("auth_token", "employee_id", "auth_token_employee_id_fkey"),
    ("auth_token", "created_by_id", "auth_token_created_by_id_fkey"),
    ("session", "employee_id", "session_employee_id_fkey"),
    ("failed_login_attempt", "employee_id", "failed_login_attempt_employee_id_fkey"),
    ("audit_event", "actor_id", "audit_event_actor_id_fkey"),
    ("audit_event", "subject_employee_id", "audit_event_subject_employee_id_fkey"),
]


def upgrade() -> None:
    for table, column, name in LINKS:
        op.drop_constraint(name, table, type_="foreignkey")
        op.create_foreign_key(name, table, "employee", [column], ["id"], ondelete="CASCADE")


def downgrade() -> None:
    for table, column, name in LINKS:
        op.drop_constraint(name, table, type_="foreignkey")
        op.create_foreign_key(name, table, "employee", [column], ["id"])
