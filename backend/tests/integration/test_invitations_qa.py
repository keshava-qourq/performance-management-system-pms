"""QA coverage for invitations (US-006: AC-018..AC-021, NFR-005, NFR-015).

Runs against the real PostgreSQL given by DATABASE_URL through the shared
`client`/`login` fixtures in backend/tests/conftest.py. No mocks.

Contract under test (docs/sdlc/architecture/api/openapi.yaml):
  POST   /employees/{id}/invitations    -> 201 {link, expires_at}, reissue revokes earlier links
  DELETE /employees/{id}/invitations    -> 204, the outstanding link stops working at once
  GET    /auth/tokens/{token}           -> 200 {purpose, valid, password_rules} | 410
  POST   /auth/tokens/{token}/accept    -> 204 + session cookie, single use
"""

import re
import time
import uuid

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import text

from app.database import SessionLocal
from app.main import app
from tests.conftest import H, login

HR = "hr.admin@example.com"
EMPLOYEE = "employee@example.com"
MANAGER = "manager@example.com"
QA_PREFIX = "qa-inv-"
GOOD_PASSWORD = "Qa-Str0ng-Passphrase!"

# Keys the delivered SystemSettings may use for the link lifetime (NFR-020).
LIFETIME_HINTS = ("invite", "invitation", "link", "token")


@pytest.fixture(autouse=True)
def _restore():
    yield
    with SessionLocal() as db:
        db.execute(text("DELETE FROM employee WHERE work_email LIKE :p"), {"p": QA_PREFIX + "%"})
        db.commit()


def _fresh_client():
    return TestClient(app, base_url="https://testserver")


def _settings():
    with SessionLocal() as db:
        return {k: v for k, v in db.execute(text("SELECT key, value FROM system_setting")).all()}


def _set_setting(key, value):
    with SessionLocal() as db:
        db.execute(
            text("UPDATE system_setting SET value = :v WHERE key = :k"),
            {"v": f'"{value}"' if isinstance(value, str) else str(value), "k": key},
        )
        db.commit()


def _lifetime_key():
    """The SystemSetting that controls how long an invitation link lives."""
    for key in _settings():
        low = key.lower()
        if any(h in low for h in LIFETIME_HINTS) and (
            "minute" in low or "hour" in low or "day" in low or "expire" in low or "ttl" in low
        ):
            return key
    pytest.fail(
        "NFR-020: no SystemSetting controls the invitation link lifetime; "
        f"settings present: {sorted(_settings())}"
    )


def _make(client, name):
    d = client.get("/departments").json()
    t = client.get("/job-titles").json()
    slug = name.lower().replace(" ", "-")
    r = client.post(
        "/employees",
        json={
            "full_name": name,
            "work_email": f"{QA_PREFIX}{slug}@example.com",
            "job_title_id": t[0]["id"],
            "department_id": d[0]["id"],
        },
        headers=H,
    )
    assert r.status_code == 201, r.text
    return r.json()


def _token_of(link: str) -> str:
    match = re.search(r"[?&]token=([^&#]+)", link)
    return match.group(1) if match else link.rstrip("/").rsplit("/", 1)[-1]


def _invite(client, employee_id):
    r = client.post(f"/employees/{employee_id}/invitations", json={}, headers=H)
    assert r.status_code in (200, 201), r.text
    body = r.json()
    assert body.get("link"), "AC-018: the invitation response carries no link"
    assert body.get("expires_at"), "AC-018/NFR-005: the invitation link has no expiry"
    return body


def _status(client, employee_id):
    row = next(e for e in client.get("/employees").json() if e["id"] == employee_id)
    return row.get("account_status") or row.get("status")


def _accept(token, password=GOOD_PASSWORD):
    anon = _fresh_client()
    r = anon.post(f"/auth/tokens/{token}/accept", json={"password": password}, headers=H)
    return anon, r


# --------------------------------------------------------------------- AC-018


def test_ac018_invite_issues_a_unique_time_limited_link_and_sets_status_invited(client):
    login(client, HR)
    a = _make(client, "Ivy Invitee")
    b = _make(client, "Ian Invitee")

    first = _invite(client, a["id"])
    second = _invite(client, b["id"])

    # Unique per person (NFR-005).
    assert _token_of(first["link"]) != _token_of(second["link"])
    assert len(_token_of(first["link"])) >= 20, "the invitation token is too short to be secret"

    # Time-limited.
    assert first["expires_at"] != second["expires_at"] or first["expires_at"]

    # The account is now Invited, and cannot be signed into yet.
    assert _status(client, a["id"]).lower() == "invited"

    check = _fresh_client().get(f"/auth/tokens/{_token_of(first['link'])}")
    assert check.status_code == 200, check.text
    assert check.json()["valid"] is True
    assert check.json()["purpose"] in ("invitation", "invite")


def test_ac018_only_hr_can_invite(client):
    login(client, HR)
    target = _make(client, "Perm Invitee")
    client.cookies.clear()

    for email in (EMPLOYEE, MANAGER, "executive@example.com"):
        login(client, email)
        r = client.post(f"/employees/{target['id']}/invitations", json={}, headers=H)
        assert r.status_code == 403 and r.content == b""
        client.cookies.clear()


# --------------------------------------------------------------------- AC-019


def test_ac019_accepting_activates_the_account_and_issues_a_session(client):
    login(client, HR)
    person = _make(client, "Ada Accept")
    link = _invite(client, person["id"])["link"]

    invitee, r = _accept(_token_of(link))
    assert r.status_code in (200, 204), r.text
    assert "session=" in r.headers.get(
        "set-cookie", ""
    ), "AC-019: accepting the invitation issued no session cookie"
    me = invitee.get("/auth/me")
    assert me.status_code == 200
    assert me.json()["id"] == person["id"]

    assert _status(client, person["id"]).lower() == "active"
    # The new password works on a plain sign-in too.
    other = _fresh_client()
    assert login(other, person["work_email"], GOOD_PASSWORD).status_code == 200


# --------------------------------------------------------------------- AC-020


def test_ac020_an_already_used_link_creates_no_account_and_no_session(client):
    login(client, HR)
    person = _make(client, "Reuse Person")
    token = _token_of(_invite(client, person["id"])["link"])
    _, first = _accept(token)
    assert first.status_code in (200, 204), first.text

    before = _session_count(person["id"])
    replay, second = _accept(token, "Another-Str0ng-Pass!")
    assert second.status_code in (
        400,
        404,
        409,
        410,
        422,
    ), f"NFR-005: a used invitation link was accepted again ({second.status_code})"
    assert "session=" not in second.headers.get("set-cookie", "")
    assert replay.get("/auth/me").status_code == 401
    assert _session_count(person["id"]) == before
    # The second password was never set.
    assert login(_fresh_client(), person["work_email"], "Another-Str0ng-Pass!").status_code == 401

    check = _fresh_client().get(f"/auth/tokens/{token}")
    assert check.status_code == 410 or check.json().get("valid") is False


def test_ac020_an_expired_link_creates_no_account_and_no_session(client):
    login(client, HR)
    key = _lifetime_key()
    original = _settings()[key]
    try:
        _set_setting(key, 0)  # links expire immediately
        person = _make(client, "Expired Person")
        token = _token_of(_invite(client, person["id"])["link"])
        time.sleep(1)

        check = _fresh_client().get(f"/auth/tokens/{token}")
        assert check.status_code == 410 or check.json().get("valid") is False

        anon, r = _accept(token)
        assert r.status_code in (
            400,
            404,
            409,
            410,
            422,
        ), f"AC-020: an expired invitation link was accepted ({r.status_code})"
        assert "session=" not in r.headers.get("set-cookie", "")
        assert anon.get("/auth/me").status_code == 401
        assert _session_count(person["id"]) == 0
        assert _status(client, person["id"]).lower() != "active"
    finally:
        _set_setting(key, original)


def test_ac020_an_unknown_token_is_refused_without_enumerating(client):
    anon = _fresh_client()
    unknown = uuid.uuid4().hex + uuid.uuid4().hex
    check = anon.get(f"/auth/tokens/{unknown}")
    assert check.status_code in (404, 410) or check.json().get("valid") is False
    assert "@" not in check.text, "the token check leaks an email address"
    r = anon.post(f"/auth/tokens/{unknown}/accept", json={"password": GOOD_PASSWORD}, headers=H)
    assert r.status_code in (400, 404, 409, 410, 422)
    assert "session=" not in r.headers.get("set-cookie", "")


# --------------------------------------------------------------- AC-021/NFR-005


def test_ac021_revoking_kills_the_link_immediately(client):
    login(client, HR)
    person = _make(client, "Revoked Person")
    token = _token_of(_invite(client, person["id"])["link"])

    r = client.delete(f"/employees/{person['id']}/invitations", headers=H)
    assert r.status_code in (200, 204), r.text

    check = _fresh_client().get(f"/auth/tokens/{token}")
    assert check.status_code == 410 or check.json().get("valid") is False
    anon, accepted = _accept(token)
    assert accepted.status_code in (
        400,
        404,
        409,
        410,
        422,
    ), "AC-021: a revoked invitation link still worked"
    assert anon.get("/auth/me").status_code == 401
    assert _session_count(person["id"]) == 0


def test_ac021_reissuing_invalidates_the_previous_link_and_only_the_newest_works(client):
    login(client, HR)
    person = _make(client, "Reissue Person")
    old = _token_of(_invite(client, person["id"])["link"])
    new = _token_of(_invite(client, person["id"])["link"])
    assert old != new, "AC-021: reissuing returned the same link"

    stale = _fresh_client().get(f"/auth/tokens/{old}")
    assert stale.status_code == 410 or stale.json().get("valid") is False
    anon, refused = _accept(old)
    assert refused.status_code in (
        400,
        404,
        409,
        410,
        422,
    ), "AC-021/NFR-005: the previous invitation link still worked after a reissue"
    assert anon.get("/auth/me").status_code == 401

    invitee, accepted = _accept(new)
    assert accepted.status_code in (200, 204), accepted.text
    assert invitee.get("/auth/me").status_code == 200


def test_nfr020_the_link_lifetime_comes_from_system_settings(client):
    login(client, HR)
    key = _lifetime_key()
    original = _settings()[key]
    try:
        _set_setting(key, 0)
        short_lived = _make(client, "Short Lived")
        expired = _token_of(_invite(client, short_lived["id"])["link"])
        time.sleep(1)
        check = _fresh_client().get(f"/auth/tokens/{expired}")
        assert check.status_code == 410 or check.json().get("valid") is False

        _set_setting(key, 72)
        long_lived = _make(client, "Long Lived")
        alive = _token_of(_invite(client, long_lived["id"])["link"])
        ok = _fresh_client().get(f"/auth/tokens/{alive}")
        assert ok.status_code == 200 and ok.json()["valid"] is True
    finally:
        _set_setting(key, original)


# -------------------------------------------------------------------- NFR-015


def test_nfr015_inviting_many_employees_stays_responsive(client):
    """Sized for one company under 200: inviting a batch must not crawl."""
    login(client, HR)
    people = [_make(client, f"Bulk Invitee {i:03d}") for i in range(25)]
    started = time.monotonic()
    tokens = {_token_of(_invite(client, p["id"])["link"]) for p in people}
    elapsed = time.monotonic() - started
    assert len(tokens) == len(people), "NFR-005: invitation links are not unique per person"
    assert elapsed < 30, f"issuing 25 invitations took {elapsed:.1f}s"


def _session_count(employee_id):
    with SessionLocal() as db:
        return db.execute(
            text("SELECT count(*) FROM session WHERE employee_id = :i AND revoked_at IS NULL"),
            {"i": employee_id},
        ).scalar()
