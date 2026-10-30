# Development

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start narrative -->
### DEV-PLAN-V1 · approved · source: plan:v1

The delivery plan for the PMS is approved at version 1. It covers 8 sprints of capacity 20 each and 8 epics containing 35 stories. Total estimated scope is 139 story points against 160 points of total capacity.

- Plan status: approved, version 1.
- Sprints: 8, each with capacity 20 (total capacity 160).
- Epics (8), with story points per epic:
  - EPIC-001 Employee, Org Structure and Reporting Lines: 19 pts
  - EPIC-002 Account Access, Sign-In and Personal Profile: 24 pts
  - EPIC-003 Goals and OKRs: 21 pts
  - EPIC-004 Competency Questionnaire and Self-Review: 28 pts
  - EPIC-005 Praise and Continuous Feedback: 12 pts
  - EPIC-006 1:1 Check-Ins: 12 pts
  - EPIC-007 My Performance Dashboard and Employee Review Record: 13 pts
  - EPIC-008 Platform Foundations: Language, Scope Boundaries and Data Protection: 10 pts
- Stories: 35 (US-001 to US-035), 139 points in total.
- Tasks: 7 sub-tasks, none of them estimated:
  - US-010-T1 to US-010-T3
  - US-016-T1 to US-016-T3
  - US-017-T1 to US-017-T4
- Agent roles assigned: backend-agent, frontend-agent, security-agent, qa-agent, devops-agent. Epics are unassigned.

**Related:** EPIC-001, EPIC-002, EPIC-003, EPIC-004, EPIC-005, EPIC-006, EPIC-007, EPIC-008, SPRINT-1, SPRINT-2, SPRINT-3, SPRINT-4, SPRINT-5, SPRINT-6, SPRINT-7, SPRINT-8

- ⚠ Plan approver and approval date are not recorded.
- ⚠ The plan does not explicitly map stories to sprints. The sprint-to-story links in the SPRINT entries are inferred from sprint goal text.
- ⚠ Sub-tasks (US-010-T*, US-016-T*, US-017-T*) have no point estimates.

### SPRINT-1 · approved · source: plan:Sprint 1

Sprint 1 sets up the foundations. It covers the EU production environment with encryption and backups, departments and job titles, employee records, and email/password sign-in.

- Goal: EU production environment with encryption and backups, departments/job titles, employee records and email/password sign-in.
- Capacity: 20.
- Stories inferred from the goal (18 pts total):
  - US-035 Sensitive data protected and recoverable (5, devops-agent)
  - US-002 Departments and job titles (3, backend-agent)
  - US-001 Employee records (5, backend-agent)
  - US-007 Sign in and out (5, backend-agent)

**Related:** US-035, US-002, US-001, US-007

- ⚠ No delivery record exists for any Sprint 1 story in the development run.
- ⚠ Sprint dates are not provided.
- ⚠ The story mapping is inferred from the goal text, not stated in the plan.

### SPRINT-2 · approved · source: plan:Sprint 2

Sprint 2 completes the org model and the account lifecycle.

- Goal: Complete org model and account lifecycle: reporting lines, roles, invitations, password rules/reset, deactivation.
- Capacity: 20.
- Stories inferred from the goal (19 pts total):
  - US-003 Reporting lines (5)
  - US-004 System roles (3)
  - US-006 Invitations (5)
  - US-008 Password rules and reset (3)
  - US-005 Deactivate a leaver (3)
- All five stories are assigned to backend-agent.

**Related:** US-003, US-004, US-006, US-008, US-005

- ⚠ No delivery record exists for any Sprint 2 story.
- ⚠ Sprint dates are not provided.
- ⚠ The story mapping is inferred from the goal text.

### SPRINT-3 · approved · source: plan:Sprint 3

Sprint 3 covers server-side authorisation by role and reporting line, the personal profile, and personal goals with manual progress and status.

- Goal: Server-side role and reporting-line authorisation, personal profile, personal goals with manual progress and status.
- Capacity: 20.
- Stories inferred from the goal (19 pts total):
  - US-010 Role-based least-privilege access (8, security-agent), with tasks:
    - T1 Authorisation policy module (security-agent)
    - T2 Reporting-line scope resolution (backend-agent)
    - T3 Authorisation negative test suite (qa-agent)
  - US-009 Personal profile (3, frontend-agent)
  - US-011 Create a personal goal (5, backend-agent)
  - US-012 Update goal progress/status manually (3, backend-agent)

**Related:** US-010, US-010-T1, US-010-T2, US-010-T3, US-009, US-011, US-012

- ⚠ No delivery record exists for any Sprint 3 story or task.
- ⚠ Sprint 4 deliveries (goal alignment, manager team view) appear to depend on this sprint's personal goals and authorisation work. Their delivery status is unknown.
- ⚠ Sprint dates are not provided.

### SPRINT-4 · approved · source: plan:Sprint 4

Sprint 4 covers goal alignment, company and department goals, the manager team goals view, praise, and the manager feedback-visibility setting. All five stories matching this goal have delivery records in the development run.

- Goal: Goal alignment, company/department goals, manager team goals view, praise and the manager feedback-visibility setting.
- Capacity: 20.
- Stories inferred from the goal (21 pts total), all delivered:
  - US-013 Align goal to parent goal (5): delivered, commit a7fbb88
  - US-014 Company and department goals (3): delivered, commit a7fbb88
  - US-015 Manager team goals view (5): delivered, commit b22d607
  - US-021 Give praise (3): delivered, commit 8151f2f
  - US-024 Manager feedback-visibility setting (3): delivered, commit 4388b8d

**Related:** US-013, US-014, US-015, US-021, US-024, DEV-RUN

- ⚠ The inferred story load (21 pts) exceeds sprint capacity (20). Confirm the sprint scope or the capacity.
- ⚠ The run does not state which sprint it executed. The link to Sprint 4 is inferred from matching scope.
- ⚠ Sprint dates are not provided.

### SPRINT-5 · approved · source: plan:Sprint 5

Sprint 5 covers the competency questionnaire builder, constructive feedback and feedback lists, and 1:1 creation with a shared agenda.

- Goal: Competency questionnaire builder, constructive feedback and feedback lists, 1:1 creation and shared agenda.
- Capacity: 20.
- Stories inferred from the goal (20 pts total):
  - US-016 Competency questionnaire (8, backend-agent), with tasks:
    - T1 Versioned questionnaire schema (backend-agent)
    - T2 Questionnaire and rating-scale endpoints (backend-agent)
    - T3 Builder screen (frontend-agent)
  - US-022 Constructive feedback (3, backend-agent)
  - US-023 View feedback received/given (3, frontend-agent)
  - US-025 Create a 1:1 record (3, backend-agent)
  - US-026 Shared agenda (3, frontend-agent)

**Related:** US-016, US-016-T1, US-016-T2, US-016-T3, US-022, US-023, US-025, US-026

- ⚠ No delivery record exists for any Sprint 5 story or task.
- ⚠ Sprint dates are not provided.

### SPRINT-6 · approved · source: plan:Sprint 6

Sprint 6 covers review periods with background task fan-out, self-review completion, and 1:1 action items and private notes.

- Goal: Review periods with background task fan-out, self-review completion, 1:1 action items and private notes.
- Capacity: 20.
- Stories inferred from the goal (19 pts total):
  - US-017 Open a review period (8, backend-agent), with tasks:
    - T1 Review period endpoints (backend-agent)
    - T2 Self-review task fan-out job (backend-agent)
    - T3 Redis queue and worker deployment (devops-agent)
    - T4 Review period management screen (frontend-agent)
  - US-018 Complete a self-review (5, frontend-agent)
  - US-027 1:1 action items (3, backend-agent)
  - US-028 Private manager notes (3, backend-agent)

**Related:** US-017, US-017-T1, US-017-T2, US-017-T3, US-017-T4, US-018, US-027, US-028

- ⚠ No delivery record exists for any Sprint 6 story or task.
- ⚠ Sprint dates are not provided.

### SPRINT-7 · approved · source: plan:Sprint 7

Sprint 7 covers review locking and history, manager reading of self-reviews, the performance dashboard, and review records.

- Goal: Review locking and history, manager reading of self-reviews, performance dashboard and review records.
- Capacity: 20.
- Stories inferred from the goal (20 pts total):
  - US-019 Review lock and change history (5, backend-agent)
  - US-020 Manager sees direct report's self-review (2, backend-agent)
  - US-029 Performance dashboard (5, frontend-agent)
  - US-030 Single employee's review record (5, backend-agent)
  - US-031 Own full review record (3, frontend-agent)

**Related:** US-019, US-020, US-029, US-030, US-031

- ⚠ No delivery record exists for any Sprint 7 story.
- ⚠ Sprint dates are not provided.

### SPRINT-8 · approved · source: plan:Sprint 8

Sprint 8 verifies the responsive layout across devices and confirms that no payment functionality exists. Only about 4 points of the 20-point capacity map to its goal.

- Goal: Verify responsive layout across devices and the absence of any payment functionality.
- Capacity: 20.
- Stories inferred from the goal (4 pts total):
  - US-034 Responsive web access (3, frontend-agent)
  - US-033 No payment/billing/subscription (1, qa-agent)

**Related:** US-034, US-033, US-032

- ⚠ US-032 (English-only interface, 1 pt, frontend-agent) is not referenced by any sprint goal. Its sprint assignment is unknown.
- ⚠ No delivery record exists for Sprint 8 stories.
- ⚠ Sprint dates are not provided.

### EPIC-001 · approved · source: plan:EPIC-001

This epic covers employee records, departments and job titles, reporting lines, role assignment, and leaver deactivation. It totals 19 pts. None of its stories have delivery records.

Stories, all assigned to backend-agent:
- US-001 HR creates and maintains employee records (5): not reported
- US-002 HR maintains departments and job titles (3): not reported
- US-003 HR sets reporting lines (5): not reported
- US-004 HR assigns system roles (3): not reported
- US-005 HR deactivates a leaver (3): not reported

The epic itself has no assigned role.

**Related:** US-001, US-002, US-003, US-004, US-005

- ⚠ No ticket or commit is recorded for any story in this epic.
- ⚠ Delivered US-015 (manager team view) and US-024 appear to rely on reporting lines (US-003) and roles (US-004).

### EPIC-002 · approved · source: plan:EPIC-002

This epic covers invitations, sign-in and sign-out, password rules and reset, the personal profile, and least-privilege authorisation. It totals 24 pts. None of its stories have delivery records.

Stories:
- US-006 HR invites an employee to create an account (5, backend-agent): not reported
- US-007 Employee signs in and out (5, backend-agent): not reported
- US-008 Password rules and reset (3, backend-agent): not reported
- US-009 Employee maintains a personal profile (3, frontend-agent): not reported
- US-010 Role-based least-privilege access is enforced (8, security-agent): not reported
  - US-010-T1 Implement authorisation policy module (security-agent)
  - US-010-T2 Add reporting-line scope resolution (backend-agent)
  - US-010-T3 Add authorisation negative test suite (qa-agent)

**Related:** US-006, US-007, US-008, US-009, US-010, US-010-T1, US-010-T2, US-010-T3

- ⚠ No ticket or commit is recorded for any story or task in this epic.
- ⚠ It is unconfirmed how the delivered stories (US-013, US-014, US-015, US-021, US-024) enforce access without a recorded US-010 delivery.

### EPIC-003 · approved · source: plan:EPIC-003

This epic covers personal goals, progress tracking, alignment to company and department goals, HR-maintained org goals, and the manager oversight view. It totals 21 pts. Three of its five stories are delivered.

Stories:
- US-011 Create a personal goal (5, backend-agent): not reported
- US-012 Update goal progress and status manually (3, backend-agent): not reported
- US-013 Align a goal to a parent company or department goal (5, backend-agent): delivered, commit a7fbb8890aba6c23edf48529b86271ef330142f7
- US-014 HR maintains company and department goals (3, backend-agent): delivered, commit a7fbb8890aba6c23edf48529b86271ef330142f7
- US-015 Manager oversees goals across their reporting line (5, frontend-agent): delivered, commit b22d607f72b6fea1d93f84be42d61cd19e13f98b

**Related:** US-011, US-012, US-013, US-014, US-015

- ⚠ US-011 and US-012 have no delivery record. Goal alignment (US-013) and the manager goals view (US-015) presuppose personal goals exist.

### EPIC-004 · approved · source: plan:EPIC-004

This epic covers the competency questionnaire, review periods, self-reviews, review locking and history, and manager reading of self-reviews. It totals 28 pts. None of its stories have delivery records.

Stories:
- US-016 HR builds a competency questionnaire (8, backend-agent): not reported
  - T1 Add questionnaire schema with versioning (backend-agent)
  - T2 Implement questionnaire and rating-scale endpoints (backend-agent)
  - T3 Build questionnaire builder screen (frontend-agent)
- US-017 HR opens a review period for participants (8, backend-agent): not reported
  - T1 Implement review period endpoints (backend-agent)
  - T2 Add self-review task fan-out job (backend-agent)
  - T3 Wire Redis queue and worker deployment (devops-agent)
  - T4 Build review period management screen (frontend-agent)
- US-018 Employee completes a self-review (5, frontend-agent): not reported
- US-019 Submitted reviews lock and record who changed what (5, backend-agent): not reported
- US-020 Manager sees a direct report's submitted self-review (2, backend-agent): not reported

**Related:** US-016, US-016-T1, US-016-T2, US-016-T3, US-017, US-017-T1, US-017-T2, US-017-T3, US-017-T4, US-018, US-019, US-020

- ⚠ No ticket or commit is recorded for any story or task in this epic.

### EPIC-005 · approved · source: plan:EPIC-005

This epic covers praise, constructive feedback, feedback lists, and HR control over manager visibility of feedback. It totals 12 pts. Two of its four stories are delivered.

Stories:
- US-021 Give praise to a colleague (3, backend-agent): delivered, commit 8151f2f8200dc7f16934471ea4cd8bf49ecf9ce1
- US-022 Give written constructive feedback (3, backend-agent): not reported
- US-023 View feedback received and given (3, frontend-agent): not reported
- US-024 HR configures manager visibility of feedback (3, backend-agent): delivered, commit 4388b8d95b29ab0c46aaf242d2991f86a0ddedba

**Related:** US-021, US-022, US-023, US-024

- ⚠ The visibility setting (US-024) is delivered, but constructive feedback (US-022) and the feedback lists (US-023) are not. It is unclear what the setting currently governs.
- ⚠ No user-facing list for viewing praise is recorded as delivered, because US-023 is not reported.

### EPIC-006 · approved · source: plan:EPIC-006

This epic covers 1:1 records, the shared agenda, action items, and private manager notes. It totals 12 pts. None of its stories have delivery records.

Stories:
- US-025 Create a 1:1 record (3, backend-agent): not reported
- US-026 Build a shared agenda and talking points (3, frontend-agent): not reported
- US-027 Track action items from a 1:1 (3, backend-agent): not reported
- US-028 Keep private manager notes (3, backend-agent): not reported

**Related:** US-025, US-026, US-027, US-028

- ⚠ No ticket or commit is recorded for any story in this epic.

### EPIC-007 · approved · source: plan:EPIC-007

This epic covers the personal performance dashboard and employee review records. It totals 13 pts. None of its stories have delivery records.

Stories:
- US-029 See my performance at a glance (5, frontend-agent): not reported
- US-030 Browse a single employee's review record (5, backend-agent): not reported
- US-031 See my own full review record (3, frontend-agent): not reported

**Related:** US-029, US-030, US-031

- ⚠ No ticket or commit is recorded for any story in this epic.

### EPIC-008 · approved · source: plan:EPIC-008

This epic covers the platform foundations: English-only UI, no payment functionality, responsive access, and data protection with recoverability. It totals 10 pts. None of its stories have delivery records.

Stories:
- US-032 English-only interface (1, frontend-agent): not reported
- US-033 No payment, billing or subscription functionality (1, qa-agent): not reported
- US-034 Responsive web access on any device (3, frontend-agent): not reported
- US-035 Sensitive data is protected and recoverable (5, devops-agent): not reported

**Related:** US-032, US-033, US-034, US-035

- ⚠ No ticket or commit is recorded for any story in this epic.
- ⚠ The EU environment, encryption and backups (US-035, Sprint 1 goal) are unconfirmed. The delivered features have no recorded hosting or data-protection baseline.

### DEV-RUN · draft · source: dev:run

The development run is reported as completed, with 5 delivered tickets totalling 19 pts. The delivered scope matches the Sprint 4 goal. The 30 stories outside that set have no ticket records.

- Run status: completed.
- Delivered tickets:
  - US-013 Align a goal to a parent company or department goal: commit a7fbb8890aba6c23edf48529b86271ef330142f7
  - US-014 HR maintains company and department goals: commit a7fbb8890aba6c23edf48529b86271ef330142f7 (same commit as US-013)
  - US-015 Manager oversees goals across their reporting line: commit b22d607f72b6fea1d93f84be42d61cd19e13f98b
  - US-021 Give praise to a colleague: commit 8151f2f8200dc7f16934471ea4cd8bf49ecf9ce1
  - US-024 HR configures manager visibility of feedback: commit 4388b8d95b29ab0c46aaf242d2991f86a0ddedba
- No tickets are recorded for the other stories:
  - US-001 to US-012
  - US-016 to US-020
  - US-022, US-023
  - US-025 to US-035

**Related:** US-013, US-014, US-015, US-021, US-024, SPRINT-4

- ⚠ Discrepancy: the run status is 'completed', but only 5 of 35 planned stories have tickets. It is unclear whether 'completed' refers to one sprint (apparently Sprint 4) or to the whole plan.
- ⚠ Earlier-sprint prerequisites (sign-in, roles, reporting lines, authorisation, personal goals) have no delivery record. It is unknown whether they exist in other runs or were not built.
- ⚠ Run date, branch or repository, reviewers and merge approvals are not provided.
- ⚠ No test results, code review outcomes or build/CI status are provided for the delivered commits.
- ⚠ Because end-to-end delivery of the application is not confirmed, no user guide can be produced yet.

### DEV-TICKET-US-013 · draft · source: dev:US-013

Goal alignment to a parent company or department goal is delivered. It shares a commit with US-014.

- Ticket: US-013 Align a goal to a parent company or department goal.
- Status: delivered.
- Commit: a7fbb8890aba6c23edf48529b86271ef330142f7.
- Plan estimate: 5 pts, backend-agent, EPIC-003.

**Related:** US-013, EPIC-003, US-011, US-014, SPRINT-4

- ⚠ No implementation notes, acceptance results or tests are recorded.
- ⚠ Personal goal creation (US-011) has no delivery record, so it is unconfirmed what goals can be aligned.
- ⚠ One commit covers two tickets (US-013 and US-014). Per-ticket change scope cannot be separated from the input.

### DEV-TICKET-US-014 · draft · source: dev:US-014

HR maintenance of company and department goals is delivered. It shares a commit with US-013.

- Ticket: US-014 HR maintains company and department goals.
- Status: delivered.
- Commit: a7fbb8890aba6c23edf48529b86271ef330142f7.
- Plan estimate: 3 pts, backend-agent, EPIC-003.

**Related:** US-014, EPIC-003, US-013, US-004, SPRINT-4

- ⚠ No implementation notes, acceptance results or tests are recorded.
- ⚠ The HR role (US-004) and departments (US-002) have no delivery records. HR-only restriction is unconfirmed.

### DEV-TICKET-US-015 · draft · source: dev:US-015

The manager view of goals across their reporting line is delivered.

- Ticket: US-015 Manager oversees goals across their reporting line.
- Status: delivered.
- Commit: b22d607f72b6fea1d93f84be42d61cd19e13f98b.
- Plan estimate: 5 pts, frontend-agent, EPIC-003.

**Related:** US-015, EPIC-003, US-003, US-010, SPRINT-4

- ⚠ No implementation notes, acceptance results or tests are recorded.
- ⚠ Reporting lines (US-003) and reporting-line scope authorisation (US-010, US-010-T2) have no delivery records. Correct scoping of the manager view is unverified.

### DEV-TICKET-US-021 · draft · source: dev:US-021

Giving praise to a colleague is delivered.

- Ticket: US-021 Give praise to a colleague.
- Status: delivered.
- Commit: 8151f2f8200dc7f16934471ea4cd8bf49ecf9ce1.
- Plan estimate: 3 pts, backend-agent, EPIC-005.

**Related:** US-021, EPIC-005, US-023, SPRINT-4

- ⚠ No implementation notes, acceptance results or tests are recorded.
- ⚠ The planned feedback lists (US-023) are not delivered, so there is no recorded way to view praise once given.

### DEV-TICKET-US-024 · draft · source: dev:US-024

The HR setting that controls manager visibility of feedback is delivered.

- Ticket: US-024 HR configures manager visibility of feedback.
- Status: delivered.
- Commit: 4388b8d95b29ab0c46aaf242d2991f86a0ddedba.
- Plan estimate: 3 pts, backend-agent, EPIC-005.

**Related:** US-024, EPIC-005, US-021, US-022, US-023, SPRINT-4

- ⚠ No implementation notes, acceptance results or tests are recorded.
- ⚠ Constructive feedback (US-022) and the feedback lists (US-023) are not delivered. It is unclear whether the setting currently applies to praise only.
- ⚠ The setting's options and default value are not documented in the input.
<!-- sdlc:auto:end narrative -->
