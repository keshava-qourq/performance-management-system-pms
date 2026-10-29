<!-- sdlc:auto:start adr -->
# ADR-0001: Use React 19 for Frontend

Status: Accepted  
Date: 2026-10-29

## Context and Problem Statement

Which Frontend technology does the project use? Decided in architecture v1.

## Considered Options

- React 19
- Vue
- Angular

## Decision Outcome

Chosen option: React 19, because Approved stack. It delivers one responsive, English-only web app covering employee, manager, HR and executive screens, with single-column reflow on phones (NFR-017). Served as a static build from S3 and CloudFront in the EU region.

## Consequences

The SPA means authorisation must live entirely on the server, which access_policy guarantees. No native app is built.
<!-- sdlc:auto:end adr -->