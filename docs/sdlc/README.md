# Performance management System (PMS) — SDLC Documentation

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start overview -->
Build a Performance management System

**Documentation version:** v5
<!-- sdlc:auto:end overview -->

## Contents

<!-- sdlc:auto:start contents -->
| Document | State |
|---|---|
| [Requirements](requirements/README.md) | v1 approved |
| [Architecture](architecture/README.md) | 47 entries |
| [Development](development/README.md) | 24 entries |
| [Testing](testing/README.md) | 1 entry |
| [Deployment](deployment/README.md) | 3 entries |
| [Maintenance](maintenance/README.md) | 1 entry |
| [Data model](architecture/data-model.md) | generated |
| [API (OpenAPI)](architecture/api/openapi.yaml) | generated |
| [Decisions (ADRs)](architecture/adr/README.md) | 6 decisions |
| [Sprint plan](development/sprint-plan.md) | 8 sprints |
| [Developer guide](development/developer-guide.md) | generated |
| [API reference](development/api-reference.md) | 9 routes |
| [Test report](testing/test-report.md) | not run yet |
| [Tests](testing/test-cases.md) | 0 tests |
| [Deployment guide](deployment/deployment-guide.md) | deployed |
| [Runbook](deployment/runbook.md) | deployed |
| [Release notes](deployment/release-notes.md) | 2 releases |
| [Traceability matrix](traceability-matrix.md) | 35 requirements |
| [Changelog](CHANGELOG.md) | 5 versions |
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

- No approver, approval date or approval record is given for 'Status: approved'.
- AWS region is stated as 'eu-central-1 by default, pending confirmation'. Who confirms it, and by when, is not recorded.
- The input cites NFR-001, NFR-007, NFR-009, NFR-010, NFR-014 and NFR-017, but none of these are among the known requirement keys (US-001..US-035). The NFR source document is not available for traceability.
- Only US-009 (profile photos) is explicitly traced to the architecture. Mapping of the other user stories (US-001..US-035) to components and endpoints is not provided.
- Wording ambiguity: the summary says employees 'sign in through HR-issued, time-limited links', while the Auth component and endpoints describe email-and-password sign-in. The links appear to be for invitation and reset only. Confirm the intended reading.
- No staging or pre-production environment is described. Only local (Docker Compose) and AWS production nodes are listed.
- No observability or alerting design is given beyond a mention of CloudTrail and CloudWatch in the Cloud technology decision.
- No industry domain skill was named, so regulation-by-regulation compliance tracing was not applied. GDPR references in the input are carried through as stated.
- The input does not say which items are deferred (planned later) and which are permanently out of scope.
- How HR delivers invitation and reset links to employees without email is not described.
- Accessibility targets (e.g. WCAG level) are not stated.
- Default values for the lockout threshold, lockout duration, inactivity timeout, token lifetime and password rules are not given.
- MFA is not mentioned.
- The cookie SameSite and CSRF protection approach is not specified.
- The rule for when to return 403 versus 404 is not specified.
- How long deactivated employees' data is retained is not specified. See SEC-GDPR.
- The target weighting total that triggers the warning (e.g. 100%) is not stated.
- Whether a closed period can be reopened is not stated.
- The possible values and default of the manager feedback visibility setting are not given.
- The carry-over rule for action items (e.g. which items carry and to which 1:1) is not defined.
- There is no endpoint for editing or deleting action items.
- The items that populate the Needs-your-attention list are not enumerated.
- No audit retention period is specified.
- Who may read GET /audit-events is not stated.
- Whether the audit list should also cover employee create, deactivate, settings changes and invitation issue is not stated.
- Retry count, backoff and dead-letter handling are not specified.
- How HR is told about a permanently failed job is not specified.
- The queue is called durable, but in production Redis runs as an ECS Fargate task. No persistent volume (e.g. EFS) is specified for the AOF file, so durability across task restarts is unconfirmed.
- No backup retention period, RPO or RTO is stated.
- The deployment is single-AZ, so there is no stated availability target or failover approach.
- Allowed photo file types and size limits are not given.
- Whether photos are deleted when an employee is deactivated is not given.
- The input does not say whether a password reset also activates the account or only sets the password.
- The checks performed when the period is validated before opening are not enumerated.
- It is not stated whether the status flip and the enqueue are atomic. If the enqueue fails after the flip, recovery is undefined.
- The difference between employee.status and employee.account_status, and their allowed values, is not defined.
- It is not defined whether goal.period references review_period or is a free-form value.
- No field records action-item carry-over, so the carry-over mechanism is unclear.
- The full list of setting keys is not given. Known keys implied by the input are: lockout threshold, inactivity timeout, password rules, manager feedback visibility and HR private-note visibility.
- There is no reactivation endpoint for deactivated employees.
- There is no delete endpoint for job titles.
- It is not stated whether these are intentionally omitted.
- Who may comment on a goal (manager only, or others too) is not restated at endpoint level.
- No list or read endpoints are given for rating scales or review periods (e.g. GET /rating-scales, GET /review-periods).
- There is no endpoint for an employee to find their own self-review id or task list, unless GET /me/dashboard provides it.
- Participant removal is described as available while a period is draft, but DELETE is guarded only by 'already submitted'. This implies removal may also be possible while the period is open. Clarify.
- There is no explicit endpoint for marking feedback read (feedback.read_at). The trigger for setting it is unstated.
- There is no endpoint to delete a 1:1.
- Which participants may reorder the agenda is not stated.
- Who may call GET /settings and GET /audit-events is not specified.
- Audit-event filtering and pagination are not specified.
- There is no local substitute for S3 photo storage (e.g. MinIO or LocalStack).
- Region eu-central-1 is pending confirmation.
- A single-AZ RDS deployment has no failover. No availability target or rationale is recorded.
- Redis on Fargate has no persistent volume specified for AOF, so its durability is unconfirmed.
- CloudFront has edge locations outside the EU. The input does not address whether this affects the data-residency claim. Static assets only are implied.
- No CI/CD pipeline, infrastructure-as-code tool, secrets management approach or task scaling settings are described.
- CloudTrail and CloudWatch are mentioned in TECH-CLOUD but are not listed as deployment nodes.
- Who approved the stack, and when, is not recorded.
- This decision says triggers protect both the audit and history tables, but the Audit component describes the trigger only for audit_event. The trigger on self_review_history should be confirmed.
- CloudTrail and CloudWatch configuration (log retention, alarms) is not specified.
- The reason a managed service (e.g. ElastiCache) was not used is not recorded, nor is the persistent storage for the AOF file on Fargate.
- The design does not address data retention or erasure (e.g. GDPR Art. 17 right to erasure, storage limitation). Employees are never hard-deleted and audit rows are immutable.
- The design does not address data subject access or portability (GDPR Art. 15/20). Exports are deferred.
- No DPIA, lawful-basis or processor (AWS DPA) documentation is referenced.
- The EU region is not yet confirmed.

### Development

- No plan approval date or approver recorded.
- Explicit story-to-sprint assignment is not provided; sprint mappings in the sprint entries are inferred from goal wording.
- Two of the four goal components (EU environment/encryption/backups via US-035; departments/job titles via US-002) were skipped, so the sprint goal is not met per the ticket record.
- No sprint dates recorded.
- No ticket records exist for any Sprint 2 story; execution status unknown.
- No ticket records exist for any Sprint 3 story or task; execution status unknown.
- No ticket records exist for any Sprint 4 story; execution status unknown.
- No ticket records exist for any Sprint 5 story or task; execution status unknown.
- No ticket records exist for any Sprint 6 story or task; execution status unknown.
- No ticket records exist for any Sprint 7 story; execution status unknown.
- No ticket records exist for Sprint 8 stories; execution status unknown.
- US-032 (English-only interface, 1 pt) is not referenced by any sprint goal, yet it was delivered; its planned sprint is unclear.
- Epic is only partially delivered (1 of 5 stories).
- Only US-007 delivered; the invitation flow (US-006) and password rules (US-008) are not ticketed, so it is unclear how accounts are created or what password policy the delivered sign-in applies.
- No stories in this epic have ticket records.
- No stories or tasks in this epic have ticket records.
- The data-protection story (US-035) was skipped; see DEV-US-035.
- Discrepancy: run status is 'completed', but only 5 of 35 stories have ticket records and only 3 were delivered. It is unclear whether the run covered only part of the plan or whether ticket records are missing.
- No run start/end dates recorded.
- No reasons recorded for skipped tickets.
- Departments/job titles (US-002) were skipped; it is unknown how employee records reference a department or job title.
- HR-only access depends on role assignment (US-004) and authorisation (US-010), neither of which is ticketed; how access to this capability is restricted is unconfirmed.
- No code review, approval or test evidence recorded.
- No reason given for skipping.
- No indication whether it is deferred, descoped or blocked.
- This is a Sprint 1 goal item that US-001 likely depends on.
- Account invitation (US-006) and password rules/reset (US-008) are not ticketed; account provisioning and password policy for this sign-in are unconfirmed.
- Not referenced in any sprint goal; planned sprint unknown.
- Delivered stories (US-001 employee records, US-007 sign-in) handle personal data without recorded encryption, backup or EU-hosting work. A human should review this data-protection risk.
- No indication whether it is deferred or descoped.
- Execution status unknown for all items listed; there is no evidence of delivery, skipping or deferral.
- Security-critical US-010 (least-privilege authorisation) is not ticketed.
- No user guide can be documented for most of the application, because only employee records, sign-in and the English-only interface are recorded as built, and no screen definitions were provided.

### Testing

- Testing phase has not started: no test plans, test cases or results recorded.

### Deployment

- No deployment date or timestamp recorded.
- No deployer or approver recorded. Status is left as 'draft' because no release approval or sign-off was provided.
- Target environment not named. 'live' does not confirm whether this is production, staging or a demo environment.
- No release notes or changelog. It is unknown which requirements (US-001 to US-035) are included, so none are linked in related_ids.
- No link to testing-phase results or a QA sign-off for this version.
- No previous version recorded, so it cannot be determined whether an earlier release was superseded.
- No rollback plan or procedure documented.
- No post-deployment smoke test or health-check results provided.
- No monitoring, alerting, logging or incident-response arrangements documented.
- No database or schema migration information for this release.
- Unconfirmed: whether 0b3e2f34c2bb maps to a specific source-control commit or build artifact.
- No custom or branded domain recorded. Users access the app through a platform-generated hostname.
- Login or authentication entry point and user access provisioning not documented.
- Supported browsers and devices not documented.
- Unconfirmed: whether this frontend is configured to call the backend URL in DEP-0b3e2f34c2bb-BE (API base URL and environment configuration not provided).
- The backend uses an IP-based sslip.io hostname instead of a dedicated domain. If the host IP changes, the URL changes too. Confirm whether this is acceptable for a live release.
- TLS certificate source and renewal arrangement not documented.
- Unconfirmed: whether the host is shared with other applications, and what isolation is in place.
- No API documentation, health-check endpoint or version endpoint provided.
- CORS configuration allowing the frontend origin not documented.
- Backend runtime, data store, backups and scaling configuration not documented.
- Secrets and credentials management for this deployment not documented.

### Maintenance

- No post-deployment activity recorded: the product has not been deployed.
<!-- sdlc:auto:end open-gaps -->
