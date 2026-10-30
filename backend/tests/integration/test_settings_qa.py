"""QA: manager visibility of feedback (US-024: AC-089..AC-091, NFR-008, NFR-020)."""

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
OFF_STATEMENT = "Feedback is readable only by its author, its recipient and HR Admins."


def _sql(sql, **p):
    with SessionLocal() as db:
        db.execute(text(sql), p)
        db.commit()


def _scalar(sql, **p):
    with SessionLocal() as db:
        return db.execute(text(sql), p).scalar()


def _reset():
    _sql("DELETE FROM feedback")
    _sql("DELETE FROM audit_event WHERE action='setting_changed'")
    _sql("UPDATE system_setting SET value='false' WHERE key='manager_feedback_visible'")
    _sql("UPDATE employee SET manager_id=NULL")


@pytest.fixture(autouse=True)
def _restore():
    _reset()
    yield
    _reset()


def _id(client, email):
    login(client, email)
    i = client.get("/auth/me").json()["id"]
    client.cookies.clear()
    return i


def _setup(client):
    mgr, emp = _id(client, MGR), _id(client, EMP)
    _sql("UPDATE employee SET manager_id=:m WHERE id=:e", m=mgr, e=emp)
    login(client, HR)
    r = client.post(
        "/feedback", json={"recipient_id": emp, "type": "praise", "body": "qa-note"}, headers=H
    )
    assert r.status_code == 201, r.text
    client.cookies.clear()
    return mgr, emp


def _bodies(client, who, emp):
    client.cookies.clear()
    login(client, who)
    r = client.get(f"/employees/{emp}/record")
    assert r.status_code == 200, r.text
    return [f["body"] for f in r.json()["feedback"]]


def test_ac089_hr_switches_on_persists_manager_reads_and_audit_row(client):
    _, emp = _setup(client)
    assert _bodies(client, MGR, emp) == []
    client.cookies.clear()
    login(client, HR)
    r = client.put("/settings", json={KEY: True}, headers=H)
    assert r.status_code == 200 and r.json()[KEY] is True
    assert client.get("/settings").json()[KEY] is True
    client.cookies.clear()
    login(client, HR)  # new session = "reload"
    assert client.get("/settings").json()[KEY] is True
    assert _scalar("SELECT count(*) FROM audit_event WHERE action='setting_changed'") >= 1
    assert _bodies(client, MGR, emp) == ["qa-note"]


def test_ac089_switching_off_again_hides_it_and_audits(client):
    _, emp = _setup(client)
    login(client, HR)
    client.put("/settings", json={KEY: True}, headers=H)
    client.put("/settings", json={KEY: False}, headers=H)
    assert _scalar("SELECT count(*) FROM audit_event WHERE action='setting_changed'") == 2
    assert _bodies(client, MGR, emp) == []


def test_ac090_off_recipient_hr_see_manager_and_executive_do_not(client):
    _, emp = _setup(client)
    assert _bodies(client, MGR, emp) == []
    assert _bodies(client, EMP, emp) == ["qa-note"]
    assert _bodies(client, HR, emp) == ["qa-note"]
    assert _bodies(client, EXEC, emp) == []


def test_ac090_on_executive_still_gets_no_individual_feedback(client):
    _, emp = _setup(client)
    _sql("UPDATE system_setting SET value='true' WHERE key='manager_feedback_visible'")
    assert _bodies(client, EXEC, emp) == []


@pytest.mark.parametrize("state", ["false", "true"])
def test_ac090_manager_outside_the_line_is_403_empty(client, state):
    _, emp = _setup(client)
    _sql("UPDATE employee SET manager_id=NULL")
    _sql("UPDATE system_setting SET value=:v WHERE key='manager_feedback_visible'", v=state)
    login(client, MGR)
    r = client.get(f"/employees/{emp}/record")
    assert r.status_code == 403 and r.content == b""


def test_ac091_audience_statement_for_off_and_on(client):
    _setup(client)
    login(client, EMP)
    off = client.get("/feedback/audience")
    assert off.status_code == 200
    assert off.json()["manager_feedback_visible"] is False
    assert off.json()["readers_statement"] == OFF_STATEMENT
    _sql("UPDATE system_setting SET value='true' WHERE key='manager_feedback_visible'")
    on = client.get("/feedback/audience").json()
    assert on["manager_feedback_visible"] is True
    assert "manager" in on["readers_statement"]
    assert on["readers_statement"] != OFF_STATEMENT


def test_nfr008_statement_follows_hr_toggle_via_api(client):
    login(client, EMP)
    before = client.get("/feedback/audience").json()["readers_statement"]
    client.cookies.clear()
    login(client, HR)
    client.put("/settings", json={KEY: True}, headers=H)
    client.cookies.clear()
    login(client, EMP)
    assert client.get("/feedback/audience").json()["readers_statement"] != before


@pytest.mark.parametrize("who", [EMP, MGR, EXEC])
def test_nfr020_non_hr_put_is_403_empty_and_changes_nothing(client, who):
    login(client, who)
    r = client.put("/settings", json={KEY: True}, headers=H)
    assert r.status_code == 403 and r.content == b""
    assert _scalar("SELECT value FROM system_setting WHERE key=:k", k=KEY) is False
    assert _scalar("SELECT count(*) FROM audit_event WHERE action='setting_changed'") == 0


def test_nfr020_signed_out_put_is_401(client):
    assert client.put("/settings", json={KEY: True}, headers=H).status_code == 401


@pytest.mark.parametrize("bad", ["yes", "true", 1, 0, None, [], {}])
def test_nfr020_non_boolean_is_422_and_stores_nothing(client, bad):
    login(client, HR)
    r = client.put("/settings", json={KEY: bad}, headers=H)
    assert r.status_code == 422 and KEY in r.json()["errors"]
    assert _scalar("SELECT value FROM system_setting WHERE key=:k", k=KEY) is False
    assert _scalar("SELECT count(*) FROM audit_event WHERE action='setting_changed'") == 0


def test_nfr020_value_is_held_in_system_setting_table(client):
    login(client, HR)
    client.put("/settings", json={KEY: True}, headers=H)
    assert _scalar("SELECT value FROM system_setting WHERE key=:k", k=KEY) is True


def test_nfr020_put_requires_mutation_header(client):
    login(client, HR)
    r = client.put("/settings", json={KEY: True})
    assert r.status_code == 403 and r.content == b""
