# Product Requirements

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start narrative -->
## Summary

### REQ-STACK · approved · source: requirements:technology_stack

The product owner approved the technology stack and the agent must design against exactly this stack. The backend was changed from an assumed Node/TypeScript API to FastAPI, because the platform cannot build Node/TypeScript.

- Delivery scope: lightweight. Requirements version: 1.
- Backend: FastAPI 0.115 (Python).
  - Replaces the earlier Node/TypeScript assumption, which the platform cannot build.
  - Stated fit: cycle state machine, reporting-line permission rules, append-only audit trail, server-generated CSV/PDF review records usable as employment evidence.
- Cloud: AWS.
  - One production environment in an EU region (Frankfurt, Ireland or Paris).
  - Managed PostgreSQL with automated backups and point-in-time restore.
  - Encrypted storage and access logging.
  - Modest cost at under 200 employees; still works if the company doubles.
- Database: PostgreSQL 16.
  - Relational model: reporting lines, goal alignment, reviews in cycles, sign-off locks.
  - Sign-off, lock and audit entry happen atomically.
  - Supports reporting, encryption at rest, and targeted export or deletion of one person's data.
- Frontend: React 19.
  - One responsive web app serving four screen families: employee goals and reviews, manager team view, HR cycle configuration and calibration grid, read-only executive dashboards.
  - The same code resizes down to phones.

**Related:** EPIC-008, US-035, NFR-002, NFR-006, NFR-012

- ⚠ EPIC-008 assumptions still say 'React/TypeScript front end, Node/TypeScript API', which conflicts with the approved FastAPI backend. Which source is authoritative is reported here, not resolved.
- ⚠ Whether the React frontend uses TypeScript is not stated in the approved stack.
- ⚠ Several justifications cite capabilities deferred beyond this MVP: cycle state machine, calibration grid, executive dashboards, CSV/PDF review records, and per-individual export/deletion (see EPIC-004, EPIC-007, NFR-023).

### REQ-SERVICES · approved · source: requirements:services

The product owner approved two runtime services: Redis as a background queue and Amazon S3 for file storage. The app needs five keys: AWS_ACCESS_KEY_ID, AWS_REGION, AWS_SECRET_ACCESS_KEY, REDIS_URL and S3_BUCKET.

- Queue: Redis (container redis:7-alpine).
  - Stated purpose: create hundreds of review tasks and emails in the background when a cycle opens.
  - Fire deadline reminders days later.
  - Run slow jobs (PDF review records, CSV exports) without blocking users.
- File storage: Amazon S3 (SaaS).
  - Env vars: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, S3_BUCKET.
  - Stated purpose: durable, encrypted storage for generated PDF review records, CSV exports, uploaded employee import files and per-individual data exports.
- API keys required: AWS_ACCESS_KEY_ID, AWS_REGION, AWS_SECRET_ACCESS_KEY, REDIS_URL, S3_BUCKET.

**Related:** NFR-014, US-017, US-009

- ⚠ The Redis justification mentions emails, but email is out of scope (NFR-021).
- ⚠ Deadline reminders are queued per NFR-014, but no story defines reminders or how they are delivered without email.
- ⚠ Every S3 use case given depends on deferred features: PDF/CSV exports (EPIC-007), employee import files (EPIC-001 defers bulk import) and per-individual export (NFR-023). The MVP's actual S3 use is not stated; profile photos (AC-032) may be one, but this is unconfirmed.

### REQ-SCOPE · draft · source: requirements:scope

Defines the capabilities in scope for the Lightweight MVP and the items explicitly out of scope. Email was removed from the stack.

In scope:
- HR-kept employee, job title, department and reporting-line records.
- Employee sign-in and personal profile.
- Goals with target, due date and weighting.
- Manual percentage progress and status updates, typed in by the goal owner (never calculated).
- Goal alignment to a parent company or department goal.
- Self-review against a competency questionnaire.
- Praise and written feedback between colleagues.
- 1:1 records with shared agenda, talking points and action items.
- My-performance dashboard and a browsable review record for a single employee.
- HR-issued account invitations.
- English-only interface.
- No payment, billing or subscription functions (internal tool).

Out of scope:
- Payroll processing and salary/bonus payments.
- Native iOS/Android app.
- Calendar integration and video meetings for 1:1s.
- Recruitment, onboarding, leave/absence, time tracking, learning management.
- Email (the suggested SendGrid was removed).

**Related:** US-032, US-033, NFR-011, NFR-018, NFR-021

- ⚠ Private manager notes (US-028) are not in the capability list but were included anyway. EPIC-006 asks for confirmation.

### EPIC-001 · draft · source: requirements:EPIC-001

Employee, Org Structure and Reporting Lines. The system is the source of truth for people data, maintained in-product by HR Admins. There is no HRIS or directory sync.

Assumptions:
- Four roles: Employee, Manager, HR Admin, Executive (read-only).
- Managers see only their own reporting line. Employees see only their own data plus feedback addressed to them.
- CSV bulk import/export is NOT in the MVP. Records are maintained one at a time; bulk import is deferred.
- 'Manager' is a derived capability: an employee becomes a Manager when at least one other employee reports to them.
- Employees are deactivated, never hard-deleted, so history is preserved as employment evidence.
- Per-individual export/erasure is deferred to a later version.

**Related:** US-001, US-002, US-003, US-004, US-005

- ⚠ Manager is described both as a derived capability and as an assignable role in US-004. The two are in conflict.

### US-001 · draft · source: requirements:US-001

[critical] HR Admin creates and edits employee records (name, work email, job title, department) so the system holds an authoritative list of everyone in the company.

- AC-001: An HR Admin creates an employee with full name, unique work email, job title and department. The record appears in the directory with those details.
- AC-002: A missing full name or work email, or a duplicate work email, blocks the save. A field-level message explains the problem.
- AC-003: Changes to job title or department show immediately on the record and in the directory.
- AC-004: Employees, Managers and Executives are refused access to the create/edit screen.

**Related:** EPIC-001, NFR-001, NFR-019

### US-002 · draft · source: requirements:US-002

[high] HR Admin maintains the department and job title lists, giving a consistent vocabulary for employee records and goal alignment.

- AC-005: Adding a department with a unique name makes it selectable on employee records.
- AC-006: Deleting a department assigned to at least one active employee is blocked. HR is shown the number of assigned employees.
- AC-007: Renaming an in-use job title updates every employee record that references it.

**Related:** EPIC-001, US-001, US-013

- ⚠ Not specified: deleting job titles, renaming departments, and whether departments assigned only to deactivated employees can be deleted.

### US-003 · draft · source: requirements:US-003

[critical] HR Admin assigns each employee a manager and views the resulting reporting line. This drives manager visibility rules.

- AC-008: Setting B's manager to A puts B in A's direct reports. A gains Manager capabilities.
- AC-009: Setting someone as their own manager, or creating a circular line, is rejected with an explanation.
- AC-010: An employee with no manager shows an empty manager field and is flagged in the directory as missing a reporting line.
- AC-011: Reassigning a departing or changing manager's reports gives the new manager access. The previous manager loses access to those employees' data.

**Related:** EPIC-001, US-004, US-005, NFR-001, NFR-019

- ⚠ AC-011 does not say whether the previous manager keeps access to shared historical records (for example, 1:1s they took part in) after reassignment.

### US-004 · draft · source: requirements:US-004

[critical] HR Admin assigns one of four roles (Employee, Manager, HR Admin, Executive read-only) for least-privilege access.

- AC-012: A role set to HR Admin takes effect at the person's next sign-in, giving access to HR functions such as the directory.
- AC-013: Executives have read-only access. They cannot create, edit or delete goals, reviews, feedback or 1:1s.
- AC-014: The last remaining HR Admin cannot change their own role away from HR Admin.

**Related:** EPIC-001, US-010, NFR-001

- ⚠ Manager is listed here as an assignable role, but EPIC-001 says Manager capability is derived from having direct reports. The two definitions conflict.
- ⚠ Role changes take effect at next sign-in (AC-012). Whether removing privileges should also end active sessions immediately is unspecified.

### US-005 · draft · source: requirements:US-005

[high] HR Admin deactivates a leaver instead of deleting them. Access ends at once and performance history is preserved.

- AC-015: Deactivation with a leaving date blocks sign-in. The person is excluded from pickers for new goals, feedback and 1:1s.
- AC-016: All historical goals, feedback and reviews stay visible and unchanged to HR Admins.
- AC-017: If the leaver has direct reports, HR must reassign them before deactivation completes.

**Related:** EPIC-001, US-003, US-007, NFR-003, NFR-010

- ⚠ Not specified: how deactivation affects open self-review tasks, open action items, and participation in an open review period.
- ⚠ Not specified whether a deactivated employee can be reactivated.

### EPIC-002 · draft · source: requirements:EPIC-002

Account Access, Sign-In and Personal Profile. HR invites employees, who sign in with email and password. Role-based least privilege applies everywhere.

Assumptions:
- Email sending was removed. Invitations and password resets are time-limited secure links that HR copies and hands over out of band. This differs from the original email assumption and should be confirmed.
- Authentication is email plus password with enforced rules. Optional MFA and SSO/SAML are not in the MVP.
- Performance data is sensitive personal data: least privilege, encryption in transit and at rest.

**Related:** US-006, US-007, US-008, US-009, US-010

- ⚠ The email removal is still awaiting confirmation.

### US-006 · draft · source: requirements:US-006

[critical] HR Admin issues an invitation link from an employee record so only HR-approved people can create accounts.

- AC-018: 'Invite' on an active record with no account generates a unique, time-limited link to copy. Account status becomes 'Invited'.
- AC-019: Opening a valid link and setting a compliant password activates the account and signs the person in. Status becomes 'Active'.
- AC-020: Expired or used links create no account and tell the person to contact HR.
- AC-021: Revoking or reissuing an invitation kills the previous link immediately. Only the newest link works.

**Related:** EPIC-002, US-001, NFR-005, NFR-021

- ⚠ The invitation expiry duration is not specified.

### US-007 · draft · source: requirements:US-007

[critical] Employee signs in with work email and password and signs out, keeping their performance data private.

- AC-022: Correct credentials sign the person in and open the performance dashboard.
- AC-023: A wrong password gives a generic message that does not reveal whether the email exists.
- AC-024: Once the configured failed-attempt threshold is exceeded, the account is temporarily blocked and the block is recorded.
- AC-025: Sign out or the inactivity timeout ends the session. Further requests return to the sign-in screen.
- AC-026: Deactivated accounts are refused sign-in.

**Related:** EPIC-002, US-005, US-029, NFR-003, NFR-020, NFR-022

- ⚠ Default values are not specified for the attempt threshold, block duration and inactivity timeout (configurable per NFR-020).
- ⚠ Not specified where recorded blocks are visible, or to whom.

### US-008 · draft · source: requirements:US-008

[high] Enforced password rules, self-service password change, and an HR-issued one-time reset link.

- AC-027: Passwords that fail the configured length/complexity rules are rejected, and the unmet rules are listed.
- AC-028: Changing a password requires the current one. Afterwards the new password works and the old one does not.
- AC-029: With no email available, HR issues a time-limited reset link from the employee record. It works once.
- AC-030: Only a salted one-way hash is stored. No password is recoverable in plain text.

**Related:** EPIC-002, US-006, NFR-004, NFR-005, NFR-020, NFR-021

- ⚠ Not specified: default password rules, the reset link expiry, and the hashing algorithm.

### US-009 · draft · source: requirements:US-009

[medium] Employee views their profile and edits self-owned details. HR-owned fields are read-only.

- AC-031: 'My profile' shows name, work email, job title, department and manager.
- AC-032: Self-owned fields (display name, pronouns, profile photo) save and show to colleagues wherever the profile appears.
- AC-033: For non-HR users, job title, department, manager and role are read-only and labelled as maintained by HR.

**Related:** EPIC-002, US-001

- ⚠ Not specified: profile photo storage location, accepted formats and size limits.

### US-010 · draft · source: requirements:US-010

[critical] Every screen and API call enforces role and reporting-line visibility rules.

- AC-034: An Employee requesting another employee's goals, self-review or 1:1 by URL or API gets an authorisation error and no data.
- AC-035: A Manager can view people inside their reporting line and is refused for people outside it.
- AC-036: An HR Admin can view any employee's goals, reviews, feedback and 1:1s, subject to the private-note rules.
- AC-037: Data is encrypted in transit (TLS) and at rest (database and backups).

**Related:** EPIC-002, US-028, NFR-001, NFR-002

- ⚠ 'Reporting line' (AC-035) and 'direct reports' are used interchangeably across stories. Whether managers see indirect (skip-level) reports is undefined.

### EPIC-003 · draft · source: requirements:EPIC-003

Goals and OKRs. Goals have a measurable target, due date and weighting, align to parent goals, and have progress updated manually.

Assumptions:
- Progress is a percentage typed in by the owner. It is never calculated.
- Goal fields: title, description, measurable target, due date, weighting, percentage progress, status.
- Shared/multi-owner goals are not in the MVP. Each goal has exactly one owner.
- Company and department goals are owned by HR.

**Related:** US-011, US-012, US-013, US-014, US-015

### US-011 · draft · source: requirements:US-011

[critical] Employee creates a personal goal with title, description, measurable target, due date and weighting.

- AC-038: A goal saves against the employee as owner at 0% progress and appears in 'My goals'.
- AC-039: A missing title, measurable target or due date blocks the save, and the missing fields are highlighted.
- AC-040: A weighting outside 0–100, or non-numeric, is rejected with a validation message.
- AC-041: Weightings over 100% for the same period show the total with a warning. Saving is not blocked.
- AC-042: The owner edits title, description, target, due date or weighting. The record shows who last changed it and when.

**Related:** EPIC-003, NFR-009, NFR-019

- ⚠ AC-041 relies on 'the same period', but goals have no period field. How the period is determined is undefined.

### US-012 · draft · source: requirements:US-012

[critical] Goal owner types in percentage progress and sets a status. Overdue goals are flagged.

- AC-043: Progress of 0–100 is stored, shown on the goal, and recorded with the date and the owner's name.
- AC-044: Values below 0 or above 100 are rejected, and the previous value is retained.
- AC-045: Status is one of Not started, On track, At risk, Off track, Achieved or Cancelled. It shows on the goal and in 'My goals'.
- AC-046: A goal past its due date that is not Achieved or Cancelled is flagged as overdue.
- AC-047: Progress and status are read-only to anyone who is not the owner or an HR Admin.

**Related:** EPIC-003, US-029, NFR-009, NFR-019

### US-013 · draft · source: requirements:US-013

[high] Employee or manager aligns their goal to a parent company or department goal.

- AC-048: Selecting a parent saves the alignment, and the parent's title shows on the goal.
- AC-049: A parent goal lists the aligned child goals the viewer may see, with owner, progress and status.
- AC-050: Alignments that create a cycle are rejected with an explanation.
- AC-051: HR cannot delete a parent goal until its child goals are re-aligned or unlinked.

**Related:** EPIC-003, US-014, US-002

- ⚠ AC-048 does not say whether personal goals can act as parents, or only company/department goals.

### US-014 · draft · source: requirements:US-014

[high] HR Admin creates company-level and department-level goals to serve as alignment parents.

- AC-052: A goal marked Company, or Department with a department selected, becomes selectable as a parent.
- AC-053: Employees can select company goals and goals of their own department.
- AC-054: Employees and Managers cannot create company-level goals.

**Related:** EPIC-003, US-013, US-002

- ⚠ AC-054 does not cover department-level goal creation by Managers.

### US-015 · draft · source: requirements:US-015

[high] Manager sees and comments on goals across their reporting line.

- AC-055: The team goals view shows each direct report's goals, weightings, progress and status.
- AC-056: A comment on a report's goal is saved and visible to the owner and the manager.
- AC-057: No goals of employees outside the reporting line are listed.

**Related:** EPIC-003, US-010, NFR-001

- ⚠ AC-055 says 'direct reports' while AC-057 says 'reporting line'. Whether indirect reports are included is ambiguous.
- ⚠ Not specified: whether comments can be edited or deleted, and whether HR can see them.

### EPIC-004 · draft · source: requirements:EPIC-004

Competency Questionnaire and Self-Review. HR defines questionnaires and rating scales. Employees complete self-reviews, which lock on submission.

Assumptions:
- The MVP covers self-review only.
- Confirmed as wanted but deferred:
  - manager reviews
  - peer/360 input with anonymisation and respondent thresholds
  - the full cycle state machine (draft → open → in review → calibration → finalised → closed)
  - calibration views
  - employee acknowledgement of a manager rating
  - PIPs
- The rating scale and competency framework are configurable by HR.
- A lightweight 'review period' replaces full cycle configuration: name, dates, submission deadline, questionnaire, participants.

**Related:** US-016, US-017, US-018, US-019, US-020

- ⚠ The approved stack justifications (FastAPI cycle state machine, React calibration grid) describe features this epic defers.

### US-016 · draft · source: requirements:US-016

[critical] HR Admin builds reusable questionnaire templates with competencies, questions and a rating scale.

- AC-058: A template with a name and competencies, each with questions, is saved and listed as available.
- AC-059: Question type is rated, free text, or both. The type determines what the employee supplies.
- AC-060: The rating scale has a set number of points with labels. The labels appear on rated questions.
- AC-061: Editing a template does not change already-submitted reviews, which keep their questions and scale as they were.
- AC-062: Publishing a template with no questions is blocked.

**Related:** EPIC-004, US-018, NFR-010, NFR-020

- ⚠ AC-069 relies on 'mandatory questions', but no AC defines how a question is marked mandatory.

### US-017 · draft · source: requirements:US-017

[critical] HR Admin opens a named review period with a questionnaire, dates, a deadline and participants.

- AC-063: Opening a period with a published template creates a self-review task for each participant on their dashboard.
- AC-064: In draft, the questionnaire, dates and participants can change, and no tasks exist.
- AC-065: A participant who has already submitted cannot be removed from an open period.
- AC-066: After the deadline, HR sees who has submitted and who is outstanding.

**Related:** EPIC-004, US-018, US-029, NFR-010, NFR-014, NFR-015

- ⚠ AC-071 refers to HR closing a period, but no AC defines closing a period.
- ⚠ NFR-014 mentions queued deadline reminders, but no AC defines reminders or how they are delivered.

### US-018 · draft · source: requirements:US-018

[critical] Employee completes a self-review, saves drafts, and submits.

- AC-067: The task shows every competency and question with the rating scale and free-text boxes.
- AC-068: Drafts keep all entered ratings and comments.
- AC-069: Submit is blocked while mandatory questions are unanswered, and those questions are highlighted.
- AC-070: Submission records the employee's name and a timestamp.
- AC-071: Past the deadline, the task is marked overdue but can still be submitted unless HR has closed the period.

**Related:** EPIC-004, US-016, US-017, US-019, NFR-019

- ⚠ Depends on undefined mechanics: the mandatory-question flag (US-016) and period closure (US-017).

### US-019 · draft · source: requirements:US-019

[critical] Submitted self-reviews lock, and HR reopenings are recorded in an immutable history.

- AC-072: A submitted review is read-only.
- AC-073: HR reopening requires a reason. The HR identity, timestamp and reason are recorded and shown in the review's history.
- AC-074: History is chronological and cannot be edited or deleted by any role.

**Related:** EPIC-004, US-018, NFR-009, NFR-010

- ⚠ Not specified: the flow after an HR reopen, including who edits, resubmission, and how the prior submitted version is retained.

### US-020 · draft · source: requirements:US-020

[high] Manager reads submitted self-reviews of people in their reporting line.

- AC-075: Submitted answers are readable in full, read-only.
- AC-076: Drafts show as not yet submitted, with no content visible.
- AC-077: Employees outside the reporting line are refused.

**Related:** EPIC-004, US-030, NFR-001

### EPIC-005 · draft · source: requirements:EPIC-005

Praise and Continuous Feedback. Colleagues exchange praise and written feedback at any time.

Assumptions:
- Feedback requests are not in the MVP. Only unsolicited praise and written feedback are supported.
- No email or chat notifications. New feedback is shown by an in-app dashboard indicator.
- Feedback is visible to the author, the recipient and HR Admins.
- Whether the recipient's manager can see it is a single HR-configured system-wide setting, because the confirmed understanding was ambiguous.

**Related:** US-021, US-022, US-023, US-024

- ⚠ The in-app new-feedback indicator appears only as an assumption. No AC defines it.

### US-021 · draft · source: requirements:US-021

[high] Employee sends praise to an active colleague.

- AC-078: Praise saves with author, recipient and timestamp.
- AC-079: An empty message or no recipient blocks sending, and the missing field is highlighted.
- AC-080: Selecting oneself as recipient is rejected.
- AC-081: Received praise appears in the recipient's feedback list with author and date.

**Related:** EPIC-005, US-023, NFR-008, NFR-019, NFR-021

- ⚠ Not specified whether praise, like constructive feedback, is read-only once sent and can be withdrawn.

### US-022 · draft · source: requirements:US-022

[high] Employee or manager writes constructive feedback to a colleague.

- AC-082: Feedback saves with author, recipient and timestamp.
- AC-083: Sent feedback is read-only. It can only be withdrawn, and the withdrawal is recorded with name and time.
- AC-084: The author may attach one of the recipient's goals they are entitled to view. It shows when the feedback is read.

**Related:** EPIC-005, US-012, NFR-008, NFR-009

- ⚠ Not specified whether withdrawn feedback stays visible to the recipient, HR or managers.

### US-023 · draft · source: requirements:US-023

[high] Employee views feedback received and given, with filters.

- AC-085: 'My feedback' lists received items newest first, with author, date and content.
- AC-086: The 'Given' tab lists only items the employee authored.
- AC-087: Employees cannot view feedback addressed to colleagues.
- AC-088: The list filters by date range or by type (praise or constructive).

**Related:** EPIC-005, US-021, US-022, NFR-001

### US-024 · draft · source: requirements:US-024

[medium] HR Admin sets one system-wide switch for manager visibility of reports' feedback.

- AC-089: When on, managers read feedback addressed to their reporting line.
- AC-090: When off, feedback is hidden from managers on a report's record.
- AC-091: The compose screen states who will be able to read the feedback before it is sent.

**Related:** EPIC-005, US-030, NFR-008, NFR-020

- ⚠ The default value of the setting is not specified.

### EPIC-006 · draft · source: requirements:EPIC-006

1:1 Check-Ins. Managers and direct reports record 1:1s with a shared agenda, talking points and action items.

Assumptions:
- No calendar integration or video. The date is recorded in-app only.
- Private manager notes are outside the Lightweight capability list but are included as a minimal, clearly labelled field. Remove it if unwanted.
- Recurring schedules are deferred. 1:1s are created one at a time.

**Related:** US-025, US-026, US-027, US-028

- ⚠ Inclusion of private manager notes needs confirmation.

### US-025 · draft · source: requirements:US-025

[high] Manager or direct report creates a 1:1 record with a date.

- AC-092: A manager picks a direct report and a date. The 1:1 appears in both participants' lists.
- AC-093: An employee's 1:1 is automatically paired with their manager.
- AC-094: Anyone who is neither manager nor direct report is not selectable.
- AC-095: Either participant can change the date, and the new date shows to both.

**Related:** EPIC-006, US-003

- ⚠ Not specified: deleting or cancelling a 1:1, and behaviour for an employee with no manager.

### US-026 · draft · source: requirements:US-026

[high] Both participants build a shared agenda of talking points.

- AC-096: A talking point is saved, attributed to its author, and immediately visible to the other participant.
- AC-097: Authors can edit, reorder or delete their own points.
- AC-098: A participant can read and mark discussed the other's points, but not delete them.
- AC-099: Non-participants who are not HR Admins are refused.

**Related:** EPIC-006, NFR-001

### US-027 · draft · source: requirements:US-027

[high] Participants record, complete and carry over 1:1 action items.

- AC-100: An action item has a description, an owner (either participant) and a due date. It appears in the owner's open items.
- AC-101: Completion records the date and who completed it.
- AC-102: Open items past their due date are flagged overdue on the 1:1 and on the dashboard.
- AC-103: A new 1:1 between the same pair lists still-open items for carry-over.

**Related:** EPIC-006, US-029

- ⚠ Not specified: editing or deleting action items.

### US-028 · draft · source: requirements:US-028

[medium] Manager keeps private 1:1 notes that the direct report cannot see.

- AC-104: The notes save, and the field is labelled as visible only to the manager.
- AC-105: Notes are never displayed to or returned by the API to the direct report.
- AC-106: HR access follows the HR private-note visibility setting, and the screen tells the manager whether HR can read the notes.

**Related:** EPIC-006, US-010, NFR-007, NFR-020

- ⚠ The default of the HR private-note visibility setting is not specified.
- ⚠ AC-104's 'visible only to me' label may conflict with HR visibility when that setting is on.

### EPIC-007 · draft · source: requirements:EPIC-007

My Performance Dashboard and Employee Review Record.

Assumptions:
- Deferred:
  - Manager, HR and Executive analytical dashboards (completion, rating distribution, attainment by department, overdue items)
  - CSV/PDF exports, including a printable review record
- The dashboard is read-and-navigate only. It calculates nothing beyond counts and the progress values owners type in.

**Related:** US-029, US-030, US-031

- ⚠ With executive dashboards deferred, it is unclear what the Executive role can actually see in the MVP (see US-030 AC-114).

### US-029 · draft · source: requirements:US-029

[critical] Employee sees their goals, feedback and reviews on sign-in.

- AC-107: The dashboard shows active goals with progress and status, recent feedback received, and current and past reviews.
- AC-108: A 'Needs your attention' area links to open self-review tasks, overdue goals and overdue action items.
- AC-109: Empty sections show explanatory empty-state messages, not errors.
- AC-110: Only the employee's own data and feedback addressed to them is shown.

**Related:** EPIC-007, US-012, US-017, US-027, NFR-019, NFR-021

### US-030 · draft · source: requirements:US-030

[high] Manager or HR Admin browses one employee's review record over time.

- AC-111: A manager, for someone in their line, sees goals, submitted self-reviews by period, and feedback subject to the HR setting.
- AC-112: An HR Admin can view any employee's record.
- AC-113: Selecting an earlier period shows that self-review exactly as it was at submission.
- AC-114: Employees are refused. Executives see only aggregate information, never an individual record.
- AC-115: Every access is recorded with the viewer's identity and a timestamp.

**Related:** EPIC-007, US-020, US-024, NFR-001, NFR-009, NFR-010

- ⚠ AC-114 promises Executives aggregate information, but aggregate dashboards are deferred (EPIC-007). No in-scope aggregate view is defined.

### US-031 · draft · source: requirements:US-031

[medium] Employee browses their own full history.

- AC-116: 'My record' groups goals, submitted self-reviews and feedback by period, newest first.
- AC-117: A past submitted self-review is read-only and shows its submission date.

**Related:** EPIC-007, US-029

### EPIC-008 · draft · source: requirements:EPIC-008

Platform Foundations: Language, Scope Boundaries and Data Protection. Cross-cutting constraints.

Assumptions:
- No payment, billing or subscription functionality (internal tool).
- English only. No multi-language or multi-currency.
- Responsive web app: 'React/TypeScript front end, Node/TypeScript API, PostgreSQL'.
- One managed cloud environment with automated daily backups. No native app.
- EU hosting is the cautious default for GDPR-equivalent treatment. No region was actually stated.
- Configurable retention and per-individual export/erasure are deferred. Only access, encryption and backup controls are in this release.
- No AI/LLM features or external AI keys.

**Related:** US-032, US-033, US-034, US-035, REQ-STACK

- ⚠ The 'Node/TypeScript API' assumption conflicts with the approved FastAPI 0.115 backend (REQ-STACK).
- ⚠ The EU region needs confirmation.

### US-032 · draft · source: requirements:US-032

[medium] The entire interface is in English, with no language chooser.

- AC-118: All labels, messages, dates and validation text are in English.
- AC-119: A non-English browser preference still gets English, and no language selector is offered.

**Related:** EPIC-008, NFR-018

- ⚠ The date format (for example UK or US) is not specified.

### US-033 · draft · source: requirements:US-033

[medium] No payment, billing or subscription functionality anywhere.

- AC-120: No billing, pricing, subscription, invoice or payment screen exists for any role.
- AC-121: No payment provider integration or payment credential is present in configuration or dependencies.
- AC-122: No salary, bonus or payment amount is stored or processed. Pay outcomes are handled outside the product.

**Related:** EPIC-008, NFR-011

### US-034 · draft · source: requirements:US-034

[medium] Responsive web access on laptop, tablet and phone.

- AC-123: On a phone viewport, the dashboard, goals, feedback and 1:1 screens reflow to one column with all controls reachable and no horizontal scroll.
- AC-124: On desktop, the layout uses the wider viewport without losing function.

**Related:** EPIC-008, NFR-017

- ⚠ Supported browsers and breakpoints are not specified. AC-123 does not list review, self-review or HR admin screens.

### US-035 · draft · source: requirements:US-035

[critical] Sensitive data is encrypted, hosted in one controlled EU environment, and backed up daily.

- AC-125: Production traffic travels only over TLS. Plain HTTP is redirected or rejected.
- AC-126: Encryption at rest is enabled on the production database and its backups.
- AC-127: An automated daily backup runs, and its completion is recorded.
- AC-128: Restoring a prior-day backup into a test environment brings back employee, goal, review, feedback and 1:1 data intact.
- AC-129: The environment runs in an EU region (assumed default, pending confirmation).

**Related:** EPIC-008, NFR-002, NFR-006, NFR-012, NFR-013, NFR-023

- ⚠ AC-128 requires a test environment, while NFR-013 and REQ-STACK describe a single production environment. Whether a test environment exists is unclear.
- ⚠ No RPO/RTO targets are stated.
- ⚠ S3-stored files are not explicitly covered by the backup and restore criteria.

### NFR-001 · draft · source: requirements:NFR-001

[security] Least-privilege access is enforced on the server for every screen, URL and API call.

- Employees: own data plus feedback addressed to them.
- Managers: only their own reporting line.
- HR Admins: all records, subject to the private-note setting.
- Executives: read-only aggregate information, no individual records.
- Out-of-bounds requests are refused with an authorisation error and return no data.

**Related:** US-001, US-010, US-015, US-020, US-023, US-026, US-030

- ⚠ The Executive aggregate view is undefined in the MVP (see US-030).

### NFR-002 · draft · source: requirements:NFR-002

[security] Data is encrypted in transit and at rest.

- TLS for all browser–API traffic. Plain HTTP is redirected or rejected.
- Encryption at rest on the production database and backups.
- Target: TLS in transit; encryption at rest on database and backups.

**Related:** US-010, US-035

### NFR-003 · draft · source: requirements:NFR-003

[security] Sign-in is protected against guessing and abandoned sessions.

- Generic failure message.
- Temporary block once the configured attempt threshold is passed; the block is recorded.
- Session ends at the inactivity timeout or on sign-out.
- Deactivated accounts are refused immediately.

**Related:** US-007, US-005

### NFR-004 · draft · source: requirements:NFR-004

[security] Passwords are hashed and strength rules are enforced.

- Only a salted one-way hash is stored.
- New or changed passwords must meet configured length and complexity rules.
- Failed rules are listed on screen.

**Related:** US-008

### NFR-005 · draft · source: requirements:NFR-005

[security] Invitation and reset links are time-limited and single-use.

- Links are unique, expire and work once.
- Revoking or reissuing invalidates the previous link immediately.

**Related:** US-006, US-008

- ⚠ Expiry duration is not specified.

### NFR-006 · draft · source: requirements:NFR-006

[privacy] Employee data stays in an EU region.

- The production environment, database and backups run in an EU AWS region.
- This is the cautious default, pending confirmation.
- Target: one production environment in an EU AWS region.

**Related:** US-035

- ⚠ The region needs confirmation.

### NFR-007 · draft · source: requirements:NFR-007

[privacy] Private 1:1 notes never reach the direct report.

- Notes are never displayed to, or returned by the API to, the direct report.
- The manager is told on screen who can read them, including whether HR can.

**Related:** US-028

### NFR-008 · draft · source: requirements:NFR-008

[privacy] Feedback readership is stated before sending.

- The compose screen states who will be able to read the feedback.
- The statement reflects the current manager-visibility setting.

**Related:** US-021, US-022, US-024

### NFR-009 · draft · source: requirements:NFR-009

[compliance] Append-only audit trail of changes and access.

- Recorded events, each with identity and timestamp:
  - submissions
  - reopenings with reason
  - goal edits
  - progress updates
  - withdrawals
  - review-record views
- Entries are shown in chronological order.
- No role can edit or delete entries.

**Related:** US-011, US-012, US-019, US-022, US-030

- ⚠ Not specified where audit entries for goal edits and record views are surfaced, or to whom. AC-042 only shows last-changed details.

### NFR-010 · draft · source: requirements:NFR-010

[compliance] Records stand up as employment evidence.

- Submitted self-reviews are read-only and keep questions and scale as at submission.
- Participants with a submitted review cannot be removed from a period.
- Leavers are deactivated, not deleted.

**Related:** US-005, US-016, US-017, US-019, US-030

### NFR-011 · draft · source: requirements:NFR-011

[compliance] No payment, billing or payroll data anywhere.

- No billing, pricing, subscription, invoice or payment screens.
- No payment provider or credentials.
- No salary, bonus or payment amounts stored.

**Related:** US-033

### NFR-012 · draft · source: requirements:NFR-012

[availability] Daily backup with proven restore.

- Daily automated backup, with completion recorded.
- A prior-day backup restores intact into a test environment.
- Target: one automated backup per day.

**Related:** US-035

### NFR-013 · draft · source: requirements:NFR-013

[availability] (accepted risk) Single production environment, no failover.

- No standby, failover or multi-region setup.
- Recovery relies on daily backups and point-in-time restore.

**Related:** US-035

### NFR-014 · draft · source: requirements:NFR-014

[performance] Bulk and slow work runs in the background.

- Opening a review period creates tasks via a background queue, so HR's screen responds immediately.
- Deadline reminders and slow jobs are queued so no task is lost and no user is blocked.

**Related:** US-017, REQ-SERVICES

- ⚠ Deadline reminders have no defining story or delivery channel, since email is out of scope.

### NFR-015 · draft · source: requirements:NFR-015

[scalability] Sized for one company of fewer than 200 people.

- A review period can be opened for up to 200 participants at once.
- The setup should still work if the company doubles.
- Target: fewer than 200 employees in one organisation.

**Related:** US-017

### NFR-016 · draft · source: requirements:NFR-016

[scalability] (accepted risk) No horizontal scaling engineering.

- No horizontal scaling, sharding or multi-tenancy.
- Serving multiple organisations or much larger numbers would need rework.

### NFR-017 · draft · source: requirements:NFR-017

[compatibility] One responsive web app for laptop, tablet and phone.

- Single-column reflow on phones, with no horizontal scrolling.
- Desktop uses the wider viewport without losing function.
- No native app.

**Related:** US-034

### NFR-018 · draft · source: requirements:NFR-018

[usability] English-only interface.

- All text is in English.
- No language selector, even when the browser prefers another language.

**Related:** US-032

### NFR-019 · draft · source: requirements:NFR-019

[usability] Clear in-context validation, warnings and empty states.

- Blocking errors highlight the field and explain in plain English. Examples: missing name, duplicate email, weighting out of range, circular reporting line.
- Questionable situations warn without blocking. Example: weightings over 100%.
- Empty sections explain what will appear there.

**Related:** US-001, US-003, US-011, US-012, US-018, US-021, US-029

### NFR-020 · draft · source: requirements:NFR-020

[maintainability] HR configures the rules without code changes.

HR-configurable settings:
- competency framework
- questions
- rating scale and labels
- password rules
- session timeout
- failed sign-in threshold
- manager visibility of feedback
- HR visibility of private notes

**Related:** US-007, US-008, US-016, US-024, US-028

- ⚠ Default values are not specified for any of these settings.

### NFR-021 · draft · source: requirements:NFR-021

[usability] (accepted risk) No email. HR hands over links, and notices are in-app only.

- Invitations and resets are links that HR passes on out of band.
- A forgotten password requires asking HR.
- New feedback and tasks are shown by an in-app indicator only.
- This differs from the earlier email assumption and should be confirmed.

**Related:** US-006, US-008, US-021, US-029

- ⚠ Awaiting confirmation.

### NFR-022 · draft · source: requirements:NFR-022

[security] (accepted risk) No MFA or SSO.

- Email and password only.
- MFA and SSO/SAML were deliberately left out of the lightweight build.

**Related:** US-007

### NFR-023 · draft · source: requirements:NFR-023

[privacy] (accepted risk) Retention and per-person export or erasure deferred.

- Only access control, encryption and backup are in this release.
- Configurable retention and per-individual export/erasure are deferred.
- Such requests must be handled manually.

**Related:** US-035

- ⚠ No manual procedure for handling export or erasure requests is documented.
<!-- sdlc:auto:end narrative -->

<!-- sdlc:auto:start summary -->
**Requirements version:** v1  
**Delivery scope:** lightweight  
**Approved:** 2026-10-29

**Capabilities in scope:** Employee, job title, department and reporting-line records kept by HR, Employee sign-in and personal profile, Goal creation with target, due date and weighting, Manual percentage progress and status updates on goals, Goal alignment to a parent company or department goal, Self-review against a competency questionnaire, Praise and written feedback between colleagues, 1:1 record with shared agenda, talking points and action items, My-performance dashboard: my goals, my feedback, my reviews, Browsable review record for a single employee, HR-issued invitations to create employee accounts, Goal progress typed in by the goal owner, not calculated, English-only interface, No payment, billing or subscription functions — internal tool

**Approved technology stack:**

| Layer | Choice | Rationale |
|---|---|---|
| backend | FastAPI | The earlier note assumed a Node/TypeScript API; this platform cannot build that, so I am changing it to FastAPI (Python) — the closest equivalent, a typed modern API serving React in the same shape. Nothing you told me depends on the API being JavaScript. It suits the parts that matter: the cycle state machine, the permission rules keeping managers inside their reporting line, the append-only audit trail, and server-generated CSV and PDF review records that must stand up as employment evidence. |
| cloud | AWS | You need one production environment in an EU region with daily backups and encryption at rest — not scale. AWS gives you EU regions (Frankfurt, Ireland, Paris) so employee performance data never leaves the EU, managed PostgreSQL with automated backups and point-in-time restore, encrypted storage, and the access logging that supports your audit story. At fewer than 200 employees the running cost is modest, and the same setup still works if the company doubles. |
| database | PostgreSQL | Everything here is relational and must be exactly right: employees reporting to managers, goals aligned to parent goals, reviews inside cycles, sign-offs locking records. PostgreSQL guarantees that a sign-off, the lock and the audit entry either all happen or none do — which is what makes a record defensible when a rating drives pay or an exit. It also produces your reporting (rating distributions, completion rates, attainment by department) and supports encryption at rest plus targeted export or deletion of one person's data. |
| frontend | React | This is the stack already assumed, and it suits what you described: one responsive web app serving four very different screens — an employee's own goals and reviews, a manager's team view, HR's cycle configuration and calibration grid, and read-only executive dashboards. Calibration in particular is an interactive, spreadsheet-like screen where ratings are compared and adjusted side by side before finalising; React handles that kind of dense screen well, and the same code resizes down for someone writing a self-review on a phone. |
<!-- sdlc:auto:end summary -->

<!-- sdlc:auto:start epics -->
## EPIC-001: Employee, Org Structure and Reporting Lines

The system is the source of truth for people data: employee records, job titles, departments and manager relationships, all maintained in-product by HR Admins. No HRIS or directory sync exists.

Assumptions surfaced for this epic:
- Four roles are supported: Employee, Manager, HR Admin and Executive (read-only). Managers see only their own reporting line; employees see only their own data plus feedback addressed to them.
- CSV bulk import/export of employees was discussed but is NOT part of this Lightweight MVP; records are created and maintained one at a time in-app. Bulk import is deferred to a later version.
- 'Manager' is a derived capability: an employee becomes a Manager when at least one other employee reports to them.
- Employee records are deactivated rather than hard-deleted so that historical goals, feedback and reviews remain intact as employment evidence; per-individual export/erasure on request is a later-version capability.

### US-001: HR creates and maintains employee records

**Priority:** critical

> As a HR Admin, I want to create and edit employee records with name, work email, job title and department, so that the system holds an accurate, authoritative list of everyone in the company.

| ID | Given | When | Then |
|---|---|---|---|
| AC-001 | I am signed in as an HR Admin on the employee directory page | I create a new employee with a full name, a unique work email, a job title and a department and save | the employee record is created and appears in the employee directory with those details |
| AC-002 | I am an HR Admin creating or editing an employee record | I submit the form with a missing full name or work email, or with a work email already used by another employee | the record is not saved and a field-level validation message explains which value is missing or duplicated |
| AC-003 | an existing employee record | I change the job title or department and save | the updated values are shown on the employee record and in the directory immediately |
| AC-004 | I am signed in as an Employee, Manager or Executive | I attempt to open the employee creation or editing screen | access is refused and the action is not available to me |

### US-002: HR maintains departments and job titles

**Priority:** high

> As a HR Admin, I want to maintain the list of departments and job titles used across the company, so that employee records and goal alignment use a consistent, controlled vocabulary.

| ID | Given | When | Then |
|---|---|---|---|
| AC-005 | I am an HR Admin in the organisation settings area | I add a department with a unique name | the department is saved and becomes selectable when creating or editing an employee record |
| AC-006 | a department that is currently assigned to at least one active employee | I attempt to delete it | the deletion is blocked and I am told how many employees are still assigned to it |
| AC-007 | a job title already in use | I rename it | every employee record referencing that job title shows the new name |

### US-003: HR sets reporting lines

**Priority:** critical

> As a HR Admin, I want to assign each employee a manager and view the resulting reporting line, so that the system knows who manages whom and can apply manager visibility rules.

| ID | Given | When | Then |
|---|---|---|---|
| AC-008 | two existing active employee records | I set employee B's manager to employee A and save | employee B appears in employee A's list of direct reports, and employee A gains Manager capabilities |
| AC-009 | an employee whose manager field is being edited | I attempt to set the employee as their own manager, or to create a circular reporting line (A reports to B and B reports to A) | the change is rejected with a message explaining that the reporting line would be circular |
| AC-010 | an employee with no manager assigned | I view their record | the manager field is shown as empty and the record is flagged in the directory as missing a reporting line |
| AC-011 | a manager who leaves or changes role | I reassign their direct reports to a different manager | the new manager sees those employees as direct reports and the previous manager no longer has access to their data |

### US-004: HR assigns system roles

**Priority:** critical

> As a HR Admin, I want to assign each employee one of the four roles — Employee, Manager, HR Admin or Executive (read-only), so that people only have the access their job requires.

| ID | Given | When | Then |
|---|---|---|---|
| AC-012 | an existing employee record | I set their role to HR Admin and save | on their next sign-in they can access HR Admin functions such as the employee directory |
| AC-013 | an employee assigned the Executive role | they sign in | they have read-only access and cannot create, edit or delete any goal, review, feedback or 1:1 record |
| AC-014 | I am the only remaining HR Admin in the system | I attempt to change my own role away from HR Admin | the change is blocked with a message that at least one HR Admin must remain |

### US-005: HR deactivates a leaver

**Priority:** high

> As a HR Admin, I want to deactivate an employee who has left rather than delete them, so that their access ends immediately while their performance history is preserved as employment evidence.

| ID | Given | When | Then |
|---|---|---|---|
| AC-015 | an active employee record | I mark the employee as deactivated with a leaving date | the employee can no longer sign in and is excluded from directory pickers for new goals, feedback and 1:1s |
| AC-016 | a deactivated employee who previously had goals, feedback and reviews | an HR Admin opens that employee's review record | all historical goals, feedback and reviews are still visible and unchanged |
| AC-017 | a deactivated employee who still has direct reports | I confirm the deactivation | I am prompted to reassign those direct reports to another manager before the deactivation completes |

## EPIC-002: Account Access, Sign-In and Personal Profile

HR issues invitations so employees can create accounts; employees sign in with email and password and maintain a personal profile. Role-based least-privilege access is enforced on every screen and API call.

Assumptions surfaced for this epic:
- Email sending (SendGrid/SES) has been removed from the stack for this MVP. Invitations and password resets therefore work by generating a time-limited secure link in-app that the HR Admin copies and distributes to the employee out of band. This differs from the original understanding, which assumed transactional email, and should be confirmed.
- Authentication is email + password with enforced password rules. Optional MFA and SSO/SAML are not in this MVP.
- Performance data is treated as sensitive personal data: least-privilege access, encryption in transit and at rest.

### US-006: HR invites an employee to create an account

**Priority:** critical

> As a HR Admin, I want to issue an invitation for an employee record so the person can set up their own account, so that only people HR has approved can get into the system.

| ID | Given | When | Then |
|---|---|---|---|
| AC-018 | an active employee record with no account yet | I click 'Invite' on that record | the system generates a unique, time-limited invitation link that I can copy, and the record's account status changes to 'Invited' |
| AC-019 | a valid, unexpired invitation link | the invited person opens it and sets a password that meets the password rules | their account is activated, they are signed in, and the record's account status changes to 'Active' |
| AC-020 | an invitation link that has expired or has already been used | someone opens it | no account is created and the page explains the link is no longer valid and to contact HR |
| AC-021 | an outstanding invitation | the HR Admin revokes or reissues it | the previous link stops working immediately and only the newest link can be used |

### US-007: Employee signs in and out

**Priority:** critical

> As a employee, I want to sign in with my work email and password and sign out again, so that my performance data is only reachable by me.

| ID | Given | When | Then |
|---|---|---|---|
| AC-022 | an active account | I enter the correct email and password | I am signed in and taken to my performance dashboard |
| AC-023 | an active account | I enter an incorrect password | I am not signed in and I see a generic message that does not reveal whether the email address exists |
| AC-024 | repeated failed sign-in attempts for the same account | the configured attempt threshold is exceeded | further attempts on that account are temporarily blocked and the block is recorded |
| AC-025 | I am signed in | I choose 'Sign out', or my session reaches the configured inactivity timeout | my session is ended and any further page request returns me to the sign-in screen |
| AC-026 | a deactivated employee account | the person attempts to sign in with their previous credentials | sign-in is refused |

### US-008: Password rules and reset

**Priority:** high

> As a employee, I want my password to meet enforced rules and to be able to get a new one if I forget it, so that accounts holding sensitive performance data stay secure and I am never locked out permanently.

| ID | Given | When | Then |
|---|---|---|---|
| AC-027 | I am setting or changing my password | I enter a password that does not meet the configured rules (minimum length and complexity) | the password is rejected and the unmet rules are listed on screen |
| AC-028 | I am signed in | I change my password by supplying my current password and a new valid one | the new password works on the next sign-in and the old one does not |
| AC-029 | I have forgotten my password and email sending is not available in this release | I ask HR to reset it and the HR Admin issues a password-reset link from my employee record | the time-limited link lets me set a new password once, after which the link is invalid |
| AC-030 | passwords are stored by the system | the stored data is inspected | no password is recoverable in plain text; only a salted one-way hash is held |

### US-009: Employee maintains a personal profile

**Priority:** medium

> As a employee, I want to view my profile and update the personal details I own, so that colleagues can recognise me and my HR-owned details stay authoritative.

| ID | Given | When | Then |
|---|---|---|---|
| AC-031 | I am signed in | I open 'My profile' | I see my name, work email, job title, department and manager |
| AC-032 | I am on 'My profile' | I update a self-owned field such as display name, pronouns or profile photo and save | the change is saved and shown to colleagues wherever my profile appears |
| AC-033 | I am on 'My profile' as a non-HR user | I look at job title, department, manager or role | those fields are read-only and labelled as maintained by HR |

### US-010: Role-based least-privilege access is enforced

**Priority:** critical

> As a HR Admin, I want every screen and API call to enforce the role and reporting-line visibility rules, so that sensitive performance data is only seen by people entitled to see it.

| ID | Given | When | Then |
|---|---|---|---|
| AC-034 | I am signed in as an Employee | I request another employee's goals, self-review or 1:1 record by direct URL or API call | the request is refused with an authorisation error and no data is returned |
| AC-035 | I am signed in as a Manager | I open the data of someone inside my reporting line versus someone outside it | I can view the person inside my line and am refused access to the person outside it |
| AC-036 | I am signed in as an HR Admin | I open any employee's goals, reviews, feedback or 1:1 record | I can view them, subject to the private-note rules defined in the 1:1 epic |
| AC-037 | any user is signed in | data travels between the browser and the API, or is stored in the database and backups | it is encrypted in transit (TLS) and at rest |

## EPIC-003: Goals and OKRs

Employees and managers set goals with a measurable target, due date and weighting, align them to parent company or department goals, and update progress manually.

Assumptions surfaced for this epic:
- Progress is a percentage typed in by the goal owner; the system never calculates or infers it from other data.
- Goals carry title, description, measurable target, due date, weighting, percentage progress and status.
- Shared/multi-owner goals were discussed but are not in this MVP; each goal has exactly one owner. Company and department goals are owned by HR.

### US-011: Create a personal goal

**Priority:** critical

> As a employee, I want to create a goal with a title, description, measurable target, due date and weighting, so that what I am expected to achieve this period is written down and measurable.

| ID | Given | When | Then |
|---|---|---|---|
| AC-038 | I am signed in as an employee | I create a goal supplying a title, a measurable target, a due date and a weighting | the goal is saved against me as owner with progress 0% and appears in 'My goals' |
| AC-039 | I am creating a goal | I submit without a title, measurable target or due date | the goal is not saved and the missing mandatory fields are highlighted |
| AC-040 | I am entering a weighting | I enter a value outside 0–100 or a non-numeric value | the value is rejected with a validation message |
| AC-041 | I own goals whose weightings sum to more than 100% for the same period | I view 'My goals' | the total weighting is displayed with a warning that it exceeds 100%, without blocking me from saving |
| AC-042 | a goal I own | I edit its title, description, target, due date or weighting | the changes are saved and the record shows who last changed it and when |

### US-012: Update goal progress and status manually

**Priority:** critical

> As a goal owner, I want to type in my percentage progress and set a status, so that my manager and I can see how each goal is tracking against its due date.

| ID | Given | When | Then |
|---|---|---|---|
| AC-043 | a goal I own | I enter a progress value between 0 and 100 and save | the new percentage is stored, shown on the goal, and recorded with the date and my name |
| AC-044 | a goal I own | I enter a progress value below 0 or above 100 | the value is rejected with a validation message and the previous progress is retained |
| AC-045 | a goal I own | I set its status to one of Not started, On track, At risk, Off track, Achieved or Cancelled | the selected status is saved and displayed on the goal and in 'My goals' |
| AC-046 | a goal whose due date has passed and whose status is not Achieved or Cancelled | I view the goal or my goal list | the goal is visibly flagged as overdue |
| AC-047 | I am not the owner of a goal and I am not an HR Admin | I open that goal | the progress and status fields are read-only to me |

### US-013: Align a goal to a parent company or department goal

**Priority:** high

> As a employee or manager, I want to link my goal to a parent company or department goal, so that it is clear how my work contributes to the wider objectives.

| ID | Given | When | Then |
|---|---|---|---|
| AC-048 | at least one company or department goal exists | I create or edit a goal and select a parent goal | the alignment is saved and the parent goal's title is shown on my goal |
| AC-049 | a company or department goal with aligned child goals | I open that parent goal | I see the list of aligned child goals I am entitled to view, each with its owner, progress and status |
| AC-050 | I am editing a goal's alignment | I select a parent that would create a cycle (a goal aligned directly or indirectly to itself) | the alignment is rejected with an explanatory message |
| AC-051 | a parent goal that has aligned child goals | an HR Admin attempts to delete it | the deletion is blocked until the child goals are re-aligned or unlinked |

### US-014: HR maintains company and department goals

**Priority:** high

> As a HR Admin, I want to create company-level and department-level goals, so that individual goals have something authoritative to align to.

| ID | Given | When | Then |
|---|---|---|---|
| AC-052 | I am an HR Admin | I create a goal and mark its level as Company, or as Department with a department selected | the goal is saved at that level and becomes selectable as a parent goal |
| AC-053 | a department goal exists | an employee in a different department looks for a parent goal | they can select company goals and the goals of their own department |
| AC-054 | I am signed in as an Employee or Manager | I attempt to create a company-level goal | the option is not available to me |

### US-015: Manager oversees goals across their reporting line

**Priority:** high

> As a manager, I want to see and comment on the goals of the people who report to me, so that I can keep the team's objectives aligned and up to date.

| ID | Given | When | Then |
|---|---|---|---|
| AC-055 | I am a manager with direct reports | I open my team goals view | I see each direct report with their goals, weightings, progress and status |
| AC-056 | I am viewing a direct report's goal | I add a comment | the comment is saved against the goal and is visible to the goal owner and to me |
| AC-057 | I am a manager | I open my team goals view | no goals belonging to employees outside my reporting line are listed |

## EPIC-004: Competency Questionnaire and Self-Review

HR defines a competency questionnaire and rating scale; employees complete a self-review against it for a defined review period. Once submitted, the self-review locks so the record stands up as employment evidence.

Assumptions surfaced for this epic:
- The MVP covers the self-review only. Manager reviews, peer and direct-report (360) input, anonymisation and minimum respondent thresholds, the full cycle state machine (draft → open → in review → calibration → finalised → closed), calibration views, employee acknowledgement of a manager rating, and PIP objects were all confirmed as wanted but are deferred beyond this Lightweight MVP.
- The rating scale and competency framework are configurable by HR rather than hard-coded to a specific model.
- A lightweight 'review period' object replaces the full cycle configuration here: HR names a period, sets its dates and a submission deadline, chooses a questionnaire and the participating employees.

### US-016: HR builds a competency questionnaire

**Priority:** critical

> As a HR Admin, I want to define competencies, questions and a rating scale in a reusable questionnaire template, so that self-reviews reflect our own competency framework rather than a fixed model.

| ID | Given | When | Then |
|---|---|---|---|
| AC-058 | I am an HR Admin in the questionnaire area | I create a template with a name and add competencies, each with one or more questions | the template is saved and listed as available for use |
| AC-059 | I am editing a question | I choose its type as rated, free text, or both | the selected type is saved and determines what the employee is asked to supply |
| AC-060 | I am defining a rating scale | I set the number of points and a label for each point | the scale is saved and its labels appear on rated questions using it |
| AC-061 | a questionnaire template already used by a submitted self-review | I edit that template | the already-submitted review continues to show the questions and scale as they were at submission |
| AC-062 | I attempt to publish a questionnaire template with no questions | I save it as available for use | the action is blocked with a message that at least one question is required |

### US-017: HR opens a review period for participants

**Priority:** critical

> As a HR Admin, I want to open a named review period with a questionnaire, dates and a list of participating employees, so that the right people are asked to complete a self-review at the right time.

| ID | Given | When | Then |
|---|---|---|---|
| AC-063 | a published questionnaire template exists | I create a review period with a name, start and end dates, a submission deadline and selected participants, and open it | a self-review task is created for each participant and appears on their dashboard |
| AC-064 | a review period in draft | I change its questionnaire, dates or participant list | the changes are saved and no self-review tasks exist until I open the period |
| AC-065 | an open review period | I attempt to remove a participant who has already submitted their self-review | the removal is blocked and I am told the submitted review must be preserved |
| AC-066 | an open review period whose submission deadline has passed | I view the period | I see which participants have submitted and which are outstanding |

### US-018: Employee completes a self-review

**Priority:** critical

> As a employee, I want to answer the competency questionnaire about my own performance and save it as a draft before submitting, so that I can reflect properly and submit my assessment when it is ready.

| ID | Given | When | Then |
|---|---|---|---|
| AC-067 | I have an open self-review task | I open it | I see every competency and question from the assigned questionnaire with the configured rating scale and free-text boxes |
| AC-068 | I am part-way through my self-review | I save it as a draft and return later | all my previously entered ratings and comments are still there |
| AC-069 | a self-review with mandatory questions unanswered | I click Submit | submission is blocked and the unanswered mandatory questions are highlighted |
| AC-070 | a complete self-review | I confirm Submit | the review is recorded as submitted with my name and a submission timestamp |
| AC-071 | the submission deadline for the review period has passed and I have not submitted | I open my self-review task | it is marked overdue and I can still submit unless HR has closed the period |

### US-019: Submitted reviews lock and record who changed what

**Priority:** critical

> As a HR Admin, I want a submitted self-review to become non-editable and for changes to it to be recorded, so that the record stands up as employment evidence in pay, promotion and performance decisions.

| ID | Given | When | Then |
|---|---|---|---|
| AC-072 | a self-review I have submitted | I reopen it | it is displayed read-only and no answer can be changed |
| AC-073 | a submitted self-review | an HR Admin reopens it for editing with a stated reason | the reopening, the HR Admin's identity, the timestamp and the reason are recorded against the review and shown in its history |
| AC-074 | a self-review record with a history of submissions and reopenings | any user views that history | entries are shown in chronological order and cannot be edited or deleted by any role |

### US-020: Manager sees a direct report's submitted self-review

**Priority:** high

> As a manager, I want to read the submitted self-reviews of people in my reporting line, so that I can prepare for the performance conversation.

| ID | Given | When | Then |
|---|---|---|---|
| AC-075 | a direct report has submitted their self-review | I open their review record | I can read the submitted answers in full, read-only |
| AC-076 | a direct report has a self-review still in draft | I open their review record | the review is shown as not yet submitted and none of its draft content is visible to me |
| AC-077 | an employee outside my reporting line | I attempt to open their self-review | access is refused |

## EPIC-005: Praise and Continuous Feedback

Colleagues give each other praise and written feedback at any time, outside formal review periods.

Assumptions surfaced for this epic:
- Feedback requests (asking a colleague for feedback) were discussed but are not in this MVP; only unsolicited praise and written feedback are supported.
- Email and chat-tool notifications are out of this MVP's stack; recipients are told about new feedback through an in-app indicator on their dashboard.
- Visibility default: a piece of feedback is visible to its author, its recipient and HR Admins. Whether the recipient's manager can also see feedback about their direct report is configured by HR as a single system-wide setting, since the confirmed understanding was ambiguous on this point.

### US-021: Give praise to a colleague

**Priority:** high

> As a employee, I want to send praise to a colleague, so that good work is recognised when it happens rather than months later.

| ID | Given | When | Then |
|---|---|---|---|
| AC-078 | I am signed in | I select an active colleague, write a praise message and send it | the praise is saved with my name as author, the recipient and a timestamp |
| AC-079 | I am composing praise | I submit with an empty message or without selecting a recipient | it is not sent and the missing field is highlighted |
| AC-080 | I am composing praise | I select myself as the recipient | the selection is rejected with a message that praise must be addressed to someone else |
| AC-081 | praise has been sent to me | I open my dashboard | the praise appears in my feedback list with the author's name and date |

### US-022: Give written constructive feedback

**Priority:** high

> As a employee or manager, I want to write constructive feedback to a colleague, so that development points are captured while they are fresh and can inform reviews.

| ID | Given | When | Then |
|---|---|---|---|
| AC-082 | I am signed in | I select a colleague, write feedback and send it | the feedback is saved attributed to me with the recipient and a timestamp |
| AC-083 | feedback I have written and sent | I reopen it | it is read-only and cannot be edited; I can only withdraw it, which records the withdrawal with my name and the time |
| AC-084 | I am drafting feedback and wish to link it to context | I attach one of the recipient's goals that I am entitled to view | the linked goal is stored with the feedback and shown when the feedback is read |

### US-023: View feedback received and given

**Priority:** high

> As a employee, I want to see all the praise and feedback addressed to me and everything I have sent, so that I can act on it and draw on it when writing my self-review.

| ID | Given | When | Then |
|---|---|---|---|
| AC-085 | I have received praise and feedback | I open 'My feedback' | all items addressed to me are listed newest first with author, date and content |
| AC-086 | I have sent praise and feedback | I switch to the 'Given' tab | only the items I authored are listed |
| AC-087 | I am signed in as an Employee | I attempt to view feedback addressed to a colleague | access is refused |
| AC-088 | I have a long feedback history | I filter 'My feedback' by date range or by type (praise or constructive) | only the matching items are listed |

### US-024: HR configures manager visibility of feedback

**Priority:** medium

> As a HR Admin, I want to decide system-wide whether managers can see feedback addressed to their direct reports, so that the company can set the level of openness it is comfortable with.

| ID | Given | When | Then |
|---|---|---|---|
| AC-089 | I am an HR Admin in settings | I switch manager visibility of feedback on | managers can read feedback addressed to employees in their reporting line |
| AC-090 | manager visibility of feedback is switched off | a manager opens a direct report's record | feedback addressed to that report is not shown to the manager |
| AC-091 | either setting | a user composes feedback | the screen states who will be able to read it before it is sent |

## EPIC-006: 1:1 Check-Ins

Managers and their direct reports record 1:1 check-ins in the product: a shared agenda, talking points and action items with owners and due dates.

Assumptions surfaced for this epic:
- No calendar integration and no video calling; the 1:1 date is recorded in-app only and nothing is pushed to Outlook or Google Calendar.
- Private manager notes were part of the confirmed understanding but sit outside the Lightweight MVP capability list; they are included here as a minimal, clearly-labelled field because a 1:1 record without them changes how managers use the tool. If that is unwanted, the field should be removed.
- Recurring 1:1 schedules are deferred; 1:1s are created one at a time in this MVP.

### US-025: Create a 1:1 record

**Priority:** high

> As a manager or direct report, I want to create a 1:1 record with a date for a specific manager–report pairing, so that each check-in has a place for its agenda and outcomes.

| ID | Given | When | Then |
|---|---|---|---|
| AC-092 | I am a manager with direct reports | I create a 1:1 selecting one of my direct reports and a date | the 1:1 is created and appears for both of us in our 1:1 lists |
| AC-093 | I am an employee with a manager | I create a 1:1 | it is automatically paired with my manager and no other participant can be chosen |
| AC-094 | I attempt to create a 1:1 with someone who is neither my manager nor my direct report | I look for them in the participant picker | they are not selectable |
| AC-095 | an existing 1:1 record | either participant changes its date | the new date is saved and shown to both participants |

### US-026: Build a shared agenda and talking points

**Priority:** high

> As a manager or direct report, I want both of us to add talking points to the 1:1 agenda before and during the meeting, so that neither of us forgets what we wanted to discuss.

| ID | Given | When | Then |
|---|---|---|---|
| AC-096 | a 1:1 record that I am a participant in | I add a talking point | it is saved on the shared agenda, attributed to me, and immediately visible to the other participant |
| AC-097 | a talking point I added | I edit, reorder or delete it | the change is reflected on the shared agenda for both participants |
| AC-098 | a talking point added by the other participant | I view the agenda | I can read it and mark it discussed, but I cannot delete it |
| AC-099 | I am not a participant in a 1:1 and I am not an HR Admin | I attempt to open that 1:1 | access is refused |

### US-027: Track action items from a 1:1

**Priority:** high

> As a manager or direct report, I want to record action items with an owner and a due date and mark them complete, so that what we agreed actually gets done and can be checked at the next 1:1.

| ID | Given | When | Then |
|---|---|---|---|
| AC-100 | a 1:1 record I am a participant in | I add an action item with a description, an owner (either participant) and a due date | it is saved on the 1:1 and appears in the owner's open action items |
| AC-101 | an action item assigned to me | I mark it complete | it is shown as completed with the completion date and who completed it |
| AC-102 | an open action item whose due date has passed | either participant views the 1:1 or their dashboard | the item is flagged as overdue |
| AC-103 | a new 1:1 between the same two people | I open it | any still-open action items from their previous 1:1s are listed for carry-over |

### US-028: Keep private manager notes

**Priority:** medium

> As a manager, I want a private notes field on a 1:1 that my direct report cannot see, so that I can record my own observations ahead of a performance conversation.

| ID | Given | When | Then |
|---|---|---|---|
| AC-104 | a 1:1 record where I am the manager | I write in the private notes field and save | the note is saved and the field is clearly labelled as visible only to me |
| AC-105 | a 1:1 with private manager notes | the direct report opens that 1:1 | the private notes are not displayed anywhere and are not returned by the API to that user |
| AC-106 | a 1:1 with private manager notes | an HR Admin opens the 1:1 | the behaviour matches the HR setting for private-note visibility, and the screen states plainly to the manager whether HR can read their private notes |

## EPIC-007: My Performance Dashboard and Employee Review Record

A landing dashboard that pulls together an individual's goals, feedback and reviews, plus a browsable per-employee review record that managers and HR can open for anyone they are entitled to see.

Assumptions surfaced for this epic:
- Manager, HR and Executive analytical dashboards (team completion, rating distribution, goal attainment by department, overdue items) and CSV/PDF exports including a printable review record were in the confirmed understanding but are deferred beyond this Lightweight MVP.
- The dashboard is read-and-navigate only; nothing on it is calculated beyond counts and the progress values typed in by goal owners.

### US-029: See my performance at a glance

**Priority:** critical

> As a employee, I want a dashboard showing my goals, my feedback and my reviews when I sign in, so that I know where I stand and what needs my attention.

| ID | Given | When | Then |
|---|---|---|---|
| AC-107 | I am signed in | I land on my performance dashboard | I see my active goals with progress and status, my most recent feedback received, and my current and past reviews |
| AC-108 | I have an open self-review task or an overdue goal or action item | I view my dashboard | those items are shown in a clearly marked 'Needs your attention' area with a link to each |
| AC-109 | I am a new employee with no goals, feedback or reviews yet | I view my dashboard | each section shows an empty-state message explaining what will appear there rather than an error |
| AC-110 | I am signed in | I view my dashboard | it contains only my own data and feedback addressed to me, with no other employee's records |

### US-030: Browse a single employee's review record

**Priority:** high

> As a manager or HR Admin, I want to open one employee's record and browse their goals, submitted reviews and feedback over time, so that I can prepare for a performance, pay or promotion conversation on the evidence.

| ID | Given | When | Then |
|---|---|---|---|
| AC-111 | I am a manager and the employee is in my reporting line | I open their review record | I see their goals with progress and status, their submitted self-reviews by review period, and their feedback subject to the HR visibility setting |
| AC-112 | I am an HR Admin | I open any employee's review record | I can view their goals, submitted reviews and feedback |
| AC-113 | I am viewing an employee's review record | I select an earlier review period | the record shows that period's submitted self-review exactly as it was at submission |
| AC-114 | I am an Employee or an Executive | I attempt to open another employee's review record | access is refused for Employees, and Executives are shown only aggregate information with no individual record |
| AC-115 | any user opens an employee review record | the page loads | the access is recorded with the viewer's identity and timestamp |

### US-031: See my own full review record

**Priority:** medium

> As a employee, I want to browse my own complete history of goals, reviews and feedback, so that I can see my progression over time and reuse it in future reviews.

| ID | Given | When | Then |
|---|---|---|---|
| AC-116 | I have performance history across more than one review period | I open 'My record' | my goals, submitted self-reviews and feedback are grouped by period, newest first |
| AC-117 | I am viewing my own record | I open a submitted self-review from a past period | it is shown read-only with its submission date |

## EPIC-008: Platform Foundations: Language, Scope Boundaries and Data Protection

Cross-cutting constraints that apply to the whole product rather than to one feature area.

Assumptions surfaced for this epic:
- The product carries no payment, billing or subscription functionality of any kind — it is an internal tool with no paying users.
- Single-language English interface; no multi-language or multi-currency need.
- Responsive web application (React/TypeScript front end, Node/TypeScript API, PostgreSQL), one managed cloud environment with automated daily backups; no native mobile app.
- Hosting in an EU region is the cautious default chosen to match GDPR-equivalent treatment of employee data; no region was actually stated, so this needs confirming.
- Configurable retention and per-individual export/erasure on request were in the confirmed understanding but are deferred beyond this Lightweight MVP; only the access, encryption and backup controls below are in this release.
- No AI/LLM features and no external AI service or API key in this release.

### US-032: English-only interface

**Priority:** medium

> As a employee, I want the entire interface in English with no language chooser, so that the product stays simple and matches how the company actually works.

| ID | Given | When | Then |
|---|---|---|---|
| AC-118 | I am using any screen in the product | the page renders | all labels, messages, dates and validation text are presented in English |
| AC-119 | my browser's preferred language is not English | I sign in | the interface is still English and no language-selection control is offered |

### US-033: No payment, billing or subscription functionality

**Priority:** medium

> As a HR Admin, I want the product to contain no payment, billing or subscription features at all, so that an internal tool is not carrying payment risk or payroll responsibilities it was never meant to have.

| ID | Given | When | Then |
|---|---|---|---|
| AC-120 | I am signed in with any role | I navigate the whole application | no billing, pricing, subscription, invoice or payment screen exists anywhere |
| AC-121 | the deployed system | its configuration and dependencies are inspected | no payment provider integration or payment credential is present |
| AC-122 | a review or goal record that informs a pay or promotion decision | it is finalised in this system | no salary, bonus or payment amount is stored or processed; the outcome is handled outside the product |

### US-034: Responsive web access on any device

**Priority:** medium

> As a employee, I want to use the system comfortably from a laptop, tablet or phone browser, so that I can check goals and add 1:1 talking points without needing a native app.

| ID | Given | When | Then |
|---|---|---|---|
| AC-123 | I open the application on a phone-sized viewport | I navigate the dashboard, goals, feedback and 1:1 screens | content reflows to a single column, all controls are reachable, and no horizontal scrolling is required |
| AC-124 | I open the application on a desktop browser | I use the same screens | the layout uses the wider viewport without loss of function |

### US-035: Sensitive data is protected and recoverable

**Priority:** critical

> As a HR Admin, I want performance data encrypted, hosted in a single controlled environment and backed up daily, so that employee performance records are treated as the sensitive personal data they are.

| ID | Given | When | Then |
|---|---|---|---|
| AC-125 | the production environment | data is transmitted between browser and API | it travels only over TLS, and plain HTTP requests are redirected or rejected |
| AC-126 | the production database and its backups | their storage configuration is inspected | encryption at rest is enabled on both |
| AC-127 | the production environment | a day passes | an automated backup has been taken and its successful completion is recorded |
| AC-128 | a backup taken on a previous day | a restore is performed into a test environment | employee, goal, review, feedback and 1:1 data are restored intact |
| AC-129 | the hosting configuration | the deployment region is checked | the environment runs in an EU region, this being the assumed default pending confirmation of the intended region |
<!-- sdlc:auto:end epics -->
