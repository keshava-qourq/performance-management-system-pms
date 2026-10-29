"""Shared FastAPI dependency: the platform's bearer secret.

Every request the generated frontend sends carries `Authorization: Bearer
<SECRET_KEY>` (see frontend/src/lib/api.ts and ENVIRONMENT.md) -- a public
value that marks the caller as the generated app, not a signed-in user. It is
separate from the per-user session cookie `auth` issues, and it is never used
to sign anything (see app/config.py). Add `require_api_secret` as a dependency
on a router once one exists; nothing calls it yet, and `/health` deliberately
stays open for the platform's unauthenticated liveness probe.
"""

from fastapi import Header, HTTPException, status

from app.config import SECRET_KEY


def require_api_secret(authorization: str | None = Header(default=None)) -> None:
    """Raise 401 unless the request carries the platform's bearer secret."""
    if authorization != f"Bearer {SECRET_KEY}":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
