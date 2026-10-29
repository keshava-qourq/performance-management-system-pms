import uuid
from datetime import UTC, date, datetime

from fastapi import APIRouter, Depends, Response
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr, TypeAdapter, ValidationError
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app import auth, tokens
from app.database import get_db
from app.models import AuditEvent, Department, Employee, JobTitle

router = APIRouter(tags=["employees"])
hr_admin = auth.require_role("hr_admin")
hr_only = Depends(hr_admin)
_email = TypeAdapter(EmailStr)
ROLES = {"employee", "manager", "hr_admin", "executive"}


class EmployeeIn(BaseModel):
    full_name: str | None = None
    work_email: str | None = None
    job_title_id: uuid.UUID | None = None
    department_id: uuid.UUID | None = None
    role: str | None = None


def _brief(e: Employee | None) -> dict | None:
    return {"id": str(e.id), "full_name": e.full_name} if e else None


def _out(db: Session, e: Employee) -> dict:
    title = db.get(JobTitle, e.job_title_id) if e.job_title_id else None
    dept = db.get(Department, e.department_id) if e.department_id else None
    manager = db.get(Employee, e.manager_id) if e.manager_id else None
    return {
        "id": str(e.id),
        "full_name": e.full_name,
        "work_email": e.work_email,
        "job_title": {"id": str(title.id), "name": title.name} if title else None,
        "department": {"id": str(dept.id), "name": dept.name} if dept else None,
        "manager": _brief(manager),
        "missing_manager": e.manager_id is None,
        "role": e.role,
        "status": e.status,
        "account_status": e.status,
        "leaving_date": e.leaving_date.isoformat() if e.leaving_date else None,
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


def _hr_admin_count(db: Session) -> int:
    return db.scalar(
        select(func.count())
        .select_from(Employee)
        .where(Employee.role == "hr_admin", Employee.deactivated.is_(False))
    )


def _manager_chain(db: Session, employee_id: uuid.UUID) -> list[uuid.UUID]:
    """Ids of every manager above `employee_id`, nearest first. Cycle-safe."""
    chain: list[uuid.UUID] = []
    seen = {employee_id}
    current = db.get(Employee, employee_id)
    while current is not None and current.manager_id is not None:
        if current.manager_id in seen:
            break
        chain.append(current.manager_id)
        seen.add(current.manager_id)
        current = db.get(Employee, current.manager_id)
    return chain


def _can_read_record(db: Session, viewer: Employee, subject: Employee) -> bool:
    """HR, executives and the employee themselves; otherwise a manager above them."""
    if viewer.role in {"hr_admin", "executive"} or viewer.id == subject.id:
        return True
    return viewer.id in _manager_chain(db, subject.id)


def _invalid(errors: dict) -> JSONResponse:
    return JSONResponse(status_code=422, content={"errors": errors})


@router.get("/employees")
def list_employees(active_only: bool = False, db: Session = Depends(get_db), _hr=hr_only):
    """The directory. Pickers for new goals, feedback and 1:1s pass active_only."""
    query = select(Employee).order_by(Employee.full_name)
    if active_only:
        query = query.where(Employee.deactivated.is_(False), Employee.status == "active")
    return [_out(db, e) for e in db.scalars(query).all()]


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
    if (
        not errors
        and body.role is not None
        and body.role != "hr_admin"
        and emp.role == "hr_admin"
        and _hr_admin_count(db) <= 1
    ):
        errors["role"] = "At least one HR Admin must remain, so this role cannot be changed."
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


class ManagerIn(BaseModel):
    manager_id: uuid.UUID | None = None


@router.put("/employees/{employee_id}/manager")
def set_manager(
    employee_id: uuid.UUID, body: ManagerIn, db: Session = Depends(get_db), _hr=hr_only
):
    emp = db.get(Employee, employee_id)
    if emp is None:
        return Response(status_code=404)
    manager = None
    if body.manager_id is not None:
        if body.manager_id == emp.id:
            return _invalid(
                {"manager_id": "An employee cannot report to themselves; choose someone else."}
            )
        manager = db.get(Employee, body.manager_id)
        if manager is None:
            return _invalid({"manager_id": "The chosen manager does not exist."})
        if emp.id in _manager_chain(db, manager.id):
            return _invalid(
                {
                    "manager_id": (
                        "This would make the reporting line circular, because "
                        f"{manager.full_name} already reports to {emp.full_name}."
                    )
                }
            )
    emp.manager_id = body.manager_id
    emp.updated_at = datetime.now(UTC)
    if manager is not None and manager.role == "employee":
        manager.role = "manager"
    db.commit()
    return _out(db, emp)


class DeactivateIn(BaseModel):
    leaving_date: date
    reassign_manager_id: uuid.UUID | None = None


@router.post("/employees/{employee_id}/deactivate")
def deactivate(
    employee_id: uuid.UUID,
    body: DeactivateIn,
    db: Session = Depends(get_db),
    actor: Employee = Depends(hr_admin),
):
    """Mark a leaver deactivated, end their sessions, keep their record (NFR-010)."""
    emp = db.get(Employee, employee_id)
    if emp is None:
        return Response(status_code=404)
    reports = db.scalars(
        select(Employee).where(Employee.manager_id == emp.id).order_by(Employee.full_name)
    ).all()
    new_manager = None
    if reports:
        if body.reassign_manager_id is None:
            names = ", ".join(r.full_name for r in reports)
            return _invalid(
                {
                    "reassign_manager_id": (
                        f"{emp.full_name} still manages {names}. "
                        "Choose a new manager for them before deactivating."
                    )
                }
            )
        new_manager = db.get(Employee, body.reassign_manager_id)
        if new_manager is None:
            return _invalid({"reassign_manager_id": "The chosen manager does not exist."})
        if new_manager.id == emp.id or new_manager.deactivated or new_manager.status != "active":
            return _invalid(
                {"reassign_manager_id": "Choose an active employee as the new manager."}
            )
        chain = _manager_chain(db, new_manager.id)
        for r in reports:
            if r.id == new_manager.id or r.id in chain:
                return _invalid(
                    {
                        "reassign_manager_id": (
                            "This would make the reporting line circular, because "
                            f"{new_manager.full_name} reports to {r.full_name}."
                        )
                    }
                )
        for r in reports:
            r.manager_id = new_manager.id
            r.updated_at = datetime.now(UTC)
        if new_manager.role == "employee":
            new_manager.role = "manager"
    db.add(
        AuditEvent(
            actor_id=actor.id,
            action="employee_deactivated",
            entity_type="employee",
            entity_id=emp.id,
            subject_employee_id=emp.id,
            details={
                "leaving_date": body.leaving_date.isoformat(),
                "reassigned_reports": [str(r.id) for r in reports],
            },
        )
    )
    emp.updated_at = datetime.now(UTC)
    auth.deactivate_employee(db, emp, leaving_date=body.leaving_date)
    return _out(db, emp)


@router.post("/employees/{employee_id}/password-resets", status_code=201)
def issue_password_reset(
    employee_id: uuid.UUID,
    db: Session = Depends(get_db),
    actor: Employee = Depends(hr_admin),
):
    """HR issues a single-use reset link; any earlier one stops working (NFR-005)."""
    emp = db.get(Employee, employee_id)
    if emp is None:
        return Response(status_code=404)
    raw, row = tokens.issue_token(db, emp.id, "password_reset", actor.id)
    db.add(
        AuditEvent(
            actor_id=actor.id,
            action="password_reset_issued",
            entity_type="employee",
            entity_id=emp.id,
            subject_employee_id=emp.id,
            details={"token_id": str(row.id)},
        )
    )
    db.commit()
    return {"link": tokens.link_for(raw), "expires_at": row.expires_at.isoformat()}


@router.get("/employees/{employee_id}/record")
def employee_record(
    employee_id: uuid.UUID,
    db: Session = Depends(get_db),
    viewer: Employee = Depends(auth.current_employee),
):
    emp = db.get(Employee, employee_id)
    if emp is None:
        return Response(status_code=404)
    if not _can_read_record(db, viewer, emp):
        raise auth.PolicyRefusal
    reports = db.scalars(
        select(Employee).where(Employee.manager_id == emp.id).order_by(Employee.full_name)
    ).all()
    return {
        "employee": _out(db, emp),
        "direct_reports": [_brief(r) for r in reports],
        "goals": [],
        "self_reviews": [],
        "feedback": [],
    }


@router.get("/departments")
def list_departments(db: Session = Depends(get_db), _e=Depends(auth.current_employee)):
    rows = db.scalars(select(Department).order_by(Department.name)).all()
    return [{"id": str(r.id), "name": r.name} for r in rows]


@router.get("/job-titles")
def list_job_titles(db: Session = Depends(get_db), _e=Depends(auth.current_employee)):
    rows = db.scalars(select(JobTitle).order_by(JobTitle.name)).all()
    return [{"id": str(r.id), "name": r.name} for r in rows]
