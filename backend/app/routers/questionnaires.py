"""Review questionnaires: rating scales, templates and immutable versions (US-016).

Everything HR configures here is data in Postgres, never code (NFR-020). An
edit never touches a stored version: it writes a new one, so a submitted
review keeps the questions and scale labels it was answered against (NFR-010).
"""

import uuid
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, Response
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app import auth
from app.database import get_db
from app.models import (
    AuditEvent,
    Employee,
    QuestionnaireCompetency,
    QuestionnaireQuestion,
    QuestionnaireTemplate,
    QuestionnaireVersion,
    RatingScale,
    RatingScalePoint,
)
from app.routers.employees import _invalid

router = APIRouter(tags=["questionnaires"])
hr_admin = Depends(auth.require_role("hr_admin"))

TYPES = ("rated", "text", "both")
MIN_POINTS, MAX_POINTS = 2, 10
NO_QUESTIONS = "At least one question is required."


class PointIn(BaseModel):
    value: object | None = None
    label: str | None = None


class ScaleIn(BaseModel):
    name: str | None = None
    points: list[PointIn] | None = None
    # The UI and the contract call the same thing "labels"; accept either name.
    labels: list[PointIn] | None = None

    def all_points(self) -> list[PointIn]:
        return self.points if self.points is not None else (self.labels or [])

    def field(self) -> str:
        return "points" if self.points is not None or self.labels is None else "labels"


class QuestionIn(BaseModel):
    text: str | None = None
    type: str | None = None
    mandatory: bool = True


class CompetencyIn(BaseModel):
    name: str | None = None
    questions: list[QuestionIn] | None = None


class TemplateIn(BaseModel):
    name: str | None = None
    rating_scale_id: uuid.UUID | None = None
    competencies: list[CompetencyIn] | None = None


# --------------------------------------------------------------------------- scales


def _scale_out(db: Session, scale: RatingScale) -> dict:
    points = db.scalars(
        select(RatingScalePoint)
        .where(RatingScalePoint.scale_id == scale.id)
        .order_by(RatingScalePoint.value)
    ).all()
    out = [{"value": p.value, "label": p.label} for p in points]
    return {"id": str(scale.id), "name": scale.name, "points": out, "labels": out}


@router.post("/rating-scales", status_code=201)
def create_rating_scale(body: ScaleIn, db: Session = Depends(get_db), _hr=hr_admin):
    errors: dict[str, str] = {}
    field = body.field()
    if not (body.name or "").strip():
        errors["name"] = "Enter a name for this rating scale."
    points = body.all_points()
    if len(points) < MIN_POINTS or len(points) > MAX_POINTS:
        errors[field] = (
            f"Enter between {MIN_POINTS} and {MAX_POINTS} points for this rating scale."
        )
    seen: set[int] = set()
    cleaned: list[tuple[int, str]] = []
    for i, p in enumerate(points):
        value = p.value if isinstance(p.value, int) and not isinstance(p.value, bool) else i + 1
        label = (p.label or "").strip()
        if not label:
            errors[f"{field}.{i}.label"] = "Enter a label for this point."
        if value in seen:
            errors[f"{field}.{i}.value"] = "Each point must have a different value."
        seen.add(value)
        cleaned.append((value, label))
    if errors:
        return _invalid(errors)
    scale = RatingScale(name=body.name.strip())
    db.add(scale)
    db.flush()
    for value, label in cleaned:
        db.add(RatingScalePoint(scale_id=scale.id, value=value, label=label))
    db.commit()
    return _scale_out(db, scale)


@router.get("/rating-scales")
def list_rating_scales(db: Session = Depends(get_db), _hr=hr_admin):
    rows = db.scalars(select(RatingScale).order_by(RatingScale.created_at)).all()
    return [_scale_out(db, s) for s in rows]


@router.get("/rating-scales/{scale_id}")
def get_rating_scale(scale_id: uuid.UUID, db: Session = Depends(get_db), _hr=hr_admin):
    """Read only: a scale's labels are never edited in place, a new scale is
    created instead, so a submitted review keeps its labels (NFR-010)."""
    scale = db.get(RatingScale, scale_id)
    if scale is None:
        return Response(status_code=404)
    return _scale_out(db, scale)


# -------------------------------------------------------------------- questionnaires


def _validate(db: Session, body: TemplateIn) -> dict[str, str]:
    errors: dict[str, str] = {}
    if not (body.name or "").strip():
        errors["name"] = "Enter a name for this questionnaire."
    if body.rating_scale_id is not None and db.get(RatingScale, body.rating_scale_id) is None:
        errors["rating_scale_id"] = "The chosen rating scale does not exist."
    # An empty draft is allowed; the publish guard is what refuses it (AC-062).
    for ci, comp in enumerate(body.competencies or []):
        if not (comp.name or "").strip():
            errors[f"competencies.{ci}.name"] = "Enter a name for this competency."
        for qi, q in enumerate(comp.questions or []):
            field = f"competencies.{ci}.questions.{qi}"
            if not (q.text or "").strip():
                errors[f"{field}.text"] = "Enter the question."
            if q.type not in TYPES:
                errors[f"{field}.type"] = "Choose a question type: rated, text or both."
    return errors


def _scale_snapshot(db: Session, scale_id: uuid.UUID | None) -> dict | None:
    if scale_id is None:
        return None
    scale = db.get(RatingScale, scale_id)
    if scale is None:
        return None
    return _scale_out(db, scale)


def _new_version(
    db: Session, template: QuestionnaireTemplate, body: TemplateIn, number: int
) -> QuestionnaireVersion:
    version = QuestionnaireVersion(
        template_id=template.id,
        version=number,
        name=body.name.strip(),
        status="draft",
        rating_scale_id=body.rating_scale_id,
        scale_snapshot=_scale_snapshot(db, body.rating_scale_id),
    )
    db.add(version)
    db.flush()
    for ci, comp in enumerate(body.competencies or []):
        competency = QuestionnaireCompetency(
            version_id=version.id, name=comp.name.strip(), position=ci
        )
        db.add(competency)
        db.flush()
        for qi, q in enumerate(comp.questions or []):
            db.add(
                QuestionnaireQuestion(
                    competency_id=competency.id,
                    text=q.text.strip(),
                    type=q.type,
                    mandatory=q.mandatory,
                    position=qi,
                )
            )
    return version


def _latest(db: Session, template_id: uuid.UUID) -> QuestionnaireVersion | None:
    return db.scalar(
        select(QuestionnaireVersion)
        .where(QuestionnaireVersion.template_id == template_id)
        .order_by(QuestionnaireVersion.version.desc())
    )


def questionnaire_snapshot(db: Session, template_version_id: uuid.UUID) -> dict | None:
    """The full questions and scale labels as at this version.

    What the self-review submit step stores, so the answers always read back
    against the questions and labels they were given (NFR-010). The result
    never changes once the version exists.
    """
    version = db.get(QuestionnaireVersion, template_version_id)
    if version is None:
        return None
    competencies = db.scalars(
        select(QuestionnaireCompetency)
        .where(QuestionnaireCompetency.version_id == version.id)
        .order_by(QuestionnaireCompetency.position)
    ).all()
    scale = version.scale_snapshot
    out_competencies = []
    for comp in competencies:
        questions = db.scalars(
            select(QuestionnaireQuestion)
            .where(QuestionnaireQuestion.competency_id == comp.id)
            .order_by(QuestionnaireQuestion.position)
        ).all()
        out_competencies.append(
            {
                "id": str(comp.id),
                "name": comp.name,
                "questions": [
                    {
                        "id": str(q.id),
                        "text": q.text,
                        "type": q.type,
                        "mandatory": q.mandatory,
                        "requires": {
                            "rating": q.type in {"rated", "both"},
                            "comment": q.type in {"text", "both"},
                        },
                        "scale": scale if q.type in {"rated", "both"} else None,
                    }
                    for q in questions
                ],
            }
        )
    return {
        "template_id": str(version.template_id),
        "version_id": str(version.id),
        "version": version.version,
        "name": version.name,
        "scale": scale,
        "competencies": out_competencies,
    }


def _detail(db: Session, version: QuestionnaireVersion) -> dict:
    return {
        **questionnaire_snapshot(db, version.id),
        "id": str(version.template_id),
        "status": version.status,
        "available": version.status == "published",
    }


def _summary(version: QuestionnaireVersion) -> dict:
    return {
        "id": str(version.template_id),
        "version_id": str(version.id),
        "version": version.version,
        "name": version.name,
        "status": version.status,
        "available": version.status == "published",
    }


def _audit(db: Session, actor: Employee, action: str, version: QuestionnaireVersion) -> None:
    db.add(
        AuditEvent(
            actor_id=actor.id,
            action=action,
            entity_type="questionnaire",
            entity_id=version.template_id,
            details={"version_id": str(version.id), "version": version.version},
        )
    )


@router.get("/questionnaires")
def list_questionnaires(
    status: str | None = None, db: Session = Depends(get_db), _hr=hr_admin
):
    """Every template with its latest version; `status` narrows the list."""
    templates = db.scalars(
        select(QuestionnaireTemplate).order_by(QuestionnaireTemplate.created_at)
    ).all()
    out = []
    for t in templates:
        version = _latest(db, t.id)
        if version is not None and (status is None or version.status == status):
            out.append(_summary(version))
    return out


@router.post("/questionnaires", status_code=201)
def create_questionnaire(
    body: TemplateIn, db: Session = Depends(get_db), actor: Employee = hr_admin
):
    errors = _validate(db, body)
    if errors:
        return _invalid(errors)
    template = QuestionnaireTemplate(name=body.name.strip())
    db.add(template)
    db.flush()
    version = _new_version(db, template, body, 1)
    _audit(db, actor, "questionnaire_created", version)
    db.commit()
    return _detail(db, version)


@router.get("/questionnaires/{template_id}")
def get_questionnaire(template_id: uuid.UUID, db: Session = Depends(get_db), _hr=hr_admin):
    version = _latest(db, template_id)
    if version is None:
        return Response(status_code=404)
    return _detail(db, version)


@router.put("/questionnaires/{template_id}")
def update_questionnaire(
    template_id: uuid.UUID,
    body: TemplateIn,
    db: Session = Depends(get_db),
    actor: Employee = hr_admin,
):
    """An edit always writes a new version; prior rows are never touched."""
    template = db.get(QuestionnaireTemplate, template_id)
    current = _latest(db, template_id) if template is not None else None
    if template is None or current is None:
        return Response(status_code=404)
    errors = _validate(db, body)
    if errors:
        return _invalid(errors)
    version = _new_version(db, template, body, current.version + 1)
    template.name = body.name.strip()
    _audit(db, actor, "questionnaire_edited", version)
    db.commit()
    return _detail(db, version)


@router.post("/questionnaires/{template_id}/publish")
def publish_questionnaire(
    template_id: uuid.UUID, db: Session = Depends(get_db), actor: Employee = hr_admin
):
    version = _latest(db, template_id)
    if version is None:
        return Response(status_code=404)
    has_question = db.scalar(
        select(QuestionnaireQuestion.id)
        .join(
            QuestionnaireCompetency,
            QuestionnaireCompetency.id == QuestionnaireQuestion.competency_id,
        )
        .where(QuestionnaireCompetency.version_id == version.id)
    )
    if has_question is None:
        return _invalid({"competencies": NO_QUESTIONS})
    if version.status != "published":
        version.status = "published"
        version.published_at = datetime.now(UTC)
        _audit(db, actor, "questionnaire_published", version)
        db.commit()
    return _detail(db, version)
