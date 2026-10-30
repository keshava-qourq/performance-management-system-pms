# Performance management System (PMS) — SDLC Documentation

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start overview -->
Build a Performance management System

**Documentation version:** v8
<!-- sdlc:auto:end overview -->

## Contents

<!-- sdlc:auto:start contents -->
| Document | State |
|---|---|
| [Requirements](requirements/README.md) | v1 approved |
| [Architecture](architecture/README.md) | 47 entries |
| [Development](development/README.md) | 22 entries |
| [Testing](testing/README.md) | 2 entries |
| [Deployment](deployment/README.md) | 3 entries |
| [Maintenance](maintenance/README.md) | 1 entry |
| [Data model](architecture/data-model.md) | generated |
| [API (OpenAPI)](architecture/api/openapi.yaml) | generated |
| [Decisions (ADRs)](architecture/adr/README.md) | 6 decisions |
| [Sprint plan](development/sprint-plan.md) | 8 sprints |
| [Developer guide](development/developer-guide.md) | generated |
| [API reference](development/api-reference.md) | 27 routes |
| [Test report](testing/test-report.md) | not run yet |
| [Tests](testing/test-cases.md) | 0 tests |
| [Deployment guide](deployment/deployment-guide.md) | deployed |
| [Runbook](deployment/runbook.md) | deployed |
| [Release notes](deployment/release-notes.md) | 4 releases |
| [Traceability matrix](traceability-matrix.md) | 35 requirements |
| [Changelog](CHANGELOG.md) | 8 versions |
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

- No approval date or approver is recorded for the plan.
- The plan gives no explicit story-to-sprint assignment. Sprint contents can only be inferred from goal wording.
- Sub-tasks have no point estimates.
- No ticket outcomes are recorded for any story matching this sprint's goal.
- Sprint dates are not provided.
- US-010 (authorisation) was skipped, so the sprint goal of server-side role and reporting-line authorisation is not met according to the recorded outcomes.
- US-032 (English-only interface) does not clearly appear in any sprint goal.
- No ticket, commit or status is recorded for US-001 to US-005.
- Delivered features (profile, goals) presumably depend on employee records and reporting lines. Whether those prerequisites exist in code is not documented.
- No outcome is recorded for US-006, US-007 or US-008. It is unclear how users sign in to reach the delivered profile and goals features.
- US-010 was skipped and no reason is given.
- No status is recorded for US-010 sub-tasks T1 to T3.
- No ticket, commit or status is recorded for US-013, US-014 or US-015.
- No ticket, commit or status is recorded for US-016 to US-020 or their sub-tasks.
- No ticket, commit or status is recorded for US-021 to US-024.
- No ticket, commit or status is recorded for US-025 to US-028.
- No ticket, commit or status is recorded for US-029 to US-031.
- No ticket, commit or status is recorded for US-032 to US-035.
- No evidence is recorded that the Sprint 1 EU environment, encryption and backups (US-035) were provisioned.
- Discrepancy: the run status says 'completed', but 31 of 35 planned stories have no ticket record. It is unclear whether the run covered only Sprint 3 scope or whether outcomes are missing.
- No run dates, reviewer or code-review approval are recorded.
- No test or CI results are attached to the delivered commit.
- No implementation details, acceptance verification or review approval are recorded.
- It is delivered while US-010 (server-side authorisation) was skipped. Access controls on profile data are unverified.
- The sign-in story it depends on (US-007) has no recorded outcome.
- No reason for skipping is recorded.
- No status is recorded for sub-tasks T1 to T3.
- No re-plan or target sprint is recorded.
- Delivered features (US-009, US-011, US-012) and future manager or HR features depend on this authorisation layer.
- Authorisation enforcement (US-010) was skipped, so goal ownership checks are unverified.
- Authorisation enforcement (US-010) was skipped, so edit permissions on goals are unverified.

### Testing

- The input does not say what the 4 checks are (names, type, scope).
- No run date/time, executor, commit/build reference, or environment is recorded.
- The run is not linked to a ticket or to any requirement, so it cannot be traced to US-001 to US-035.
- It is unclear whether these checks are functional tests of PMS features or only build/lint/static checks.
- No approval or sign-off of this result is recorded, so status is left as draft.
- No test plan or test strategy provided for the testing phase.
- No test cases or acceptance tests mapped to any of US-001 to US-035.
- No defect/bug records provided, so open issues cannot be determined.
- No non-functional testing (performance, security, accessibility) recorded.
- No UAT or stakeholder sign-off recorded for the testing phase.
- There is no basis to say whether the 4 passing checks cover any user story. Requirement coverage should be treated as unknown, not as passed.

### Deployment

- No deployment date or timestamp recorded.
- No deployer or approver recorded. A formal release approval cannot be confirmed, so this entry stays 'draft'.
- The input does not say whether this is a production, staging or demo environment.
- Release scope is unknown. The input does not say which of US-001 through US-035 are included, so requirement traceability for this deployment cannot be established.
- The version identifier looks like a commit hash, but no build artifact, branch, or development/test phase output is referenced to confirm what code it contains.
- No pre- or post-deployment verification (smoke tests, health checks, test sign-off) recorded.
- No rollback plan or previous version recorded.
- No release notes, known issues, or post-deployment monitoring/alerting details provided.
- No custom domain recorded. The app is reachable only on the default Amplify-generated hostname.
- The input does not confirm that the frontend is configured to call the recorded backend URL.
- No frontend build or branch information recorded.
- The backend is addressed by a raw-IP-derived sslip.io hostname rather than a stable domain. The input does not say whether this is intended for production use. Needs human confirmation.
- No health-check, monitoring or alerting details recorded.
- No database, data migration or backup details recorded for this deployment.
- No security or access-control configuration recorded for the backend endpoint.

### Maintenance

- No post-deployment activity recorded: the product has not been deployed.
<!-- sdlc:auto:end open-gaps -->
