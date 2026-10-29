<!-- sdlc:auto:start adr -->
# ADR-0002: Use FastAPI 0.115 for Backend

Status: Accepted  
Date: 2026-10-29

## Context and Problem Statement

Which Backend technology does the project use? Decided in architecture v1.

## Considered Options

- FastAPI 0.115
- Django
- Express

## Decision Outcome

Chosen option: FastAPI 0.115, because Approved stack. Built as a modular monolith with Pydantic validation, which produces the field-level 422 messages. A shared policy dependency runs on every route for least privilege (NFR-001). The same image runs the RQ worker. Transactional submit and lock logic uses SQLAlchemy sessions.

## Consequences

A single deployable is simple at under 200 users but would need splitting only far beyond the sizing target. The async API and sync worker share models but run in separate processes.
<!-- sdlc:auto:end adr -->