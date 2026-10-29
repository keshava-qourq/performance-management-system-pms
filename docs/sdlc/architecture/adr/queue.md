<!-- sdlc:auto:start adr -->
# ADR-0005: Use Redis for Queue

Status: Accepted  
Date: 2026-10-29

## Context and Problem Statement

Which Queue technology does the project use? Decided in architecture v1.

## Considered Options

- Redis
- PostgreSQL-backed job table

## Decision Outcome

Chosen option: Redis, because Approved service. Opening a review period queues self-review task creation, so HR's request returns immediately and failed jobs retry (NFR-014). Runs as the approved redis:7-alpine container with AOF persistence.

## Consequences

Another container to operate. Job durability depends on AOF, and the worker is idempotent so re-runs are safe.
<!-- sdlc:auto:end adr -->