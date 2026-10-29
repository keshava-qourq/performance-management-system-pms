import pytest
from sqlalchemy import text

from app.database import SessionLocal
from tests.conftest import H, login

HR = "hr.admin@example.com"
NON_HR = ["employee@example.com", "manager@example.com", "executive@example.com"]
EMAIL = "qa-new@example.com"


@pytest.fixture(autouse=True)
def _purge():
    yield
    with SessionLocal() as db:
        db.execute(text("DELETE FROM employee WHERE work_email = :e"), {"e": EMAIL})
        db.commit()


def _refs(client):
    return client.get("/departments").json(), client.get("/job-titles").json()


def _body(client, **over):
    d, t = _refs(client)
    p = {
        "full_name": "Qa Person",
        "work_email": EMAIL,
        "job_title_id": t[0]["id"],
        "department_id": d[0]["id"],
    }
    p.update(over)
    return p


def test_ac001_created_employee_listed_with_title_and_department(client):
    login(client, HR)
    r = client.post("/employees", json=_body(client), headers=H)
    assert r.status_code == 201
    rows = client.get("/employees").json()
    row = next(x for x in rows if x["id"] == r.json()["id"])
    assert row["full_name"] == "Qa Person" and row["job_title"]["name"] and row["department"]["name"]


def test_ac002_missing_name_message_is_field_level_english(client):
    login(client, HR)
    r = client.post("/employees", json=_body(client, full_name=""), headers=H)
    assert r.status_code == 422
    assert r.json()["errors"] == {"full_name": "Enter the employee's full name."}


def test_ac002_missing_email_message_is_field_level_english(client):
    login(client, HR)
    p = _body(client)
    del p["work_email"]
    r = client.post("/employees", json=p, headers=H)
    assert r.status_code == 422
    assert r.json()["errors"] == {"work_email": "Enter a work email address."}


def test_ac002_duplicate_email_any_case_message(client):
    login(client, HR)
    r = client.post("/employees", json=_body(client, work_email="EMPLOYEE@Example.com"), headers=H)
    assert r.status_code == 422
    assert r.json()["errors"] == {
        "work_email": "This work email is already used by another employee."
    }


def test_ac003_edit_visible_on_next_get(client):
    login(client, HR)
    created = client.post("/employees", json=_body(client), headers=H).json()
    d, t = _refs(client)
    r = client.patch(
        f"/employees/{created['id']}",
        json={"job_title_id": t[-1]["id"], "department_id": d[-1]["id"]},
        headers=H,
    )
    assert r.status_code == 200
    row = next(x for x in client.get("/employees").json() if x["id"] == created["id"])
    assert row["job_title"]["id"] == t[-1]["id"] and row["department"]["id"] == d[-1]["id"]


@pytest.mark.parametrize("email", NON_HR)
def test_ac004_nfr001_server_refuses_post_and_patch_403_empty(client, email):
    login(client, HR)
    payload = _body(client)
    target = client.get("/employees").json()[0]
    client.cookies.clear()
    login(client, email)
    for r in (
        client.post("/employees", json=payload, headers=H),
        client.patch(f"/employees/{target['id']}", json={"full_name": "Hacked"}, headers=H),
    ):
        assert r.status_code == 403 and r.content == b""
    client.cookies.clear()
    login(client, HR)
    rows = client.get("/employees").json()
    assert not any(x["work_email"] == EMAIL for x in rows)
    assert next(x for x in rows if x["id"] == target["id"])["full_name"] == target["full_name"]


@pytest.mark.parametrize("email", NON_HR)
def test_nfr001_non_hr_cannot_read_directory(client, email):
    login(client, email)
    r = client.get("/employees")
    assert r.status_code == 403 and r.content == b""


def test_nfr015_directory_lists_under_200_quickly(client):
    login(client, HR)
    assert len(client.get("/employees").json()) < 200
