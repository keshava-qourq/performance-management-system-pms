"""QA coverage for goal alignment and company/department levels
(US-013: AC-048..AC-054, NFR-001, NFR-015). Real PostgreSQL, no mocks.

Contract: POST/PATCH /goals accept parent_goal_id, level, department_id;
GET /goals/parent-options -> [{id, title, level}]; GET /goals/{id} ->
{goal{parent_title}, children[{owner, progress, status}], ...}.
"""

import time
import uuid
from datetime import date, timedelta

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import text

from app.auth import hash_password
from app.database import SessionLocal
from app.main import app
from app.seed import DEV_PASSWORD
from tests.conftest import H, login

HR = "hr.admin@example.com"
MANAGER = "manager@example.com"
EMPLOYEE = "employee@example.com"
PREFIX = "qa-align-"
FUTURE = (date.today() + timedelta(days=30)).isoformat()


@pytest.fixture(autouse=True)
def _clean():
    yield
    with SessionLocal() as db:
        db.execute(text("DELETE FROM audit_event WHERE entity_type = 'goal'"))
        db.execute(text("UPDATE goal SET parent_goal_id = NULL"))
        db.execute(text("DELETE FROM goal"))
        db.execute(text("UPDATE employee SET manager_id = NULL"))
        db.execute(text("DELETE FROM employee WHERE work_email LIKE :p"), {"p": PREFIX + "%"})
        db.execute(text("DELETE FROM department WHERE name LIKE :p"), {"p": "QA Align %"})
        db.commit()


def _body(**over):
    p = {
        "title": "Aligned goal",
        "target": "Measurable result",
        "due_date": FUTURE,
        "weighting": 10,
    }
    p.update(over)
    return p


def _create(client, **over):
    r = client.post("/goals", json=_body(**over), headers=H)
    assert r.status_code == 201, r.text
    return r.json()


def _detail(client, goal_id):
    r = client.get(f"/goals/{goal_id}")
    assert r.status_code == 200, r.text
    return r.json()


def _count(sql, **p):
    with SessionLocal() as db:
        return db.execute(text(sql), p).scalar()


def _by_email(client, email):
    return next(e for e in client.get("/employees").json() if e["work_email"] == email)


def _other_dept_user(email_tag):
    """A signed-in-able employee in a brand-new department. Returns (email, dept_id)."""
    dept_id, emp_id = uuid.uuid4(), uuid.uuid4()
    email = f"{PREFIX}{email_tag}@example.com"
    with SessionLocal() as db:
        db.execute(
            text("INSERT INTO department (id, name) VALUES (:i, :n)"),
            {"i": dept_id, "n": f"QA Align {email_tag}"},
        )
        title = db.execute(text("SELECT id FROM job_title LIMIT 1")).scalar()
        db.execute(
            text(
                "INSERT INTO employee (id, full_name, work_email, role, status, deactivated,"
                " department_id, job_title_id, password_hash, updated_at) VALUES (:i, :n, :e,"
                " 'employee', 'active', false, :d, :t, :h, now())"
            ),
            {
                "i": emp_id,
                "n": f"Align {email_tag}",
                "e": email,
                "d": dept_id,
                "t": title,
                "h": hash_password(DEV_PASSWORD),
            },
        )
        db.commit()
    return email, str(dept_id)


def _hr_dept_id(client):
    return _by_email(client, HR)["department"]["id"]


# --------------------------------------------------------------------- AC-048


def test_ac048_parent_set_on_create_and_parent_title_returned(client):
    login(client, HR)
    parent = _create(client, title="Parent P", level="company")
    client.cookies.clear()
    login(client, EMPLOYEE)
    child = _create(client, title="Child C", parent_goal_id=parent["id"])
    assert child["parent_goal_id"] == parent["id"]
    assert child["parent_title"] == "Parent P"
    assert _detail(client, child["id"])["goal"]["parent_title"] == "Parent P"
    row = next(g for g in client.get("/goals").json()["goals"] if g["id"] == child["id"])
    assert row["parent_title"] == "Parent P"


def test_ac048_parent_set_and_cleared_on_edit(client):
    login(client, EMPLOYEE)
    parent = _create(client, title="Edit Parent")
    child = _create(client, title="Edit Child")
    assert child.get("parent_title") in (None, "")
    r = client.patch(f"/goals/{child['id']}", json={"parent_goal_id": parent["id"]}, headers=H)
    assert r.status_code == 200, r.text
    assert r.json()["parent_title"] == "Edit Parent"
    r = client.patch(f"/goals/{child['id']}", json={"parent_goal_id": None}, headers=H)
    assert r.status_code == 200, r.text
    assert r.json().get("parent_title") in (None, "")


# --------------------------------------------------------------------- AC-049


def test_ac049_children_list_only_contains_children_the_caller_may_view(client):
    login(client, HR)
    parent = _create(client, title="Shared Parent", level="company")
    client.cookies.clear()

    login(client, EMPLOYEE)
    child = _create(client, title="Emi child", parent_goal_id=parent["id"], progress=0)
    client.post(
        f"/goals/{child['id']}/progress", json={"progress": 40, "status": "On track"}, headers=H
    )
    client.cookies.clear()

    # Manager who is NOT in Emi's chain: does not see Emi's child.
    login(client, MANAGER)
    assert [c["id"] for c in _detail(client, parent["id"])["children"]] == []
    client.cookies.clear()

    # Put the manager in the owner's chain.
    login(client, HR)
    emp, mgr = _by_email(client, EMPLOYEE), _by_email(client, MANAGER)
    r = client.put(f"/employees/{emp['id']}/manager", json={"manager_id": mgr["id"]}, headers=H)
    assert r.status_code == 200, r.text
    hr_children = _detail(client, parent["id"])["children"]
    assert [c["id"] for c in hr_children] == [child["id"]]
    c = hr_children[0]
    assert c["owner"]["full_name"] == "Emi Employee"
    assert c["progress"] == 40 and c["status"] == "On track"
    client.cookies.clear()

    login(client, MANAGER)
    assert [c["id"] for c in _detail(client, parent["id"])["children"]] == [child["id"]]


def test_ac049_a_peer_without_a_chain_link_does_not_see_the_child(client):
    login(client, HR)
    parent = _create(client, title="Peer Parent", level="company")
    client.cookies.clear()
    login(client, EMPLOYEE)
    _create(client, title="Hidden child", parent_goal_id=parent["id"])
    client.cookies.clear()
    email, _ = _other_dept_user("peer")
    login(client, email)
    r = client.get(f"/goals/{parent['id']}")
    assert r.status_code == 200, r.text
    assert r.json()["children"] == []


# --------------------------------------------------------------------- AC-050


def _assert_loop_refused(r):
    assert r.status_code == 422, r.text
    assert "parent_goal_id" in r.json()["errors"]


def test_ac050_self_parent_is_422_and_persists_nothing(client):
    login(client, EMPLOYEE)
    g = _create(client, title="Self")
    _assert_loop_refused(
        client.patch(f"/goals/{g['id']}", json={"parent_goal_id": g["id"]}, headers=H)
    )
    assert _count("SELECT count(*) FROM goal WHERE parent_goal_id IS NOT NULL") == 0
    assert _detail(client, g["id"])["goal"].get("parent_goal_id") in (None, "")


def test_ac050_two_goal_loop_is_422_and_persists_nothing(client):
    login(client, EMPLOYEE)
    a = _create(client, title="A")
    b = _create(client, title="B", parent_goal_id=a["id"])
    _assert_loop_refused(
        client.patch(f"/goals/{a['id']}", json={"parent_goal_id": b["id"]}, headers=H)
    )
    assert _count("SELECT count(*) FROM goal WHERE parent_goal_id IS NOT NULL") == 1
    assert _detail(client, a["id"])["goal"].get("parent_goal_id") in (None, "")


def test_ac050_three_goal_loop_is_422_and_persists_nothing(client):
    login(client, EMPLOYEE)
    a = _create(client, title="A")
    b = _create(client, title="B", parent_goal_id=a["id"])
    c = _create(client, title="C", parent_goal_id=b["id"])
    _assert_loop_refused(
        client.patch(f"/goals/{a['id']}", json={"parent_goal_id": c["id"]}, headers=H)
    )
    assert _count("SELECT count(*) FROM goal WHERE parent_goal_id IS NOT NULL") == 2
    assert _detail(client, a["id"])["goal"].get("parent_goal_id") in (None, "")


# --------------------------------------------------------------------- AC-051


def test_ac051_hr_delete_of_a_parent_with_children_is_409_until_unlinked(client):
    login(client, EMPLOYEE)
    parent = _create(client, title="Del Parent")
    child = _create(client, title="Del Child", parent_goal_id=parent["id"])
    client.cookies.clear()

    login(client, HR)
    r = client.delete(f"/goals/{parent['id']}", headers=H)
    assert r.status_code == 409, r.text
    assert _detail(client, parent["id"])["goal"]["id"] == parent["id"]

    r = client.patch(f"/goals/{child['id']}", json={"parent_goal_id": None}, headers=H)
    assert r.status_code == 200, r.text
    assert client.delete(f"/goals/{parent['id']}", headers=H).status_code == 204
    assert client.get(f"/goals/{parent['id']}").status_code == 404


# --------------------------------------------------------------------- AC-052


def test_ac052_hr_creates_company_and_department_goals_listed_in_parent_options(client):
    login(client, HR)
    dept = _hr_dept_id(client)
    company = _create(client, title="Company G", level="company")
    assert company["level"] == "company"
    r = client.post("/goals", json=_body(title="Dept no id", level="department"), headers=H)
    assert r.status_code == 422 and "department_id" in r.json()["errors"]
    assert _count("SELECT count(*) FROM goal WHERE title = 'Dept no id'") == 0
    dg = _create(client, title="Dept G", level="department", department_id=dept)
    assert dg["level"] == "department"
    opts = client.get("/goals/parent-options")
    assert opts.status_code == 200, opts.text
    by_id = {o["id"]: o for o in opts.json()}
    assert by_id[company["id"]]["level"] == "company"
    assert by_id[dg["id"]]["level"] == "department"
    assert by_id[dg["id"]]["title"] == "Dept G"


# --------------------------------------------------------------------- AC-053


def test_ac053_employee_sees_company_and_own_department_goals_only(client):
    login(client, HR)
    own_dept = _by_email(client, EMPLOYEE)["department"]["id"]
    other_email, other_dept = _other_dept_user("other")
    company = _create(client, title="Co Goal", level="company")
    mine = _create(client, title="My Dept Goal", level="department", department_id=own_dept)
    theirs = _create(client, title="Other Dept Goal", level="department", department_id=other_dept)
    client.cookies.clear()

    login(client, EMPLOYEE)
    ids = {o["id"] for o in client.get("/goals/parent-options").json()}
    assert company["id"] in ids and mine["id"] in ids
    assert theirs["id"] not in ids
    client.cookies.clear()

    login(client, other_email)
    ids = {o["id"] for o in client.get("/goals/parent-options").json()}
    assert company["id"] in ids and theirs["id"] in ids
    assert mine["id"] not in ids


# --------------------------------------------------------------------- AC-054


@pytest.mark.parametrize("email", [EMPLOYEE, MANAGER])
@pytest.mark.parametrize("level", ["company", "department"])
def test_ac054_non_hr_cannot_create_company_or_department_goals(client, email, level):
    login(client, email)
    dept = _by_email_dept(client)
    r = client.post("/goals", json=_body(title="Nope", level=level, department_id=dept), headers=H)
    assert r.status_code == 403 and r.content == b"", r.text
    assert _count("SELECT count(*) FROM goal WHERE title = 'Nope'") == 0


def _by_email_dept(client):
    return client.get("/auth/me").json().get("department_id") or str(uuid.uuid4())


# ------------------------------------------------------------ NFR-001 / NFR-015


def test_nfr001_non_hr_cannot_reach_another_departments_goal_by_id(client):
    login(client, HR)
    _, other_dept = _other_dept_user("hidden")
    dg = _create(client, title="Hidden Dept Goal", level="department", department_id=other_dept)
    client.cookies.clear()
    login(client, EMPLOYEE)
    r = client.get(f"/goals/{dg['id']}")
    assert r.status_code in (403, 404), r.text
    assert "Hidden Dept Goal" not in r.text
    assert client.patch(f"/goals/{dg['id']}", json={"title": "X"}, headers=H).status_code in (
        403,
        404,
    )


def test_nfr015_parent_options_with_200_employees_responds_in_time(client):
    login(client, HR)
    dept = _hr_dept_id(client)
    title = client.get("/job-titles").json()[0]["id"]
    with SessionLocal() as db:
        for i in range(200):
            nid = uuid.uuid4()
            db.execute(
                text(
                    "INSERT INTO employee (id, full_name, work_email, role, status, deactivated,"
                    " department_id, job_title_id, updated_at) VALUES (:i, :n, :e, 'employee',"
                    " 'active', false, :d, :t, now())"
                ),
                {
                    "i": nid,
                    "n": f"Align Bulk {i:03d}",
                    "e": f"{PREFIX}{nid.hex}@example.com",
                    "d": dept,
                    "t": title,
                },
            )
        db.commit()
    for i in range(10):
        _create(client, title=f"Co {i}", level="company")
    client.cookies.clear()
    login(client, EMPLOYEE)
    started = time.monotonic()
    r = client.get("/goals/parent-options")
    elapsed = time.monotonic() - started
    assert r.status_code == 200, r.text
    assert len(r.json()) >= 10
    assert elapsed < 10, f"parent-options took {elapsed:.1f}s"


def test_fresh_client_helper_is_importable():
    assert TestClient and app
