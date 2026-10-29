import subprocess
import sys

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import text

from app.database import SessionLocal
from app.main import app
from app.seed import DEV_PASSWORD, seed

H = {"X-Requested-With": "test"}


@pytest.fixture(scope="session", autouse=True)
def _db():
    subprocess.run([sys.executable, "-m", "alembic", "upgrade", "head"], check=True)
    seed()


@pytest.fixture(autouse=True)
def _clean():
    yield
    with SessionLocal() as db:
        for sql in (
            "DELETE FROM failed_login_attempt",
            "DELETE FROM session",
            "DELETE FROM audit_event",
            "UPDATE employee SET deactivated=false, status='active'",
            "UPDATE system_setting SET value='5' WHERE key='login_max_failed_attempts'",
            "UPDATE system_setting SET value='30' WHERE key='session_idle_minutes'",
        ):
            db.execute(text(sql))
        db.commit()


@pytest.fixture
def client():
    return TestClient(app, base_url="https://testserver")


def login(client, email="employee@example.com", password=DEV_PASSWORD):
    return client.post("/auth/login", json={"email": email, "password": password}, headers=H)
