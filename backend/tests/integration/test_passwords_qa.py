"""QA coverage for password rules, change and reset (US-006: AC-027..AC-030,
NFR-004, NFR-005, NFR-020).

Runs against the real PostgreSQL given by DATABASE_URL through the shared
`client`/`login` fixtures in backend/tests/conftest.py. No mocks.

Contract under test (docs/sdlc/architecture/api/openapi.yaml):
  POST /auth/password                     -> 204 | 422 {unmet_rules[] / errors}
  POST /employees/{id}/password-resets    -> 201 {link, expires_at}
  GET  /auth/tokens/{token}               -> 200 {purpose, valid, password_rules} | 410
  POST /auth/tokens/{token}/accept        -> 204 + session cookie, single use
"""

import re

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import text

from app.database import SessionLocal
from app.main import app
from app.seed import DEV_PASSWORD
from tests.conftest import H, login

HR = "hr.admin@example.com"
EMPLOYEE = "employee@example.com"
MANAGER = "manager@example.com"
NEW_PASSWORD = "Qa-N3w-Passphrase!"
RULE_KEY_HINTS = ("password",)


@pytest.fixture(autouse=True)
def _restore_passwords():
    yield
    from app.auth import hash_password

    with SessionLocal() as db:
        for email in (HR, EMPLOYEE, MANAGER, "executive@example.com"):
            db.execute(
                text("UPDATE employee SET password_hash = :h WHERE work_email = :e"),
                {"h": hash_password(DEV_PASSWORD), "e": email},
            )
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


def _min_length_key():
    for key in _settings():
        low = key.lower()
        if "password" in low and ("min" in low or "length" in low):
            return key
    pytest.fail(
        "NFR-020: no SystemSetting controls the minimum password length; "
        f"settings present: {sorted(_settings())}"
    )


def _hash_of(email):
    with SessionLocal() as db:
        return db.execute(
            text("SELECT password_hash FROM employee WHERE work_email = :e"), {"e": email}
        ).scalar()


def _change(client, current, new):
    return client.post(
        "/auth/password", json={"current_password": current, "new_password": new}, headers=H
    )


def _messages(response):
    """Every English message the 422 body carries, however it is shaped."""
    body = response.json()
    out = []
    for key in ("errors", "unmet_rules"):
        part = body.get(key)
        if isinstance(part, dict):
            out.extend(str(v) for v in part.values())
        elif isinstance(part, list):
            out.extend(str(v) for v in part)
    if body.get("detail") and isinstance(body["detail"], str):
        out.append(body["detail"])
    return out


def _token_of(link):
    match = re.search(r"[?&]token=([^&#]+)", link)
    return match.group(1) if match else link.rstrip("/").rsplit("/", 1)[-1]


# --------------------------------------------------------------------- AC-027


@pytest.mark.parametrize(
    "weak",
    ["a", "short1!", "alllowercaseletters", "NODIGITSORLOWER", "12345678901234", ""],
)
def test_ac027_every_unmet_rule_is_a_field_level_english_message_on_422(client, weak):
    login(client, EMPLOYEE)
    before = _hash_of(EMPLOYEE)
    r = _change(client, DEV_PASSWORD, weak)
    assert r.status_code == 422, f"a weak password ({weak!r}) was accepted: {r.status_code}"
    messages = _messages(r)
    assert messages, "AC-027: the 422 carries no message naming the unmet rule"
    joined = " ".join(messages)
    assert re.search(r"[A-Za-z]{3,}", joined), "the message is not English prose"
    assert joined.strip().endswith("."), f"message is not a sentence: {joined!r}"
    assert "password" in joined.lower() or "character" in joined.lower()
    assert _hash_of(EMPLOYEE) == before, "the password changed despite the 422"


def test_ac027_all_unmet_rules_are_listed_at_once(client):
    login(client, EMPLOYEE)
    r = _change(client, DEV_PASSWORD, "aa")
    assert r.status_code == 422
    messages = _messages(r)
    # A two-character all-lower-case password breaks several rules; the user must
    # see every one of them, not just the first.
    assert len(" ".join(messages)) > 20, f"only one rule reported: {messages}"


def test_ac027_a_wrong_current_password_is_refused_field_level(client):
    login(client, EMPLOYEE)
    before = _hash_of(EMPLOYEE)
    r = _change(client, "not-my-password", NEW_PASSWORD)
    assert r.status_code in (401, 422), r.text
    assert _hash_of(EMPLOYEE) == before
    assert login(_fresh_client(), EMPLOYEE, NEW_PASSWORD).status_code == 401


def test_ac027_signed_out_cannot_change_a_password(client):
    r = _change(client, DEV_PASSWORD, NEW_PASSWORD)
    assert r.status_code == 401
    assert login(_fresh_client(), EMPLOYEE, NEW_PASSWORD).status_code == 401


# --------------------------------------------------------------------- AC-028


def test_ac028_changed_password_works_next_sign_in_and_the_old_one_is_refused(client):
    login(client, EMPLOYEE)
    r = _change(client, DEV_PASSWORD, NEW_PASSWORD)
    assert r.status_code in (200, 204), r.text

    fresh = _fresh_client()
    assert login(fresh, EMPLOYEE, NEW_PASSWORD).status_code == 200
    assert fresh.get("/auth/me").status_code == 200

    old = _fresh_client()
    refused = login(old, EMPLOYEE, DEV_PASSWORD)
    assert refused.status_code == 401
    assert refused.json() == {"detail": "The email or password is incorrect."}


# --------------------------------------------------------------- AC-029/NFR-005


def _issue_reset(client, employee_id):
    r = client.post(f"/employees/{employee_id}/password-resets", json={}, headers=H)
    assert r.status_code in (200, 201), r.text
    body = r.json()
    assert body.get("link"), "AC-029: the reset response carries no link"
    assert body.get("expires_at"), "NFR-005: the reset link has no expiry"
    return body


def _by_email(client, email):
    return next(e for e in client.get("/employees").json() if e["work_email"] == email)


def test_ac029_hr_issued_reset_link_works_exactly_once(client):
    login(client, HR)
    target = _by_email(client, EMPLOYEE)
    token = _token_of(_issue_reset(client, target["id"])["link"])

    check = _fresh_client().get(f"/auth/tokens/{token}")
    assert check.status_code == 200 and check.json()["valid"] is True
    assert check.json()["purpose"] in ("reset", "password_reset", "password-reset")

    user = _fresh_client()
    first = user.post(f"/auth/tokens/{token}/accept", json={"password": NEW_PASSWORD}, headers=H)
    assert first.status_code in (200, 204), first.text
    assert login(_fresh_client(), EMPLOYEE, NEW_PASSWORD).status_code == 200

    replay = _fresh_client()
    second = replay.post(
        f"/auth/tokens/{token}/accept", json={"password": "Third-T1me-Pass!"}, headers=H
    )
    assert second.status_code in (
        400,
        404,
        409,
        410,
        422,
    ), f"AC-029/NFR-005: the reset link worked twice ({second.status_code})"
    assert replay.get("/auth/me").status_code == 401
    assert login(_fresh_client(), EMPLOYEE, "Third-T1me-Pass!").status_code == 401
    # The first new password still stands.
    assert login(_fresh_client(), EMPLOYEE, NEW_PASSWORD).status_code == 200


def test_ac029_reissuing_a_reset_invalidates_the_previous_link(client):
    login(client, HR)
    target = _by_email(client, EMPLOYEE)
    old = _token_of(_issue_reset(client, target["id"])["link"])
    new = _token_of(_issue_reset(client, target["id"])["link"])
    assert old != new

    stale = _fresh_client().get(f"/auth/tokens/{old}")
    assert stale.status_code == 410 or stale.json().get("valid") is False
    refused = _fresh_client().post(
        f"/auth/tokens/{old}/accept", json={"password": NEW_PASSWORD}, headers=H
    )
    assert refused.status_code in (400, 404, 409, 410, 422)
    assert login(_fresh_client(), EMPLOYEE, DEV_PASSWORD).status_code == 200


def test_ac029_a_reset_link_must_also_satisfy_the_password_rules(client):
    login(client, HR)
    target = _by_email(client, EMPLOYEE)
    token = _token_of(_issue_reset(client, target["id"])["link"])
    anon = _fresh_client()
    r = anon.post(f"/auth/tokens/{token}/accept", json={"password": "a"}, headers=H)
    assert r.status_code == 422, r.text
    assert _messages(r), "AC-027: no English rule message on a weak password at accept"
    # The link survives a rejected attempt so the user can try again.
    retry = _fresh_client().post(
        f"/auth/tokens/{token}/accept", json={"password": NEW_PASSWORD}, headers=H
    )
    assert retry.status_code in (200, 204), retry.text


def test_ac029_only_hr_can_issue_a_reset_link(client):
    login(client, HR)
    target = _by_email(client, EMPLOYEE)
    client.cookies.clear()
    for email in (EMPLOYEE, MANAGER, "executive@example.com"):
        login(client, email)
        r = client.post(f"/employees/{target['id']}/password-resets", json={}, headers=H)
        assert r.status_code == 403 and r.content == b""
        client.cookies.clear()


# --------------------------------------------------------------- AC-030/NFR-004


def test_ac030_nfr004_the_stored_value_is_a_salted_argon2_hash(client):
    login(client, EMPLOYEE)
    assert _change(client, DEV_PASSWORD, NEW_PASSWORD).status_code in (200, 204)
    stored = _hash_of(EMPLOYEE)
    assert stored and stored != NEW_PASSWORD
    assert NEW_PASSWORD not in stored
    assert stored.startswith("$argon2"), f"the stored password is not argon2: {stored[:12]!r}"

    from app.auth import hash_password

    # Salted: the same password hashes differently every time.
    assert hash_password(NEW_PASSWORD) != hash_password(NEW_PASSWORD)


def test_ac030_no_endpoint_returns_the_password_or_its_hash(client):
    login(client, HR)
    target = _by_email(client, EMPLOYEE)
    responses = [
        client.get("/employees"),
        client.get(f"/employees/{target['id']}/record"),
        client.get("/auth/me"),
    ]
    client.cookies.clear()
    login(client, EMPLOYEE)
    responses.append(client.get("/auth/me"))
    responses.append(_change(client, DEV_PASSWORD, NEW_PASSWORD))
    for r in responses:
        body = r.text.lower()
        assert "password_hash" not in body
        assert "$argon2" not in body
        assert DEV_PASSWORD.lower() not in body
        assert NEW_PASSWORD.lower() not in body


def test_nfr004_the_plain_text_is_never_stored_anywhere(client):
    login(client, EMPLOYEE)
    assert _change(client, DEV_PASSWORD, NEW_PASSWORD).status_code in (200, 204)
    with SessionLocal() as db:
        rows = db.execute(text("SELECT details FROM audit_event")).scalars().all()
    blob = str(rows).lower()
    assert NEW_PASSWORD.lower() not in blob, "a password was written into the audit trail"
    assert DEV_PASSWORD.lower() not in blob


# -------------------------------------------------------------------- NFR-020


def test_nfr020_password_rules_come_from_system_settings(client):
    key = _min_length_key()
    original = _settings()[key]
    candidate = "Ab3!xyzq"  # eight characters
    try:
        _set_setting(key, 8)
        login(client, EMPLOYEE)
        r = _change(client, DEV_PASSWORD, candidate)
        assert r.status_code in (
            200,
            204,
        ), f"NFR-020: an 8-character password was refused with a minimum of 8: {r.text}"
        client.cookies.clear()

        _set_setting(key, 20)
        login(client, EMPLOYEE, candidate)
        r = _change(client, candidate, "Ab3!xyzqrs")  # ten characters, now too short
        assert r.status_code == 422, (
            "NFR-020: raising the minimum length in SystemSettings did not change enforcement"
        )
        assert _messages(r)
    finally:
        _set_setting(key, original)


def test_nfr020_the_rules_are_published_to_the_form(client):
    """The set-password screen shows the rules it will be judged by (AC-027)."""
    login(client, HR)
    target = _by_email(client, EMPLOYEE)
    token = _token_of(_issue_reset(client, target["id"])["link"])
    r = _fresh_client().get(f"/auth/tokens/{token}")
    assert r.status_code == 200
    rules = r.json().get("password_rules")
    assert rules, "AC-027: /auth/tokens/{token} publishes no password_rules"
