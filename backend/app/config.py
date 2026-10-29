"""Process-wide configuration read from the environment.

The platform injects these at deploy time; the defaults below are only for a
bare `uvicorn app.main:app --reload` with no `.env` loaded. Every other
module reads its setting from here rather than calling `os.getenv` again, so
there is exactly one place that knows what each variable means and what it
defaults to. `DATABASE_URL` and `REDIS_URL` stay where they are already read
(app/database.py, app/services.py); this module only adds what nothing read
yet.
"""

import os

# The frontend's origin(s), comma separated. Used for CORS. In development
# that is the Vite dev server; the platform injects the deployed frontend's
# real origin in production.
ALLOWED_ORIGINS: list[str] = [
    origin.strip() for origin in os.getenv("ALLOWED_ORIGINS", "").split(",") if origin.strip()
] or ["http://localhost:5173", "http://127.0.0.1:5173"]

# The bearer every request from the generated frontend carries (see
# frontend/src/lib/api.ts). It is public -- the platform bakes it into the
# frontend build -- so it identifies the caller as "the generated app", not a
# signed-in user, and it must never be used to sign anything.
SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-key")

# Private: signs session tokens and anything else this app signs. Never
# logged, never sent to the frontend.
JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "dev-jwt-secret-key")

# A writable directory that survives redeploys -- where an upload lands when
# S3_BUCKET is unset (tests, a laptop). See app/storage.py.
MEDIA_ROOT: str = os.getenv("MEDIA_ROOT", os.path.join(os.path.dirname(__file__), "..", "media"))

# Object storage. Unset locally, so app/storage.py falls back to MEDIA_ROOT.
S3_BUCKET: str | None = os.getenv("S3_BUCKET")
AWS_REGION: str | None = os.getenv("AWS_REGION")
