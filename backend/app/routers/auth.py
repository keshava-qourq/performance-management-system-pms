from datetime import UTC, datetime, timedelta

from fastapi import APIRouter, Cookie, Depends, Response
from pydantic import BaseModel, EmailStr
from sqlalchemy import delete, func, select
from sqlalchemy.orm import Session

from app import auth
from app.database import get_db
from app.models import AuditEvent, Employee, FailedLoginAttempt

router = APIRouter(prefix="/auth", tags=["auth"])

GENERIC_FAILURE = "The email or password is incorrect."


class LoginIn(BaseModel):
    email: EmailStr
    password: str


def _fail(response: Response) -> dict:
    response.status_code = 401
    return {"detail": GENERIC_FAILURE}


def _public(e: Employee) -> dict:
    return {"id": str(e.id), "full_name": e.full_name, "role": e.role}


@router.post("/login")
def login(body: LoginIn, response: Response, db: Session = Depends(get_db)):
    emp = db.scalar(select(Employee).where(Employee.work_email == body.email.lower()))
    ok = auth.verify_password(emp.password_hash if emp else None, body.password)
    if emp is None:
        return _fail(response)
    now = datetime.now(UTC)
    threshold = int(auth.get_setting(db, "login_max_failed_attempts"))
    block = timedelta(minutes=float(auth.get_setting(db, "login_block_minutes")))
    recent = db.scalar(
        select(func.count())
        .select_from(FailedLoginAttempt)
        .where(
            FailedLoginAttempt.employee_id == emp.id,
            FailedLoginAttempt.created_at > now - block,
        )
    )
    if recent >= threshold:
        db.add(
            AuditEvent(
                action="login_blocked",
                entity_type="employee",
                entity_id=emp.id,
                subject_employee_id=emp.id,
                details={"failed_attempts": recent},
            )
        )
        db.commit()
        return _fail(response)
    if not ok or emp.deactivated or emp.status != "active":
        if not ok:
            db.add(FailedLoginAttempt(employee_id=emp.id))
            db.commit()
        return _fail(response)
    db.execute(delete(FailedLoginAttempt).where(FailedLoginAttempt.employee_id == emp.id))
    db.commit()
    token = auth.create_session(db, emp)
    response.set_cookie(auth.COOKIE_NAME, token, httponly=True, secure=True, samesite="strict")
    return {"employee": _public(emp), "role": emp.role}


@router.post("/logout", status_code=204)
def logout(
    response: Response,
    db: Session = Depends(get_db),
    _emp: Employee = Depends(auth.current_employee),
    token: str | None = Cookie(default=None, alias=auth.COOKIE_NAME),
):
    if token:
        auth.revoke_session(db, token)
    response.delete_cookie(auth.COOKIE_NAME, httponly=True, secure=True, samesite="strict")
    return None


@router.get("/me")
def me(emp: Employee = Depends(auth.current_employee), db: Session = Depends(get_db)):
    reports = db.scalar(
        select(func.count()).select_from(Employee).where(Employee.manager_id == emp.id)
    )
    return {**_public(emp), "is_manager": emp.role == "manager" or reports > 0}
