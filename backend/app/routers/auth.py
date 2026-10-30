from datetime import UTC, datetime, timedelta

from fastapi import APIRouter, Cookie, Depends, Response
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr
from sqlalchemy import delete, func, select
from sqlalchemy.orm import Session

from app import auth, tokens
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
    auth.set_session_cookie(response, token)
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
    auth.clear_session_cookie(response)
    return None


class PasswordIn(BaseModel):
    current_password: str = ""
    new_password: str = ""


class AcceptIn(BaseModel):
    password: str = ""


def _rules_refused(db: Session, field: str, password: str) -> JSONResponse | None:
    """422 with one message per unmet rule; nothing is stored (AC-027)."""
    failures = tokens.unmet_rules(db, password)
    if not failures:
        return None
    return JSONResponse(
        status_code=422,
        content={"errors": {field: " ".join(failures)}, "unmet_rules": failures},
    )


@router.post("/password")
def change_password(
    body: PasswordIn,
    db: Session = Depends(get_db),
    emp: Employee = Depends(auth.current_employee),
    token: str | None = Cookie(default=None, alias=auth.COOKIE_NAME),
):
    """Change own password. Never logs either password (AC-030)."""
    if not auth.verify_password(emp.password_hash, body.current_password):
        return JSONResponse(
            status_code=422,
            content={"errors": {"current_password": "The current password is incorrect."}},
        )
    refused = _rules_refused(db, "new_password", body.new_password)
    if refused is not None:
        return refused
    emp.password_hash = auth.hash_password(body.new_password)
    emp.updated_at = datetime.now(UTC)
    db.add(
        AuditEvent(
            actor_id=emp.id,
            action="password_changed",
            entity_type="employee",
            entity_id=emp.id,
            subject_employee_id=emp.id,
        )
    )
    db.commit()
    # Every other session for this account ends at once.
    tokens.revoke_sessions(db, emp.id, keep_token_hash=tokens.token_hash(token) if token else None)
    return Response(status_code=204)


@router.get("/tokens/{token}")
def check_token(token: str, db: Session = Depends(get_db)):
    row = tokens.valid_token(db, token)
    if row is None:
        return JSONResponse(status_code=410, content={"detail": "This link is no longer valid."})
    return {"purpose": row.purpose, "valid": True, "password_rules": tokens.password_rules(db)}


@router.post("/tokens/{token}/accept")
def accept_token(token: str, body: AcceptIn, response: Response, db: Session = Depends(get_db)):
    """Set a password from an invitation or reset link. Single-use (NFR-005)."""
    row = tokens.valid_token(db, token)
    if row is None:
        return JSONResponse(status_code=410, content={"detail": "This link is no longer valid."})
    refused = _rules_refused(db, "password", body.password)
    if refused is not None:
        return refused
    emp = db.get(Employee, row.employee_id)
    if emp is None or emp.deactivated or emp.status not in {"active", "invited"}:
        return JSONResponse(status_code=410, content={"detail": "This link is no longer valid."})
    emp.status = "active"  # accepting an invitation activates the account (AC-019)
    emp.password_hash = auth.hash_password(body.password)
    emp.updated_at = datetime.now(UTC)
    db.add(
        AuditEvent(
            actor_id=emp.id,
            action="password_set_from_link",
            entity_type="employee",
            entity_id=emp.id,
            subject_employee_id=emp.id,
            details={"purpose": row.purpose},
        )
    )
    db.execute(delete(FailedLoginAttempt).where(FailedLoginAttempt.employee_id == emp.id))
    tokens.consume_token(db, row)
    tokens.revoke_sessions(db, emp.id)
    session_token = auth.create_session(db, emp)
    auth.set_session_cookie(response, session_token)
    return {"employee": _public(emp), "role": emp.role}


@router.get("/me")
def me(emp: Employee = Depends(auth.current_employee), db: Session = Depends(get_db)):
    reports = db.scalar(
        select(func.count()).select_from(Employee).where(Employee.manager_id == emp.id)
    )
    return {**_public(emp), "is_manager": emp.role == "manager" or reports > 0}
