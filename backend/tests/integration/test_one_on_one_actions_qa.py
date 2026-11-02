"""QA coverage for 1:1 action items and private manager notes
(US-027: AC-100..AC-103; US-028: AC-104..AC-106; NFR-007, NFR-015, NFR-020).

Runs against the real PostgreSQL given by DATABASE_URL through the shared
`client`/`login` fixtures in backend/tests/conftest.py. No mocks.

Contract under test (docs/sdlc/architecture/api/openapi.yaml):
  GET  /one-on-ones                      -> {one_on_ones[], open_action_items[]}
  POST /one-on-ones                      -> 201 {id, counterpart, meeting_date}
  GET  /one-on-ones/{id}                 -> {..., action_items[], carry_over[],
                                             private_note?, hr_can_read_private_notes}
  POST /one-on-ones/{id}/action-items    -> 201 {id, owner, due_date, overdue, completed_at}
  POST /action-items/{id}/complete       -> 200 {completed_at, completed_by}
  PUT  /one-on-ones/{id}/private-note    -> 200
  GET  /me/dashboard                     -> {..., attention[]}
  GET/PUT /settings                      -> hr_private_notes_visible
"""

import time
from datetime import date, timedelta

import pytest
from sqlalchemy import text

from app.database import SessionLocal
from tests.conftest import H, login

HR = "hr.admin@example.com"
MGR = "manager@example.com"
EMP = "employee@example.com"
EXEC = "executive@example.com"

NOTE_KEY = "hr_private_notes_visible"
SECRET_NOTE = "QA-PRIVATE-OBSERVATION-do-not-leak"

TODAY = date.today()
PAST = (TODAY - timedelta(days=7)).isoformat()
FUTURE = (TODAY + timedelta(days=14)).isoformat()

# Rows these tests create. Dropped only where the delivered schema has them, so
# the file still runs cleanly before the 1:1 tables land.
OWN_TABLES = (
    "one_on_one_private_note",
    "action_item",
    "talking_point",
    "one_on_one",
)


def _sql(sql, **p):
    with SessionLocal() as db:
        db.execute(text(sql), p)
        db.commit()


def _scalar(sql, **p):
    with SessionLocal() as db:
        return db.execute(text(sql), p).scalar()


def _table_exists(name):
    return bool(
        _scalar("SELECT to_regclass(:n) IS NOT NULL", n=f"public.{name}"),
    )


def _reset():
    for table in OWN_TABLES:
        if _table_exists(table):
            _sql(f"DELETE FROM {table}")
    _sql("UPDATE employee SET manager_id = NULL")
    if _scalar("SELECT count(*) FROM system_setting WHERE key = :k", k=NOTE_KEY):
        _sql("UPDATE system_setting SET value = 'false' WHERE key = :k", k=NOTE_KEY)


@pytest.fixture(autouse=True)
def _clean_one_on_ones():
    _reset()
    yield
    _reset()


def _id(client, email):
    login(client, email)
    who = client.get("/auth/me").json()["id"]
    client.cookies.clear()
    return who


@pytest.fixture
def people(client):
    """Mo Manager manages Emi Employee, as US-027 assumes."""
    mgr, emp = _id(client, MGR), _id(client, EMP)
    _sql("UPDATE employee SET manager_id = :m WHERE id = :e", m=mgr, e=emp)
    return {"manager": mgr, "employee": emp}


def _as(client, email):
    client.cookies.clear()
    r = login(client, email)
    assert r.status_code == 200, r.text
    return client


def _create_one_on_one(client, report_id=None, meeting_date=FUTURE):
    body = {"meeting_date": meeting_date}
    if report_id:
        body["report_id"] = report_id
    r = client.post("/one-on-ones", json=body, headers=H)
    assert r.status_code in (200, 201), r.text
    return r.json()


def _detail(client, one_on_one_id):
    r = client.get(f"/one-on-ones/{one_on_one_id}")
    assert r.status_code == 200, r.text
    return r.json()


def _add_item(client, one_on_one_id, owner_id, due_date=FUTURE, description="Write the summary"):
    return client.post(
        f"/one-on-ones/{one_on_one_id}/action-items",
        json={"description": description, "owner_id": owner_id, "due_date": due_date},
        headers=H,
    )


def _open_items(client):
    r = client.get("/one-on-ones")
    assert r.status_code == 200, r.text
    body = r.json()
    assert isinstance(body, dict), "AC-100: GET /one-on-ones carries no open_action_items"
    return body.get("open_action_items", [])


def _set_due(item_id, due_date):
    _sql("UPDATE action_item SET due_date = :d WHERE id = :i", d=due_date, i=item_id)


# --------------------------------------------------------------- AC-100/AC-101


def test_ac100_an_action_item_saves_with_its_owner_and_due_date(client, people):
    _as(client, MGR)
    meeting = _create_one_on_one(client, report_id=people["employee"])

    created = _add_item(
        client,
        meeting["id"],
        people["employee"],
        description="Draft the onboarding plan",
    )
    assert created.status_code == 201, created.text
    item = created.json()
    assert item["description"] == "Draft the onboarding plan"
    assert item["owner"]["id"] == people["employee"]
    assert item["due_date"] == FUTURE
    assert item["completed_at"] is None

    # It is saved on the 1:1 for both participants.
    for email in (MGR, EMP):
        _as(client, email)
        items = _detail(client, meeting["id"])["action_items"]
        assert [i["id"] for i in items] == [item["id"]]


def test_ac100_the_item_appears_in_the_owners_open_items(client, people):
    _as(client, MGR)
    meeting = _create_one_on_one(client, report_id=people["employee"])
    mine = _add_item(client, meeting["id"], people["manager"], description="Book the room").json()
    theirs = _add_item(
        client, meeting["id"], people["employee"], description="Bring the numbers"
    ).json()

    _as(client, MGR)
    assert [i["id"] for i in _open_items(client)] == [mine["id"]]
    _as(client, EMP)
    assert [i["id"] for i in _open_items(client)] == [theirs["id"]]


def test_ac100_either_participant_may_own_and_either_may_add(client, people):
    _as(client, MGR)
    meeting = _create_one_on_one(client, report_id=people["employee"])
    _as(client, EMP)
    added = _add_item(client, meeting["id"], people["manager"], description="Share the template")
    assert added.status_code == 201, added.text
    assert added.json()["owner"]["id"] == people["manager"]


@pytest.mark.parametrize(
    "field,value",
    [("description", "  "), ("due_date", ""), ("due_date", "31/12/2026")],
)
def test_ac100_an_incomplete_action_item_is_422_field_level_and_saves_nothing(
    client, people, field, value
):
    _as(client, MGR)
    meeting = _create_one_on_one(client, report_id=people["employee"])
    body = {
        "description": "Something",
        "owner_id": people["employee"],
        "due_date": FUTURE,
    }
    body[field] = value
    r = client.post(f"/one-on-ones/{meeting['id']}/action-items", json=body, headers=H)
    assert r.status_code == 422, r.text
    assert field in r.json()["errors"]
    assert _detail(client, meeting["id"])["action_items"] == []


def test_ac100_an_owner_who_is_not_a_participant_is_refused(client, people):
    other = _id(client, EXEC)
    _as(client, MGR)
    meeting = _create_one_on_one(client, report_id=people["employee"])
    r = _add_item(client, meeting["id"], other)
    assert r.status_code == 422, r.text
    assert "owner_id" in r.json()["errors"]
    assert _detail(client, meeting["id"])["action_items"] == []


def test_ac101_completing_records_the_date_and_who_completed_it(client, people):
    _as(client, MGR)
    meeting = _create_one_on_one(client, report_id=people["employee"])
    item = _add_item(client, meeting["id"], people["employee"]).json()

    _as(client, EMP)
    r = client.post(f"/action-items/{item['id']}/complete", headers=H)
    assert r.status_code == 200, r.text
    done = r.json()
    assert done["completed_at"], "AC-101: no completion date was stored"
    assert done["completed_by"]["id"] == people["employee"]
    assert done["completed_by"]["full_name"] == "Emi Employee"

    # It leaves the owner's open items and reads as complete for both of them.
    assert [i["id"] for i in _open_items(client)] == []
    for email in (MGR, EMP):
        _as(client, email)
        shown = next(
            i for i in _detail(client, meeting["id"])["action_items"] if i["id"] == item["id"]
        )
        assert shown["completed_at"] == done["completed_at"]
        assert shown["completed_by"]["full_name"] == "Emi Employee"


def test_ac101_a_completed_item_is_no_longer_overdue(client, people):
    _as(client, MGR)
    meeting = _create_one_on_one(client, report_id=people["employee"], meeting_date=PAST)
    item = _add_item(client, meeting["id"], people["manager"], due_date=PAST).json()
    assert item["overdue"] is True
    done = client.post(f"/action-items/{item['id']}/complete", headers=H)
    assert done.status_code == 200, done.text
    assert done.json()["overdue"] is False


# --------------------------------------------------------------------- AC-102


def test_ac102_an_overdue_open_item_is_flagged_for_both_participants(client, people):
    _as(client, MGR)
    meeting = _create_one_on_one(client, report_id=people["employee"], meeting_date=PAST)
    overdue = _add_item(
        client, meeting["id"], people["employee"], due_date=PAST, description="Late task"
    ).json()
    on_time = _add_item(
        client, meeting["id"], people["employee"], due_date=FUTURE, description="Future task"
    ).json()
    assert overdue["overdue"] is True
    assert on_time["overdue"] is False

    for email in (MGR, EMP):
        _as(client, email)
        shown = {i["id"]: i for i in _detail(client, meeting["id"])["action_items"]}
        assert shown[overdue["id"]]["overdue"] is True, f"AC-102: not flagged for {email}"
        assert shown[on_time["id"]]["overdue"] is False


def test_ac102_an_item_due_today_is_not_yet_overdue(client, people):
    _as(client, MGR)
    meeting = _create_one_on_one(client, report_id=people["employee"])
    item = _add_item(client, meeting["id"], people["manager"], due_date=TODAY.isoformat()).json()
    assert item["overdue"] is False


def test_ac102_the_overdue_item_reaches_the_owners_dashboard(client, people):
    _as(client, MGR)
    meeting = _create_one_on_one(client, report_id=people["employee"], meeting_date=PAST)
    item = _add_item(
        client, meeting["id"], people["employee"], due_date=PAST, description="Late task"
    ).json()

    _as(client, EMP)
    board = client.get("/me/dashboard")
    assert board.status_code == 200, board.text
    attention = board.json()["attention"]
    assert attention, "AC-102/AC-108: an overdue action item is missing from 'Needs your attention'"
    blob = str(attention)
    assert "Late task" in blob or item["id"] in blob
    assert [i["id"] for i in _open_items(client)] == [item["id"]]


def test_ac102_the_overdue_item_also_shows_on_the_other_participants_1_to_1_list(client, people):
    _as(client, MGR)
    meeting = _create_one_on_one(client, report_id=people["employee"], meeting_date=PAST)
    _add_item(client, meeting["id"], people["employee"], due_date=PAST)

    _as(client, MGR)
    row = next(
        r for r in client.get("/one-on-ones").json()["one_on_ones"] if r["id"] == meeting["id"]
    )
    assert row.get("overdue_action_item_count") == 1


# --------------------------------------------------------------------- AC-103


def test_ac103_still_open_items_from_earlier_1_to_1s_are_listed_as_carry_over(client, people):
    _as(client, MGR)
    earlier = _create_one_on_one(client, report_id=people["employee"], meeting_date=PAST)
    still_open = _add_item(
        client, earlier["id"], people["employee"], due_date=PAST, description="Unfinished"
    ).json()
    finished = _add_item(
        client, earlier["id"], people["manager"], due_date=PAST, description="Finished"
    ).json()
    assert client.post(f"/action-items/{finished['id']}/complete", headers=H).status_code == 200

    later = _create_one_on_one(client, report_id=people["employee"], meeting_date=FUTURE)
    for email in (MGR, EMP):
        _as(client, email)
        carried = _detail(client, later["id"])["carry_over"]
        ids = [i["id"] for i in carried]
        assert still_open["id"] in ids, f"AC-103: open item not carried over for {email}"
        assert finished["id"] not in ids, "AC-103: a completed item was carried over"
        row = next(i for i in carried if i["id"] == still_open["id"])
        assert row["description"] == "Unfinished"
        assert row.get("one_on_one_id") == earlier["id"] or row.get("meeting_date") == PAST


def test_ac103_carry_over_is_limited_to_the_same_pair(client, people):
    exec_id = _id(client, EXEC)
    _sql("UPDATE employee SET manager_id = :m WHERE id = :e", m=people["manager"], e=exec_id)

    _as(client, MGR)
    with_exec = _create_one_on_one(client, report_id=exec_id, meeting_date=PAST)
    theirs = _add_item(
        client, with_exec["id"], exec_id, due_date=PAST, description="Someone else's"
    ).json()
    fresh = _create_one_on_one(client, report_id=people["employee"], meeting_date=FUTURE)
    assert theirs["id"] not in [i["id"] for i in _detail(client, fresh["id"])["carry_over"]]


def test_ac103_a_first_1_to_1_carries_nothing_over(client, people):
    _as(client, MGR)
    first = _create_one_on_one(client, report_id=people["employee"])
    assert _detail(client, first["id"])["carry_over"] == []


# --------------------------------------------------- AC-104/AC-105 and NFR-007


def _save_note(client, one_on_one_id, body=SECRET_NOTE):
    return client.put(f"/one-on-ones/{one_on_one_id}/private-note", json={"body": body}, headers=H)


def test_ac104_the_manager_saves_a_private_note_and_reads_it_back(client, people):
    _as(client, MGR)
    meeting = _create_one_on_one(client, report_id=people["employee"])
    r = _save_note(client, meeting["id"])
    assert r.status_code in (200, 204), r.text

    detail = _detail(client, meeting["id"])
    assert detail["private_note"] == SECRET_NOTE
    assert detail["i_am_manager"] is True
    # The screen must be able to state who can read it (NFR-007).
    assert "hr_can_read_private_notes" in detail


def test_ac104_an_edited_note_replaces_the_previous_one(client, people):
    _as(client, MGR)
    meeting = _create_one_on_one(client, report_id=people["employee"])
    assert _save_note(client, meeting["id"]).status_code in (200, 204)
    assert _save_note(client, meeting["id"], "Second thoughts").status_code in (200, 204)
    assert _detail(client, meeting["id"])["private_note"] == "Second thoughts"


def test_ac105_nfr007_no_response_to_the_direct_report_contains_the_note(client, people):
    _as(client, MGR)
    meeting = _create_one_on_one(client, report_id=people["employee"])
    assert _save_note(client, meeting["id"]).status_code in (200, 204)

    _as(client, EMP)
    responses = {
        "detail": client.get(f"/one-on-ones/{meeting['id']}"),
        "list": client.get("/one-on-ones"),
        "dashboard": client.get("/me/dashboard"),
    }
    for name, r in responses.items():
        assert r.status_code == 200, f"{name}: {r.text}"
        assert SECRET_NOTE not in r.text, f"NFR-007: the private note leaked in the {name} response"
    body = responses["detail"].json()
    assert body.get("private_note") in (None, "") or "private_note" not in body
    assert body["i_am_manager"] is False


def test_ac105_the_report_cannot_write_or_read_the_note_through_its_own_route(client, people):
    _as(client, MGR)
    meeting = _create_one_on_one(client, report_id=people["employee"])
    assert _save_note(client, meeting["id"]).status_code in (200, 204)

    _as(client, EMP)
    r = client.put(
        f"/one-on-ones/{meeting['id']}/private-note", json={"body": "Mine now"}, headers=H
    )
    assert r.status_code in (403, 404), r.text
    assert r.content == b"" or SECRET_NOTE not in r.text

    _as(client, MGR)
    assert _detail(client, meeting["id"])["private_note"] == SECRET_NOTE


# ---------------------------------------------------------- AC-106 / NFR-020


def _set_hr_visibility(client, value):
    _as(client, HR)
    r = client.put("/settings", json={NOTE_KEY: value}, headers=H)
    assert r.status_code == 200, r.text
    assert r.json()[NOTE_KEY] is value


def test_ac106_hr_cannot_read_the_note_while_the_setting_is_off(client, people):
    _as(client, MGR)
    meeting = _create_one_on_one(client, report_id=people["employee"])
    assert _save_note(client, meeting["id"]).status_code in (200, 204)
    assert _detail(client, meeting["id"])["hr_can_read_private_notes"] is False

    _set_hr_visibility(client, False)
    r = client.get(f"/one-on-ones/{meeting['id']}")
    assert r.status_code in (200, 403, 404), r.text
    assert SECRET_NOTE not in r.text, "AC-106: HR read a private note while the setting was off"


def test_ac106_hr_reads_the_note_once_the_setting_is_on(client, people):
    _as(client, MGR)
    meeting = _create_one_on_one(client, report_id=people["employee"])
    assert _save_note(client, meeting["id"]).status_code in (200, 204)

    _set_hr_visibility(client, True)
    r = client.get(f"/one-on-ones/{meeting['id']}")
    assert r.status_code == 200, r.text
    assert r.json().get("private_note") == SECRET_NOTE


def test_ac106_the_manager_is_told_which_state_the_setting_is_in(client, people):
    _as(client, MGR)
    meeting = _create_one_on_one(client, report_id=people["employee"])
    assert _save_note(client, meeting["id"]).status_code in (200, 204)
    assert _detail(client, meeting["id"])["hr_can_read_private_notes"] is False

    _set_hr_visibility(client, True)
    _as(client, MGR)
    assert _detail(client, meeting["id"])["hr_can_read_private_notes"] is True


def test_ac106_the_setting_change_never_exposes_the_note_to_the_report(client, people):
    _as(client, MGR)
    meeting = _create_one_on_one(client, report_id=people["employee"])
    assert _save_note(client, meeting["id"]).status_code in (200, 204)
    _set_hr_visibility(client, True)

    _as(client, EMP)
    r = client.get(f"/one-on-ones/{meeting['id']}")
    assert r.status_code == 200, r.text
    assert SECRET_NOTE not in r.text


def test_nfr020_the_visibility_state_lives_in_system_setting(client):
    _set_hr_visibility(client, True)
    assert _scalar("SELECT value FROM system_setting WHERE key = :k", k=NOTE_KEY) is True
    _set_hr_visibility(client, False)
    assert _scalar("SELECT value FROM system_setting WHERE key = :k", k=NOTE_KEY) is False


@pytest.mark.parametrize("who", [EMP, MGR, EXEC])
def test_nfr020_non_hr_cannot_change_the_visibility_setting(client, who):
    _as(client, who)
    r = client.put("/settings", json={NOTE_KEY: True}, headers=H)
    assert r.status_code == 403 and r.content == b""
    assert _scalar("SELECT value FROM system_setting WHERE key = :k", k=NOTE_KEY) is False


def test_nfr020_signed_out_cannot_change_the_visibility_setting(client):
    assert client.put("/settings", json={NOTE_KEY: True}, headers=H).status_code == 401
    assert _scalar("SELECT value FROM system_setting WHERE key = :k", k=NOTE_KEY) is False


# ------------------------------------------------------------------ role rules


def test_roles_a_non_participant_is_403_with_an_empty_body(client, people):
    _as(client, MGR)
    meeting = _create_one_on_one(client, report_id=people["employee"])
    item = _add_item(client, meeting["id"], people["employee"]).json()

    _as(client, EXEC)
    for r in (
        client.get(f"/one-on-ones/{meeting['id']}"),
        client.post(
            f"/one-on-ones/{meeting['id']}/action-items",
            json={"description": "No", "owner_id": people["employee"], "due_date": FUTURE},
            headers=H,
        ),
        client.post(f"/action-items/{item['id']}/complete", headers=H),
        client.put(f"/one-on-ones/{meeting['id']}/private-note", json={"body": "No"}, headers=H),
    ):
        assert r.status_code == 403, r.text
        assert r.content == b"", "a refusal leaked a body"

    _as(client, MGR)
    after = _detail(client, meeting["id"])
    assert [i["id"] for i in after["action_items"]] == [item["id"]]
    assert after["action_items"][0]["completed_at"] is None
    assert after["private_note"] in (None, "")


def test_roles_signed_out_calls_are_401(client, people):
    _as(client, MGR)
    meeting = _create_one_on_one(client, report_id=people["employee"])
    item = _add_item(client, meeting["id"], people["manager"]).json()
    client.cookies.clear()

    assert client.get("/one-on-ones").status_code == 401
    assert client.get(f"/one-on-ones/{meeting['id']}").status_code == 401
    assert (
        client.post(
            f"/one-on-ones/{meeting['id']}/action-items",
            json={"description": "X", "owner_id": people["manager"], "due_date": FUTURE},
            headers=H,
        ).status_code
        == 401
    )
    assert client.post(f"/action-items/{item['id']}/complete", headers=H).status_code == 401
    assert (
        client.put(
            f"/one-on-ones/{meeting['id']}/private-note", json={"body": "X"}, headers=H
        ).status_code
        == 401
    )


def test_roles_mutations_require_the_custom_header(client, people):
    _as(client, MGR)
    meeting = _create_one_on_one(client, report_id=people["employee"])
    item = _add_item(client, meeting["id"], people["manager"]).json()

    for r in (
        client.post("/one-on-ones", json={"report_id": people["employee"], "meeting_date": FUTURE}),
        client.post(
            f"/one-on-ones/{meeting['id']}/action-items",
            json={"description": "X", "owner_id": people["manager"], "due_date": FUTURE},
        ),
        client.post(f"/action-items/{item['id']}/complete"),
        client.put(f"/one-on-ones/{meeting['id']}/private-note", json={"body": SECRET_NOTE}),
    ):
        assert r.status_code == 403, r.text
        assert r.content == b""

    detail = _detail(client, meeting["id"])
    assert [i["id"] for i in detail["action_items"]] == [item["id"]]
    assert detail["action_items"][0]["completed_at"] is None
    assert detail["private_note"] in (None, "")


# -------------------------------------------------------------------- NFR-015


def test_nfr015_a_1_to_1_with_many_action_items_loads_within_the_time_budget(client, people):
    """Sized for one company under 200: a busy 1:1 history must still open fast."""
    _as(client, MGR)
    meetings = [
        _create_one_on_one(
            client,
            report_id=people["employee"],
            meeting_date=(TODAY - timedelta(days=offset)).isoformat(),
        )
        for offset in range(30, 0, -3)
    ]
    for meeting in meetings:
        for owner in (people["manager"], people["employee"]):
            assert _add_item(client, meeting["id"], owner, due_date=PAST).status_code == 201

    newest = _create_one_on_one(client, report_id=people["employee"], meeting_date=FUTURE)
    started = time.monotonic()
    detail = _detail(client, newest["id"])
    listed = client.get("/one-on-ones")
    elapsed = time.monotonic() - started
    assert listed.status_code == 200
    assert len(detail["carry_over"]) >= 20
    assert elapsed < 10, f"opening a busy 1:1 took {elapsed:.1f}s"
