import time
import uuid
from datetime import date, timedelta

import pytest
from sqlalchemy import text

from app.database import SessionLocal
from tests.conftest import H, login

HR = "hr.admin@example.com"
MGR = "manager@example.com"
EMP = "employee@example.com"
EXE = "executive@example.com"
PREFIX = "tg-"
FUTURE = (date.today() + timedelta(days=30)).isoformat()


@pytest.fixture(autouse=True)
def _clean():
    yield
    with SessionLocal() as db:
        db.execute(text("DELETE FROM goal_comment"))
        db.execute(text("UPDATE goal SET parent_goal_id = NULL"))
        db.execute(text("DELETE FROM goal"))
        db.execute(text("UPDATE employee SET manager_id = NULL"))
        db.execute(text("DELETE FROM employee WHERE work_email LIKE :p"), {"p": PREFIX + "%"})
        db.commit()


def _id(email):
    with SessionLocal() as db:
        sql = text("SELECT id FROM employee WHERE work_email=:e")
        return db.execute(sql, {"e": email}).scalar()


def _report(manager_email, employee_email):
    with SessionLocal() as db:
        db.execute(
            text("UPDATE employee SET manager_id=:m WHERE work_email=:e"),
            {"m": _id(manager_email), "e": employee_email},
        )
        db.commit()


def _goal(client, title="G", weighting=10, due=FUTURE):
    r = client.post(
        "/goals",
        json={"title": title, "target": "t", "due_date": due, "weighting": weighting},
        headers=H,
    )
    assert r.status_code == 201, r.text
    return r.json()


def _as(client, email):
    client.cookies.clear()
    login(client, email)


def _comment(client, goal_id, body="x"):
    return client.post(f"/goals/{goal_id}/comments", json={"body": body}, headers=H)


def test_ac055_team_goals_lists_each_direct_report(client):
    _report(MGR, EMP)
    login(client, EMP)
    _goal(client, "A", 70)
    _goal(client, "B", 50, due="2020-01-01")
    _as(client, MGR)
    r = client.get("/team/goals")
    assert r.status_code == 200
    body = r.json()
    assert len(body) == 1
    e = body[0]
    assert e["employee"]["full_name"] == "Emi Employee"
    assert e["weighting_total"] == 120 and e["over_100_warning"] is True
    by = {g["title"]: g for g in e["goals"]}
    assert by["B"]["overdue"] is True and by["A"]["overdue"] is False
    assert {"title", "weighting", "progress", "status", "overdue"} <= set(by["A"])


def test_ac055_manager_without_reports_gets_empty_list(client):
    login(client, MGR)
    r = client.get("/team/goals")
    assert r.status_code == 200 and r.json() == []


def test_ac056_comment_stored_and_returned_oldest_first(client):
    _report(MGR, EMP)
    login(client, EMP)
    g = _goal(client)
    r = _comment(client, g["id"], "first")
    assert r.status_code == 201
    assert set(r.json()) == {"id", "author", "body", "created_at"}
    assert r.json()["author"]["full_name"] == "Emi Employee"
    _as(client, MGR)
    assert _comment(client, g["id"], "second").status_code == 201
    for who in (MGR, EMP):
        _as(client, who)
        c = client.get(f"/goals/{g['id']}").json()["comments"]
        assert [x["body"] for x in c] == ["first", "second"]
    with SessionLocal() as db:
        n = db.execute(
            text("SELECT count(*) FROM audit_event WHERE action='goal_comment_added'")
        ).scalar()
    assert n == 2


def test_ac056_blank_body_is_422(client):
    login(client, EMP)
    g = _goal(client)
    for payload in ({"body": "  "}, {}):
        r = client.post(f"/goals/{g['id']}/comments", json=payload, headers=H)
        assert r.status_code == 422 and r.json()["errors"]["body"] == "Enter a comment."


def test_ac056_hr_may_comment_and_others_refused(client):
    login(client, EMP)
    g = _goal(client)
    _as(client, HR)
    assert _comment(client, g["id"]).status_code == 201
    _as(client, MGR)  # not in the chain
    r = _comment(client, g["id"])
    assert r.status_code == 403 and r.content == b""


def test_ac057_outside_reports_excluded_and_403(client):
    _as(client, EMP)
    other = _goal(client, "Emp")
    _report(EMP, MGR)  # the manager reports to the employee
    _as(client, MGR)
    assert client.get("/team/goals").json() == []
    r = client.get(f"/goals/{other['id']}")
    assert r.status_code == 403 and r.content == b""
    r = _comment(client, other["id"])
    assert r.status_code == 403 and r.content == b""


def test_ac057_peer_goal_is_refused(client):
    login(client, EMP)
    g = _goal(client)
    _as(client, MGR)
    r = client.get(f"/goals/{g['id']}")
    assert r.status_code == 403 and r.content == b""


def test_nfr001_roles_deactivation_and_reassignment(client):
    _report(MGR, EMP)
    login(client, EMP)
    g = _goal(client)
    r = client.get("/team/goals")
    assert r.status_code == 403 and r.content == b""
    _as(client, EXE)
    r = client.get("/team/goals")
    assert r.status_code == 403 and r.content == b""
    r = _comment(client, g["id"])
    assert r.status_code == 403 and r.content == b""
    _as(client, HR)
    assert client.get("/team/goals").json() == []
    _report(HR, EMP)
    assert len(client.get("/team/goals").json()) == 1
    _as(client, MGR)
    assert client.get("/team/goals").json() == []
    _report(MGR, EMP)
    with SessionLocal() as db:
        db.execute(
            text("UPDATE employee SET deactivated=true, status='deactivated' WHERE work_email=:e"),
            {"e": EMP},
        )
        db.commit()
    assert client.get("/team/goals").json() == []


def test_nfr015_team_goals_with_200_reports(client):
    mgr = _id(MGR)
    with SessionLocal() as db:
        dept = db.execute(text("SELECT id FROM department LIMIT 1")).scalar()
        for i in range(200):
            nid = uuid.uuid4()
            db.execute(
                text(
                    "INSERT INTO employee (id, full_name, work_email, role, status, deactivated,"
                    " department_id, manager_id, updated_at) VALUES (:i, :n, :e, 'employee',"
                    " 'active', false, :d, :m, now())"
                ),
                {
                    "i": nid,
                    "n": f"TG {i:03d}",
                    "e": f"{PREFIX}{nid.hex}@example.com",
                    "d": dept,
                    "m": mgr,
                },
            )
            db.execute(
                text(
                    "INSERT INTO goal (id, owner_id, title, target, due_date, period, weighting,"
                    " progress, status, level, created_at, updated_at) VALUES (:g, :o, 'T', 't',"
                    " :due, '2030-Q1', 10, 0, 'Not started', 'personal', now(), now())"
                ),
                {"g": uuid.uuid4(), "o": nid, "due": date.today()},
            )
        db.commit()
    login(client, MGR)
    t = time.monotonic()
    r = client.get("/team/goals")
    assert r.status_code == 200 and len(r.json()) == 200
    assert time.monotonic() - t < 10
