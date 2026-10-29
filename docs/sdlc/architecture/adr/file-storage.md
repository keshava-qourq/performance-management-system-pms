<!-- sdlc:auto:start adr -->
# ADR-0006: Use Amazon S3 for File storage

Status: Accepted  
Date: 2026-10-29

## Context and Problem Statement

Which File storage technology does the project use? Decided in architecture v1.

## Considered Options

- Amazon S3
- bytea in PostgreSQL

## Decision Outcome

Chosen option: Amazon S3, because Approved service. Holds profile photos (US-009) outside the database with SSE-KMS, private access and presigned URLs, in the EU region. It is ready for the deferred PDF, CSV and export work.

## Consequences

In this MVP only profile photos use it, because imports and exports are deferred.
<!-- sdlc:auto:end adr -->