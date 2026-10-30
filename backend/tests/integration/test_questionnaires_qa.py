"""QA coverage for the questionnaire builder (US-016: AC-058..AC-062, NFR-001,
NFR-010, NFR-015, NFR-020).

Runs against the real PostgreSQL given by DATABASE_URL through the shared
`client`/`login` fixtures in backend/tests/conftest.py. No mocks.

Contract under test (docs/sdlc/architecture/api/openapi.yaml):
  POST /rating-scales            {name, labels[{value,label}]}                 -> 201 | 422
  POST /questionnaires           {name, rating_scale_id,
                                  competencies[{name, questions[{text,type,mandatory}]}]}
                                                                               -> 201 | 422
  GET  /questionnaires           -> list of templates with their status
  GET  /questionnaires/{id}      -> the template with competencies, questions and scale labels
  PUT  /questionnaires/{id}      -> the edited template
  POST /questionnaires/{id}/publish -> 200 | 422 {errors}
"""

import time
import uuid

import pytest
from sqlalchemy import text

from app.database import SessionLocal
from tests.conftest import H, login

HR = "hr.admin@example.com"
MANAGER = "manager@example.com"
EMPLOYEE = "employee@example.com"
EXEC = "executive@example.com"
NON_HR = [EMPLOYEE, MANAGER, EXEC]
QA_PREFIX = "QA Q16 "

LABELS = [
    {"value": 1, "label": "Needs development"},
    {"value": 2, "label": "Meets some expectations"},
    {"value": 3, "label": "Meets expectations"},
    {"value": 4, "label": "Exceeds expectations"},
]


@pytest.fixture(autouse=True)
def _clean_questionnaires():
    yield
    statements = (
        "DELETE FROM self_review_answer WHERE question_id IN (SELECT q.id FROM question q"
        " JOIN competency c ON c.id = q.competency_id JOIN questionnaire_template t"
        " ON t.id = c.template_id WHERE t.name LIKE :p)",
        "DELETE FROM question WHERE competency_id IN (SELECT c.id FROM competency c"
        " JOIN questionnaire_template t ON t.id = c.template_id WHERE t.name LIKE :p)",
        "DELETE FROM competency WHERE template_id IN"
        " (SELECT id FROM questionnaire_template WHERE name LIKE :p)",
        "DELETE FROM questionnaire_template WHERE name LIKE :p",
        "DELETE FROM rating_scale WHERE name LIKE :p",
    )
    for sql in statements:
        with SessionLocal() as db:
            try:
                db.execute(text(sql), {"p": QA_PREFIX + "%"})
                db.commit()
            except Exception:  # the table may not exist yet, or rows may be referenced
                db.rollback()


# ------------------------------------------------------------------ helpers


def _name(what):
    return f"{QA_PREFIX}{what} {uuid.uuid4().hex[:8]}"


def _scale(client, labels=None, name=None):
    r = client.post(
        "/rating-scales",
        json={"name": name or _name("Scale"), "labels": labels if labels is not None else LABELS},
        headers=H,
    )
    assert r.status_code in (200, 201), r.text
    return r.json()


def _template_body(scale_id, **over):
    body = {
        "name": _name("Template"),
        "rating_scale_id": scale_id,
        "competencies": [
            {
                "name": "Collaboration",
                "questions": [
                    {
                        "text": "How well did you work with others?",
                        "type": "rated",
                        "mandatory": True,
                    },
                ],
            }
        ],
    }
    body.update(over)
    return body


def _create_template(client, scale_id, **over):
    r = client.post("/questionnaires", json=_template_body(scale_id, **over), headers=H)
    assert r.status_code in (200, 201), r.text
    return r.json()


def _get_template(client, template_id):
    r = client.get(f"/questionnaires/{template_id}")
    assert r.status_code == 200, r.text
    return r.json()


def _publish(client, template_id):
    return client.post(f"/questionnaires/{template_id}/publish", json={}, headers=H)


def _list(client, **params):
    query = "&".join(f"{k}={v}" for k, v in params.items())
    r = client.get("/questionnaires" + (f"?{query}" if query else ""))
    assert r.status_code == 200, r.text
    body = r.json()
    return body["templates"] if isinstance(body, dict) and "templates" in body else body


def _row(listing, template_id):
    return next((t for t in listing if t["id"] == template_id), None)


def _questions_of(template):
    out = []
    for comp in template.get("competencies", []):
        out.extend(comp.get("questions", []))
    return out


def _labels_of(template):
    scale = template.get("rating_scale") or template.get("scale") or {}
    return scale.get("labels") or template.get("labels") or []


_TEXT_TYPE = None


def _text_type(client, scale_id):
    """The delivered name for a free-text question ('free_text' per the data model)."""
    global _TEXT_TYPE
    if _TEXT_TYPE is None:
        for candidate in ("free_text", "text"):
            body = _template_body(
                scale_id,
                competencies=[
                    {
                        "name": "Probe",
                        "questions": [{"text": "Probe?", "type": candidate, "mandatory": False}],
                    }
                ],
            )
            r = client.post("/questionnaires", json=body, headers=H)
            if r.status_code in (200, 201):
                _TEXT_TYPE = candidate
                break
        assert _TEXT_TYPE, "AC-059: neither 'free_text' nor 'text' was accepted as a question type"
    return _TEXT_TYPE


def _count(sql, **params):
    with SessionLocal() as db:
        return db.execute(text(sql), params).scalar()


# --------------------------------------------------------------------- AC-058


def test_ac058_a_template_with_competencies_and_questions_is_listed_once_published(client):
    login(client, HR)
    scale = _scale(client)
    created = _create_template(
        client,
        scale["id"],
        competencies=[
            {
                "name": "Collaboration",
                "questions": [
                    {
                        "text": "How well did you work with others?",
                        "type": "rated",
                        "mandatory": True,
                    },
                    {
                        "text": "Give an example.",
                        "type": _text_type(client, scale["id"]),
                        "mandatory": False,
                    },
                ],
            },
            {
                "name": "Delivery",
                "questions": [
                    {
                        "text": "Did you deliver what you promised?",
                        "type": "rated",
                        "mandatory": True,
                    }
                ],
            },
        ],
    )
    assert created["id"]
    assert created["status"] == "draft", "AC-058: a new template is not a draft"

    fetched = _get_template(client, created["id"])
    assert [c["name"] for c in fetched["competencies"]] == ["Collaboration", "Delivery"]
    assert len(_questions_of(fetched)) == 3

    # A draft is not yet offered as available for a review period.
    available = _list(client, status="published")
    assert _row(available, created["id"]) is None, "AC-058: a draft is offered as available"

    published = _publish(client, created["id"])
    assert published.status_code == 200, published.text
    assert published.json()["status"] == "published"

    row = _row(_list(client, status="published"), created["id"])
    assert row is not None, "AC-058: a published template is not listed as available"
    assert row["status"] == "published"
    assert _get_template(client, created["id"])["status"] == "published"


# --------------------------------------------------------------------- AC-059


def test_ac059_rated_text_and_both_question_types_persist(client):
    login(client, HR)
    scale = _scale(client)
    text_type = _text_type(client, scale["id"])
    types = ["rated", text_type, "both"]
    created = _create_template(
        client,
        scale["id"],
        competencies=[
            {
                "name": "Types",
                "questions": [
                    {"text": f"Question {t}", "type": t, "mandatory": i == 0}
                    for i, t in enumerate(types)
                ],
            }
        ],
    )
    saved = _questions_of(_get_template(client, created["id"]))
    assert [q["type"] for q in saved] == types, "AC-059: a question type was not persisted"
    assert [q["text"] for q in saved] == [f"Question {t}" for t in types]
    assert saved[0]["mandatory"] is True and saved[1]["mandatory"] is False


@pytest.mark.parametrize("bad", ["rating", "multiple_choice", "", None, 3, "RATED "])
def test_ac059_an_invalid_question_type_is_422_and_stores_nothing(client, bad):
    login(client, HR)
    scale = _scale(client)
    body = _template_body(
        scale["id"],
        competencies=[
            {"name": "Bad", "questions": [{"text": "Q?", "type": bad, "mandatory": True}]}
        ],
    )
    r = client.post("/questionnaires", json=body, headers=H)
    assert r.status_code == 422, f"AC-059: question type {bad!r} was accepted"
    assert r.json()["errors"], "AC-059: the 422 carries no field-level message"
    assert all(
        t["name"] != body["name"] for t in _list(client)
    ), "AC-059: a template was stored despite the 422"


def test_ac059_a_question_needs_text(client):
    login(client, HR)
    scale = _scale(client)
    r = client.post(
        "/questionnaires",
        json=_template_body(
            scale["id"],
            competencies=[
                {"name": "Blank", "questions": [{"text": "  ", "type": "rated", "mandatory": True}]}
            ],
        ),
        headers=H,
    )
    assert r.status_code == 422, r.text
    assert r.json()["errors"]


# --------------------------------------------------------------------- AC-060


def test_ac060_scale_points_and_labels_are_saved_and_shown_on_rated_questions(client):
    login(client, HR)
    scale = _scale(client)
    assert [p["value"] for p in scale["labels"]] == [1, 2, 3, 4]
    assert [p["label"] for p in scale["labels"]] == [p["label"] for p in LABELS]

    created = _create_template(client, scale["id"])
    fetched = _get_template(client, created["id"])
    shown = _labels_of(fetched)
    assert shown, "AC-060: the template does not carry the rating scale labels"
    assert [(p["value"], p["label"]) for p in shown] == [
        (p["value"], p["label"]) for p in LABELS
    ], "AC-060: the labels shown with the rated questions are not the ones HR saved"


@pytest.mark.parametrize(
    "labels",
    [
        [],
        [{"value": 1, "label": "Only one"}],
        [{"value": 1, "label": ""}, {"value": 2, "label": "Fine"}],
        [{"value": 1, "label": "A"}, {"value": 1, "label": "B"}],
        [{"value": 1}, {"value": 2}],
        [{"label": "No value"}],
        "not-a-list",
    ],
)
def test_ac060_bad_scale_points_or_labels_are_422_and_store_nothing(client, labels):
    login(client, HR)
    name = _name("Scale")
    r = client.post("/rating-scales", json={"name": name, "labels": labels}, headers=H)
    assert r.status_code == 422, f"AC-060: labels {labels!r} were accepted"
    assert r.json()["errors"], "AC-060: the 422 carries no field-level message"
    assert _count("SELECT count(*) FROM rating_scale WHERE name = :n", n=name) == 0


# --------------------------------------------------------------------- AC-061


def test_ac061_a_captured_snapshot_is_untouched_by_a_later_edit(client):
    login(client, HR)
    scale = _scale(client)
    created = _create_template(
        client,
        scale["id"],
        competencies=[
            {
                "name": "Original competency",
                "questions": [{"text": "Original question?", "type": "rated", "mandatory": True}],
            }
        ],
    )
    assert _publish(client, created["id"]).status_code == 200

    # The snapshot a review takes of the questionnaire as it stands today.
    snapshot = _get_template(client, created["id"])
    snapshot_questions = [q["text"] for q in _questions_of(snapshot)]
    snapshot_labels = [(p["value"], p["label"]) for p in _labels_of(snapshot)]
    assert snapshot_questions == ["Original question?"]
    assert snapshot_labels == [(p["value"], p["label"]) for p in LABELS]

    # HR edits both the questionnaire and the rating scale labels.
    edited_labels = [{"value": p["value"], "label": p["label"] + " (revised)"} for p in LABELS]
    scale_edit = client.put(
        f"/rating-scales/{scale['id']}",
        json={"name": scale["name"], "labels": edited_labels},
        headers=H,
    )
    if scale_edit.status_code == 405:  # labels are versioned by creating a new scale
        new_scale = _scale(client, labels=edited_labels)
        scale_id_for_edit = new_scale["id"]
    else:
        assert scale_edit.status_code == 200, scale_edit.text
        scale_id_for_edit = scale["id"]

    edit = client.put(
        f"/questionnaires/{created['id']}",
        json={
            "name": snapshot["name"],
            "rating_scale_id": scale_id_for_edit,
            "competencies": [
                {
                    "name": "Edited competency",
                    "questions": [{"text": "Edited question?", "type": "rated", "mandatory": True}],
                }
            ],
        },
        headers=H,
    )
    assert edit.status_code in (200, 201), edit.text

    # The new version shows the edit...
    current = _get_template(client, edit.json().get("id", created["id"]))
    assert [q["text"] for q in _questions_of(current)] == ["Edited question?"]
    assert [p["label"] for p in _labels_of(current)] == [p["label"] for p in edited_labels]

    # ...and the snapshot taken earlier is unchanged.
    if edit.json().get("id") not in (None, created["id"]):
        preserved = _get_template(client, created["id"])
        assert [q["text"] for q in _questions_of(preserved)] == snapshot_questions
        assert [(p["value"], p["label"]) for p in _labels_of(preserved)] == snapshot_labels
    else:
        kept = _count(
            "SELECT count(*) FROM question WHERE text = 'Original question?'",
        )
        assert kept == 1, (
            "AC-061/NFR-010: editing a published template destroyed the questions a "
            "submitted review must keep showing"
        )


def test_ac061_editing_a_published_template_never_destroys_the_earlier_wording(client):
    """NFR-010: records must stand up as employment evidence."""
    login(client, HR)
    scale = _scale(client)
    created = _create_template(
        client,
        scale["id"],
        competencies=[
            {
                "name": "Evidence",
                "questions": [{"text": "Keep me?", "type": "rated", "mandatory": True}],
            }
        ],
    )
    assert _publish(client, created["id"]).status_code == 200
    client.put(
        f"/questionnaires/{created['id']}",
        json={
            "name": created["name"],
            "rating_scale_id": scale["id"],
            "competencies": [
                {
                    "name": "Evidence",
                    "questions": [{"text": "Replaced", "type": "rated", "mandatory": True}],
                }
            ],
        },
        headers=H,
    )
    assert (
        _count("SELECT count(*) FROM question WHERE text = 'Keep me?'") == 1
    ), "NFR-010: the published wording was overwritten in place"


# --------------------------------------------------------------------- AC-062


def test_ac062_publishing_without_questions_is_422_and_the_template_stays_unpublished(client):
    login(client, HR)
    scale = _scale(client)
    empty = _create_template(client, scale["id"], competencies=[])

    r = _publish(client, empty["id"])
    assert r.status_code == 422, r.text
    messages = list(r.json().get("errors", {}).values()) or [r.json().get("detail")]
    assert "At least one question is required." in [
        str(m) for m in messages
    ], f"AC-062: the message was {messages!r}"
    assert _get_template(client, empty["id"])["status"] == "draft"
    assert _row(_list(client, status="published"), empty["id"]) is None


def test_ac062_a_competency_with_no_questions_still_cannot_be_published(client):
    login(client, HR)
    scale = _scale(client)
    created = _create_template(
        client, scale["id"], competencies=[{"name": "Empty competency", "questions": []}]
    )
    r = _publish(client, created["id"])
    assert r.status_code == 422, r.text
    assert _get_template(client, created["id"])["status"] == "draft"


# -------------------------------------------------------------------- NFR-001


@pytest.mark.parametrize("email", NON_HR)
def test_nfr001_non_hr_roles_are_refused_403_with_an_empty_body(client, email):
    login(client, HR)
    scale = _scale(client)
    template = _create_template(client, scale["id"])
    client.cookies.clear()

    login(client, email)
    refusals = [
        client.post("/rating-scales", json={"name": _name("Nope"), "labels": LABELS}, headers=H),
        client.post("/questionnaires", json=_template_body(scale["id"]), headers=H),
        client.put(
            f"/questionnaires/{template['id']}", json=_template_body(scale["id"]), headers=H
        ),
        client.post(f"/questionnaires/{template['id']}/publish", json={}, headers=H),
    ]
    for r in refusals:
        assert r.status_code == 403, r.text
        assert r.content == b"", "NFR-001: the refusal leaked a body"

    client.cookies.clear()
    login(client, HR)
    assert _get_template(client, template["id"])["status"] == "draft"


def test_nfr001_signed_out_calls_are_401(client):
    login(client, HR)
    scale = _scale(client)
    template = _create_template(client, scale["id"])
    client.cookies.clear()

    assert client.get("/questionnaires").status_code == 401
    assert (
        client.post("/questionnaires", json=_template_body(scale["id"]), headers=H).status_code
        == 401
    )
    assert (
        client.post(f"/questionnaires/{template['id']}/publish", json={}, headers=H).status_code
        == 401
    )
    assert (
        client.post(
            "/rating-scales", json={"name": _name("X"), "labels": LABELS}, headers=H
        ).status_code
        == 401
    )


def test_nfr001_mutations_require_the_mutation_header(client):
    login(client, HR)
    scale = _scale(client)
    r = client.post("/questionnaires", json=_template_body(scale["id"]))
    assert r.status_code == 403 and r.content == b""


# ----------------------------------------------------------- NFR-010 / NFR-020


def test_nfr010_no_route_hard_deletes_a_template(client):
    login(client, HR)
    paths = client.get("/openapi.json").json()["paths"]
    deletable = [
        p
        for p, ops in paths.items()
        if "delete" in ops and ("questionnaire" in p or "rating-scale" in p or "competenc" in p)
    ]
    assert deletable == [], f"NFR-010: a delete route exists for questionnaire content: {deletable}"

    scale = _scale(client)
    template = _create_template(client, scale["id"])
    assert _publish(client, template["id"]).status_code == 200
    for path in (
        f"/questionnaires/{template['id']}",
        f"/rating-scales/{scale['id']}",
    ):
        assert client.delete(path, headers=H).status_code >= 400
    assert (
        _count("SELECT count(*) FROM questionnaire_template WHERE id = :i", i=template["id"]) == 1
    )


def test_nfr020_the_questions_and_the_scale_live_in_the_database_not_in_code(client):
    login(client, HR)
    scale = _scale(client)
    created = _create_template(
        client,
        scale["id"],
        competencies=[
            {
                "name": "Configured competency",
                "questions": [{"text": "Configured question?", "type": "rated", "mandatory": True}],
            }
        ],
    )
    assert _count("SELECT count(*) FROM rating_scale WHERE id = :i", i=scale["id"]) == 1
    assert _count("SELECT count(*) FROM competency WHERE name = 'Configured competency'") == 1
    assert _count("SELECT count(*) FROM question WHERE text = 'Configured question?'") == 1
    assert _count("SELECT count(*) FROM questionnaire_template WHERE id = :i", i=created["id"]) == 1


# -------------------------------------------------------------------- NFR-015


def test_nfr015_a_large_framework_is_built_and_published_within_time(client):
    """Sized for one company under 200: 20 competencies of 10 questions each."""
    login(client, HR)
    scale = _scale(client)
    competencies = [
        {
            "name": f"Competency {c:02d}",
            "questions": [
                {"text": f"Question {c:02d}-{q:02d}?", "type": "rated", "mandatory": False}
                for q in range(10)
            ],
        }
        for c in range(20)
    ]
    started = time.monotonic()
    created = _create_template(client, scale["id"], competencies=competencies)
    assert _publish(client, created["id"]).status_code == 200
    fetched = _get_template(client, created["id"])
    elapsed = time.monotonic() - started
    assert len(_questions_of(fetched)) == 200
    assert elapsed < 10, f"building and publishing a 200-question template took {elapsed:.1f}s"
