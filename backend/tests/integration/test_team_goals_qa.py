"""QA coverage for manager oversight of team goals (US-015: AC-055..AC-057, NFR-001, NFR-015).
Real PostgreSQL, no mocks."""

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
PREFIX = "tgqa-"
FUTURE = (date.today() + timedelta(days=30)).isoformat()


@pytest.fixture(autouse=True)
def _clean_team_goals():
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
        return db.execute(
            text("SELECT id FROM employee WHERE work_email=:e"), {"e": email}
        ).scalar()


def _report(manager_email, employee_email):
    with SessionLocal() as db:
        db.execute(
            text("UPDATE employee SET manager_id=:m WHERE work_email=:e"),
            {"m": _id(manager_email) if manager_email else None, "e": employee_email},
        )
        db.commit()


def _as(client, email):
    client.cookies.clear()
    assert login(client, email).status_code == 200


def _goal(client, title="G", weighting=10):
    r = client.post(
        "/goals",
        json={"title": title, "target": "t", "due_date": FUTURE, "weighting": weighting},
        headers=H,
    )
    assert r.status_code == 201, r.text
    return r.json()


def _comment(client, goal_id, body="x"):
    return client.post(f"/goals/{goal_id}/comments", json={"body": body}, headers=H)


def _outsider(name="out"):
    nid = uuid.uuid4()
    email = f"{PREFIX}{name}-{nid.hex[:8]}@example.com"
    with SessionLocal() as db:
        dept = db.execute(text("SELECT id FROM department LIMIT 1")).scalar()
        db.execute(
            text(
                "INSERT INTO employee (id, full_name, work_email, role, status, deactivated,"
                " department_id, updated_at) VALUES (:i, :n, :e, 'employee', 'active', false,"
                " :d, now())"
            ),
            {"i": nid, "n": f"Outsider {name}", "e": email, "d": dept},
        )
        db.commit()
    return nid, email


def _outsider_goal(owner_id, title="Outside goal"):
    with SessionLocal() as db:
        gid = uuid.uuid4()
        db.execute(
            text(
                "INSERT INTO goal (id, owner_id, title, target, due_date, period, weighting,"
                " progress, status, level, created_at, updated_at) VALUES (:g, :o, :t, 't',"
                " :due, '2030-Q1', 10, 0, 'Not started', 'personal', now(), now())"
            ),
            {"g": gid, "o": owner_id, "t": title, "due": date.today()},
        )
        db.commit()
    return str(gid)


def test_ac055_each_direct_report_with_goals_weighting_progress_status(client):
    _report(MGR, EMP)
    out_id, _ = _outsider("a")
    _outsider_goal(out_id)
    _as(client, EMP)
    g = _goal(client, "Mine", 30)
    r = client.post(
        f"/goals/{g['id']}/progress", json={"progress": 45, "status": "At risk"}, headers=H
    )
    assert r.status_code == 200, r.text
    _as(client, MGR)
    body = client.get("/team/goals").json()
    assert [e["employee"]["full_name"] for e in body] == ["Emi Employee"]
    row = body[0]["goals"][0]
    assert row["title"] == "Mine" and float(row["weighting"]) == 30
    assert row["progress"] == 45 and row["status"] == "At risk"
    assert body[0]["weighting_total"] == 30 and body[0]["over_100_warning"] is False


def test_ac055_report_without_goals_is_still_listed(client):
    _report(MGR, EMP)
    _as(client, MGR)
    body = client.get("/team/goals").json()
    assert len(body) == 1 and body[0]["goals"] == []


def test_ac056_comment_visible_to_owner_and_manager_and_persisted(client):
    _report(MGR, EMP)
    _as(client, EMP)
    g = _goal(client)
    _as(client, MGR)
    r = _comment(client, g["id"], "Well done")
    assert r.status_code == 201, r.text
    assert r.json()["body"] == "Well done" and r.json()["author"]["full_name"] == "Mo Manager"
    for who in (EMP, MGR):
        _as(client, who)
        comments = client.get(f"/goals/{g['id']}").json()["comments"]
        assert [c["body"] for c in comments] == ["Well done"]
    with SessionLocal() as db:
        assert (
            db.execute(
                text("SELECT count(*) FROM goal_comment WHERE goal_id=:g AND body='Well done'"),
                {"g": g["id"]},
            ).scalar()
            == 1
        )


@pytest.mark.parametrize("payload", [{"body": ""}, {"body": "   "}, {"body": "\n\t"}, {}])
def test_ac056_blank_comment_is_422_and_stores_nothing(client, payload):
    _report(MGR, EMP)
    _as(client, EMP)
    g = _goal(client)
    _as(client, MGR)
    r = client.post(f"/goals/{g['id']}/comments", json=payload, headers=H)
    assert r.status_code == 422 and "body" in r.json()["errors"]
    with SessionLocal() as db:
        assert db.execute(text("SELECT count(*) FROM goal_comment")).scalar() == 0


def test_ac056_comment_requires_mutation_header_and_session(client):
    _report(MGR, EMP)
    _as(client, EMP)
    g = _goal(client)
    _as(client, MGR)
    r = client.post(f"/goals/{g['id']}/comments", json={"body": "x"})
    assert r.status_code == 403 and r.content == b""
    client.cookies.clear()
    assert _comment(client, g["id"]).status_code == 401


def test_ac057_no_outside_goal_in_team_goals(client):
    _report(MGR, EMP)
    out_id, _ = _outsider("b")
    _outsider_goal(out_id, "Secret outside")
    _as(client, EMP)
    _goal(client, "Inside")
    _as(client, MGR)
    r = client.get("/team/goals")
    assert "Secret outside" not in r.text and "Outsider" not in r.text
    assert len(r.json()) == 1


def test_ac057_outside_goal_get_and_comment_403_empty(client):
    _report(MGR, EMP)
    out_id, _ = _outsider("c")
    gid = _outsider_goal(out_id)
    _as(client, MGR)
    r = client.get(f"/goals/{gid}")
    assert r.status_code == 403 and r.content == b""
    r = _comment(client, gid)
    assert r.status_code == 403 and r.content == b""
    with SessionLocal() as db:
        assert db.execute(text("SELECT count(*) FROM goal_comment")).scalar() == 0


def test_ac057_grand_report_is_not_a_direct_report(client):
    _report(MGR, EMP)
    out_id, out_email = _outsider("d")
    gid = _outsider_goal(out_id)
    with SessionLocal() as db:
        db.execute(
            text("UPDATE employee SET manager_id=:m WHERE id=:i"),
            {"m": _id(EMP), "i": out_id},
        )
        db.commit()
    _as(client, MGR)
    names = [e["employee"]["full_name"] for e in client.get("/team/goals").json()]
    assert names == ["Emi Employee"]
    # A grand-report is below the manager in the chain: readable, but not a direct report.
    assert client.get(f"/goals/{gid}").status_code == 200


def test_ac057_reassigned_report_leaves_first_managers_view(client):
    _report(MGR, EMP)
    _as(client, EMP)
    g = _goal(client, "Moves")
    _as(client, MGR)
    assert len(client.get("/team/goals").json()) == 1
    assert client.get(f"/goals/{g['id']}").status_code == 200
    _as(client, HR)
    emp = _id(EMP)
    new_mgr, _ = _outsider("newmgr")
    r = client.put(f"/employees/{emp}/manager", json={"manager_id": str(new_mgr)}, headers=H)
    assert r.status_code == 200, r.text
    _as(client, MGR)
    r = client.get("/team/goals")
    assert r.json() == [] and "Moves" not in r.text
    r = client.get(f"/goals/{g['id']}")
    assert r.status_code == 403 and r.content == b""
    r = _comment(client, g["id"])
    assert r.status_code == 403 and r.content == b""


@pytest.mark.parametrize("email", [EMP, EXE])
def test_nfr001_employee_and_executive_refused_team_goals(client, email):
    _as(client, email)
    r = client.get("/team/goals")
    assert r.status_code == 403 and r.content == b""


def test_nfr001_signed_out_team_goals_is_401(client):
    assert client.get("/team/goals").status_code == 401


def test_nfr001_executive_refused_comment_and_nothing_stored(client):
    _report(MGR, EMP)
    _as(client, EMP)
    g = _goal(client)
    _as(client, EXE)
    r = _comment(client, g["id"])
    assert r.status_code == 403 and r.content == b""
    with SessionLocal() as db:
        assert db.execute(text("SELECT count(*) FROM goal_comment")).scalar() == 0


def test_nfr015_team_goals_for_many_reports_within_timeout(client):
    mgr = _id(MGR)
    with SessionLocal() as db:
        dept = db.execute(text("SELECT id FROM department LIMIT 1")).scalar()
        for i in range(150):
            nid = uuid.uuid4()
            db.execute(
                text(
                    "INSERT INTO employee (id, full_name, work_email, role, status, deactivated,"
                    " department_id, manager_id, updated_at) VALUES (:i, :n, :e, 'employee',"
                    " 'active', false, :d, :m, now())"
                ),
                {
                    "i": nid,
                    "n": f"TGQA {i:03d}",
                    "e": f"{PREFIX}{nid.hex}@example.com",
                    "d": dept,
                    "m": mgr,
                },
            )
            for _k in range(2):
                db.execute(
                    text(
                        "INSERT INTO goal (id, owner_id, title, target, due_date, period,"
                        " weighting, progress, status, level, created_at, updated_at) VALUES"
                        " (:g, :o, 'T', 't', :due, '2030-Q1', 10, 0, 'Not started',"
                        " 'personal', now(), now())"
                    ),
                    {"g": uuid.uuid4(), "o": nid, "due": date.today()},
                )
        db.commit()
    _as(client, MGR)
    t = time.monotonic()
    r = client.get("/team/goals")
    elapsed = time.monotonic() - t
    assert r.status_code == 200 and len(r.json()) == 150
    assert all(len(e["goals"]) == 2 for e in r.json())
    assert elapsed < 10, f"/team/goals took {elapsed:.1f}s"
