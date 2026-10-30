"""Application entrypoint.

Generated from the approved architecture: one router per component that owns
endpoints, one route per endpoint the API spec declares. Every generated route
is a stub that returns a typed placeholder, so the service starts, serves its
OpenAPI document and passes its tests before a single handler is implemented.
"""

from fastapi import Depends, FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app import auth
from app.config import ALLOWED_ORIGINS
from app.routers import auth as auth_router
from app.routers import employees as employees_router
from app.routers import goals as goals_router
from app.services import configured_services

app = FastAPI(
    title="Performance management System (PMS)",
    description="Build a Performance management System",
    version="0.1.0",
    dependencies=[Depends(auth.require_custom_header)],
)
app.add_exception_handler(auth.PolicyRefusal, auth.refusal_response)
app.add_exception_handler(auth.Unauthenticated, auth.unauthenticated_response)
app.include_router(auth_router.router)
app.include_router(employees_router.router)
app.include_router(goals_router.router)


@app.exception_handler(RequestValidationError)
async def validation_errors(_request: Request, exc: RequestValidationError) -> JSONResponse:
    """422 with one English message per field."""
    errors: dict[str, str] = {}
    for err in exc.errors():
        field = ".".join(str(p) for p in err["loc"][1:]) or "body"
        if err["type"] == "missing":
            msg = "This field is required."
        elif field == "email":
            msg = "Enter a valid email address."
        else:
            msg = "Enter a valid value."
        errors.setdefault(field, msg)
    return JSONResponse(status_code=422, content={"errors": errors})


# The SPA runs on a different origin than the API, so the browser refuses its calls
# unless that origin is allowed here. In development that is the Vite dev server; when
# deployed, the platform injects the frontend's real URL as ALLOWED_ORIGINS (comma
# separated). Point ALLOWED_ORIGINS at the real thing and nothing else has to change.
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# The schema is managed by Alembic (see backend/alembic/), not created here at
# startup: `alembic upgrade head` is the only thing allowed to change it, per
# the architecture's data-residency, encryption and audit requirements.


@app.get("/health")
async def health() -> dict[str, object]:
    """Liveness probe, and the only route here that is not a stub."""
    return {"status": "ok", "services": configured_services()}
