import uuid
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, Response
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr, TypeAdapter, ValidationError
from sqlalchemy import select
from sqlalchemy.orm import Session

from app import auth
from app.database import get_db
from app.models import Department, Employee, JobTitle

router = APIRouter(tags=["employees"])
hr_only = Depends(auth.require_role("hr_admin"))
_email = TypeAdapter(EmailStr)
ROLES = {"employee", "manager", "hr_admin", "executive"}


class EmployeeIn(BaseModel):
    full_name: str | None = None
    work_email: str | None = None
    job_title_id: uuid.UUID | None = None
    department_id: uuid.UUID | None = None
    role: str | None = None


def _out(db: Session, e: Employee) -> dict:
    title = db.get(JobTitle, e.job_title_id) if e.job_title_id else None
    dept = db.get(Department, e.department_id) if e.department_id else None
    return {
        "id": str(e.id),
        "full_name": e.full_name,
        "work_email": e.work_email,
        "job_title": {"id": str(title.id), "name": title.name} if title else None,
        "department": {"id": str(dept.id), "name": dept.name} if dept else None,
        "status": e.status,
    }


def _errors(db: Session, body: EmployeeIn, creating: bool, own_id=None) -> dict:
    sent = body.model_fields_set
    errors: dict[str, str] = {}
    if creating or "full_name" in sent:
        if not (body.full_name or "").strip():
            errors["full_name"] = "Enter the employee's full name."
    if creating or "work_email" in sent:
        raw = (body.work_email or "").strip()
        if not raw:
            errors["work_email"] = "Enter a work email address."
        else:
            try:
                email = _email.validate_python(raw).lower()
            except ValidationError:
                errors["work_email"] = "Enter a valid work email address."
            else:
                other = db.scalar(select(Employee).where(Employee.work_email == email))
                if other is not None and other.id != own_id:
                    errors["work_email"] = "This work email is already used by another employee."
    for field, model, label in (
        ("job_title_id", JobTitle, "job title"),
        ("department_id", Department, "department"),
    ):
        value = getattr(body, field)
        if value is None:
            if creating or field in sent:
                errors[field] = f"Choose a {label}."
        elif db.get(model, value) is None:
            errors[field] = f"The chosen {label} does not exist."
    if body.role is not None and body.role not in ROLES:
        errors["role"] = "Choose a valid role."
    return errors


def _invalid(errors: dict) -> JSONResponse:
    return JSONResponse(status_code=422, content={"errors": errors})


@router.get("/employees")
def list_employees(db: Session = Depends(get_db), _hr=hr_only):
    rows = db.scalars(select(Employee).order_by(Employee.full_name)).all()
    return [_out(db, e) for e in rows]


@router.post("/employees", status_code=201)
def create_employee(body: EmployeeIn, db: Session = Depends(get_db), _hr=hr_only):
    errors = _errors(db, body, creating=True)
    if errors:
        return _invalid(errors)
    emp = Employee(
        full_name=body.full_name.strip(),
        work_email=body.work_email.strip().lower(),
        job_title_id=body.job_title_id,
        department_id=body.department_id,
        role=body.role or "employee",
    )
    db.add(emp)
    db.commit()
    return _out(db, emp)


@router.patch("/employees/{employee_id}")
def update_employee(
    employee_id: uuid.UUID, body: EmployeeIn, db: Session = Depends(get_db), _hr=hr_only
):
    emp = db.get(Employee, employee_id)
    if emp is None:
        return Response(status_code=404)
    errors = _errors(db, body, creating=False, own_id=emp.id)
    if errors:
        return _invalid(errors)
    sent = body.model_fields_set
    if "full_name" in sent:
        emp.full_name = body.full_name.strip()
    if "work_email" in sent:
        emp.work_email = body.work_email.strip().lower()
    if "job_title_id" in sent:
        emp.job_title_id = body.job_title_id
    if "department_id" in sent:
        emp.department_id = body.department_id
    if body.role is not None:
        emp.role = body.role
    emp.updated_at = datetime.now(UTC)
    db.commit()
    return _out(db, emp)


@router.get("/departments")
def list_departments(db: Session = Depends(get_db), _e=Depends(auth.current_employee)):
    rows = db.scalars(select(Department).order_by(Department.name)).all()
    return [{"id": str(r.id), "name": r.name} for r in rows]


@router.get("/job-titles")
def list_job_titles(db: Session = Depends(get_db), _e=Depends(auth.current_employee)):
    rows = db.scalars(select(JobTitle).order_by(JobTitle.name)).all()
    return [{"id": str(r.id), "name": r.name} for r in rows]
