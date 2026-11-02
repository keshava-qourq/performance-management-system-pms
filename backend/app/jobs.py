"""Background work on the project's Redis, through rq (NFR-014).

Opening a review period must return at once, so the self-review task for each
participant is created by `open_review_period` on the "reviews" queue. The job
is safe to run twice: it only inserts a self_review row for a participant that
has none.
"""

import os
import uuid

QUEUE_NAME = "reviews"


def _queue():
    """The rq queue, or None when no Redis is configured (a laptop, a test)."""
    url = os.getenv("REDIS_URL")
    if not url:
        return None
    from redis import Redis
    from rq import Queue

    return Queue(QUEUE_NAME, connection=Redis.from_url(url))


def enqueue(func, *args) -> None:
    """Hand the work to Redis; run it inline only when there is no Redis."""
    queue = _queue()
    if queue is None:
        func(*args)
        return
    queue.enqueue(func, *args)


def open_review_period(period_id: str) -> int:
    """Create the missing self-review tasks for a period. Idempotent."""
    from sqlalchemy import select

    from app.database import SessionLocal
    from app.models import ReviewPeriod, ReviewPeriodParticipant, SelfReview
    from app.routers.questionnaires import questionnaire_snapshot

    pid = uuid.UUID(str(period_id))
    created = 0
    with SessionLocal() as db:
        period = db.get(ReviewPeriod, pid)
        if period is None or period.status != "open":
            return 0
        snapshot = questionnaire_snapshot(db, period.questionnaire_version_id)
        participants = db.scalars(
            select(ReviewPeriodParticipant).where(ReviewPeriodParticipant.period_id == pid)
        ).all()
        existing = set(
            db.scalars(select(SelfReview.employee_id).where(SelfReview.period_id == pid)).all()
        )
        for p in participants:
            if p.employee_id in existing:
                continue
            db.add(
                SelfReview(
                    period_id=pid,
                    employee_id=p.employee_id,
                    questionnaire_version_id=period.questionnaire_version_id,
                    snapshot=snapshot,
                    status="not_started",
                )
            )
            existing.add(p.employee_id)
            created += 1
        db.commit()
    return created
