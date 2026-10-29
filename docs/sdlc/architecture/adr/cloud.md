<!-- sdlc:auto:start adr -->
# ADR-0004: Use AWS for Cloud

Status: Accepted  
Date: 2026-10-29

## Context and Problem Statement

Which Cloud technology does the project use? Decided in architecture v1.

## Considered Options

- AWS
- Azure
- GCP

## Decision Outcome

Chosen option: AWS, because Approved stack. It provides an EU region for data residency (GDPR), RDS automated backups with PITR, KMS encryption, ECS Fargate for small always-on tasks, ACM for TLS, and CloudTrail and CloudWatch for access and backup logging.

## Consequences

Some fixed monthly cost for the ALB and RDS even at low usage. The region choice is still pending confirmation.
<!-- sdlc:auto:end adr -->