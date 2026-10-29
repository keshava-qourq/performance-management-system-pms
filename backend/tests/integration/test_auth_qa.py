from sqlalchemy import text

from app.database import SessionLocal
from app.seed import DEV_PASSWORD
from tests.conftest import H, login

GENERIC = "The email or password is incorrect."


def _scalar(sql):
    with SessionLocal() as db:
        return db.execute(text(sql)).scalar()


def test_ac022_cookie_not_leaked_in_body(client):
    r = login(client)
    assert r.status_code == 200
    assert "session=" in r.headers["set-cookie"]
    assert "token" not in r.text.lower()


def test_ac022_email_case_insensitive(client):
    assert login(client, "Employee@Example.COM").status_code == 200


def test_ac023_wrong_password_and_unknown_email_identical_bytes(client):
    a = login(client, "employee@example.com", "bad")
    b = login(client, "ghost@example.com", "bad")
    assert a.content == b.content and a.status_code == b.status_code


def test_ac024_default_threshold_blocks_after_five(client):
    for _ in range(5):
        assert login(client, password="bad").status_code == 401
    r = login(client)  # correct password but blocked
    assert r.status_code == 401 and r.json() == {"detail": GENERIC}
    assert _scalar("SELECT count(*) FROM audit_event WHERE action='login_blocked'") == 1
    assert _scalar("SELECT count(*) FROM session") == 0


def test_ac024_block_is_per_account(client):
    _ = [login(client, password="bad") for _ in range(5)]
    assert login(client, "manager@example.com").status_code == 200


def test_ac024_below_threshold_still_signs_in(client):
    for _ in range(4):
        login(client, password="bad")
    assert login(client).status_code == 200


def test_ac025_logout_revokes_session_server_side(client):
    login(client)
    token = client.cookies.get("session")
    assert client.post("/auth/logout", headers=H).status_code == 204
    client.cookies.set("session", token)  # replay the old cookie
    assert client.get("/auth/me").status_code == 401


def test_ac025_logout_signed_out_is_401(client):
    assert client.post("/auth/logout", headers=H).status_code == 401


def test_ac026_deactivated_account_refused_without_failed_attempt(client):
    _ = DEV_PASSWORD
    with SessionLocal() as db:
        db.execute(
            text(
                "UPDATE employee SET deactivated=true, status='deactivated' "
                "WHERE work_email='manager@example.com'"
            )
        )
        db.commit()
    r = login(client, "manager@example.com")
    assert r.status_code == 401 and r.json() == {"detail": GENERIC}
    assert _scalar("SELECT count(*) FROM session") == 0
