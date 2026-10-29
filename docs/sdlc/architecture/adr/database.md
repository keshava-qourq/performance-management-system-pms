<!-- sdlc:auto:start adr -->
# ADR-0003: Use PostgreSQL 16 for Database

Status: Accepted  
Date: 2026-10-29

## Context and Problem Statement

Which Database technology does the project use? Decided in architecture v1.

## Considered Options

- PostgreSQL 16
- MySQL

## Decision Outcome

Chosen option: PostgreSQL 16, because Approved stack. It covers relational integrity for reporting lines and goal alignment, recursive CTEs for reporting-line and cycle checks, and JSONB for questionnaire snapshots and settings. Triggers make the audit and history tables append-only. One transaction covers submit, lock and audit (NFR-009, NFR-010). Runs on RDS with KMS encryption and daily backups (GDPR Art. 32).

## Consequences

Single-AZ RDS is accepted (NFR-013). Recovery is from backup or PITR rather than failover.
<!-- sdlc:auto:end adr -->