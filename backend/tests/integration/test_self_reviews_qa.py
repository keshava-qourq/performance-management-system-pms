"""QA coverage for the employee's own self-review (US-018: AC-067..AC-071, NFR-010).

Runs against the real PostgreSQL given by DATABASE_URL and the real Redis queue
given by REDIS_URL through the shared `client`/`login` fixtures in
backend/tests/conftest.py. No mocks.

Contract under test:
  GET  /me/dashboard                      -> {reviews: [...]} the open task, if any
  GET  /self-reviews/{id}                 -> the questionnaire, its scale and the answers
  PUT  /self-reviews/{id}/answers         -> draft saved, round-trips unchanged
  POST /self-reviews/{id}/submit          -> submitted review | 422 {errors} per question
"""

import os
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
QA_PREFIX = "qa-selfrev-"

TODAY = date.today()
START = TODAY.isoformat()
END = (TODAY + timedelta(days=30)).isoformat()
DEADLINE = (TODAY + timedelta(days=20)).isoformat()
PAST = (TODAY - timedelta(days=3)).isoformat()

RATED_TEXT = "How consistently did you deliver against your goals?"
OPTIONAL_TEXT = "Anything to add?"
TEXT_ONLY = "Describe one thing you would do differently."
POINTS = [
    {"value": 1, "label": "Developing"},
    {"value": 2, "label": "Proficient"},
    {"value": 3, "label": "Exemplary"},
]


@pytest.fixture(autouse=True)
def _clean_self_reviews():
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
    url = os.getenv("REDIS_URL")
    if not url:
        return None
    from redis import Redis
    from rq import Queue

    from app import jobs

    return Queue(jobs.QUEUE_NAME, connection=Redis.from_url(url))


def _drop_queued_jobs():
    queue = _queue()
    if queue is not None:
        queue.empty()


def _run_queue():
    """Drain the queue the way a worker would."""
    queue = _queue()
    if queue is None:
        return 0
    ran = 0
    for job in queue.get_jobs():
        job.perform()
        queue.remove(job)
        ran += 1
    return ran


def _count(sql, **params):
    with SessionLocal() as db:
        return db.execute(text(sql), params).scalar()


def _by_email(client, email):
    return next(e for e in client.get("/employees").json() if e["work_email"] == email)


def _published_version(client, name="Annual competency review"):
    """A published questionnaire with a rated+comment, a text-only and an optional question."""
    scale = client.post(
        "/rating-scales", json={"name": f"{name} scale", "points": POINTS}, headers=H
    )
    assert scale.status_code == 201, scale.text
    created = client.post(
        "/questionnaires",
        json={
            "name": name,
            "rating_scale_id": scale.json()["id"],
            "competencies": [
                {
                    "name": "Delivery",
                    "questions": [
                        {"text": RATED_TEXT, "type": "both", "mandatory": True},
                        {"text": OPTIONAL_TEXT, "type": "text", "mandatory": False},
                    ],
                },
                {
                    "name": "Growth",
                    "questions": [{"text": TEXT_ONLY, "type": "text", "mandatory": True}],
                },
            ],
        },
        headers=H,
    )
    assert created.status_code == 201, created.text
    template_id = created.json()["id"]
    published = client.post(f"/questionnaires/{template_id}/publish", headers=H)
    assert published.status_code == 200, published.text
    return template_id, client.get(f"/questionnaires/{template_id}").json()["version_id"]


def _period(client, version_id, participant_ids, **over):
    body = {
        "name": "Mid-year 2026",
        "questionnaire_version_id": version_id,
        "start_date": START,
        "end_date": END,
        "submission_deadline": DEADLINE,
        "participant_ids": participant_ids,
    }
    body.update(over)
    r = client.post("/review-periods", json=body, headers=H)
    assert r.status_code == 201, r.text
    return r.json()


def _open_period(client, **over):
    """HR builds and opens a period for Emi and Mo. Returns (period, template_id)."""
    login(client, HR)
    template_id, version_id = _published_version(client)
    people = [_by_email(client, EMPLOYEE)["id"], _by_email(client, MANAGER)["id"]]
    period = _period(client, version_id, people, **over)
    opened = client.post(f"/review-periods/{period['id']}/open", headers=H)
    assert opened.status_code == 200, opened.text
    _run_queue()
    client.cookies.clear()
    return period, template_id


def _my_task(client, email=EMPLOYEE):
    """Sign in as the employee and return their dashboard self-review task."""
    login(client, email)
    dashboard = client.get("/me/dashboard")
    assert dashboard.status_code == 200, dashboard.text
    return dashboard.json()["reviews"]


def _review(client, review_id):
    r = client.get(f"/self-reviews/{review_id}")
    assert r.status_code == 200, r.text
    return r.json()


def _questions(review):
    """Every question in the review, in order, whichever shape the body used."""
    source = review.get("competencies") or (review.get("questionnaire") or {}).get(
        "competencies", []
    )
    out = []
    for competency in source:
        out.extend(competency.get("questions", []))
    return out


def _answers_of(review):
    """The saved answers keyed by question id, whichever shape the body used."""
    answers = review.get("answers") or {}
    if isinstance(answers, list):
        return {a["question_id"]: a for a in answers}
    return answers


def _q(review, text_wanted):
    return next(q for q in _questions(review) if q["text"] == text_wanted)


def _save(client, review_id, answers):
    return client.put(f"/self-reviews/{review_id}/answers", json={"answers": answers}, headers=H)


def _submit(client, review_id):
    return client.post(f"/self-reviews/{review_id}/submit", headers=H)


def _complete(review):
    """Answers that satisfy every mandatory question of this review."""
    answers = {}
    for question in _questions(review):
        requires = question.get("requires") or {}
        answers[question["id"]] = {
            "rating": 2 if requires.get("rating") else None,
            "comment": f"My reflection on: {question['text']}" if requires.get("comment") else None,
        }
    return answers


# --------------------------------------------------------------- AC-067/AC-068


def test_ac067_the_task_carries_the_questionnaire_with_its_scale_and_labels(client):
    _open_period(client)
    tasks = _my_task(client)
    assert len(tasks) == 1, "AC-067: the participant does not see exactly one self-review task"
    review = _review(client, tasks[0]["id"])

    texts = [q["text"] for q in _questions(review)]
    assert texts == [RATED_TEXT, OPTIONAL_TEXT, TEXT_ONLY], (
        f"AC-067: the questions are not the published ones: {texts}"
    )
    rated = _q(review, RATED_TEXT)
    scale = rated.get("scale") or review.get("scale") or {}
    labels = [(p["value"], p["label"]) for p in (scale.get("points") or scale.get("labels") or [])]
    assert labels == [(p["value"], p["label"]) for p in POINTS], (
        f"AC-067: the rating scale and its labels are not returned: {labels}"
    )
    assert rated["mandatory"] is True
    assert _q(review, OPTIONAL_TEXT)["mandatory"] is False
    assert review["status"] in ("not_started", "in_progress")
    assert review.get("submitted_at") is None


def test_ac068_a_part_complete_draft_round_trips_unchanged(client):
    _open_period(client)
    tasks = _my_task(client)
    review_id = tasks[0]["id"]
    review = _review(client, review_id)
    rated_id = _q(review, RATED_TEXT)["id"]
    text_id = _q(review, TEXT_ONLY)["id"]

    saved = _save(
        client,
        review_id,
        {
            rated_id: {"rating": 3, "comment": "  I shipped every milestone.  "},
            text_id: {"rating": None, "comment": "I would ask for help sooner."},
        },
    )
    assert saved.status_code == 200, saved.text

    reloaded = _review(client, review_id)
    answers = _answers_of(reloaded)
    assert answers[rated_id]["rating"] == 3
    assert answers[rated_id]["comment"] == "I shipped every milestone."
    assert answers[text_id]["comment"] == "I would ask for help sooner."
    assert reloaded["status"] == "in_progress", "AC-068: a part-complete draft is not in progress"
    assert reloaded.get("submitted_at") is None, "AC-068: saving a draft submitted the review"
    assert _count("SELECT count(*) FROM self_review WHERE submitted_at IS NOT NULL") == 0


def test_ac068_a_second_draft_save_keeps_the_answers_it_does_not_mention(client):
    _open_period(client)
    review_id = _my_task(client)[0]["id"]
    review = _review(client, review_id)
    rated_id = _q(review, RATED_TEXT)["id"]
    text_id = _q(review, TEXT_ONLY)["id"]

    first = _save(client, review_id, {rated_id: {"rating": 1, "comment": "First"}})
    assert first.status_code == 200, first.text
    assert _save(client, review_id, {text_id: {"comment": "Second"}}).status_code == 200

    answers = _answers_of(_review(client, review_id))
    assert answers[rated_id]["rating"] == 1 and answers[rated_id]["comment"] == "First"
    assert answers[text_id]["comment"] == "Second"


def test_ac068_a_rating_outside_the_scale_is_422_and_stores_nothing(client):
    _open_period(client)
    review_id = _my_task(client)[0]["id"]
    rated_id = _q(_review(client, review_id), RATED_TEXT)["id"]

    for bad in (0, 9, -1, True):
        r = _save(client, review_id, {rated_id: {"rating": bad, "comment": "x"}})
        assert r.status_code == 422, f"AC-068: rating {bad!r} was accepted"
        assert any("rating" in key for key in r.json()["errors"])
    assert _answers_of(_review(client, review_id)) == {}


def test_ac068_an_empty_draft_is_accepted_and_changes_nothing(client):
    _open_period(client)
    review_id = _my_task(client)[0]["id"]
    r = _save(client, review_id, {})
    assert r.status_code == 200, r.text
    assert _answers_of(_review(client, review_id)) == {}


def test_nfr001_one_employee_cannot_read_or_write_another_persons_review(client):
    _open_period(client)
    mine = _my_task(client, EMPLOYEE)[0]["id"]
    client.cookies.clear()
    theirs = _my_task(client, MANAGER)[0]["id"]
    assert mine != theirs

    for r in (
        client.get(f"/self-reviews/{mine}"),
        _save(client, mine, {}),
        _submit(client, mine),
    ):
        assert r.status_code == 403 and r.content == b"", r.text

    client.cookies.clear()
    assert client.get(f"/self-reviews/{mine}").status_code == 401
    unknown = uuid.UUID(int=0)
    login(client, EMPLOYEE)
    assert client.get(f"/self-reviews/{unknown}").status_code == 404


# --------------------------------------------------------------------- AC-069


def test_ac069_submitting_with_mandatory_questions_unanswered_is_422_per_question(client):
    _open_period(client)
    review_id = _my_task(client)[0]["id"]
    review = _review(client, review_id)
    rated_id = _q(review, RATED_TEXT)["id"]
    text_id = _q(review, TEXT_ONLY)["id"]
    optional_id = _q(review, OPTIONAL_TEXT)["id"]

    r = _submit(client, review_id)
    assert r.status_code == 422, r.text
    errors = r.json()["errors"]
    named = {key.split(".")[-1] for key in errors}
    assert rated_id in named, "AC-069: the unanswered rated question is not named"
    assert text_id in named, "AC-069: the unanswered text question is not named"
    assert optional_id not in named, "AC-069: an optional question blocked submission"
    for key, message in errors.items():
        assert message.strip().endswith("."), f"not an English sentence on {key}: {message!r}"

    after = _review(client, review_id)
    assert after.get("submitted_at") is None, "AC-069: the review was submitted anyway"
    assert after["status"] != "submitted", "AC-069: the review did not stay a draft"
    assert after.get("read_only") in (False, None)
    assert _count("SELECT count(*) FROM self_review WHERE submitted_at IS NOT NULL") == 0


def test_ac069_only_the_still_missing_questions_are_named_on_a_part_complete_review(client):
    _open_period(client)
    review_id = _my_task(client)[0]["id"]
    review = _review(client, review_id)
    rated_id = _q(review, RATED_TEXT)["id"]
    text_id = _q(review, TEXT_ONLY)["id"]

    assert _save(client, review_id, {rated_id: {"rating": 2, "comment": "Done"}}).status_code == 200
    r = _submit(client, review_id)
    assert r.status_code == 422, r.text
    named = {key.split(".")[-1] for key in r.json()["errors"]}
    assert text_id in named
    assert rated_id not in named, "AC-069: an answered question was still reported as missing"


def test_ac069_a_rated_question_with_only_a_comment_is_still_blocked(client):
    _open_period(client)
    review_id = _my_task(client)[0]["id"]
    review = _review(client, review_id)
    rated_id = _q(review, RATED_TEXT)["id"]
    text_id = _q(review, TEXT_ONLY)["id"]

    assert (
        _save(
            client,
            review_id,
            {
                rated_id: {"rating": None, "comment": "Plenty to say, no rating."},
                text_id: {"comment": "Answered."},
            },
        ).status_code
        == 200
    )
    r = _submit(client, review_id)
    assert r.status_code == 422, r.text
    errors = r.json()["errors"]
    assert rated_id in {key.split(".")[-1] for key in errors}
    assert "rating" in " ".join(errors.values()).lower()
    assert _review(client, review_id).get("submitted_at") is None


def test_ac069_whitespace_only_comment_does_not_count_as_an_answer(client):
    _open_period(client)
    review_id = _my_task(client)[0]["id"]
    review = _review(client, review_id)
    rated_id = _q(review, RATED_TEXT)["id"]
    text_id = _q(review, TEXT_ONLY)["id"]

    assert (
        _save(
            client,
            review_id,
            {rated_id: {"rating": 2, "comment": "   "}, text_id: {"comment": "\t \n"}},
        ).status_code
        == 200
    )
    r = _submit(client, review_id)
    assert r.status_code == 422, r.text
    named = {key.split(".")[-1] for key in r.json()["errors"]}
    assert rated_id in named and text_id in named


# --------------------------------------------------------------------- AC-070


def test_ac070_a_submitted_review_records_the_submitter_and_the_timestamp(client):
    _open_period(client)
    review_id = _my_task(client)[0]["id"]
    review = _review(client, review_id)
    before = _save(client, review_id, _complete(review))
    assert before.status_code == 200, before.text

    submitted = _submit(client, review_id)
    assert submitted.status_code == 200, submitted.text
    body = submitted.json()
    assert body["status"] == "submitted"
    assert body["submitted_at"], "AC-070: no submission timestamp was recorded"
    by = body.get("submitted_by")
    name = by if isinstance(by, str) else (by or {}).get("full_name")
    assert name == "Emi Employee", f"AC-070: the submitter was not recorded: {by!r}"

    reloaded = _review(client, review_id)
    assert reloaded["submitted_at"] == body["submitted_at"]
    assert reloaded.get("read_only") is True, "AC-070: the submitted review is not read-only"

    with SessionLocal() as db:
        row = db.execute(
            text("SELECT status, submitted_at FROM self_review WHERE id = :i"), {"i": review_id}
        ).one()
    assert row.status == "submitted" and row.submitted_at is not None


def test_ac070_a_submitted_review_refuses_every_further_edit(client):
    _open_period(client)
    review_id = _my_task(client)[0]["id"]
    review = _review(client, review_id)
    answers = _complete(review)
    assert _save(client, review_id, answers).status_code == 200
    assert _submit(client, review_id).status_code == 200
    locked = _review(client, review_id)

    rated_id = _q(review, RATED_TEXT)["id"]
    edit = _save(client, review_id, {rated_id: {"rating": 1, "comment": "Changed my mind"}})
    assert edit.status_code in (403, 409, 422), (
        f"AC-070: a submitted review was edited: {edit.text}"
    )
    again = _submit(client, review_id)
    assert again.status_code in (403, 409, 422), "AC-070: a submitted review was submitted twice"

    after = _review(client, review_id)
    assert after["submitted_at"] == locked["submitted_at"]
    assert _answers_of(after) == _answers_of(locked), "AC-070: the submitted answers changed"


def test_ac070_the_submission_is_recorded_in_the_reviews_history(client):
    _open_period(client)
    review_id = _my_task(client)[0]["id"]
    assert _save(client, review_id, _complete(_review(client, review_id))).status_code == 200
    assert _submit(client, review_id).status_code == 200

    history = client.get(f"/self-reviews/{review_id}/history")
    assert history.status_code == 200, history.text
    actions = [row["action"] for row in history.json()]
    assert "self_review_submitted" in actions
    entry = next(r for r in history.json() if r["action"] == "self_review_submitted")
    assert entry["actor"]["full_name"] == "Emi Employee"
    assert entry["created_at"]


def test_ac070_mutations_need_the_custom_header_and_a_session(client):
    _open_period(client)
    review_id = _my_task(client)[0]["id"]
    for r in (
        client.put(f"/self-reviews/{review_id}/answers", json={"answers": {}}),
        client.post(f"/self-reviews/{review_id}/submit"),
    ):
        assert r.status_code == 403 and r.content == b""
    client.cookies.clear()
    assert _save(client, review_id, {}).status_code == 401
    assert _submit(client, review_id).status_code == 401


# --------------------------------------------------------------------- AC-071


def test_ac071_an_overdue_unsubmitted_review_can_still_be_submitted(client):
    _open_period(client, start_date=PAST, submission_deadline=PAST)
    tasks = _my_task(client)
    assert tasks[0]["overdue"] is True, "AC-071: a late task is not flagged overdue"
    review_id = tasks[0]["id"]
    review = _review(client, review_id)
    assert review["overdue"] is True

    assert _save(client, review_id, _complete(review)).status_code == 200
    submitted = _submit(client, review_id)
    assert submitted.status_code == 200, (
        f"AC-071: an overdue review could not be submitted: {submitted.text}"
    )
    assert submitted.json()["submitted_at"]
    assert _review(client, review_id).get("overdue") is False


def test_ac071_a_closed_period_refuses_submission_and_keeps_the_draft(client):
    period, _ = _open_period(client)
    review_id = _my_task(client)[0]["id"]
    review = _review(client, review_id)
    assert _save(client, review_id, _complete(review)).status_code == 200
    draft = _answers_of(_review(client, review_id))
    client.cookies.clear()

    login(client, HR)
    closed = client.post(f"/review-periods/{period['id']}/close", headers=H)
    assert closed.status_code == 200 and closed.json()["status"] == "closed"
    client.cookies.clear()

    login(client, EMPLOYEE)
    r = _submit(client, review_id)
    assert r.status_code in (403, 409, 422), (
        f"AC-071: a closed period accepted a submission ({r.status_code})"
    )
    after = _review(client, review_id)
    assert after.get("submitted_at") is None, (
        "AC-071: the review was submitted into a closed period"
    )
    assert _answers_of(after) == draft, "AC-071: the refusal destroyed the draft"
    assert _count("SELECT count(*) FROM self_review WHERE submitted_at IS NOT NULL") == 0


def test_ac071_a_closed_period_also_refuses_a_draft_save(client):
    period, _ = _open_period(client)
    review_id = _my_task(client)[0]["id"]
    review = _review(client, review_id)
    rated_id = _q(review, RATED_TEXT)["id"]
    client.cookies.clear()

    login(client, HR)
    assert client.post(f"/review-periods/{period['id']}/close", headers=H).status_code == 200
    client.cookies.clear()

    login(client, EMPLOYEE)
    r = _save(client, review_id, {rated_id: {"rating": 1, "comment": "Too late"}})
    assert r.status_code in (403, 409, 422), r.text
    assert _answers_of(_review(client, review_id)) == {}


# -------------------------------------------------------------------- NFR-010


def test_nfr010_a_questionnaire_edit_after_submission_does_not_change_the_review(client):
    _, template_id = _open_period(client)
    review_id = _my_task(client)[0]["id"]
    review = _review(client, review_id)
    assert _save(client, review_id, _complete(review)).status_code == 200
    assert _submit(client, review_id).status_code == 200
    before = _review(client, review_id)
    before_questions = [(q["id"], q["text"], q["type"]) for q in _questions(before)]
    before_scale = _q(before, RATED_TEXT).get("scale") or before.get("scale")
    client.cookies.clear()

    login(client, HR)
    edited = client.put(
        f"/questionnaires/{template_id}",
        json={
            "name": "Rewritten after the fact",
            "competencies": [
                {
                    "name": "Something else",
                    "questions": [{"text": "A brand new question", "type": "text"}],
                }
            ],
        },
        headers=H,
    )
    assert edited.status_code == 200, edited.text
    with SessionLocal() as db:
        db.execute(text("UPDATE rating_scale_point SET label = 'Relabelled'"))
        db.commit()
    client.cookies.clear()

    login(client, EMPLOYEE)
    after = _review(client, review_id)
    assert [(q["id"], q["text"], q["type"]) for q in _questions(after)] == before_questions, (
        "NFR-010: a later questionnaire edit changed the submitted review's questions"
    )
    after_scale = _q(after, RATED_TEXT).get("scale") or after.get("scale")
    assert after_scale == before_scale, (
        "NFR-010: a later scale edit changed the submitted review's labels"
    )
    labels = [p["label"] for p in (after_scale.get("points") or after_scale.get("labels") or [])]
    assert labels == [p["label"] for p in POINTS], f"NFR-010: the labels moved: {labels}"
    assert _answers_of(after) == _answers_of(before)
    assert after["submitted_at"] == before["submitted_at"]


def test_nfr010_an_edit_while_a_review_is_still_a_draft_also_leaves_it_alone(client):
    _, template_id = _open_period(client)
    review_id = _my_task(client)[0]["id"]
    before = [(q["id"], q["text"]) for q in _questions(_review(client, review_id))]
    client.cookies.clear()

    login(client, HR)
    assert (
        client.put(
            f"/questionnaires/{template_id}",
            json={
                "name": "Draft-time rewrite",
                "competencies": [{"name": "New", "questions": [{"text": "New Q", "type": "text"}]}],
            },
            headers=H,
        ).status_code
        == 200
    )
    client.cookies.clear()

    login(client, EMPLOYEE)
    assert [(q["id"], q["text"]) for q in _questions(_review(client, review_id))] == before, (
        "NFR-010: an open task's questions changed under the employee"
    )


# -------------------------------------------------------------------- NFR-015


def test_nfr015_a_period_of_200_people_gives_each_one_a_usable_task_in_time(client):
    """Sized for one organisation under 200: opening for 200 and completing one."""
    login(client, HR)
    _, version_id = _published_version(client)
    dept = client.get("/departments").json()[0]["id"]
    title = client.get("/job-titles").json()[0]["id"]
    people = []
    with SessionLocal() as db:
        for i in range(199):
            new_id = uuid.uuid4()
            db.execute(
                text(
                    "INSERT INTO employee (id, full_name, work_email, role, status,"
                    " deactivated, department_id, job_title_id, updated_at)"
                    " VALUES (:i, :n, :e, 'employee', 'active', false, :d, :t, now())"
                ),
                {
                    "i": new_id,
                    "n": f"Scale Person {i:03d}",
                    "e": f"{QA_PREFIX}{new_id.hex}@example.com",
                    "d": dept,
                    "t": title,
                },
            )
            people.append(str(new_id))
        db.commit()
    people.append(_by_email(client, EMPLOYEE)["id"])

    period = _period(client, version_id, people)
    assert client.post(f"/review-periods/{period['id']}/open", headers=H).status_code == 200
    started = time.monotonic()
    _run_queue()
    elapsed = time.monotonic() - started
    assert _count("SELECT count(*) FROM self_review WHERE period_id = :p", p=period["id"]) == 200
    assert elapsed < 60, f"NFR-015: creating 200 self-review tasks took {elapsed:.1f}s"
    client.cookies.clear()

    review_id = _my_task(client)[0]["id"]
    started = time.monotonic()
    review = _review(client, review_id)
    assert _save(client, review_id, _complete(review)).status_code == 200
    assert _submit(client, review_id).status_code == 200
    elapsed = time.monotonic() - started
    assert elapsed < 10, f"NFR-015: one person's review took {elapsed:.1f}s in a 200-person period"


# -------------------------------------------------------------------- NFR-019


def test_nfr019_a_participant_with_no_open_task_gets_an_empty_list_not_an_error(client):
    login(client, EMPLOYEE)
    dashboard = client.get("/me/dashboard")
    assert dashboard.status_code == 200, dashboard.text
    assert dashboard.json()["reviews"] == [], "NFR-019: an empty state behaved like an error"


def test_nfr019_someone_left_out_of_the_period_sees_no_task(client):
    login(client, HR)
    _, version_id = _published_version(client)
    period = _period(client, version_id, [_by_email(client, EMPLOYEE)["id"]])
    assert client.post(f"/review-periods/{period['id']}/open", headers=H).status_code == 200
    _run_queue()
    client.cookies.clear()

    login(client, MANAGER)
    r = client.get("/me/dashboard")
    assert r.status_code == 200 and r.json()["reviews"] == []


def test_nfr019_every_validation_message_is_plain_english_about_the_question(client):
    _open_period(client)
    review_id = _my_task(client)[0]["id"]
    r = _submit(client, review_id)
    assert r.status_code == 422
    for message in r.json()["errors"].values():
        assert message[0].isupper(), f"not a sentence: {message!r}"
        assert message.strip().endswith(".")
        assert len(message.split()) >= 4, f"too terse to be plain English: {message!r}"
