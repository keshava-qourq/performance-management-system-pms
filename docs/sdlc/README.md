# Performance management System (PMS) — SDLC Documentation

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start overview -->
Build a Performance management System

**Documentation version:** v1
<!-- sdlc:auto:end overview -->

## Contents

<!-- sdlc:auto:start contents -->
| Document | State |
|---|---|
| [Requirements](requirements/README.md) | v1 approved |
| [Architecture](architecture/README.md) | 1 entry |
| [Development](development/README.md) | 1 entry |
| [Testing](testing/README.md) | 1 entry |
| [Deployment](deployment/README.md) | 1 entry |
| [Maintenance](maintenance/README.md) | 1 entry |
| [Data model](architecture/data-model.md) | not generated yet |
| [API (OpenAPI)](architecture/api/openapi.yaml) | not generated yet |
| [Decisions (ADRs)](architecture/adr/README.md) | 0 decisions |
| [Sprint plan](development/sprint-plan.md) | not generated yet |
| [Developer guide](development/developer-guide.md) | not generated yet |
| [API reference](development/api-reference.md) | 0 routes |
| [Test report](testing/test-report.md) | not run yet |
| [Tests](testing/test-cases.md) | 0 tests |
| [Deployment guide](deployment/deployment-guide.md) | not deployed yet |
| [Runbook](deployment/runbook.md) | not deployed yet |
| [Release notes](deployment/release-notes.md) | 0 releases |
| [Traceability matrix](traceability-matrix.md) | 35 requirements |
| [Changelog](CHANGELOG.md) | 1 version |
<!-- sdlc:auto:end contents -->

## Open gaps

<!-- sdlc:auto:start open-gaps -->
### Requirements

- EPIC-008 assumptions still say 'React/TypeScript front end, Node/TypeScript API', which conflicts with the approved FastAPI backend. Which source is authoritative is reported here, not resolved.
- Whether the React frontend uses TypeScript is not stated in the approved stack.
- Several justifications cite capabilities deferred beyond this MVP: cycle state machine, calibration grid, executive dashboards, CSV/PDF review records, and per-individual export/deletion (see EPIC-004, EPIC-007, NFR-023).
- The Redis justification mentions emails, but email is out of scope (NFR-021).
- Deadline reminders are queued per NFR-014, but no story defines reminders or how they are delivered without email.
- Every S3 use case given depends on deferred features: PDF/CSV exports (EPIC-007), employee import files (EPIC-001 defers bulk import) and per-individual export (NFR-023). The MVP's actual S3 use is not stated; profile photos (AC-032) may be one, but this is unconfirmed.
- Private manager notes (US-028) are not in the capability list but were included anyway. EPIC-006 asks for confirmation.
- Manager is described both as a derived capability and as an assignable role in US-004. The two are in conflict.
- Not specified: deleting job titles, renaming departments, and whether departments assigned only to deactivated employees can be deleted.
- AC-011 does not say whether the previous manager keeps access to shared historical records (for example, 1:1s they took part in) after reassignment.
- Manager is listed here as an assignable role, but EPIC-001 says Manager capability is derived from having direct reports. The two definitions conflict.
- Role changes take effect at next sign-in (AC-012). Whether removing privileges should also end active sessions immediately is unspecified.
- Not specified: how deactivation affects open self-review tasks, open action items, and participation in an open review period.
- Not specified whether a deactivated employee can be reactivated.
- The email removal is still awaiting confirmation.
- The invitation expiry duration is not specified.
- Default values are not specified for the attempt threshold, block duration and inactivity timeout (configurable per NFR-020).
- Not specified where recorded blocks are visible, or to whom.
- Not specified: default password rules, the reset link expiry, and the hashing algorithm.
- Not specified: profile photo storage location, accepted formats and size limits.
- 'Reporting line' (AC-035) and 'direct reports' are used interchangeably across stories. Whether managers see indirect (skip-level) reports is undefined.
- AC-041 relies on 'the same period', but goals have no period field. How the period is determined is undefined.
- AC-048 does not say whether personal goals can act as parents, or only company/department goals.
- AC-054 does not cover department-level goal creation by Managers.
- AC-055 says 'direct reports' while AC-057 says 'reporting line'. Whether indirect reports are included is ambiguous.
- Not specified: whether comments can be edited or deleted, and whether HR can see them.
- The approved stack justifications (FastAPI cycle state machine, React calibration grid) describe features this epic defers.
- AC-069 relies on 'mandatory questions', but no AC defines how a question is marked mandatory.
- AC-071 refers to HR closing a period, but no AC defines closing a period.
- NFR-014 mentions queued deadline reminders, but no AC defines reminders or how they are delivered.
- Depends on undefined mechanics: the mandatory-question flag (US-016) and period closure (US-017).
- Not specified: the flow after an HR reopen, including who edits, resubmission, and how the prior submitted version is retained.
- The in-app new-feedback indicator appears only as an assumption. No AC defines it.
- Not specified whether praise, like constructive feedback, is read-only once sent and can be withdrawn.
- Not specified whether withdrawn feedback stays visible to the recipient, HR or managers.
- The default value of the setting is not specified.
- Inclusion of private manager notes needs confirmation.
- Not specified: deleting or cancelling a 1:1, and behaviour for an employee with no manager.
- Not specified: editing or deleting action items.
- The default of the HR private-note visibility setting is not specified.
- AC-104's 'visible only to me' label may conflict with HR visibility when that setting is on.
- With executive dashboards deferred, it is unclear what the Executive role can actually see in the MVP (see US-030 AC-114).
- AC-114 promises Executives aggregate information, but aggregate dashboards are deferred (EPIC-007). No in-scope aggregate view is defined.
- The 'Node/TypeScript API' assumption conflicts with the approved FastAPI 0.115 backend (REQ-STACK).
- The EU region needs confirmation.
- The date format (for example UK or US) is not specified.
- Supported browsers and breakpoints are not specified. AC-123 does not list review, self-review or HR admin screens.
- AC-128 requires a test environment, while NFR-013 and REQ-STACK describe a single production environment. Whether a test environment exists is unclear.
- No RPO/RTO targets are stated.
- S3-stored files are not explicitly covered by the backup and restore criteria.
- The Executive aggregate view is undefined in the MVP (see US-030).
- Expiry duration is not specified.
- The region needs confirmation.
- Not specified where audit entries for goal edits and record views are surfaced, or to whom. AC-042 only shows last-changed details.
- Deadline reminders have no defining story or delivery channel, since email is out of scope.
- Default values are not specified for any of these settings.
- Awaiting confirmation.
- No manual procedure for handling export or erasure requests is documented.

### Architecture

- Architecture phase has not started: no system design, data model, API design or infrastructure design recorded.

### Development

- Development phase has not started: no plans, sprints, tickets or code changes recorded.

### Testing

- Testing phase has not started: no test plans, test cases or results recorded.

### Deployment

- No deployment recorded yet: EU region, encryption at rest and daily backup configuration are all unverified.

### Maintenance

- No post-deployment activity recorded: the product has not been deployed.
<!-- sdlc:auto:end open-gaps -->
