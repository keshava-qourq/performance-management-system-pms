"""Personal profile API (US-009): AC-031, AC-032, AC-033, NFR-019."""

import io

import pytest
from PIL import Image

from tests.conftest import H, login


def _image(size=(900, 700), fmt="PNG") -> bytes:
    buffer = io.BytesIO()
    Image.new("RGB", size, (10, 120, 200)).save(buffer, format=fmt)
    return buffer.getvalue()


@pytest.fixture
def employee(client):
    login(client)
    return client


def test_ac031_profile_returns_identity_and_hr_fields(employee):
    body = employee.get("/me/profile").json()
    assert body["full_name"] == "Emi Employee"
    assert body["work_email"] == "employee@example.com"
    for field in ("job_title", "department", "manager", "display_name", "pronouns", "photo_url"):
        assert field in body


def test_ac031_signed_out_is_401(client):
    assert client.get("/me/profile").status_code == 401


def test_ac032_patch_persists_display_name_and_pronouns(employee):
    patched = employee.patch(
        "/me/profile", json={"display_name": "Emi", "pronouns": "they/them"}, headers=H
    )
    assert patched.status_code == 200
    body = employee.get("/me/profile").json()
    assert body["display_name"] == "Emi"
    assert body["pronouns"] == "they/them"


def test_ac032_stored_values_show_in_the_directory_colleagues_see(client):
    login(client)
    client.patch("/me/profile", json={"display_name": "Emi E."}, headers=H)
    client.post("/auth/logout", headers=H)
    login(client, "hr.admin@example.com")
    rows = client.get("/employees").json()
    row = next(r for r in rows if r["work_email"] == "employee@example.com")
    assert row["display_name"] == "Emi E."


def test_ac032_photo_upload_is_stored_and_returned_as_a_short_lived_url(employee):
    response = employee.put(
        "/me/profile/photo",
        files={"photo": ("me.png", _image(), "image/png")},
        headers=H,
    )
    assert response.status_code == 200
    url = response.json()["photo_url"]
    assert url
    assert employee.get("/me/profile").json()["photo_url"]


def test_ac032_uploaded_image_is_downsized_by_pillow(employee, monkeypatch):
    from app import storage
    from app.routers.profile import MAX_PIXELS

    saved = {}
    monkeypatch.setattr(storage, "save", lambda key, data, ct: saved.update(data=data, ct=ct))
    monkeypatch.setattr(storage, "url_for", lambda key, expires_in=300: f"signed:{key}")
    response = employee.put(
        "/me/profile/photo",
        files={"photo": ("big.png", _image((2000, 1500)), "image/png")},
        headers=H,
    )
    assert response.json()["photo_url"].startswith("signed:profile-photos/")
    with Image.open(io.BytesIO(saved["data"])) as stored:
        assert max(stored.size) <= MAX_PIXELS


def test_ac032_photo_upload_requires_the_mutation_header(employee):
    response = employee.put("/me/profile/photo", files={"photo": ("me.png", _image(), "image/png")})
    assert response.status_code == 403
    assert response.content == b""


def test_ac033_hr_owned_fields_are_refused(employee):
    for field, value in (
        ("job_title_id", "x"),
        ("department_id", "x"),
        ("manager_id", "x"),
        ("role", "hr_admin"),
    ):
        response = employee.patch("/me/profile", json={field: value}, headers=H)
        assert response.status_code == 422
        assert field in response.json()["errors"]


def test_ac033_a_refused_field_changes_nothing(employee):
    before = employee.get("/me/profile").json()
    employee.patch("/me/profile", json={"role": "hr_admin", "display_name": "Nope"}, headers=H)
    after = employee.get("/me/profile").json()
    assert after["role"] == before["role"]
    assert after["display_name"] == before["display_name"]


def test_ac033_hr_maintained_fields_are_labelled_for_the_ui(employee):
    body = employee.get("/me/profile").json()
    assert body["hr_maintained"] == ["job_title", "department", "manager", "role"]


def test_nfr019_an_invalid_image_is_422_with_a_field_level_english_message(employee):
    response = employee.put(
        "/me/profile/photo",
        files={"photo": ("notes.txt", b"this is not an image", "text/plain")},
        headers=H,
    )
    assert response.status_code == 422
    assert response.json()["errors"]["photo"].endswith("Upload a JPEG or PNG.")


def test_nfr019_an_oversized_image_is_422_with_a_field_level_english_message(employee):
    from app.routers.profile import MAX_UPLOAD_BYTES

    oversized = b"\x89PNG\r\n\x1a\n" + b"0" * (MAX_UPLOAD_BYTES + 1)
    response = employee.put(
        "/me/profile/photo", files={"photo": ("huge.png", oversized, "image/png")}, headers=H
    )
    assert response.status_code == 422
    assert "5 MB" in response.json()["errors"]["photo"]


def test_nfr019_a_missing_file_is_422(employee):
    response = employee.put("/me/profile/photo", headers=H)
    assert response.status_code == 422
    assert response.json()["errors"]
