"""QA coverage for leaver deactivation (US-005: AC-015..AC-017, NFR-003, NFR-010, NFR-015).

Runs against the real PostgreSQL given by DATABASE_URL through the shared
`client`/`login` fixtures in backend/tests/conftest.py. No mocks.
"""

import time
import uuid
from datetime import date

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import text

from app.database import SessionLocal
from app.main import app
from tests.conftest import H, login

HR = "hr.admin@example.com"
MANAGER = "manager@example.com"
EMPLOYEE = "employee@example.com"
EXEC = "executive@example.com"
SEED_ROLES = {HR: "hr_admin", MANAGER: "manager", EMPLOYEE: "employee", EXEC: "executive"}
QA_PREFIX = "qa-leaver-"
GENERIC = "The email or password is incorrect."
LEAVING = date(2026, 6, 30).isoformat()


@pytest.fixture(autouse=True)
def _restore():
    """Reporting lines, roles and leaver columns are shared seed state."""
    yield
    with SessionLocal() as db:
        db.execute(
            text(
                "UPDATE employee SET manager_id = NULL, leaving_date = NULL, deactivated_at = NULL"
            )
        )
        for email, role in SEED_ROLES.items():
            db.execute(
                text("UPDATE employee SET role = :r WHERE work_email = :e"),
                {"r": role, "e": email},
            )
        db.execute(
            text(
                "DELETE FROM audit_event WHERE actor_id IN"
                " (SELECT id FROM employee WHERE work_email LIKE :p)"
                " OR subject_employee_id IN"
                " (SELECT id FROM employee WHERE work_email LIKE :p)"
                " OR entity_id IN (SELECT id FROM employee WHERE work_email LIKE :p)"
            ),
            {"p": QA_PREFIX + "%"},
        )
        db.execute(
            text(
                "DELETE FROM session WHERE employee_id IN"
                " (SELECT id FROM employee WHERE work_email LIKE :p)"
            ),
            {"p": QA_PREFIX + "%"},
        )
        db.execute(
            text(
                "DELETE FROM failed_login_attempt WHERE employee_id IN"
                " (SELECT id FROM employee WHERE work_email LIKE :p)"
            ),
            {"p": QA_PREFIX + "%"},
        )
        db.execute(text("DELETE FROM employee WHERE work_email LIKE :p"), {"p": QA_PREFIX + "%"})
        db.commit()


def _fresh_client():
    return TestClient(app, base_url="https://testserver")


def _by_email(client, email):
    return next(e for e in client.get("/employees").json() if e["work_email"] == email)


def _make(client, name, **over):
    d = client.get("/departments").json()
    t = client.get("/job-titles").json()
    body = {
        "full_name": name,
        "work_email": f"{QA_PREFIX}{name.lower().replace(' ', '-')}@example.com",
        "job_title_id": t[0]["id"],
        "department_id": d[0]["id"],
    }
    body.update(over)
    r = client.post("/employees", json=body, headers=H)
    assert r.status_code == 201, r.text
    return r.json()


def _set_manager(client, employee_id, manager_id):
    return client.put(
        f"/employees/{employee_id}/manager", json={"manager_id": manager_id}, headers=H
    )


def _deactivate(client, employee_id, leaving_date=LEAVING, reassign=None):
    body = {"leaving_date": leaving_date}
    if reassign is not None:
        body["reassign_manager_id"] = reassign
    return client.post(f"/employees/{employee_id}/deactivate", json=body, headers=H)


def _count(sql, **params):
    with SessionLocal() as db:
        return db.execute(text(sql), params).scalar()


# --------------------------------------------------------------------- AC-015


def test_ac015_deactivation_ends_the_leavers_sessions_at_once(client):
    leaver = _fresh_client()
    assert login(leaver, EMPLOYEE).status_code == 200
    assert leaver.get("/auth/me").status_code == 200

    login(client, HR)
    target = _by_email(client, EMPLOYEE)
    r = _deactivate(client, target["id"])
    assert r.status_code == 200, r.text
    assert r.json()["account_status"] == "deactivated"
    assert r.json()["leaving_date"] == LEAVING

    # The open session is gone with no further request needed to revoke it.
    assert leaver.get("/auth/me").status_code == 401
    assert (
        _count(
            "SELECT count(*) FROM session WHERE employee_id = :i AND revoked_at IS NULL",
            i=target["id"],
        )
        == 0
    )


def test_ac015_next_sign_in_is_refused_with_the_generic_message(client):
    login(client, HR)
    target = _by_email(client, EMPLOYEE)
    assert _deactivate(client, target["id"]).status_code == 200

    other = _fresh_client()
    refused = login(other, EMPLOYEE)
    unknown = login(other, "ghost-nobody@example.com")
    assert refused.status_code == 401 and refused.json() == {"detail": GENERIC}
    # No account enumeration: a deactivated account answers exactly like an unknown one.
    assert refused.content == unknown.content
    assert refused.status_code == unknown.status_code
    assert (
        _count(
            "SELECT count(*) FROM session WHERE employee_id = :i AND revoked_at IS NULL",
            i=target["id"],
        )
        == 0
    )


def test_ac015_deactivated_employee_is_absent_from_active_pickers(client):
    login(client, HR)
    target = _by_email(client, EMPLOYEE)
    assert any(e["id"] == target["id"] for e in client.get("/employees?active_only=true").json())

    assert _deactivate(client, target["id"]).status_code == 200

    active = client.get("/employees?active_only=true").json()
    assert all(e["id"] != target["id"] for e in active)
    # ...but the full directory still lists them, marked as a leaver.
    row = next(e for e in client.get("/employees").json() if e["id"] == target["id"])
    assert row["account_status"] == "deactivated" and row["leaving_date"] == LEAVING


# --------------------------------------------------------------------- AC-016


def test_ac016_history_is_returned_unchanged_after_deactivation(client):
    login(client, HR)
    target = _by_email(client, EMPLOYEE)
    before = client.get(f"/employees/{target['id']}/record").json()
    assert before["employee"]["id"] == target["id"]

    assert _deactivate(client, target["id"]).status_code == 200

    after = client.get(f"/employees/{target['id']}/record").json()
    for key in ("goals", "self_reviews", "feedback"):
        assert key in after, f"record no longer returns {key} for a deactivated employee"
        assert after[key] == before[key], f"{key} changed when the employee was deactivated"
    assert after["employee"]["full_name"] == before["employee"]["full_name"]


def test_ac016_no_endpoint_deletes_an_employee_or_their_history(client):
    login(client, HR)
    target = _by_email(client, EMPLOYEE)
    assert _deactivate(client, target["id"]).status_code == 200

    for r in (
        client.delete(f"/employees/{target['id']}", headers=H),
        client.delete(f"/employees/{target['id']}/record", headers=H),
    ):
        assert r.status_code >= 400, "a delete endpoint exists for employee records"
    assert client.get(f"/employees/{target['id']}/record").status_code == 200


def test_ac016_record_stays_readable_by_the_executive(client):
    login(client, HR)
    target = _by_email(client, EMPLOYEE)
    assert _deactivate(client, target["id"]).status_code == 200
    client.cookies.clear()

    login(client, EXEC)
    r = client.get(f"/employees/{target['id']}/record")
    assert r.status_code == 200
    assert r.json()["employee"]["account_status"] == "deactivated"


# --------------------------------------------------------------------- AC-017


def test_ac017_outstanding_direct_reports_block_deactivation_and_name_them(client):
    login(client, HR)
    leaver = _make(client, "Lena Leaver")
    report_a = _make(client, "Rory Report")
    report_b = _make(client, "Remy Report")
    for r in (report_a, report_b):
        assert _set_manager(client, r["id"], leaver["id"]).status_code == 200

    r = _deactivate(client, leaver["id"])
    assert r.status_code == 422, r.text
    message = r.json()["errors"]["reassign_manager_id"]
    assert "Rory Report" in message and "Remy Report" in message

    # Nothing changed: the leaver is still active and still manages them.
    row = _by_email(client, leaver["work_email"])
    assert row["account_status"] == "active" and row["leaving_date"] is None
    reports = client.get(f"/employees/{leaver['id']}/record").json()["direct_reports"]
    assert {p["id"] for p in reports} == {report_a["id"], report_b["id"]}


def test_ac017_reassignment_and_deactivation_complete_atomically(client):
    login(client, HR)
    leaver = _make(client, "Lara Leaver")
    report_a = _make(client, "Ada Report")
    report_b = _make(client, "Bo Report")
    successor = _make(client, "Sam Successor")
    for r in (report_a, report_b):
        assert _set_manager(client, r["id"], leaver["id"]).status_code == 200

    r = _deactivate(client, leaver["id"], reassign=successor["id"])
    assert r.status_code == 200, r.text
    assert r.json()["account_status"] == "deactivated"

    rows = {e["id"]: e for e in client.get("/employees").json()}
    assert rows[report_a["id"]]["manager"]["id"] == successor["id"]
    assert rows[report_b["id"]]["manager"]["id"] == successor["id"]
    assert rows[successor["id"]]["role"] == "manager"
    assert client.get(f"/employees/{leaver['id']}/record").json()["direct_reports"] == []


@pytest.mark.parametrize(
    "case",
    ["unknown_manager", "deactivated_manager", "circular", "self"],
)
def test_ac017_a_failed_reassignment_leaves_the_employee_active(client, case):
    login(client, HR)
    leaver = _make(client, f"Fail Leaver {case}".replace("_", " "))
    report = _make(client, f"Fail Report {case}".replace("_", " "))
    assert _set_manager(client, report["id"], leaver["id"]).status_code == 200

    if case == "unknown_manager":
        target = str(uuid.UUID(int=0))
    elif case == "deactivated_manager":
        gone = _make(client, f"Gone Manager {case}".replace("_", " "))
        assert _deactivate(client, gone["id"]).status_code == 200
        target = gone["id"]
    elif case == "circular":
        target = report["id"]  # the report cannot become their own manager
    else:
        target = leaver["id"]

    r = _deactivate(client, leaver["id"], reassign=target)
    assert r.status_code == 422, r.text
    assert "reassign_manager_id" in r.json()["errors"]

    rows = {e["id"]: e for e in client.get("/employees").json()}
    assert rows[leaver["id"]]["account_status"] == "active"
    assert rows[leaver["id"]]["leaving_date"] is None
    assert rows[report["id"]]["manager"]["id"] == leaver["id"]
    assert (
        _count(
            "SELECT count(*) FROM audit_event WHERE action = 'employee_deactivated'"
            " AND subject_employee_id = :i",
            i=leaver["id"],
        )
        == 0
    ), "an audit event was written for a deactivation that was refused"


def test_ac017_only_hr_can_deactivate(client):
    login(client, HR)
    target = _by_email(client, EMPLOYEE)
    client.cookies.clear()

    for email in (MANAGER, EXEC):
        login(client, email)
        r = _deactivate(client, target["id"])
        assert r.status_code == 403 and r.content == b""
        client.cookies.clear()

    login(client, HR)
    assert _by_email(client, EMPLOYEE)["account_status"] == "active"


def test_ac017_leaving_date_is_required_and_field_level(client):
    login(client, HR)
    target = _by_email(client, EMPLOYEE)
    r = client.post(f"/employees/{target['id']}/deactivate", json={}, headers=H)
    assert r.status_code == 422
    assert "leaving_date" in r.json()["errors"]
    assert _by_email(client, EMPLOYEE)["account_status"] == "active"


# -------------------------------------------------------------------- NFR-010


def test_nfr010_nothing_is_hard_deleted_and_the_audit_event_is_complete(client):
    login(client, HR)
    actor = _by_email(client, HR)
    target = _by_email(client, EMPLOYEE)
    before = _count("SELECT count(*) FROM employee")

    assert _deactivate(client, target["id"]).status_code == 200

    assert _count("SELECT count(*) FROM employee") == before
    assert _count("SELECT count(*) FROM employee WHERE id = :i", i=target["id"]) == 1, (
        "the leaver row was hard-deleted"
    )

    with SessionLocal() as db:
        row = db.execute(
            text(
                "SELECT actor_id, subject_employee_id, entity_type, details FROM audit_event"
                " WHERE action = 'employee_deactivated' AND subject_employee_id = :i"
            ),
            {"i": target["id"]},
        ).one()
    assert str(row.actor_id) == actor["id"]
    assert str(row.subject_employee_id) == target["id"]
    assert row.entity_type == "employee"
    assert row.details["leaving_date"] == LEAVING


def test_nfr010_a_second_deactivation_is_idempotent_and_keeps_the_record(client):
    login(client, HR)
    target = _by_email(client, EMPLOYEE)
    assert _deactivate(client, target["id"]).status_code == 200
    again = _deactivate(client, target["id"], leaving_date="2026-07-31")
    assert again.status_code in (200, 422), again.text
    assert _count("SELECT count(*) FROM employee WHERE id = :i", i=target["id"]) == 1
    assert client.get(f"/employees/{target['id']}/record").status_code == 200


# -------------------------------------------------------------------- NFR-003


def test_nfr003_deactivated_account_is_refused_without_counting_a_failed_attempt(client):
    login(client, HR)
    target = _by_email(client, EMPLOYEE)
    assert _deactivate(client, target["id"]).status_code == 200
    client.cookies.clear()

    other = _fresh_client()
    assert login(other, EMPLOYEE).status_code == 401
    assert (
        _count("SELECT count(*) FROM failed_login_attempt WHERE employee_id = :i", i=target["id"])
        == 0
    )
    assert (
        _count(
            "SELECT count(*) FROM session WHERE employee_id = :i AND revoked_at IS NULL",
            i=target["id"],
        )
        == 0
    )


def test_nfr003_a_deactivated_employees_cookie_cannot_be_replayed(client):
    leaver = _fresh_client()
    assert login(leaver, EMPLOYEE).status_code == 200
    token = leaver.cookies.get("session")

    login(client, HR)
    target = _by_email(client, EMPLOYEE)
    assert _deactivate(client, target["id"]).status_code == 200

    replay = _fresh_client()
    replay.cookies.set("session", token)
    assert replay.get("/auth/me").status_code == 401


# -------------------------------------------------------------------- NFR-015


def test_nfr015_a_leaver_with_many_reports_is_reassigned_in_one_request(client):
    login(client, HR)
    leaver = _make(client, "Bulk Leaver")
    successor = _make(client, "Bulk Successor")
    dept = client.get("/departments").json()[0]["id"]
    title = client.get("/job-titles").json()[0]["id"]
    with SessionLocal() as db:
        for i in range(60):
            new_id = uuid.uuid4()
            db.execute(
                text(
                    "INSERT INTO employee (id, full_name, work_email, role, status,"
                    " deactivated, department_id, job_title_id, manager_id, updated_at)"
                    " VALUES (:i, :n, :e, 'employee', 'active', false, :d, :t, :m, now())"
                ),
                {
                    "i": new_id,
                    "n": f"Bulk Report {i:03d}",
                    "e": f"{QA_PREFIX}{new_id.hex}@example.com",
                    "d": dept,
                    "t": title,
                    "m": leaver["id"],
                },
            )
        db.commit()

    started = time.monotonic()
    r = _deactivate(client, leaver["id"], reassign=successor["id"])
    elapsed = time.monotonic() - started
    assert r.status_code == 200, r.text
    assert elapsed < 10, f"deactivating a manager of 60 took {elapsed:.1f}s"
    assert _count("SELECT count(*) FROM employee WHERE manager_id = :i", i=leaver["id"]) == 0
    assert _count("SELECT count(*) FROM employee WHERE manager_id = :i", i=successor["id"]) == 60
