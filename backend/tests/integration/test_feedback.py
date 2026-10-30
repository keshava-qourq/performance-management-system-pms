from sqlalchemy import text

from app.database import SessionLocal
from tests.conftest import H, login

EMP, MGR, EXEC = (
    "employee@example.com",
    "manager@example.com",
    "executive@example.com",
)
BAD = "00000000-0000-0000-0000-000000000000"


def _id(client, email):
    login(client, email)
    i = client.get("/auth/me").json()["id"]
    client.cookies.clear()
    return i


def _sql(sql, **p):
    with SessionLocal() as db:
        db.execute(text(sql), p)
        db.commit()


def _count():
    with SessionLocal() as db:
        return db.execute(text("SELECT count(*) FROM feedback")).scalar()


def _post(client, rid, body="x"):
    return client.post(
        "/feedback", json={"recipient_id": rid, "type": "praise", "body": body}, headers=H
    )


def test_ac078_creates_praise_with_caller_as_author(client):
    _sql("DELETE FROM feedback")
    mgr = _id(client, MGR)
    me = _id(client, EMP)
    login(client, EMP)
    r = client.post(
        "/feedback",
        json={"recipient_id": mgr, "type": "praise", "body": " Great ", "author_id": mgr},
        headers=H,
    )
    assert r.status_code == 201
    j = r.json()
    assert j["author"]["id"] == me and j["recipient"]["id"] == mgr
    assert j["body"] == "Great" and j["type"] == "praise" and j["created_at"]
    _sql("UPDATE employee SET status='deactivated', deactivated=true WHERE id=:i", i=mgr)
    assert _post(client, mgr).status_code == 422
    _sql("DELETE FROM feedback")


def test_ac079_blank_body_and_missing_recipient_together(client):
    _sql("DELETE FROM feedback")
    login(client, EMP)
    r = client.post("/feedback", json={"type": "praise", "body": "  "}, headers=H)
    assert r.status_code == 422
    assert r.json()["errors"] == {
        "body": "Write a message before sending.",
        "recipient_id": "Choose who this praise is for.",
    }
    assert _count() == 0


def test_ac080_self_and_unknown_recipient(client):
    _sql("DELETE FROM feedback")
    me = _id(client, EMP)
    login(client, EMP)
    r = _post(client, me)
    assert r.status_code == 422
    assert r.json()["errors"]["recipient_id"] == "Praise must be addressed to someone else."
    r = _post(client, BAD)
    assert r.status_code == 422
    assert r.json()["errors"]["recipient_id"] == "Choose an active colleague."
    assert _count() == 0


def test_ac081_dashboard_and_feedback_lists(client):
    _sql("DELETE FROM feedback")
    me = _id(client, EMP)
    login(client, EMP)
    empty = client.get("/me/dashboard")
    assert empty.status_code == 200 and empty.json()["feedback"] == []
    client.cookies.clear()
    login(client, MGR)
    for t in ("one", "two"):
        _post(client, me, t)
    assert len(client.get("/feedback?direction=given").json()) == 2
    assert client.get("/feedback").json() == []
    client.cookies.clear()
    login(client, EMP)
    d = client.get("/me/dashboard").json()
    assert [f["body"] for f in d["feedback"]] == ["two", "one"]
    assert d["feedback"][0]["author"]["full_name"] == "Mo Manager"
    assert d["unread_feedback"] == 2 and d["reviews"] == [] and d["attention"] == []
    assert isinstance(d["goals"], list)
    assert len(client.get("/feedback").json()) == 2
    _sql("UPDATE feedback SET withdrawn_at=now() WHERE body='one'")
    d = client.get("/me/dashboard").json()
    assert len(d["feedback"]) == 1 and d["unread_feedback"] == 1
    _sql("DELETE FROM feedback")


def test_nfr001_feedback_not_visible_to_others(client):
    _sql("DELETE FROM feedback")
    emp = _id(client, EMP)
    login(client, MGR)
    _post(client, emp)
    assert client.get("/feedback").json() == []
    assert client.get("/me/dashboard").json()["feedback"] == []
    _sql("DELETE FROM feedback")


def test_nfr001_executive_refused_on_post(client):
    _sql("DELETE FROM feedback")
    emp = _id(client, EMP)
    login(client, EXEC)
    r = _post(client, emp)
    assert r.status_code == 403 and r.content == b""
    assert _count() == 0


def test_picker_scope(client):
    me = _id(client, EMP)
    login(client, EMP)
    r = client.get("/employees?active_only=true")
    assert r.status_code == 200
    rows = r.json()
    assert rows and all(e["id"] != me for e in rows)
    assert set(rows[0]) == {"id", "full_name", "job_title", "department"}
    assert client.get("/employees").status_code == 403
    client.cookies.clear()
    login(client, EXEC)
    assert client.get("/employees?active_only=true").status_code == 403
