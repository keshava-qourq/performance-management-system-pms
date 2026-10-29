"""Dev seed: one active user per role. Idempotent. Run: python -m app.seed"""

from sqlalchemy import select

from app.auth import hash_password
from app.database import SessionLocal
from app.models import Department, Employee, JobTitle

DEV_PASSWORD = "Dev-Passw0rd!"
USERS = [
    ("Hana Admin", "hr.admin@example.com", "hr_admin"),
    ("Mo Manager", "manager@example.com", "manager"),
    ("Emi Employee", "employee@example.com", "employee"),
    ("Eva Executive", "executive@example.com", "executive"),
]


def seed() -> None:
    with SessionLocal() as db:
        dept = db.scalar(select(Department).order_by(Department.name))
        title = db.scalar(select(JobTitle).order_by(JobTitle.name))
        for name, email, role in USERS:
            if db.scalar(select(Employee).where(Employee.work_email == email)):
                continue
            db.add(
                Employee(
                    full_name=name,
                    work_email=email,
                    role=role,
                    department_id=dept.id if dept else None,
                    job_title_id=title.id if title else None,
                    password_hash=hash_password(DEV_PASSWORD),
                )
            )
        db.commit()


if __name__ == "__main__":
    seed()
