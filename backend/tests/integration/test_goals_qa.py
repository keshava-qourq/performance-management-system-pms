"""QA coverage for the goal lifecycle (US-011: AC-038..AC-047, NFR-009, NFR-015).

Runs against the real PostgreSQL given by DATABASE_URL through the shared
`client`/`login` fixtures in backend/tests/conftest.py. No mocks.

Contract under test (docs/sdlc/architecture/api/openapi.yaml):
  GET   /goals                  -> {goals[], weighting_total, over_100_warning, warning}
  POST  /goals                  -> 201 goal | 422 {errors}
  GET   /goals/{id}             -> {goal, children, comments, history[]}
  PATCH /goals/{id}             -> goal | 422 {errors} | 403 empty
  POST  /goals/{id}/progress    -> goal | 422 {errors} | 403 empty
"""

import time
import uuid
from datetime import date, timedelta

import pytest
from sqlalchemy import text

from app.database import SessionLocal
from tests.conftest import H, login

HR = "hr.admin@example.com"
MANAGER = "manager@example.com"
EMPLOYEE = "employee@example.com"
EXEC = "executive@example.com"
QA_PREFIX = "qa-goal-"

STATUSES = ["Not started", "On track", "At risk", "Off track", "Achieved", "Cancelled"]
FUTURE = (date.today() + timedelta(days=30)).isoformat()
PAST = (date.today() - timedelta(days=5)).isoformat()


@pytest.fixture(autouse=True)
def _clean_goals():
    yield
    with SessionLocal() as db:
        db.execute(text("DELETE FROM audit_event WHERE entity_type = 'goal'"))
        db.execute(text("DELETE FROM goal"))
        db.execute(text("UPDATE employee SET manager_id = NULL"))
        db.execute(text("DELETE FROM employee WHERE work_email LIKE :p"), {"p": QA_PREFIX + "%"})
        db.commit()


def _body(**over):
    payload = {
        "title": "Ship the onboarding guide",
        "description": "Write and publish it.",
        "target": "Guide published by the end of the quarter",
        "due_date": FUTURE,
        "weighting": 25,
    }
    payload.update(over)
    return payload


def _create(client, **over):
    r = client.post("/goals", json=_body(**over), headers=H)
    assert r.status_code == 201, r.text
    return r.json()


def _patch(client, goal_id, **fields):
    return client.patch(f"/goals/{goal_id}", json=fields, headers=H)


def _progress(client, goal_id, **fields):
    return client.post(f"/goals/{goal_id}/progress", json=fields, headers=H)


def _list(client, **params):
    query = "&".join(f"{k}={v}" for k, v in params.items())
    r = client.get("/goals" + (f"?{query}" if query else ""))
    assert r.status_code == 200, r.text
    return r.json()


def _audit_rows(goal_id):
    with SessionLocal() as db:
        return db.execute(
            text(
                "SELECT id, actor_id, action, details, created_at FROM audit_event"
                " WHERE entity_type = 'goal' AND entity_id = :i ORDER BY created_at, id"
            ),
            {"i": goal_id},
        ).all()


def _by_email(client, email):
    return next(e for e in client.get("/employees").json() if e["work_email"] == email)


# --------------------------------------------------------------------- AC-038


def test_ac038_a_new_goal_is_owned_by_its_author_starts_at_zero_and_is_listed(client):
    login(client, EMPLOYEE)
    created = _create(client)

    assert created["owner"]["full_name"] == "Emi Employee"
    assert created["progress"] == 0
    assert created["status"] == "Not started"
    assert created["title"] == "Ship the onboarding guide"
    assert created["target"]
    assert created["due_date"] == FUTURE
    assert created["period"], "AC-038: the goal was saved without a period"

    listed = _list(client)
    row = next(g for g in listed["goals"] if g["id"] == created["id"])
    assert row["progress"] == 0 and row["owner"]["id"] == created["owner"]["id"]


def test_ac038_the_owner_is_the_caller_not_a_value_the_caller_sends(client):
    login(client, HR)
    hr_person = _by_email(client, HR)
    other = _by_email(client, EMPLOYEE)
    created = client.post(
        "/goals", json=_body(owner_id=other["id"]), headers=H
    )  # owner_id is not part of the contract
    assert created.status_code == 201, created.text
    assert created.json()["owner"]["id"] == hr_person["id"]


# --------------------------------------------------------------------- AC-039


@pytest.mark.parametrize("field", ["title", "target", "due_date"])
def test_ac039_each_missing_mandatory_field_gets_its_own_english_message(client, field):
    login(client, EMPLOYEE)
    payload = _body()
    del payload[field]
    r = client.post("/goals", json=payload, headers=H)
    assert r.status_code == 422, r.text
    errors = r.json()["errors"]
    assert field in errors, f"AC-039: no field-level message for a missing {field}"
    message = errors[field]
    assert message.strip().endswith("."), f"not a sentence: {message!r}"
    assert len(message) > 5
    assert _list(client)["goals"] == [], "a goal was saved despite the 422"


def test_ac039_a_blank_value_is_treated_as_missing_and_all_fields_are_reported_at_once(client):
    login(client, EMPLOYEE)
    r = client.post("/goals", json={"title": "  ", "target": "", "due_date": ""}, headers=H)
    assert r.status_code == 422
    assert set(r.json()["errors"]) >= {"title", "target", "due_date"}
    assert _list(client)["goals"] == []


def test_ac039_a_malformed_due_date_is_field_level(client):
    login(client, EMPLOYEE)
    r = client.post("/goals", json=_body(due_date="31/12/2026"), headers=H)
    assert r.status_code == 422 and "due_date" in r.json()["errors"]


# --------------------------------------------------------------------- AC-040


@pytest.mark.parametrize("weighting", [-1, 101, 100.5, "abc", "", {}, [], True])
def test_ac040_an_out_of_range_or_non_numeric_weighting_is_refused(client, weighting):
    login(client, EMPLOYEE)
    r = client.post("/goals", json=_body(weighting=weighting), headers=H)
    assert r.status_code == 422, f"weighting {weighting!r} was accepted"
    assert "weighting" in r.json()["errors"]
    assert "0" in r.json()["errors"]["weighting"] and "100" in r.json()["errors"]["weighting"]
    assert _list(client)["goals"] == []


@pytest.mark.parametrize("weighting", [0, 50, 100, "40"])
def test_ac040_a_weighting_inside_the_range_is_accepted(client, weighting):
    login(client, EMPLOYEE)
    created = _create(client, weighting=weighting)
    assert float(created["weighting"]) == float(weighting)


def test_ac040_an_edit_cannot_push_the_weighting_out_of_range(client):
    login(client, EMPLOYEE)
    goal = _create(client, weighting=20)
    r = client.patch(f"/goals/{goal['id']}", json={"weighting": 140}, headers=H)
    assert r.status_code == 422 and "weighting" in r.json()["errors"]
    after = _list(client)["goals"][0]
    assert float(after["weighting"]) == 20.0, "the previous weighting was not kept"


# --------------------------------------------------------------------- AC-041


def test_ac041_weightings_over_100_for_a_period_warn_but_still_save(client):
    login(client, EMPLOYEE)
    period = "2099-Q1"
    first = _create(client, title="Goal A", weighting=60, period=period, due_date=FUTURE)
    second = _create(client, title="Goal B", weighting=55, period=period, due_date=FUTURE)
    # Both saves succeeded: the warning never blocks (NFR-019).
    assert first["id"] and second["id"]

    listed = _list(client, period=period)
    assert {g["id"] for g in listed["goals"]} == {first["id"], second["id"]}
    assert listed["weighting_total"] == 115
    assert listed["over_100_warning"] is True
    warning = listed["warning"]
    assert warning and "115" in warning and "100" in warning
    assert warning.strip().endswith(".")


def test_ac041_a_total_of_100_or_less_carries_no_warning(client):
    login(client, EMPLOYEE)
    period = "2099-Q2"
    _create(client, title="Goal A", weighting=60, period=period)
    _create(client, title="Goal B", weighting=40, period=period)
    listed = _list(client, period=period)
    assert listed["weighting_total"] == 100
    assert listed["over_100_warning"] is False
    assert listed["warning"] is None


# --------------------------------------------------------------------- AC-042


def test_ac042_an_edit_persists_with_who_changed_it_and_when(client):
    login(client, EMPLOYEE)
    goal = _create(client)
    before = goal["updated_at"]

    time.sleep(0.01)
    r = client.patch(
        f"/goals/{goal['id']}",
        json={"title": "Ship the revised guide", "target": "Published and reviewed"},
        headers=H,
    )
    assert r.status_code == 200, r.text
    edited = r.json()
    assert edited["title"] == "Ship the revised guide"
    assert edited["target"] == "Published and reviewed"
    assert edited["updated_by"]["full_name"] == "Emi Employee"
    assert edited["updated_at"] > before

    fetched = client.get(f"/goals/{goal['id']}").json()["goal"]
    assert fetched["title"] == "Ship the revised guide"
    assert fetched["updated_by"]["full_name"] == "Emi Employee"
    assert fetched["updated_at"] == edited["updated_at"]


def test_ac042_an_hr_edit_records_hr_as_the_last_person_to_change_it(client):
    login(client, EMPLOYEE)
    goal = _create(client)
    client.cookies.clear()

    login(client, HR)
    r = client.patch(f"/goals/{goal['id']}", json={"title": "Corrected by HR"}, headers=H)
    assert r.status_code == 200, r.text
    assert r.json()["updated_by"]["full_name"] == "Hana Admin"


# --------------------------------------------------------------- AC-043/AC-044


def test_ac043_progress_is_stored_with_the_person_and_the_date(client):
    login(client, EMPLOYEE)
    goal = _create(client)

    r = client.post(f"/goals/{goal['id']}/progress", json={"progress": 40}, headers=H)
    assert r.status_code == 200, r.text
    saved = r.json()
    assert saved["progress"] == 40
    assert saved["progress_updated_by"]["full_name"] == "Emi Employee"
    assert saved["progress_updated_at"], "AC-043: no date was stored with the progress update"

    fetched = client.get(f"/goals/{goal['id']}").json()["goal"]
    assert fetched["progress"] == 40
    assert fetched["progress_updated_by"]["full_name"] == "Emi Employee"


@pytest.mark.parametrize("value", [-1, 101, 1000, "abc", "", {}, True])
def test_ac044_out_of_range_progress_is_refused_and_the_previous_value_kept(client, value):
    login(client, EMPLOYEE)
    goal = _create(client)
    assert (
        client.post(f"/goals/{goal['id']}/progress", json={"progress": 30}, headers=H).status_code
        == 200
    )

    r = client.post(f"/goals/{goal['id']}/progress", json={"progress": value}, headers=H)
    assert r.status_code == 422, f"progress {value!r} was accepted"
    assert "progress" in r.json()["errors"]
    message = r.json()["errors"]["progress"]
    assert "0" in message and "100" in message and message.strip().endswith(".")

    assert client.get(f"/goals/{goal['id']}").json()["goal"]["progress"] == 30


@pytest.mark.parametrize("value", [0, 1, 99, 100])
def test_ac043_the_boundaries_of_the_range_are_accepted(client, value):
    login(client, EMPLOYEE)
    goal = _create(client)
    r = client.post(f"/goals/{goal['id']}/progress", json={"progress": value}, headers=H)
    assert r.status_code == 200, r.text
    assert r.json()["progress"] == value


def test_ac043_progress_is_never_calculated_only_what_the_person_typed(client):
    login(client, EMPLOYEE)
    parent = _create(client, title="Parent goal", weighting=10)
    child = _create(client, title="Child goal", weighting=10, parent_goal_id=parent["id"])
    assert _progress(client, child["id"], progress=100).status_code == 200
    assert client.get(f"/goals/{parent['id']}").json()["goal"]["progress"] == 0


# --------------------------------------------------------------------- AC-045


@pytest.mark.parametrize("status", STATUSES)
def test_ac045_every_status_round_trips(client, status):
    login(client, EMPLOYEE)
    goal = _create(client)
    r = client.post(f"/goals/{goal['id']}/progress", json={"status": status}, headers=H)
    assert r.status_code == 200, r.text
    assert r.json()["status"] == status
    assert client.get(f"/goals/{goal['id']}").json()["goal"]["status"] == status
    assert next(g for g in _list(client)["goals"] if g["id"] == goal["id"])["status"] == status


def test_ac045_an_unknown_status_is_refused_field_level(client):
    login(client, EMPLOYEE)
    goal = _create(client)
    r = client.post(f"/goals/{goal['id']}/progress", json={"status": "Nearly there"}, headers=H)
    assert r.status_code == 422 and "status" in r.json()["errors"]
    assert client.get(f"/goals/{goal['id']}").json()["goal"]["status"] == "Not started"


# --------------------------------------------------------------------- AC-046


def test_ac046_a_past_due_date_flags_the_goal_as_overdue(client):
    login(client, EMPLOYEE)
    goal = _create(client, due_date=PAST)
    assert goal["overdue"] is True
    assert next(g for g in _list(client)["goals"] if g["id"] == goal["id"])["overdue"] is True


def test_ac046_a_goal_due_today_or_later_is_not_overdue(client):
    login(client, EMPLOYEE)
    today = _create(client, title="Due today", due_date=date.today().isoformat())
    later = _create(client, title="Due later", due_date=FUTURE)
    assert today["overdue"] is False
    assert later["overdue"] is False


@pytest.mark.parametrize("status", ["Achieved", "Cancelled"])
def test_ac046_an_overdue_goal_stops_being_flagged_once_closed(client, status):
    login(client, EMPLOYEE)
    goal = _create(client, due_date=PAST)
    assert goal["overdue"] is True
    r = client.post(f"/goals/{goal['id']}/progress", json={"status": status}, headers=H)
    assert r.status_code == 200
    assert r.json()["overdue"] is False
    assert client.get(f"/goals/{goal['id']}").json()["goal"]["overdue"] is False


@pytest.mark.parametrize("status", ["Not started", "On track", "At risk", "Off track"])
def test_ac046_an_open_status_keeps_the_overdue_flag(client, status):
    login(client, EMPLOYEE)
    goal = _create(client, due_date=PAST)
    r = client.post(f"/goals/{goal['id']}/progress", json={"status": status}, headers=H)
    assert r.status_code == 200
    assert r.json()["overdue"] is True


def test_ac046_moving_the_due_date_forward_clears_the_flag(client):
    login(client, EMPLOYEE)
    goal = _create(client, due_date=PAST)
    r = client.patch(f"/goals/{goal['id']}", json={"due_date": FUTURE}, headers=H)
    assert r.status_code == 200, r.text
    assert r.json()["overdue"] is False


# --------------------------------------------------------------------- AC-047


@pytest.mark.parametrize("email", [MANAGER, EXEC])
def test_ac047_a_non_owner_non_hr_caller_is_refused_403_with_an_empty_body(client, email):
    login(client, EMPLOYEE)
    goal = _create(client)
    client.cookies.clear()

    login(client, email)
    edit = client.patch(f"/goals/{goal['id']}", json={"title": "Hijacked"}, headers=H)
    progress = client.post(f"/goals/{goal['id']}/progress", json={"progress": 90}, headers=H)
    for r in (edit, progress):
        assert r.status_code == 403, r.text
        assert r.content == b"", "AC-047: the refusal leaked a body"

    client.cookies.clear()
    login(client, EMPLOYEE)
    after = client.get(f"/goals/{goal['id']}").json()["goal"]
    assert after["title"] == "Ship the onboarding guide" and after["progress"] == 0


def test_ac047_the_owner_and_hr_may_still_write(client):
    login(client, EMPLOYEE)
    goal = _create(client)
    assert (
        client.post(f"/goals/{goal['id']}/progress", json={"progress": 10}, headers=H).status_code
        == 200
    )
    client.cookies.clear()
    login(client, HR)
    assert (
        client.post(f"/goals/{goal['id']}/progress", json={"progress": 20}, headers=H).status_code
        == 200
    )


def test_ac047_signed_out_calls_are_401(client):
    login(client, EMPLOYEE)
    goal = _create(client)
    client.cookies.clear()
    assert client.get("/goals").status_code == 401
    assert client.patch(f"/goals/{goal['id']}", json={"title": "X"}, headers=H).status_code == 401
    assert (
        client.post(f"/goals/{goal['id']}/progress", json={"progress": 5}, headers=H).status_code
        == 401
    )


# -------------------------------------------------------------------- NFR-009


def test_nfr009_create_edit_and_progress_each_append_an_audit_row_in_order(client):
    login(client, EMPLOYEE)
    goal = _create(client)
    assert _patch(client, goal["id"], title="Edited").status_code == 200
    assert _progress(client, goal["id"], progress=55).status_code == 200

    rows = _audit_rows(goal["id"])
    actions = [r.action for r in rows]
    assert actions == ["goal_created", "goal_edited", "goal_progress_updated"], actions
    for row in rows:
        assert row.actor_id is not None, "NFR-009: an audit row has no identity"
        assert row.created_at is not None, "NFR-009: an audit row has no timestamp"
        assert (row.details or {}).get("actor_name"), "NFR-009: the actor is not named"
    assert [r.created_at for r in rows] == sorted(r.created_at for r in rows)

    history = client.get(f"/goals/{goal['id']}").json()["history"]
    assert [h["action"] for h in history] == actions
    assert [h["created_at"] for h in history] == sorted(h["created_at"] for h in history)
    assert all(h["actor"]["full_name"] == "Emi Employee" for h in history)


def test_nfr009_no_route_edits_or_deletes_an_audit_entry(client):
    login(client, HR)
    paths = client.get("/openapi.json").json()["paths"]
    offending = [p for p in paths if "audit" in p or "history" in p]
    assert offending == [], f"NFR-009: a route exposes the audit trail for change: {offending}"


def test_nfr009_the_trail_survives_a_goal_being_removed(client):
    login(client, EMPLOYEE)
    goal = _create(client)
    assert _patch(client, goal["id"], title="Edited").status_code == 200
    before = [(r.id, r.action) for r in _audit_rows(goal["id"])]

    removed = client.delete(f"/goals/{goal['id']}", headers=H)
    assert removed.status_code in (204, 404, 405, 409), removed.text

    after = [(r.id, r.action) for r in _audit_rows(goal["id"])]
    assert after[: len(before)] == before, "NFR-009: earlier audit rows changed or were removed"


def test_nfr009_a_refused_change_writes_no_audit_row(client):
    login(client, EMPLOYEE)
    goal = _create(client)
    assert len(_audit_rows(goal["id"])) == 1
    assert _patch(client, goal["id"], weighting=500).status_code == 422
    client.cookies.clear()
    login(client, MANAGER)
    assert _patch(client, goal["id"], title="No").status_code == 403
    assert len(_audit_rows(goal["id"])) == 1


# -------------------------------------------------------------------- NFR-015


def test_nfr015_listing_goals_in_an_organisation_of_200_returns_without_timing_out(client):
    login(client, HR)
    dept = client.get("/departments").json()[0]["id"]
    title = client.get("/job-titles").json()[0]["id"]
    owner_ids = []
    with SessionLocal() as db:
        for i in range(200):
            new_id = uuid.uuid4()
            db.execute(
                text(
                    "INSERT INTO employee (id, full_name, work_email, role, status,"
                    " deactivated, department_id, job_title_id, updated_at)"
                    " VALUES (:i, :n, :e, 'employee', 'active', false, :d, :t, now())"
                ),
                {
                    "i": new_id,
                    "n": f"Goal Person {i:03d}",
                    "e": f"{QA_PREFIX}{new_id.hex}@example.com",
                    "d": dept,
                    "t": title,
                },
            )
            owner_ids.append(new_id)
            for k in range(3):
                db.execute(
                    text(
                        "INSERT INTO goal (id, owner_id, title, target, due_date, period,"
                        " weighting, progress, status, created_at, updated_at)"
                        " VALUES (:g, :o, :ti, 'A measurable target', :d, '2099-Q3',"
                        " 20, 10, 'On track', now(), now())"
                    ),
                    {
                        "g": uuid.uuid4(),
                        "o": new_id,
                        "ti": f"Bulk goal {i:03d}-{k}",
                        "d": FUTURE,
                    },
                )
        db.commit()

    started = time.monotonic()
    for owner in owner_ids[:25]:
        r = client.get(f"/goals?employee_id={owner}")
        assert r.status_code == 200, r.text
        assert len(r.json()["goals"]) == 3
    elapsed = time.monotonic() - started
    assert elapsed < 10, f"listing goals for 25 of 200 employees took {elapsed:.1f}s"


def test_nfr019_an_employee_with_no_goals_gets_an_empty_list_not_an_error(client):
    login(client, EMPLOYEE)
    listed = _list(client)
    assert listed["goals"] == []
    assert listed["weighting_total"] == 0
    assert listed["over_100_warning"] is False
    assert listed["warning"] is None
