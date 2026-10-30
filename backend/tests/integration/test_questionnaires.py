import pytest
from sqlalchemy import text

from app.database import SessionLocal
from app.routers.questionnaires import questionnaire_snapshot
from tests.conftest import H, login

HR = "hr.admin@example.com"
NON_HR = ["employee@example.com", "manager@example.com", "executive@example.com"]


@pytest.fixture(autouse=True)
def _purge():
    yield
    with SessionLocal() as db:
        for sql in (
            "DELETE FROM question",
            "DELETE FROM competency",
            "DELETE FROM questionnaire_version",
            "DELETE FROM questionnaire_template",
            "DELETE FROM rating_scale_point",
            "DELETE FROM rating_scale",
        ):
            db.execute(text(sql))
        db.commit()


def _scale(client, name="Five point"):
    return client.post(
        "/rating-scales",
        json={
            "name": name,
            "points": [
                {"value": 1, "label": "Needs work"},
                {"value": 2, "label": "Meets"},
                {"value": 3, "label": "Exceeds"},
            ],
        },
        headers=H,
    )


def _template(client, scale_id=None, **over):
    body = {
        "name": "Mid-year review",
        "rating_scale_id": scale_id,
        "competencies": [
            {
                "name": "Collaboration",
                "questions": [
                    {"text": "How well did you work with others?", "type": "both"},
                    {"text": "Anything to add?", "type": "text", "mandatory": False},
                ],
            }
        ],
    }
    body.update(over)
    return client.post("/questionnaires", json=body, headers=H)


def test_ac058_create_lists_with_status_and_available_once_published(client):
    login(client, HR)
    created = _template(client)
    assert created.status_code == 201
    tid = created.json()["id"]
    rows = client.get("/questionnaires").json()
    row = next(r for r in rows if r["id"] == tid)
    assert row["name"] == "Mid-year review"
    assert row["status"] == "draft" and row["available"] is False
    assert client.post(f"/questionnaires/{tid}/publish", headers=H).status_code == 200
    row = next(r for r in client.get("/questionnaires").json() if r["id"] == tid)
    assert row["status"] == "published" and row["available"] is True


def test_ac059_saved_type_returned_and_drives_what_an_answer_supplies(client):
    login(client, HR)
    tid = _template(client).json()["id"]
    detail = client.get(f"/questionnaires/{tid}").json()
    questions = detail["competencies"][0]["questions"]
    assert [q["type"] for q in questions] == ["both", "text"]
    assert questions[0]["requires"] == {"rating": True, "comment": True}
    assert questions[1]["requires"] == {"rating": False, "comment": True}
    assert questions[0]["mandatory"] is True and questions[1]["mandatory"] is False


def test_ac059_unknown_question_type_is_422_field_level(client):
    login(client, HR)
    r = _template(
        client,
        competencies=[{"name": "C", "questions": [{"text": "Q", "type": "slider"}]}],
    )
    assert r.status_code == 422
    assert r.json()["errors"] == {
        "competencies.0.questions.0.type": "Choose a question type: rated, text or both."
    }
    assert client.get("/questionnaires").json() == []


def test_ac060_scale_stored_returned_and_embedded_on_rated_questions(client):
    login(client, HR)
    scale = _scale(client)
    assert scale.status_code == 201
    assert [p["label"] for p in scale.json()["points"]] == ["Needs work", "Meets", "Exceeds"]
    tid = _template(client, scale_id=scale.json()["id"]).json()["id"]
    questions = client.get(f"/questionnaires/{tid}").json()["competencies"][0]["questions"]
    assert [p["label"] for p in questions[0]["scale"]["points"]] == [
        "Needs work",
        "Meets",
        "Exceeds",
    ]
    assert questions[1]["scale"] is None  # text-only question carries no scale


@pytest.mark.parametrize(
    "points,field",
    [
        ([{"value": 1, "label": "ok"}], "points"),
        ([{"value": 1, "label": " "}, {"value": 2, "label": "ok"}], "points.0.label"),
        ([{"value": 1, "label": "a"}, {"value": 1, "label": "b"}], "points.1.value"),
    ],
)
def test_ac060_bad_points_are_422_per_field(client, points, field):
    login(client, HR)
    r = client.post("/rating-scales", json={"name": "Bad", "points": points}, headers=H)
    assert r.status_code == 422 and field in r.json()["errors"]
    assert client.get("/rating-scales").json() == []


def test_ac061_edit_creates_a_new_version_and_the_snapshot_is_byte_identical(client):
    login(client, HR)
    scale_id = _scale(client).json()["id"]
    tid = _template(client, scale_id=scale_id).json()["id"]
    client.post(f"/questionnaires/{tid}/publish", headers=H)
    old_version_id = client.get(f"/questionnaires/{tid}").json()["version_id"]
    with SessionLocal() as db:
        before = questionnaire_snapshot(db, old_version_id)

    edited = client.put(
        f"/questionnaires/{tid}",
        json={
            "name": "Mid-year review v2",
            "rating_scale_id": scale_id,
            "competencies": [
                {"name": "Delivery", "questions": [{"text": "Did you ship?", "type": "rated"}]}
            ],
        },
        headers=H,
    )
    assert edited.status_code == 200
    assert edited.json()["version"] == 2
    assert edited.json()["version_id"] != old_version_id

    with SessionLocal() as db:
        db.execute(text("UPDATE rating_scale_point SET label = 'Changed'"))
        db.commit()
        after = questionnaire_snapshot(db, old_version_id)
    assert after == before
    assert after["competencies"][0]["questions"][0]["scale"]["points"][0]["label"] == "Needs work"


def test_ac062_publish_without_questions_is_422_and_stays_draft(client):
    login(client, HR)
    r = _template(client, competencies=[])
    tid = r.json()["id"]
    publish = client.post(f"/questionnaires/{tid}/publish", headers=H)
    assert publish.status_code == 422
    assert publish.json()["errors"]["competencies"] == "At least one question is required."
    assert client.get(f"/questionnaires/{tid}").json()["status"] == "draft"


@pytest.mark.parametrize("email", NON_HR)
def test_nfr001_non_hr_is_403_empty_on_every_route(client, email):
    login(client, HR)
    tid = _template(client).json()["id"]
    client.cookies.clear()
    login(client, email)
    for r in (
        client.get("/questionnaires"),
        client.get(f"/questionnaires/{tid}"),
        client.post("/questionnaires", json={"name": "X"}, headers=H),
        client.put(f"/questionnaires/{tid}", json={"name": "X"}, headers=H),
        client.post(f"/questionnaires/{tid}/publish", headers=H),
        client.post("/rating-scales", json={"name": "X"}, headers=H),
    ):
        assert r.status_code == 403 and r.content == b""


def test_nfr001_signed_out_is_401_and_mutation_needs_the_header(client):
    assert client.get("/questionnaires").status_code == 401
    assert client.post("/questionnaires", json={}, headers=H).status_code == 401
    login(client, HR)
    r = client.post("/questionnaires", json={"name": "X"})
    assert r.status_code == 403 and r.content == b""


def test_nfr010_an_edit_leaves_the_previous_version_rows_untouched(client):
    login(client, HR)
    tid = _template(client).json()["id"]
    with SessionLocal() as db:
        before = db.execute(text("SELECT id, text, type FROM question ORDER BY id")).all()
    client.put(
        f"/questionnaires/{tid}",
        json={"name": "N", "competencies": [{"name": "C", "questions": []}]},
        headers=H,
    )
    with SessionLocal() as db:
        after = db.execute(text("SELECT id, text, type FROM question ORDER BY id")).all()
        versions = db.execute(text("SELECT count(*) FROM questionnaire_version")).scalar()
    assert all(row in after for row in before) and versions == 2
