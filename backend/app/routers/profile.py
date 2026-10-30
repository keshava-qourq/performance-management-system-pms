"""Personal profile: read it, edit the fields you own, upload a photo (US-009).

Display name and pronouns are self-service. Job title, department, manager and
role are maintained by HR through /employees, so this router refuses them and
labels them in the response so the UI can show them read-only (AC-033).
"""

import io
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, UploadFile
from fastapi.responses import JSONResponse
from PIL import Image, UnidentifiedImageError
from pydantic import BaseModel, ConfigDict
from sqlalchemy.orm import Session

from app import auth, storage
from app.database import get_db
from app.models import Department, Employee, JobTitle

router = APIRouter(tags=["profile"])

# Fields only HR may change; sent to /me/profile they are refused (AC-033).
HR_MAINTAINED = ["job_title", "department", "manager", "role"]
_HR_FIELDS = {
    "job_title",
    "job_title_id",
    "department",
    "department_id",
    "manager",
    "manager_id",
    "role",
}

MAX_UPLOAD_BYTES = 5 * 1024 * 1024
MAX_PIXELS = 512  # downsized to fit this box; one organisation, small photos (NFR-015)
PHOTO_PREFIX = "profile-photos"
PHOTO_URL_SECONDS = 300  # short-lived presigned URL; objects are never public


class ProfileIn(BaseModel):
    # Extras are kept rather than ignored so an attempt at an HR-owned field is
    # refused out loud instead of silently dropped (AC-033).
    model_config = ConfigDict(extra="allow")

    display_name: str | None = None
    pronouns: str | None = None


def photo_url(e: Employee) -> str | None:
    return storage.url_for(e.photo_key, expires_in=PHOTO_URL_SECONDS) if e.photo_key else None


def _out(db: Session, e: Employee) -> dict:
    title = db.get(JobTitle, e.job_title_id) if e.job_title_id else None
    dept = db.get(Department, e.department_id) if e.department_id else None
    manager = db.get(Employee, e.manager_id) if e.manager_id else None
    return {
        "id": str(e.id),
        "full_name": e.full_name,
        "work_email": e.work_email,
        "job_title": {"id": str(title.id), "name": title.name} if title else None,
        "department": {"id": str(dept.id), "name": dept.name} if dept else None,
        "manager": {"id": str(manager.id), "full_name": manager.full_name} if manager else None,
        "role": e.role,
        "display_name": e.display_name,
        "pronouns": e.pronouns,
        "photo_url": photo_url(e),
        "hr_maintained": HR_MAINTAINED,
    }


def _invalid(errors: dict) -> JSONResponse:
    return JSONResponse(status_code=422, content={"errors": errors})


@router.get("/me/profile")
def get_profile(db: Session = Depends(get_db), emp: Employee = Depends(auth.current_employee)):
    return _out(db, emp)


@router.patch("/me/profile")
def update_profile(
    body: ProfileIn,
    db: Session = Depends(get_db),
    emp: Employee = Depends(auth.current_employee),
):
    """Only display name and pronouns; anything HR owns is refused (AC-032, AC-033)."""
    sent = body.model_fields_set
    errors: dict[str, str] = {}
    extras = set(body.model_extra or {})
    for field in sorted(extras & _HR_FIELDS):
        errors[field] = "This field is maintained by HR and cannot be changed here."
    for field in sorted(extras - _HR_FIELDS):
        errors[field] = "This field cannot be changed here."
    if "display_name" in sent:
        value = (body.display_name or "").strip()
        if len(value) > 200:
            errors["display_name"] = "Use a display name of 200 characters or fewer."
    if "pronouns" in sent:
        pronouns = (body.pronouns or "").strip()
        if len(pronouns) > 40:
            errors["pronouns"] = "Use pronouns of 40 characters or fewer."
    if errors:
        return _invalid(errors)
    if "display_name" in sent:
        emp.display_name = (body.display_name or "").strip() or None
    if "pronouns" in sent:
        emp.pronouns = (body.pronouns or "").strip() or None
    emp.updated_at = datetime.now(UTC)
    db.commit()
    return _out(db, emp)


@router.put("/me/profile/photo")
async def upload_photo(
    photo: UploadFile,
    db: Session = Depends(get_db),
    emp: Employee = Depends(auth.current_employee),
):
    """Validate and downsize with Pillow, then store it through app/storage.py."""
    data = await photo.read()
    if not data:
        return _invalid({"photo": "Choose an image to upload."})
    if len(data) > MAX_UPLOAD_BYTES:
        return _invalid({"photo": "That image is larger than 5 MB. Choose a smaller one."})
    try:
        image = Image.open(io.BytesIO(data))
        image.load()
    except (UnidentifiedImageError, OSError, ValueError):
        return _invalid({"photo": "That file is not an image we can read. Upload a JPEG or PNG."})
    image = image.convert("RGB")
    image.thumbnail((MAX_PIXELS, MAX_PIXELS))
    buffer = io.BytesIO()
    image.save(buffer, format="JPEG", quality=85)
    key = storage.new_key(PHOTO_PREFIX, "photo.jpg")
    storage.save(key, buffer.getvalue(), "image/jpeg")
    emp.photo_key = key
    emp.updated_at = datetime.now(UTC)
    db.commit()
    return {"photo_url": photo_url(emp)}
