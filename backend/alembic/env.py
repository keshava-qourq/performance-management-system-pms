"""Alembic environment.

The database's schema changes only through a migration generated here -- see
the architecture's data-residency and audit requirements, and the note in
app/main.py. This reuses the app's own engine (app/database.py) rather than
reading `DATABASE_URL` a second time, so a migration always targets exactly
what the app itself connects to.
"""

from logging.config import fileConfig

from alembic import context

from app import models  # noqa: F401 -- imported so autogenerate sees every table
from app.database import Base, engine

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Emit SQL to stdout without a live database connection."""
    context.configure(
        url=str(engine.url),
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Connect to the database and run migrations directly."""
    with engine.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
