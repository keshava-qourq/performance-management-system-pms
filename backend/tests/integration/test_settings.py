import pytest
from sqlalchemy import text

from app.database import SessionLocal
from tests.conftest import H, login

HR, MGR, EMP, EXEC = (
    "hr.admin@example.com",
    "manager@example.com",
    "employee@example.com",
    "executive@example.com",
)
KEY = "manager_feedback_visible"


def _sql(sql, **p):
    with SessionLocal() as db:
        db.execute(text(sql), p)
        db.commit()


@pytest.fixture(autouse=True)
def _reset():
    _sql("DELETE FROM feedback")
    _sql("UPDATE system_setting SET value='false' WHERE key='manager_feedback_visible'")
    yield
    _sql("DELETE FROM feedback")
    _sql("UPDATE system_setting SET value='false' WHERE key='manager_feedback_visible'")
    _sql("UPDATE employee SET manager_id=NULL")


def _id(client, email):
    login(client, email)
    i = client.get("/auth/me").json()["id"]
    client.cookies.clear()
    return i


def _setup(client):
    """Employee reports to manager; HR sends the employee praise, one withdrawn."""
    mgr, emp = _id(client, MGR), _id(client, EMP)
    _sql("UPDATE employee SET manager_id=:m WHERE id=:e", m=mgr, e=emp)
    login(client, HR)
    for b in ("kept", "gone"):
        client.post("/feedback", json={"recipient_id": emp, "type": "praise", "body": b}, headers=H)
    _sql("UPDATE feedback SET withdrawn_at=now() WHERE body='gone'")
    client.cookies.clear()
    return mgr, emp


def _record(client, who, emp):
    client.cookies.clear()
    login(client, who)
    r = client.get(f"/employees/{emp}/record")
    assert r.status_code == 200
    return [f["body"] for f in r.json()["feedback"]]


def test_ac089_hr_put_stores_audits_and_rejects_bad_values(client):
    login(client, HR)
    r = client.put("/settings", json={KEY: True}, headers=H)
    assert r.status_code == 200 and r.json()[KEY] is True
    with SessionLocal() as db:
        v = db.execute(text("SELECT value FROM system_setting WHERE key=:k"), {"k": KEY}).scalar()
        a = db.execute(
            text("SELECT details FROM audit_event WHERE action='setting_changed'")
        ).scalar()
    assert v is True and a == {"key": KEY, "old": False, "new": True}
    r = client.put("/settings", json={KEY: "yes"}, headers=H)
    assert r.status_code == 422 and KEY in r.json()["errors"]
    assert client.put("/settings", json={"nope": True}, headers=H).status_code == 422


def test_ac089_manager_reads_after_enable(client):
    _, emp = _setup(client)
    login(client, HR)
    client.put("/settings", json={KEY: True}, headers=H)
    assert _record(client, MGR, emp) == ["kept"]


def test_ac090_off_state_per_role(client):
    _, emp = _setup(client)
    assert _record(client, MGR, emp) == []
    assert _record(client, EMP, emp) == ["kept"]
    assert _record(client, HR, emp) == ["kept"]
    assert _record(client, EXEC, emp) == []


def test_ac090_on_state_per_role(client):
    _, emp = _setup(client)
    _sql("UPDATE system_setting SET value='true' WHERE key='manager_feedback_visible'")
    assert _record(client, MGR, emp) == ["kept"]
    assert _record(client, EMP, emp) == ["kept"]
    assert _record(client, HR, emp) == ["kept"]
    assert _record(client, EXEC, emp) == []


def test_ac091_audience_statement_tracks_setting(client):
    mgr, emp = _setup(client)
    login(client, EMP)
    off = client.get("/feedback/audience").json()
    assert off == {
        "manager_feedback_visible": False,
        "readers_statement": (
            "Feedback is readable only by its author, its recipient and HR Admins."
        ),
    }
    _sql("UPDATE system_setting SET value='true' WHERE key='manager_feedback_visible'")
    on = client.get("/feedback/audience").json()
    assert on["manager_feedback_visible"] is True
    assert "HR Admins and the recipient's manager" in on["readers_statement"]
    named = client.get(f"/feedback/audience?recipient_id={emp}").json()
    assert "Mo Manager" in named["readers_statement"]
    client.cookies.clear()
    assert client.get("/feedback/audience").status_code == 401


def test_nfr008_no_caching_of_statement(client):
    login(client, EMP)
    a = client.get("/feedback/audience").json()["readers_statement"]
    _sql("UPDATE system_setting SET value='true' WHERE key='manager_feedback_visible'")
    b = client.get("/feedback/audience").json()["readers_statement"]
    assert a != b


def test_nfr020_get_settings_hr_only_with_defaults(client):
    login(client, HR)
    r = client.get("/settings").json()
    assert set(r) == {
        "password_rules",
        "session_idle_minutes",
        "login_lock_threshold",
        "manager_feedback_visible",
        "hr_private_notes_visible",
    }
    assert r[KEY] is False and r["hr_private_notes_visible"] is False
    for who in (EMP, MGR, EXEC):
        client.cookies.clear()
        login(client, who)
        g = client.get("/settings")
        assert g.status_code == 403 and g.content == b""
        p = client.put("/settings", json={KEY: True}, headers=H)
        assert p.status_code == 403 and p.content == b""
