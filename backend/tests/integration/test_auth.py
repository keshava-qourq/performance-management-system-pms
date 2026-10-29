from datetime import UTC, datetime, timedelta

from fastapi import Depends
from sqlalchemy import text

from app.auth import deactivate_employee, require_role
from app.database import SessionLocal
from app.main import app
from app.models import Employee
from app.seed import DEV_PASSWORD
from tests.conftest import H, login

GENERIC = "The email or password is incorrect."


def _sql(sql, **params):
    with SessionLocal() as db:
        db.execute(text(sql), params)
        db.commit()


def test_ac022_login_sets_cookie_and_me(client):
    r = login(client, "manager@example.com")
    assert r.status_code == 200 and r.json()["role"] == "manager"
    c = r.headers["set-cookie"].lower()
    assert "httponly" in c and "secure" in c and "samesite=strict" in c
    me = client.get("/auth/me")
    assert me.status_code == 200 and me.json()["full_name"] == "Mo Manager"


def test_ac023_same_message_no_enumeration_no_session(client):
    a = login(client, "employee@example.com", "wrong")
    b = login(client, "nobody@example.com", "wrong")
    assert a.status_code == b.status_code == 401
    assert a.json() == b.json() == {"detail": GENERIC}
    assert client.get("/auth/me").status_code == 401
    with SessionLocal() as db:
        assert db.execute(text("SELECT count(*) FROM session")).scalar() == 0


def test_ac024_lockout_recorded_and_threshold_from_settings(client):
    _sql("UPDATE system_setting SET value='2' WHERE key='login_max_failed_attempts'")
    login(client, password="bad")
    login(client, password="bad")
    r = login(client)  # correct password, now blocked
    assert r.status_code == 401 and r.json() == {"detail": GENERIC}
    with SessionLocal() as db:
        n = db.execute(
            text("SELECT count(*) FROM audit_event WHERE action='login_blocked'")
        ).scalar()
    assert n == 1


def test_ac025_logout_and_idle_timeout(client):
    login(client)
    assert client.post("/auth/logout", headers=H).status_code == 204
    assert client.get("/auth/me").status_code == 401
    login(client)
    _sql("UPDATE session SET last_seen_at=:t", t=datetime.now(UTC) - timedelta(minutes=31))
    assert client.get("/auth/me").status_code == 401


def test_ac025_idle_timeout_is_a_setting(client):
    login(client)
    _sql("UPDATE system_setting SET value='120' WHERE key='session_idle_minutes'")
    _sql("UPDATE session SET last_seen_at=:t", t=datetime.now(UTC) - timedelta(minutes=60))
    assert client.get("/auth/me").status_code == 200


def test_ac026_deactivated_refused_and_sessions_revoked(client):
    login(client)
    with SessionLocal() as db:
        emp = db.query(Employee).filter_by(work_email="employee@example.com").one()
        deactivate_employee(db, emp)
    assert client.get("/auth/me").status_code == 401
    r = login(client)
    assert r.status_code == 401 and r.json() == {"detail": GENERIC}


def test_ac022_mutation_requires_header_403_empty(client):
    r = client.post("/auth/login", json={"email": "employee@example.com", "password": DEV_PASSWORD})
    assert r.status_code == 403 and r.content == b""


def test_ac022_validation_422_per_field(client):
    r = client.post("/auth/login", json={"email": "nope"}, headers=H)
    assert r.status_code == 422
    assert r.json()["errors"] == {
        "email": "Enter a valid email address.",
        "password": "This field is required.",
    }


def test_ac022_require_role_403_empty_and_executive_cannot_mutate(client):
    guard = Depends(require_role("hr_admin", "executive"))
    if not any(getattr(r, "path", "") == "/_t/hr" for r in app.routes):
        app.get("/_t/hr")(lambda e=guard: {"ok": 1})
        app.post("/_t/hr")(lambda e=guard: {"ok": 1})
    login(client, "employee@example.com")
    r = client.get("/_t/hr")
    assert r.status_code == 403 and r.content == b""
    client.cookies.clear()
    login(client, "executive@example.com")
    assert client.get("/_t/hr").status_code == 200
    r = client.post("/_t/hr", headers=H)
    assert r.status_code == 403 and r.content == b""
    client.cookies.clear()
    login(client, "hr.admin@example.com")
    assert client.post("/_t/hr", headers=H).status_code == 200
