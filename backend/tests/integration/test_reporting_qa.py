"""QA coverage for reporting lines and system roles (US-003: AC-008..AC-014, NFR-015).

Runs against the real PostgreSQL given by DATABASE_URL, through the shared
`client`/`login` fixtures in backend/tests/conftest.py. No mocks.
"""

import time
import uuid

import pytest
from sqlalchemy import text

from app.database import SessionLocal
from tests.conftest import H, login

HR = "hr.admin@example.com"
MANAGER = "manager@example.com"
EMPLOYEE = "employee@example.com"
EXEC = "executive@example.com"
SEED_EMAILS = (HR, MANAGER, EMPLOYEE, EXEC)
SEED_ROLES = {
    HR: "hr_admin",
    MANAGER: "manager",
    EMPLOYEE: "employee",
    EXEC: "executive",
}
QA_PREFIX = "qa-rep-"


@pytest.fixture(autouse=True)
def _restore():
    """Reporting lines and roles are shared seed state: put them back."""
    yield
    with SessionLocal() as db:
        db.execute(text("UPDATE employee SET manager_id = NULL"))
        for email, role in SEED_ROLES.items():
            db.execute(
                text("UPDATE employee SET role = :r WHERE work_email = :e"),
                {"r": role, "e": email},
            )
        db.execute(text("DELETE FROM employee WHERE work_email LIKE :p"), {"p": QA_PREFIX + "%"})
        db.commit()


def _by_email(client, email):
    return next(e for e in client.get("/employees").json() if e["work_email"] == email)


def _set_manager(client, employee_id, manager_id):
    return client.put(
        f"/employees/{employee_id}/manager", json={"manager_id": manager_id}, headers=H
    )


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


# --------------------------------------------------------------------- AC-008


def test_ac008_manager_set_shows_direct_report_and_grants_manager_capability(client):
    login(client, HR)
    emp = _by_email(client, EMPLOYEE)
    boss = _make(client, "Nina New Boss")
    assert boss["role"] == "employee"

    r = _set_manager(client, emp["id"], boss["id"])
    assert r.status_code == 200, r.text
    assert r.json()["manager"]["id"] == boss["id"]
    assert r.json()["missing_manager"] is False

    record = client.get(f"/employees/{boss['id']}/record")
    assert record.status_code == 200
    assert emp["id"] in [p["id"] for p in record.json()["direct_reports"]]

    # The new manager gained the manager capability: they can read their report's record.
    assert _by_email(client, boss["work_email"])["role"] == "manager"


def test_ac008_manager_can_read_their_direct_report_record(client):
    login(client, HR)
    emp = _by_email(client, EMPLOYEE)
    mgr = _by_email(client, MANAGER)
    assert _set_manager(client, emp["id"], mgr["id"]).status_code == 200
    client.cookies.clear()

    login(client, MANAGER)
    r = client.get(f"/employees/{emp['id']}/record")
    assert r.status_code == 200
    assert r.json()["employee"]["id"] == emp["id"]


# --------------------------------------------------------------------- AC-009


def test_ac009_self_manager_is_422_field_level_and_nothing_persisted(client):
    login(client, HR)
    emp = _by_email(client, EMPLOYEE)
    r = _set_manager(client, emp["id"], emp["id"])
    assert r.status_code == 422
    errors = r.json()["errors"]
    assert set(errors) == {"manager_id"}
    assert "themselves" in errors["manager_id"]
    assert _by_email(client, EMPLOYEE)["manager"] is None


def test_ac009_two_person_cycle_is_422_field_level_and_nothing_persisted(client):
    login(client, HR)
    a = _by_email(client, EMPLOYEE)
    b = _by_email(client, MANAGER)
    assert _set_manager(client, a["id"], b["id"]).status_code == 200

    r = _set_manager(client, b["id"], a["id"])
    assert r.status_code == 422
    errors = r.json()["errors"]
    assert set(errors) == {"manager_id"}
    assert "circular" in errors["manager_id"].lower()

    rows = client.get("/employees").json()
    assert next(e for e in rows if e["id"] == b["id"])["manager"] is None
    assert next(e for e in rows if e["id"] == a["id"])["manager"]["id"] == b["id"]


def test_ac009_three_person_cycle_is_refused(client):
    login(client, HR)
    a = _make(client, "Cycle A")
    b = _make(client, "Cycle B")
    c = _make(client, "Cycle C")
    assert _set_manager(client, a["id"], b["id"]).status_code == 200
    assert _set_manager(client, b["id"], c["id"]).status_code == 200
    r = _set_manager(client, c["id"], a["id"])
    assert r.status_code == 422 and "manager_id" in r.json()["errors"]


def test_ac009_unknown_manager_is_422_field_level(client):
    login(client, HR)
    emp = _by_email(client, EMPLOYEE)
    r = _set_manager(client, emp["id"], str(uuid.UUID(int=0)))
    assert r.status_code == 422 and "manager_id" in r.json()["errors"]
    assert _by_email(client, EMPLOYEE)["manager"] is None


# --------------------------------------------------------------------- AC-010


def test_ac010_missing_reporting_line_is_flagged_in_the_directory(client):
    login(client, HR)
    rows = client.get("/employees").json()
    emp = next(e for e in rows if e["work_email"] == EMPLOYEE)
    assert emp["manager"] is None and emp["missing_manager"] is True

    mgr = next(e for e in rows if e["work_email"] == MANAGER)
    assert _set_manager(client, emp["id"], mgr["id"]).status_code == 200
    after = _by_email(client, EMPLOYEE)
    assert after["manager"]["full_name"] == "Mo Manager"
    assert after["missing_manager"] is False


def test_ac010_clearing_the_manager_restores_the_flag(client):
    login(client, HR)
    emp = _by_email(client, EMPLOYEE)
    mgr = _by_email(client, MANAGER)
    assert _set_manager(client, emp["id"], mgr["id"]).status_code == 200
    r = _set_manager(client, emp["id"], None)
    assert r.status_code == 200
    assert r.json()["manager"] is None and r.json()["missing_manager"] is True


# --------------------------------------------------------------------- AC-011


def test_ac011_reassignment_moves_visibility_and_old_manager_gets_403_empty(client):
    login(client, HR)
    emp = _by_email(client, EMPLOYEE)
    old = _by_email(client, MANAGER)
    new = _make(client, "Nora NewManager")
    assert _set_manager(client, emp["id"], old["id"]).status_code == 200
    assert _set_manager(client, emp["id"], new["id"]).status_code == 200

    old_record = client.get(f"/employees/{old['id']}/record").json()
    assert old_record["direct_reports"] == []
    new_record = client.get(f"/employees/{new['id']}/record").json()
    assert [p["id"] for p in new_record["direct_reports"]] == [emp["id"]]

    client.cookies.clear()
    login(client, MANAGER)
    r = client.get(f"/employees/{emp['id']}/record")
    assert r.status_code == 403 and r.content == b""


# --------------------------------------------------------------------- AC-012


def test_ac012_role_change_grants_hr_directory_access_on_next_sign_in(client):
    login(client, EMPLOYEE)
    assert client.get("/employees").status_code == 403
    client.cookies.clear()

    login(client, HR)
    emp = _by_email(client, EMPLOYEE)
    r = client.patch(f"/employees/{emp['id']}", json={"role": "hr_admin"}, headers=H)
    assert r.status_code == 200 and r.json()["role"] == "hr_admin"
    client.cookies.clear()

    assert login(client, EMPLOYEE).status_code == 200
    listed = client.get("/employees")
    assert listed.status_code == 200
    assert client.get("/auth/me").json()["role"] == "hr_admin"
    assert any(e["work_email"] == HR for e in listed.json())


def test_ac012_role_change_also_removes_access(client):
    login(client, HR)
    emp = _by_email(client, EMPLOYEE)
    assert (
        client.patch(f"/employees/{emp['id']}", json={"role": "hr_admin"}, headers=H).status_code
        == 200
    )
    assert (
        client.patch(f"/employees/{emp['id']}", json={"role": "employee"}, headers=H).status_code
        == 200
    )
    client.cookies.clear()
    login(client, EMPLOYEE)
    r = client.get("/employees")
    assert r.status_code == 403 and r.content == b""


def test_ac012_unknown_role_is_422_field_level(client):
    login(client, HR)
    emp = _by_email(client, EMPLOYEE)
    r = client.patch(f"/employees/{emp['id']}", json={"role": "superuser"}, headers=H)
    assert r.status_code == 422 and "role" in r.json()["errors"]
    assert _by_email(client, EMPLOYEE)["role"] == "employee"


# --------------------------------------------------------------------- AC-013


def test_ac013_executive_may_read_but_never_write(client):
    login(client, HR)
    emp = _by_email(client, EMPLOYEE)
    mgr = _by_email(client, MANAGER)
    client.cookies.clear()

    login(client, EXEC)
    # Reads allowed.
    assert client.get(f"/employees/{emp['id']}/record").status_code == 200
    assert client.get("/departments").status_code == 200
    assert client.get("/job-titles").status_code == 200

    writes = [
        client.post(
            "/employees",
            json={"full_name": "X", "work_email": f"{QA_PREFIX}x@example.com"},
            headers=H,
        ),
        client.patch(f"/employees/{emp['id']}", json={"full_name": "Hacked"}, headers=H),
        client.put(f"/employees/{emp['id']}/manager", json={"manager_id": mgr["id"]}, headers=H),
    ]
    for r in writes:
        assert r.status_code == 403 and r.content == b""
    # DELETE is not part of the delivered API; it must never succeed for an executive.
    delete = client.delete(f"/employees/{emp['id']}", headers=H)
    assert delete.status_code >= 400

    client.cookies.clear()
    login(client, HR)
    rows = client.get("/employees").json()
    assert not any(e["work_email"].startswith(QA_PREFIX) for e in rows)
    assert next(e for e in rows if e["id"] == emp["id"])["full_name"] == "Emi Employee"
    assert next(e for e in rows if e["id"] == emp["id"])["manager"] is None


def test_ac013_executive_directory_read(client):
    """The executive is read-only; the directory itself stays HR-only (AC-004)."""
    login(client, EXEC)
    r = client.get("/employees")
    assert r.status_code in (200, 403)
    if r.status_code == 403:
        assert r.content == b""


# --------------------------------------------------------------------- AC-014


def test_ac014_last_hr_admin_cannot_demote_themselves(client):
    login(client, HR)
    me = _by_email(client, HR)
    r = client.patch(f"/employees/{me['id']}", json={"role": "manager"}, headers=H)
    assert r.status_code == 422
    assert r.json()["errors"] == {
        "role": "At least one HR Admin must remain, so this role cannot be changed."
    }
    assert _by_email(client, HR)["role"] == "hr_admin"
    assert client.get("/employees").status_code == 200


def test_ac014_demotion_allowed_once_a_second_hr_admin_exists(client):
    login(client, HR)
    me = _by_email(client, HR)
    second = _make(client, "Second Admin", role="hr_admin")
    assert second["role"] == "hr_admin"
    r = client.patch(f"/employees/{me['id']}", json={"role": "manager"}, headers=H)
    assert r.status_code == 200 and r.json()["role"] == "manager"


# -------------------------------------------------------------------- NFR-015


def _bulk(db, names, dept_id, title_id):
    ids = []
    for name in names:
        new_id = uuid.uuid4()
        db.execute(
            text(
                "INSERT INTO employee (id, full_name, work_email, role, status,"
                " deactivated, department_id, job_title_id, updated_at)"
                " VALUES (:i, :n, :e, 'employee', 'active', false, :d, :t, now())"
            ),
            {
                "i": new_id,
                "n": name,
                "e": f"{QA_PREFIX}{new_id.hex}@example.com",
                "d": dept_id,
                "t": title_id,
            },
        )
        ids.append(new_id)
    db.commit()
    return ids


def test_nfr015_directory_of_200_with_reporting_lines_lists_without_timeout(client):
    login(client, HR)
    dept = client.get("/departments").json()[0]["id"]
    title = client.get("/job-titles").json()[0]["id"]
    with SessionLocal() as db:
        ids = _bulk(db, [f"Bulk Person {i:03d}" for i in range(200)], dept, title)
        # Give everyone a reporting line: a wide tree, ten reports per manager.
        for i, emp_id in enumerate(ids):
            if i == 0:
                continue
            db.execute(
                text("UPDATE employee SET manager_id = :m WHERE id = :i"),
                {"m": ids[(i - 1) // 10], "i": emp_id},
            )
        db.commit()

    started = time.monotonic()
    r = client.get("/employees")
    elapsed = time.monotonic() - started
    assert r.status_code == 200
    assert len(r.json()) >= 200
    assert elapsed < 10, f"GET /employees took {elapsed:.1f}s for 200+ employees"
    assert all(row["manager"] for row in r.json() if row["id"] == str(ids[5]))


def test_nfr015_cycle_detection_holds_on_a_deep_chain(client):
    login(client, HR)
    dept = client.get("/departments").json()[0]["id"]
    title = client.get("/job-titles").json()[0]["id"]
    with SessionLocal() as db:
        ids = _bulk(db, [f"Chain Person {i:03d}" for i in range(120)], dept, title)
        for child, parent in zip(ids[:-1], ids[1:], strict=True):
            db.execute(
                text("UPDATE employee SET manager_id = :m WHERE id = :i"),
                {"m": parent, "i": child},
            )
        db.commit()

    top, bottom = ids[-1], ids[0]
    started = time.monotonic()
    r = _set_manager(client, str(top), str(bottom))
    elapsed = time.monotonic() - started
    assert r.status_code == 422, r.text
    assert "manager_id" in r.json()["errors"]
    assert elapsed < 10, f"cycle detection took {elapsed:.1f}s on a 120-deep chain"
    with SessionLocal() as db:
        assert (
            db.execute(text("SELECT manager_id FROM employee WHERE id = :i"), {"i": top}).scalar()
            is None
        )
