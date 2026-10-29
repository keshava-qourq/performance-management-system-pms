import pytest
from sqlalchemy import text

from app.database import SessionLocal
from tests.conftest import H, login

HR = "hr.admin@example.com"


@pytest.fixture(autouse=True)
def _purge():
    yield
    with SessionLocal() as db:
        db.execute(text("DELETE FROM employee WHERE work_email = 'new@example.com'"))
        db.commit()


def _ids(client):
    d = client.get("/departments").json()
    t = client.get("/job-titles").json()
    return d, t


def _payload(client, email="new@example.com", name="New Person"):
    d, t = _ids(client)
    return {
        "full_name": name,
        "work_email": email,
        "job_title_id": t[0]["id"],
        "department_id": d[0]["id"],
    }


def test_ac001_create_and_list(client):
    login(client, HR)
    r = client.post("/employees", json=_payload(client), headers=H)
    assert r.status_code == 201
    body = r.json()
    assert body["full_name"] == "New Person" and body["department"]["name"]
    rows = client.get("/employees").json()
    row = next(x for x in rows if x["id"] == body["id"])
    assert row["work_email"] == "new@example.com" and row["job_title"]["name"]
    assert "password_hash" not in row and "session" not in str(row).lower()


def test_ac002_missing_and_blank_422(client):
    login(client, HR)
    r = client.post("/employees", json={"full_name": "  "}, headers=H)
    assert r.status_code == 422
    errs = r.json()["errors"]
    assert "full name" in errs["full_name"] and "email" in errs["work_email"]


def test_ac002_duplicate_email_case_insensitive_and_own_email_ok(client):
    login(client, HR)
    p = _payload(client)
    first = client.post("/employees", json=p, headers=H).json()
    p2 = _payload(client, email="NEW@example.com", name="Other")
    r = client.post("/employees", json=p2, headers=H)
    assert r.status_code == 422 and "already used" in r.json()["errors"]["work_email"]
    n = len([x for x in client.get("/employees").json() if x["work_email"] == "new@example.com"])
    assert n == 1
    ok = client.patch(
        f"/employees/{first['id']}", json={"work_email": "New@example.com"}, headers=H
    )
    assert ok.status_code == 200
    r = client.patch(
        f"/employees/{first['id']}", json={"work_email": "employee@example.com"}, headers=H
    )
    assert r.status_code == 422
    r = client.patch(f"/employees/{first['id']}", json={"full_name": ""}, headers=H)
    assert r.status_code == 422 and "full_name" in r.json()["errors"]


def test_ac003_patch_persists_and_nonexistent_refs_422(client):
    login(client, HR)
    first = client.post("/employees", json=_payload(client), headers=H).json()
    d, t = _ids(client)
    r = client.patch(
        f"/employees/{first['id']}",
        json={"job_title_id": t[-1]["id"], "department_id": d[-1]["id"]},
        headers=H,
    )
    assert r.status_code == 200
    assert r.json()["department"]["id"] == d[-1]["id"]
    row = next(x for x in client.get("/employees").json() if x["id"] == first["id"])
    assert row["job_title"]["id"] == t[-1]["id"] and row["department"]["id"] == d[-1]["id"]
    bad = "00000000-0000-0000-0000-000000000000"
    r = client.patch(f"/employees/{first['id']}", json={"department_id": bad}, headers=H)
    assert r.status_code == 422 and "department_id" in r.json()["errors"]


@pytest.mark.parametrize(
    "email", ["employee@example.com", "manager@example.com", "executive@example.com"]
)
def test_ac004_non_hr_403_empty(client, email):
    login(client, HR)
    p = _payload(client)
    target = client.get("/employees").json()[0]["id"]
    client.cookies.clear()
    login(client, email)
    for r in (
        client.get("/employees"),
        client.post("/employees", json=p, headers=H),
        client.patch(f"/employees/{target}", json={"full_name": "X"}, headers=H),
    ):
        assert r.status_code == 403 and r.content == b""
    assert client.get("/departments").status_code == 200
    assert client.get("/job-titles").status_code == 200


def test_ac004_signed_out_401(client):
    assert client.get("/employees").status_code == 401
    assert client.post("/employees", json={}, headers=H).status_code == 401
    assert (
        client.patch(
            f"/employees/{'0' * 8}-0000-0000-0000-{'0' * 12}", json={}, headers=H
        ).status_code
        == 401
    )
    assert client.get("/departments").status_code == 401
