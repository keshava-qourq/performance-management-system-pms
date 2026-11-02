"""QA coverage for review periods (US-017: AC-063..AC-066, NFR-010, NFR-014, NFR-015).

Runs against the real PostgreSQL given by DATABASE_URL and the real Redis queue
given by REDIS_URL through the shared `client`/`login` fixtures in
backend/tests/conftest.py. No mocks.

Contract under test:
  POST   /review-periods                              -> 201 period | 422 {errors}
  GET    /review-periods, /review-periods/{id}        -> period(s)
  PATCH  /review-periods/{id}                         -> draft edits
  POST   /review-periods/{id}/open                    -> period, queues task creation
  POST   /review-periods/{id}/close                   -> period
  DELETE /review-periods/{id}/participants/{emp_id}   -> period | 422 {errors}
  GET    /review-periods/{id}/status                  -> submitted vs outstanding, overdue
"""

import os
import time
import uuid
from datetime import date, timedelta

import pytest
from sqlalchemy import text

from app import jobs
from app.database import SessionLocal
from tests.conftest import H, login

HR = "hr.admin@example.com"
MANAGER = "manager@example.com"
EMPLOYEE = "employee@example.com"
EXEC = "executive@example.com"
NON_HR = [EMPLOYEE, MANAGER, EXEC]
QA_PREFIX = "qa-period-"

TODAY = date.today()
START = TODAY.isoformat()
END = (TODAY + timedelta(days=30)).isoformat()
DEADLINE = (TODAY + timedelta(days=20)).isoformat()
PAST_DEADLINE = (TODAY - timedelta(days=1)).isoformat()


@pytest.fixture(autouse=True)
def _clean_periods():
    _drop_queued_jobs()
    yield
    _drop_queued_jobs()
    with SessionLocal() as db:
        for sql in (
            "DELETE FROM self_review",
            "DELETE FROM review_period_participant",
            "DELETE FROM review_period",
            "DELETE FROM question",
            "DELETE FROM competency",
            "DELETE FROM questionnaire_version",
            "DELETE FROM questionnaire_template",
            "DELETE FROM rating_scale_point",
            "DELETE FROM rating_scale",
        ):
            db.execute(text(sql))
        db.execute(text("DELETE FROM employee WHERE work_email LIKE :p"), {"p": QA_PREFIX + "%"})
        db.commit()


# ------------------------------------------------------------------ helpers


def _queue():
    """The real rq queue, or None when the app is configured to run inline."""
    url = os.getenv("REDIS_URL")
    if not url:
        return None
    from redis import Redis
    from rq import Queue

    return Queue(jobs.QUEUE_NAME, connection=Redis.from_url(url))


def _queued_jobs():
    queue = _queue()
    return list(queue.get_jobs()) if queue is not None else []


def _drop_queued_jobs():
    queue = _queue()
    if queue is not None:
        queue.empty()


def _run_queue():
    """Drain the queue the way a worker would. Returns how many jobs ran."""
    queue = _queue()
    if queue is None:
        return 0  # no Redis: the route already ran the work inline
    ran = 0
    for job in queue.get_jobs():
        job.perform()
        queue.remove(job)
        ran += 1
    return ran


def _count(sql, **params):
    with SessionLocal() as db:
        return db.execute(text(sql), params).scalar()


def _published_version(client, name="QA questionnaire"):
    """A published questionnaire version id, built through the HR API."""
    scale = client.post(
        "/rating-scales",
        json={
            "name": f"{name} scale",
            "points": [
                {"value": 1, "label": "Needs work"},
                {"value": 2, "label": "Meets"},
                {"value": 3, "label": "Exceeds"},
            ],
        },
        headers=H,
    )
    assert scale.status_code == 201, scale.text
    created = client.post(
        "/questionnaires",
        json={
            "name": name,
            "rating_scale_id": scale.json()["id"],
            "competencies": [
                {
                    "name": "Collaboration",
                    "questions": [
                        {"text": "How well did you work with others?", "type": "both"},
                        {"text": "Anything to add?", "type": "text", "mandatory": False},
                    ],
                }
            ],
        },
        headers=H,
    )
    assert created.status_code == 201, created.text
    template_id = created.json()["id"]
    published = client.post(f"/questionnaires/{template_id}/publish", headers=H)
    assert published.status_code == 200, published.text
    detail = client.get(f"/questionnaires/{template_id}").json()
    return template_id, detail["version_id"]


def _by_email(client, email):
    return next(e for e in client.get("/employees").json() if e["work_email"] == email)


def _bulk_employees(client, how_many):
    """Insert active employees straight into PostgreSQL. Returns their ids."""
    dept = client.get("/departments").json()[0]["id"]
    title = client.get("/job-titles").json()[0]["id"]
    ids = []
    with SessionLocal() as db:
        for i in range(how_many):
            new_id = uuid.uuid4()
            db.execute(
                text(
                    "INSERT INTO employee (id, full_name, work_email, role, status,"
                    " deactivated, department_id, job_title_id, updated_at)"
                    " VALUES (:i, :n, :e, 'employee', 'active', false, :d, :t, now())"
                ),
                {
                    "i": new_id,
                    "n": f"Period Person {i:03d}",
                    "e": f"{QA_PREFIX}{new_id.hex}@example.com",
                    "d": dept,
                    "t": title,
                },
            )
            ids.append(str(new_id))
        db.commit()
    return ids


def _body(version_id, participant_ids, **over):
    payload = {
        "name": "Mid-year 2026",
        "questionnaire_version_id": version_id,
        "start_date": START,
        "end_date": END,
        "submission_deadline": DEADLINE,
        "participant_ids": participant_ids,
    }
    payload.update(over)
    return payload


def _create_period(client, version_id, participant_ids, **over):
    r = client.post("/review-periods", json=_body(version_id, participant_ids, **over), headers=H)
    assert r.status_code == 201, r.text
    return r.json()


def _setup(client, extra=0, **over):
    """HR signed in, a published questionnaire and a draft period. Returns both."""
    login(client, HR)
    _, version_id = _published_version(client)
    people = [_by_email(client, EMPLOYEE)["id"], _by_email(client, MANAGER)["id"]]
    people += _bulk_employees(client, extra)
    return _create_period(client, version_id, people, **over), version_id


def _mark_submitted(period_id, employee_id):
    with SessionLocal() as db:
        db.execute(
            text(
                "UPDATE self_review SET submitted_at = now(), status = 'submitted'"
                " WHERE period_id = :p AND employee_id = :e"
            ),
            {"p": period_id, "e": employee_id},
        )
        db.commit()


# --------------------------------------------------------------------- AC-063


def test_ac063_opening_creates_exactly_one_self_review_task_per_participant(client):
    period, _ = _setup(client)
    assert _count("SELECT count(*) FROM self_review WHERE period_id = :p", p=period["id"]) == 0

    opened = client.post(f"/review-periods/{period['id']}/open", headers=H)
    assert opened.status_code == 200, opened.text
    assert opened.json()["status"] == "open"
    _run_queue()

    with SessionLocal() as db:
        rows = db.execute(
            text("SELECT employee_id FROM self_review WHERE period_id = :p"), {"p": period["id"]}
        ).all()
    ids = [str(r.employee_id) for r in rows]
    assert sorted(ids) == sorted(period["participant_ids"]), (
        "AC-063: the tasks created do not match the participants one for one"
    )
    assert len(ids) == len(set(ids)), "AC-063: a participant got more than one task"


def test_ac063_each_participant_sees_the_task_on_their_dashboard(client):
    period, _ = _setup(client)
    assert client.post(f"/review-periods/{period['id']}/open", headers=H).status_code == 200
    _run_queue()
    client.cookies.clear()

    for email in (EMPLOYEE, MANAGER):
        login(client, email)
        dashboard = client.get("/me/dashboard")
        assert dashboard.status_code == 200, dashboard.text
        reviews = dashboard.json()["reviews"]
        mine = [r for r in reviews if r["period_id"] == period["id"]]
        assert len(mine) == 1, f"AC-063: {email} does not see exactly one self-review task"
        assert mine[0]["period_name"] == "Mid-year 2026"
        assert mine[0]["status"] == "not_started"
        assert mine[0]["submitted_at"] is None
        assert mine[0]["submission_deadline"] == DEADLINE
        client.cookies.clear()


def test_ac063_a_participant_added_after_opening_also_gets_a_task(client):
    period, version_id = _setup(client)
    assert client.post(f"/review-periods/{period['id']}/open", headers=H).status_code == 200
    _run_queue()
    before = _count("SELECT count(*) FROM self_review WHERE period_id = :p", p=period["id"])

    extra = _bulk_employees(client, 1)[0]
    patched = client.patch(
        f"/review-periods/{period['id']}",
        json={"participant_ids": period["participant_ids"] + [extra]},
        headers=H,
    )
    # An open period may refuse edits; if it accepts them, re-running the job
    # must create the one missing task and nothing else.
    if patched.status_code == 200:
        assert client.post(f"/review-periods/{period['id']}/open", headers=H).status_code == 200
        _run_queue()
        after = _count("SELECT count(*) FROM self_review WHERE period_id = :p", p=period["id"])
        assert after == before + 1
    else:
        assert patched.status_code == 422, patched.text
        assert (
            _count("SELECT count(*) FROM self_review WHERE period_id = :p", p=period["id"])
            == before
        )


# --------------------------------------------------------------------- AC-064


def test_ac064_draft_edits_persist_and_no_task_exists_before_open(client):
    period, _ = _setup(client)
    assert period["status"] == "draft"

    new_people = period["participant_ids"][:1]
    patched = client.patch(
        f"/review-periods/{period['id']}",
        json={
            "name": "Mid-year 2026 (revised)",
            "end_date": (TODAY + timedelta(days=45)).isoformat(),
            "submission_deadline": (TODAY + timedelta(days=25)).isoformat(),
            "participant_ids": new_people,
        },
        headers=H,
    )
    assert patched.status_code == 200, patched.text

    fetched = client.get(f"/review-periods/{period['id']}").json()
    assert fetched["name"] == "Mid-year 2026 (revised)"
    assert fetched["end_date"] == (TODAY + timedelta(days=45)).isoformat()
    assert fetched["submission_deadline"] == (TODAY + timedelta(days=25)).isoformat()
    assert fetched["participant_ids"] == new_people
    assert fetched["status"] == "draft"

    listed = next(p for p in client.get("/review-periods").json() if p["id"] == period["id"])
    assert listed["name"] == "Mid-year 2026 (revised)"

    assert _count("SELECT count(*) FROM self_review WHERE period_id = :p", p=period["id"]) == 0, (
        "AC-064: a self-review row existed before the period was opened"
    )
    assert _queued_jobs() == [], "AC-064: editing a draft queued task creation"


@pytest.mark.parametrize(
    "field,value",
    [
        ("name", "  "),
        ("start_date", "31/12/2026"),
        ("end_date", ""),
        ("submission_deadline", "not-a-date"),
        ("participant_ids", []),
    ],
)
def test_ac064_an_invalid_draft_edit_is_422_field_level_and_changes_nothing(client, field, value):
    period, _ = _setup(client)
    r = client.patch(f"/review-periods/{period['id']}", json={field: value}, headers=H)
    assert r.status_code == 422, r.text
    message = r.json()["errors"][field]
    assert message.strip().endswith("."), f"not an English sentence: {message!r}"

    after = client.get(f"/review-periods/{period['id']}").json()
    assert after == period, "AC-064: a refused edit changed the draft"


def test_ac064_a_draft_needs_a_published_questionnaire_and_real_participants(client):
    login(client, HR)
    template_id, version_id = _published_version(client)
    good = _by_email(client, EMPLOYEE)["id"]
    unknown = str(uuid.UUID(int=0))

    r = client.post("/review-periods", json=_body(version_id, [good, unknown]), headers=H)
    assert r.status_code == 422 and "participant_ids" in r.json()["errors"]

    r = client.post("/review-periods", json=_body(unknown, [good]), headers=H)
    assert r.status_code == 422 and "questionnaire_version_id" in r.json()["errors"]

    assert client.get("/review-periods").json() == []
    assert _count("SELECT count(*) FROM self_review") == 0
    assert template_id


def test_ac064_the_end_date_cannot_precede_the_start_date(client):
    login(client, HR)
    _, version_id = _published_version(client)
    person = _by_email(client, EMPLOYEE)["id"]
    r = client.post(
        "/review-periods",
        json=_body(version_id, [person], start_date=END, end_date=START, submission_deadline=START),
        headers=H,
    )
    assert r.status_code == 422 and "end_date" in r.json()["errors"]
    assert client.get("/review-periods").json() == []


# --------------------------------------------------------------------- AC-065


def test_ac065_removing_a_submitted_participant_is_refused_in_english_and_changes_nothing(client):
    period, _ = _setup(client)
    assert client.post(f"/review-periods/{period['id']}/open", headers=H).status_code == 200
    _run_queue()
    submitted = period["participant_ids"][0]
    _mark_submitted(period["id"], submitted)

    r = client.delete(f"/review-periods/{period['id']}/participants/{submitted}", headers=H)
    assert r.status_code == 422, r.text
    message = r.json()["errors"]["employee_id"]
    assert "submitted" in message.lower()
    assert message.strip().endswith(".")

    after = client.get(f"/review-periods/{period['id']}").json()
    assert submitted in after["participant_ids"], "AC-065: the participant was removed anyway"
    assert sorted(after["participant_ids"]) == sorted(period["participant_ids"])
    assert (
        _count(
            "SELECT count(*) FROM self_review WHERE period_id = :p AND employee_id = :e",
            p=period["id"],
            e=submitted,
        )
        == 1
    ), "AC-065/NFR-010: the submitted self-review was destroyed"
    assert (
        _count(
            "SELECT submitted_at IS NOT NULL FROM self_review"
            " WHERE period_id = :p AND employee_id = :e",
            p=period["id"],
            e=submitted,
        )
        is True
    )


def test_ac065_an_outstanding_participant_can_still_be_removed(client):
    period, _ = _setup(client)
    assert client.post(f"/review-periods/{period['id']}/open", headers=H).status_code == 200
    _run_queue()
    outstanding = period["participant_ids"][1]

    r = client.delete(f"/review-periods/{period['id']}/participants/{outstanding}", headers=H)
    assert r.status_code == 200, r.text
    assert outstanding not in r.json()["participant_ids"]
    assert (
        _count(
            "SELECT count(*) FROM self_review WHERE period_id = :p AND employee_id = :e",
            p=period["id"],
            e=outstanding,
        )
        == 0
    )
    assert (
        outstanding not in client.get(f"/review-periods/{period['id']}").json()["participant_ids"]
    )


def test_ac065_removing_twice_or_removing_a_non_participant_is_a_clean_404(client):
    period, _ = _setup(client)
    outstanding = period["participant_ids"][1]
    assert (
        client.delete(
            f"/review-periods/{period['id']}/participants/{outstanding}", headers=H
        ).status_code
        == 200
    )
    second = client.delete(f"/review-periods/{period['id']}/participants/{outstanding}", headers=H)
    assert second.status_code == 404
    stranger = str(uuid.UUID(int=0))
    assert (
        client.delete(
            f"/review-periods/{period['id']}/participants/{stranger}", headers=H
        ).status_code
        == 404
    )


# --------------------------------------------------------------------- AC-066


def test_ac066_status_separates_submitted_from_outstanding(client):
    period, _ = _setup(client)
    assert client.post(f"/review-periods/{period['id']}/open", headers=H).status_code == 200
    _run_queue()

    r = client.get(f"/review-periods/{period['id']}/status")
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["submitted_count"] == 0
    assert body["outstanding_count"] == len(period["participant_ids"])
    assert all(p["status"] == "outstanding" for p in body["participants"])
    assert all(p["submitted"] is False and p["submitted_at"] is None for p in body["participants"])
    assert all(p["employee"]["full_name"] for p in body["participants"])
    assert body["submission_deadline"] == DEADLINE

    submitted = period["participant_ids"][0]
    _mark_submitted(period["id"], submitted)

    body = client.get(f"/review-periods/{period['id']}/status").json()
    assert body["submitted_count"] == 1
    assert body["outstanding_count"] == len(period["participant_ids"]) - 1
    done = next(p for p in body["participants"] if p["employee"]["id"] == submitted)
    assert done["submitted"] is True and done["status"] == "submitted"
    assert done["submitted_at"], "AC-066: a submitted review carries no submission time"
    others = [p for p in body["participants"] if p["employee"]["id"] != submitted]
    assert all(p["status"] == "outstanding" for p in others)


def test_ac066_outstanding_participants_are_flagged_overdue_after_the_deadline(client):
    period, _ = _setup(client, submission_deadline=PAST_DEADLINE, start_date=PAST_DEADLINE)
    assert client.post(f"/review-periods/{period['id']}/open", headers=H).status_code == 200
    _run_queue()
    submitted = period["participant_ids"][0]
    _mark_submitted(period["id"], submitted)

    body = client.get(f"/review-periods/{period['id']}/status").json()
    for row in body["participants"]:
        if row["employee"]["id"] == submitted:
            assert row["overdue"] is False, "AC-066: a submitted review was flagged overdue"
        else:
            assert row["overdue"] is True, "AC-066: a late outstanding review was not flagged"

    # The participant sees the same flag on their own dashboard.
    client.cookies.clear()
    login(client, MANAGER)
    mine = next(
        r for r in client.get("/me/dashboard").json()["reviews"] if r["period_id"] == period["id"]
    )
    assert mine["overdue"] is True


def test_ac066_nothing_is_overdue_before_the_deadline(client):
    period, _ = _setup(client)
    assert client.post(f"/review-periods/{period['id']}/open", headers=H).status_code == 200
    _run_queue()
    body = client.get(f"/review-periods/{period['id']}/status").json()
    assert all(p["overdue"] is False for p in body["participants"])


def test_ac066_status_of_a_draft_period_lists_everyone_as_outstanding(client):
    period, _ = _setup(client)
    body = client.get(f"/review-periods/{period['id']}/status").json()
    assert body["submitted_count"] == 0
    assert body["outstanding_count"] == len(period["participant_ids"])


def test_ac066_an_unknown_period_is_404_on_every_read(client):
    login(client, HR)
    unknown = uuid.UUID(int=0)
    assert client.get(f"/review-periods/{unknown}").status_code == 404
    assert client.get(f"/review-periods/{unknown}/status").status_code == 404
    assert client.post(f"/review-periods/{unknown}/open", headers=H).status_code == 404


# -------------------------------------------------------------------- NFR-014


def test_nfr014_open_returns_promptly_and_queues_the_work(client):
    period, _ = _setup(client, extra=40)

    started = time.monotonic()
    r = client.post(f"/review-periods/{period['id']}/open", headers=H)
    elapsed = time.monotonic() - started
    assert r.status_code == 200, r.text
    assert elapsed < 2, f"NFR-014: opening a period blocked the screen for {elapsed:.1f}s"

    if _queue() is not None:
        queued = _queued_jobs()
        assert len(queued) == 1, f"NFR-014: expected one queued job, found {len(queued)}"
        assert _count("SELECT count(*) FROM self_review WHERE period_id = :p", p=period["id"]) == 0
        assert _run_queue() == 1
    assert _count("SELECT count(*) FROM self_review WHERE period_id = :p", p=period["id"]) == len(
        period["participant_ids"]
    )


def test_nfr014_running_the_queued_job_twice_creates_no_duplicate_tasks(client):
    period, _ = _setup(client)
    assert client.post(f"/review-periods/{period['id']}/open", headers=H).status_code == 200
    _run_queue()
    first = _count("SELECT count(*) FROM self_review WHERE period_id = :p", p=period["id"])
    assert first == len(period["participant_ids"])

    # The same job body, run again exactly as a retrying worker would.
    jobs.open_review_period(period["id"])
    jobs.open_review_period(period["id"])
    assert (
        _count("SELECT count(*) FROM self_review WHERE period_id = :p", p=period["id"]) == first
    ), "NFR-014: re-running the queued job duplicated self-review tasks"

    # Opening again (an impatient second click) is also safe.
    assert client.post(f"/review-periods/{period['id']}/open", headers=H).status_code == 200
    _run_queue()
    assert _count("SELECT count(*) FROM self_review WHERE period_id = :p", p=period["id"]) == first


def test_nfr014_the_job_does_nothing_for_a_period_that_is_not_open(client):
    period, _ = _setup(client)
    jobs.open_review_period(period["id"])
    assert _count("SELECT count(*) FROM self_review WHERE period_id = :p", p=period["id"]) == 0
    jobs.open_review_period(str(uuid.UUID(int=0)))  # unknown id must not raise
    assert _count("SELECT count(*) FROM self_review") == 0


def test_nfr014_closing_a_period_keeps_its_tasks_and_refuses_reopening(client):
    period, _ = _setup(client)
    assert client.post(f"/review-periods/{period['id']}/open", headers=H).status_code == 200
    _run_queue()
    before = _count("SELECT count(*) FROM self_review WHERE period_id = :p", p=period["id"])

    closed = client.post(f"/review-periods/{period['id']}/close", headers=H)
    assert closed.status_code == 200 and closed.json()["status"] == "closed"
    assert _count("SELECT count(*) FROM self_review WHERE period_id = :p", p=period["id"]) == before

    reopened = client.post(f"/review-periods/{period['id']}/open", headers=H)
    assert reopened.status_code == 422 and "status" in reopened.json()["errors"]
    _run_queue()
    assert _count("SELECT count(*) FROM self_review WHERE period_id = :p", p=period["id"]) == before


# -------------------------------------------------------------------- NFR-015


def test_nfr015_a_period_of_200_participants_opens_within_the_time_budget(client):
    login(client, HR)
    _, version_id = _published_version(client)
    people = _bulk_employees(client, 200)

    created = client.post("/review-periods", json=_body(version_id, people), headers=H)
    assert created.status_code == 201, created.text
    period = created.json()
    assert len(period["participant_ids"]) == 200

    started = time.monotonic()
    opened = client.post(f"/review-periods/{period['id']}/open", headers=H)
    open_elapsed = time.monotonic() - started
    assert opened.status_code == 200, opened.text
    assert open_elapsed < 5, f"NFR-014/NFR-015: open took {open_elapsed:.1f}s for 200 people"

    started = time.monotonic()
    _run_queue()
    job_elapsed = time.monotonic() - started
    assert _count("SELECT count(*) FROM self_review WHERE period_id = :p", p=period["id"]) == 200
    assert job_elapsed < 60, f"NFR-015: creating 200 tasks took {job_elapsed:.1f}s"

    started = time.monotonic()
    status = client.get(f"/review-periods/{period['id']}/status")
    status_elapsed = time.monotonic() - started
    assert status.status_code == 200, status.text
    assert status.json()["outstanding_count"] == 200
    assert len(status.json()["participants"]) == 200
    assert status_elapsed < 10, f"NFR-015: the status screen took {status_elapsed:.1f}s"


# --------------------------------------------------------------- roles, NFR-001


@pytest.mark.parametrize("email", NON_HR)
def test_roles_non_hr_is_403_with_an_empty_body_on_every_route(client, email):
    period, version_id = _setup(client)
    participant = period["participant_ids"][0]
    client.cookies.clear()

    login(client, email)
    for r in (
        client.get("/review-periods"),
        client.get(f"/review-periods/{period['id']}"),
        client.get(f"/review-periods/{period['id']}/status"),
        client.post("/review-periods", json=_body(version_id, [participant]), headers=H),
        client.patch(f"/review-periods/{period['id']}", json={"name": "Hijacked"}, headers=H),
        client.post(f"/review-periods/{period['id']}/open", headers=H),
        client.post(f"/review-periods/{period['id']}/close", headers=H),
        client.delete(f"/review-periods/{period['id']}/participants/{participant}", headers=H),
    ):
        assert r.status_code == 403, r.text
        assert r.content == b"", "the refusal leaked a body"

    client.cookies.clear()
    login(client, HR)
    after = client.get(f"/review-periods/{period['id']}").json()
    assert after == period, "a refused caller still changed the period"
    assert _count("SELECT count(*) FROM self_review") == 0


def test_roles_the_executive_may_not_mutate_a_period(client):
    period, _ = _setup(client)
    client.cookies.clear()
    login(client, EXEC)
    for r in (
        client.post(f"/review-periods/{period['id']}/open", headers=H),
        client.post(f"/review-periods/{period['id']}/close", headers=H),
        client.patch(f"/review-periods/{period['id']}", json={"name": "Exec"}, headers=H),
    ):
        assert r.status_code == 403 and r.content == b""
    assert _queued_jobs() == [], "a refused open still queued the task creation"
    client.cookies.clear()
    login(client, HR)
    assert client.get(f"/review-periods/{period['id']}").json()["status"] == "draft"


def test_roles_signed_out_calls_are_401(client):
    period, version_id = _setup(client)
    client.cookies.clear()
    assert client.get("/review-periods").status_code == 401
    assert client.get(f"/review-periods/{period['id']}").status_code == 401
    assert client.get(f"/review-periods/{period['id']}/status").status_code == 401
    assert client.post("/review-periods", json=_body(version_id, []), headers=H).status_code == 401
    assert client.post(f"/review-periods/{period['id']}/open", headers=H).status_code == 401


def test_roles_mutations_require_the_custom_header(client):
    period, version_id = _setup(client)
    participant = period["participant_ids"][0]
    for r in (
        client.post("/review-periods", json=_body(version_id, [participant])),
        client.patch(f"/review-periods/{period['id']}", json={"name": "No header"}),
        client.post(f"/review-periods/{period['id']}/open"),
        client.post(f"/review-periods/{period['id']}/close"),
        client.delete(f"/review-periods/{period['id']}/participants/{participant}"),
    ):
        assert r.status_code == 403, r.text
        assert r.content == b""
    assert client.get(f"/review-periods/{period['id']}").json() == period
    assert _count("SELECT count(*) FROM self_review") == 0


# -------------------------------------------------------------------- NFR-010


def test_nfr010_a_submitted_review_keeps_the_questions_and_scale_it_was_sat_on(client):
    period, version_id = _setup(client)
    template_id = _count(
        "SELECT template_id FROM questionnaire_version WHERE id = :v", v=version_id
    )
    assert client.post(f"/review-periods/{period['id']}/open", headers=H).status_code == 200
    _run_queue()
    submitted = period["participant_ids"][0]
    _mark_submitted(period["id"], submitted)

    with SessionLocal() as db:
        before = db.execute(
            text("SELECT snapshot FROM self_review WHERE period_id = :p AND employee_id = :e"),
            {"p": period["id"], "e": submitted},
        ).scalar()
    assert before, "NFR-010: the self-review kept no copy of the questionnaire"

    edited = client.put(
        f"/questionnaires/{template_id}",
        json={
            "name": "Mid-year rewritten",
            "competencies": [
                {"name": "Delivery", "questions": [{"text": "Did you ship?", "type": "text"}]}
            ],
        },
        headers=H,
    )
    assert edited.status_code == 200, edited.text

    with SessionLocal() as db:
        after = db.execute(
            text("SELECT snapshot FROM self_review WHERE period_id = :p AND employee_id = :e"),
            {"p": period["id"], "e": submitted},
        ).scalar()
    assert after == before, (
        "NFR-010: a later questionnaire edit changed what a submitted review shows"
    )


def test_nfr010_a_leaver_with_a_review_is_deactivated_not_deleted(client):
    period, _ = _setup(client)
    assert client.post(f"/review-periods/{period['id']}/open", headers=H).status_code == 200
    _run_queue()
    leaver = _by_email(client, EMPLOYEE)
    _mark_submitted(period["id"], leaver["id"])

    r = client.post(
        f"/employees/{leaver['id']}/deactivate",
        json={"leaving_date": (TODAY + timedelta(days=5)).isoformat()},
        headers=H,
    )
    assert r.status_code == 200, r.text

    assert _count("SELECT count(*) FROM employee WHERE id = :i", i=leaver["id"]) == 1
    assert (
        _count(
            "SELECT count(*) FROM self_review WHERE period_id = :p AND employee_id = :e",
            p=period["id"],
            e=leaver["id"],
        )
        == 1
    ), "NFR-010: deactivating a leaver destroyed their self-review"
    body = client.get(f"/review-periods/{period['id']}/status").json()
    assert any(p["employee"]["id"] == leaver["id"] for p in body["participants"])
    record = client.get(f"/employees/{leaver['id']}/record")
    assert record.status_code == 200
    assert record.json()["employee"]["account_status"] == "deactivated"


def test_nfr010_no_route_hard_deletes_a_review_period_or_a_self_review(client):
    login(client, HR)
    paths = client.get("/openapi.json").json()["paths"]
    for path, methods in paths.items():
        if "delete" in methods and ("review-period" in path or "self-review" in path):
            assert "participants" in path, f"NFR-010: a delete route removes history: {path}"
