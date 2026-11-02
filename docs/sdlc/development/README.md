# Development

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start narrative -->
### DEV-PLAN-V1 · approved · source: plan:v1

Approved delivery plan (version 1) for the Performance Management System. It has 8 sprints of capacity 20 each and 8 epics. The epics cover org structure, account access, goals/OKRs, competency self-review, feedback, 1:1s, the dashboard/review record, and platform foundations.

- Plan status: approved; version: 1.
- Sprints: 8 (Sprint 1 to Sprint 8), each with capacity 20, for 160 points of total capacity.
- Epics: 8 (EPIC-001 to EPIC-008). None has points or an assigned role.
- Stories: 35 (US-001 to US-035), 139 story points in total.
- Sub-tasks: 10.
  - US-010-T1 to T3.
  - US-016-T1 to T3.
  - US-017-T1 to T4.
- Story points by agent role:
  - backend-agent: 23 stories.
  - frontend-agent: 9 stories.
  - security-agent: 1 story (US-010).
  - qa-agent: 1 story (US-033).
  - devops-agent: 1 story (US-035).
- Sub-task roles:
  - security-agent: US-010-T1.
  - backend-agent: US-010-T2, US-016-T1, US-016-T2, US-017-T1, US-017-T2.
  - qa-agent: US-010-T3.
  - frontend-agent: US-016-T3, US-017-T4.
  - devops-agent: US-017-T3.

**Related:** EPIC-001, EPIC-002, EPIC-003, EPIC-004, EPIC-005, EPIC-006, EPIC-007, EPIC-008, DEV-SPRINT-1, DEV-SPRINT-2, DEV-SPRINT-3, DEV-SPRINT-4, DEV-SPRINT-5, DEV-SPRINT-6, DEV-SPRINT-7, DEV-SPRINT-8

- ⚠ Plan approval date and approver are not recorded.
- ⚠ The plan does not explicitly assign stories to sprints. The sprint mapping in the DEV-SPRINT entries is inferred from sprint goal wording only.
- ⚠ Epics have no points or owner role assigned.

### DEV-SPRINT-1 · approved · source: plan:SPRINT-1

Foundation sprint. It covers the EU production environment with encryption and backups, departments/job titles, employee records and email/password sign-in.

- Goal: EU production environment with encryption and backups, departments/job titles, employee records and email/password sign-in.
- Capacity: 20.
- Stories inferred from goal wording:
  - US-035 Sensitive data is protected and recoverable (5).
  - US-002 HR maintains departments and job titles (3).
  - US-001 HR creates and maintains employee records (5).
  - US-007 Employee signs in and out (5).
- Inferred load: 18 / 20.

**Related:** US-035, US-002, US-001, US-007

- ⚠ No delivery record (ticket status or commit) exists for any story in this sprint.
- ⚠ Sprint dates are not provided.
- ⚠ Story-to-sprint mapping is inferred from goal text, not stated in the plan.

### DEV-SPRINT-2 · approved · source: plan:SPRINT-2

Completes the org model and account lifecycle. Scope covers reporting lines, roles, invitations, password rules/reset and deactivation.

- Goal: Complete org model and account lifecycle: reporting lines, roles, invitations, password rules/reset, deactivation.
- Capacity: 20.
- Stories inferred from goal wording:
  - US-003 HR sets reporting lines (5).
  - US-004 HR assigns system roles (3).
  - US-006 HR invites an employee to create an account (5).
  - US-008 Password rules and reset (3).
  - US-005 HR deactivates a leaver (3).
- Inferred load: 19 / 20.

**Related:** US-003, US-004, US-006, US-008, US-005

- ⚠ No delivery record exists for any story in this sprint.
- ⚠ Sprint dates are not provided.
- ⚠ Story-to-sprint mapping is inferred from goal text.

### DEV-SPRINT-3 · approved · source: plan:SPRINT-3

Covers server-side role and reporting-line authorisation, the personal profile, and personal goals with manual progress and status.

- Goal: Server-side role and reporting-line authorisation, personal profile, personal goals with manual progress and status.
- Capacity: 20.
- Stories inferred from goal wording:
  - US-010 Role-based least-privilege access is enforced (8). Sub-tasks:
    - US-010-T1 authorisation policy module (security-agent).
    - US-010-T2 reporting-line scope resolution (backend-agent).
    - US-010-T3 authorisation negative test suite (qa-agent).
  - US-009 Employee maintains a personal profile (3).
  - US-011 Create a personal goal (5).
  - US-012 Update goal progress and status manually (3).
- Inferred load: 19 / 20.

**Related:** US-010, US-010-T1, US-010-T2, US-010-T3, US-009, US-011, US-012

- ⚠ No delivery record exists for any story or sub-task in this sprint, including the US-010 authorisation work.
- ⚠ Delivered stories US-018, US-027 and US-028 (especially private manager notes) depend on this access control.
- ⚠ Sprint dates are not provided.
- ⚠ Story-to-sprint mapping is inferred from goal text.

### DEV-SPRINT-4 · approved · source: plan:SPRINT-4

Covers goal alignment, company/department goals, the manager team goals view, praise, and the manager feedback-visibility setting.

- Goal: Goal alignment, company/department goals, manager team goals view, praise and the manager feedback-visibility setting.
- Capacity: 20.
- Stories inferred from goal wording:
  - US-013 Align a goal to a parent company or department goal (5).
  - US-014 HR maintains company and department goals (3).
  - US-015 Manager oversees goals across their reporting line (5).
  - US-021 Give praise to a colleague (3).
  - US-024 HR configures manager visibility of feedback (3).
- Inferred load: 19 / 20.

**Related:** US-013, US-014, US-015, US-021, US-024

- ⚠ No delivery record exists for any story in this sprint.
- ⚠ Sprint dates are not provided.
- ⚠ Story-to-sprint mapping is inferred from goal text.

### DEV-SPRINT-5 · approved · source: plan:SPRINT-5

Covers the competency questionnaire builder, constructive feedback and feedback lists, and 1:1 creation with a shared agenda.

- Goal: Competency questionnaire builder, constructive feedback and feedback lists, 1:1 creation and shared agenda.
- Capacity: 20.
- Stories inferred from goal wording:
  - US-016 HR builds a competency questionnaire (8). Sub-tasks:
    - US-016-T1 questionnaire schema with versioning (backend-agent).
    - US-016-T2 questionnaire and rating-scale endpoints (backend-agent).
    - US-016-T3 questionnaire builder screen (frontend-agent).
  - US-022 Give written constructive feedback (3).
  - US-023 View feedback received and given (3).
  - US-025 Create a 1:1 record (3).
  - US-026 Build a shared agenda and talking points (3).
- Inferred load: 20 / 20.

**Related:** US-016, US-016-T1, US-016-T2, US-016-T3, US-022, US-023, US-025, US-026

- ⚠ No delivery record exists for any story or sub-task in this sprint.
- ⚠ US-016 (questionnaire) is a functional prerequisite for delivered US-017/US-018.
- ⚠ US-025 (1:1 record) is a functional prerequisite for delivered US-027/US-028.
- ⚠ Sprint dates are not provided.
- ⚠ Story-to-sprint mapping is inferred from goal text.

### DEV-SPRINT-6 · approved · source: plan:SPRINT-6

Covers review periods with background task fan-out, self-review completion, 1:1 action items and private notes. This is the only sprint whose stories all have delivery records.

- Goal: Review periods with background task fan-out, self-review completion, 1:1 action items and private notes.
- Capacity: 20.
- Stories inferred from goal wording, all reported delivered:
  - US-017 HR opens a review period for participants (8). Commit 8c7a8271f0252d0ffa0a170731b5149e226e1849.
  - US-018 Employee completes a self-review (5). Commit a01ce9e75e42eeb479cb499af55c2338fd938e80.
  - US-027 Track action items from a 1:1 (3). Commit a01ce9e75e42eeb479cb499af55c2338fd938e80.
  - US-028 Keep private manager notes (3). Commit a01ce9e75e42eeb479cb499af55c2338fd938e80.
- Inferred load: 19 / 20.

**Related:** US-017, US-018, US-027, US-028, DEV-TICKET-US-017, DEV-TICKET-US-018, DEV-TICKET-US-027, DEV-TICKET-US-028

- ⚠ Sprint dates are not provided.
- ⚠ No sprint review or acceptance record was provided.

### DEV-SPRINT-7 · approved · source: plan:SPRINT-7

Covers review locking and history, manager reading of self-reviews, the performance dashboard, and review records.

- Goal: Review locking and history, manager reading of self-reviews, performance dashboard and review records.
- Capacity: 20.
- Stories inferred from goal wording:
  - US-019 Submitted reviews lock and record who changed what (5).
  - US-020 Manager sees a direct report's submitted self-review (2).
  - US-029 See my performance at a glance (5).
  - US-030 Browse a single employee's review record (5).
  - US-031 See my own full review record (3).
- Inferred load: 20 / 20.

**Related:** US-019, US-020, US-029, US-030, US-031

- ⚠ No delivery record exists for any story in this sprint. Without US-019, self-reviews submitted via the delivered US-018 have no recorded locking or change history.
- ⚠ Sprint dates are not provided.
- ⚠ Story-to-sprint mapping is inferred from goal text.

### DEV-SPRINT-8 · approved · source: plan:SPRINT-8

Verification sprint. It checks the responsive layout across devices and confirms that no payment functionality exists.

- Goal: Verify responsive layout across devices and the absence of any payment functionality.
- Capacity: 20.
- Stories inferred from goal wording:
  - US-034 Responsive web access on any device (3).
  - US-033 No payment, billing or subscription functionality (1, qa-agent).
- Inferred load: 4 / 20.

**Related:** US-034, US-033

- ⚠ No delivery record exists for any story in this sprint.
- ⚠ Inferred load (4) is far below capacity (20). It is unclear whether more scope was intended.
- ⚠ US-032 English-only interface (1 point) is not referenced by any sprint goal, so its sprint is unknown.
- ⚠ Sprint dates are not provided.

### EPIC-001 · approved · source: plan:EPIC-001

Employee, Org Structure and Reporting Lines. It contains 5 backend stories totalling 19 points. None has a delivery record.

- US-001 HR creates and maintains employee records: 5 points, backend-agent.
- US-002 HR maintains departments and job titles: 3 points, backend-agent.
- US-003 HR sets reporting lines: 5 points, backend-agent.
- US-004 HR assigns system roles: 3 points, backend-agent.
- US-005 HR deactivates a leaver: 3 points, backend-agent.

**Related:** US-001, US-002, US-003, US-004, US-005

- ⚠ No ticket status or commit is recorded for US-001 to US-005.
- ⚠ Employee records and reporting lines underpin the delivered review period, self-review and 1:1 features.

### EPIC-002 · approved · source: plan:EPIC-002

Account Access, Sign-In and Personal Profile. It contains 5 stories totalling 24 points, including the 8-point least-privilege authorisation story with 3 sub-tasks. None has a delivery record.

- US-006 HR invites an employee to create an account: 5 points, backend-agent.
- US-007 Employee signs in and out: 5 points, backend-agent.
- US-008 Password rules and reset: 3 points, backend-agent.
- US-009 Employee maintains a personal profile: 3 points, frontend-agent.
- US-010 Role-based least-privilege access is enforced: 8 points, security-agent. Sub-tasks:
  - US-010-T1 Implement authorisation policy module (security-agent).
  - US-010-T2 Add reporting-line scope resolution (backend-agent).
  - US-010-T3 Add authorisation negative test suite (qa-agent).

**Related:** US-006, US-007, US-008, US-009, US-010, US-010-T1, US-010-T2, US-010-T3

- ⚠ No ticket status or commit is recorded for US-006 to US-010 or the US-010 sub-tasks.
- ⚠ No evidence exists that access control protects the delivered private manager notes (US-028).

### EPIC-003 · approved · source: plan:EPIC-003

Goals and OKRs. It contains 5 stories totalling 21 points. None has a delivery record.

- US-011 Create a personal goal: 5 points, backend-agent.
- US-012 Update goal progress and status manually: 3 points, backend-agent.
- US-013 Align a goal to a parent company or department goal: 5 points, backend-agent.
- US-014 HR maintains company and department goals: 3 points, backend-agent.
- US-015 Manager oversees goals across their reporting line: 5 points, frontend-agent.

**Related:** US-011, US-012, US-013, US-014, US-015

- ⚠ No ticket status or commit is recorded for US-011 to US-015.

### EPIC-004 · approved · source: plan:EPIC-004

Competency Questionnaire and Self-Review. It contains 5 stories totalling 28 points. US-017 and US-018 (13 points) are delivered. US-016, US-019 and US-020 have no delivery record.

- US-016 HR builds a competency questionnaire: 8 points, backend-agent. No delivery record. Sub-tasks:
  - US-016-T1 Add questionnaire schema with versioning (backend-agent).
  - US-016-T2 Implement questionnaire and rating-scale endpoints (backend-agent).
  - US-016-T3 Build questionnaire builder screen (frontend-agent).
- US-017 HR opens a review period for participants: 8 points, backend-agent. DELIVERED, commit 8c7a8271f0252d0ffa0a170731b5149e226e1849. Sub-tasks:
  - US-017-T1 Implement review period endpoints (backend-agent).
  - US-017-T2 Add self-review task fan-out job (backend-agent).
  - US-017-T3 Wire Redis queue and worker deployment (devops-agent).
  - US-017-T4 Build review period management screen (frontend-agent).
- US-018 Employee completes a self-review: 5 points, frontend-agent. DELIVERED, commit a01ce9e75e42eeb479cb499af55c2338fd938e80.
- US-019 Submitted reviews lock and record who changed what: 5 points, backend-agent. No delivery record.
- US-020 Manager sees a direct report's submitted self-review: 2 points, backend-agent. No delivery record.

**Related:** US-016, US-016-T1, US-016-T2, US-016-T3, US-017, US-017-T1, US-017-T2, US-017-T3, US-017-T4, US-018, US-019, US-020

- ⚠ US-017 and US-018 are delivered, but their questionnaire prerequisite (US-016) has no delivery record. It is unclear what questionnaire the self-review renders.
- ⚠ The status of individual sub-tasks (US-016-T1 to T3, US-017-T1 to T4) is not reported.
- ⚠ No ticket status or commit is recorded for US-016, US-019 or US-020.

### EPIC-005 · approved · source: plan:EPIC-005

Praise and Continuous Feedback. It contains 4 stories totalling 12 points. None has a delivery record.

- US-021 Give praise to a colleague: 3 points, backend-agent.
- US-022 Give written constructive feedback: 3 points, backend-agent.
- US-023 View feedback received and given: 3 points, frontend-agent.
- US-024 HR configures manager visibility of feedback: 3 points, backend-agent.

**Related:** US-021, US-022, US-023, US-024

- ⚠ No ticket status or commit is recorded for US-021 to US-024.

### EPIC-006 · approved · source: plan:EPIC-006

1:1 Check-Ins. It contains 4 stories totalling 12 points. US-027 and US-028 are delivered. US-025 and US-026 have no delivery record.

- US-025 Create a 1:1 record: 3 points, backend-agent. No delivery record.
- US-026 Build a shared agenda and talking points: 3 points, frontend-agent. No delivery record.
- US-027 Track action items from a 1:1: 3 points, backend-agent. DELIVERED, commit a01ce9e75e42eeb479cb499af55c2338fd938e80.
- US-028 Keep private manager notes: 3 points, backend-agent. DELIVERED, commit a01ce9e75e42eeb479cb499af55c2338fd938e80.

**Related:** US-025, US-026, US-027, US-028

- ⚠ Action items (US-027) and private notes (US-028) are delivered, but 1:1 record creation (US-025) has no delivery record. It is unclear what 1:1 these attach to.
- ⚠ No ticket status or commit is recorded for US-025 or US-026.

### EPIC-007 · approved · source: plan:EPIC-007

My Performance Dashboard and Employee Review Record. It contains 3 stories totalling 13 points. None has a delivery record.

- US-029 See my performance at a glance: 5 points, frontend-agent.
- US-030 Browse a single employee's review record: 5 points, backend-agent.
- US-031 See my own full review record: 3 points, frontend-agent.

**Related:** US-029, US-030, US-031

- ⚠ No ticket status or commit is recorded for US-029 to US-031.

### EPIC-008 · approved · source: plan:EPIC-008

Platform Foundations: Language, Scope Boundaries and Data Protection. It contains 4 stories totalling 10 points. None has a delivery record.

- US-032 English-only interface: 1 point, frontend-agent.
- US-033 No payment, billing or subscription functionality: 1 point, qa-agent.
- US-034 Responsive web access on any device: 3 points, frontend-agent.
- US-035 Sensitive data is protected and recoverable: 5 points, devops-agent. The Sprint 1 goal references an EU production environment with encryption and backups.

**Related:** US-032, US-033, US-034, US-035

- ⚠ No ticket status or commit is recorded for US-032 to US-035.
- ⚠ No evidence of EU environment, encryption or backup provisioning has been recorded.
- ⚠ US-032 is not referenced by any sprint goal.

### DEV-RUN · draft · source: dev:run

The development run is reported as completed, with 4 delivered tickets totalling 19 points. That is 4 of 35 planned stories and 19 of 139 planned points, all matching the Sprint 6 goal.

- Run status: completed.
- Delivered tickets:
  - US-017: commit 8c7a8271f0252d0ffa0a170731b5149e226e1849.
  - US-018: commit a01ce9e75e42eeb479cb499af55c2338fd938e80.
  - US-027: commit a01ce9e75e42eeb479cb499af55c2338fd938e80.
  - US-028: commit a01ce9e75e42eeb479cb499af55c2338fd938e80.
- Distinct commits: 2. Three stories share a single commit (a01ce9e7...).
- Delivered points: 19 (8 + 5 + 3 + 3).

**Related:** DEV-TICKET-US-017, DEV-TICKET-US-018, DEV-TICKET-US-027, DEV-TICKET-US-028, DEV-GAP-UNRECORDED, DEV-PLAN-V1

- ⚠ DISCREPANCY: the run status says 'completed', but only 4 of 35 planned stories have delivery records. It is unclear whether this run covered Sprint 6 only, or whether other stories were delivered without records.
- ⚠ Run start/end dates and the executing agents are not recorded.
- ⚠ No code review, PR or branch information was provided.
- ⚠ No build or test results were provided for any delivered ticket.
- ⚠ Three stories sharing one commit (a01ce9e7...) limits per-story traceability of code changes.

### DEV-TICKET-US-017 · draft · source: dev:US-017

HR opens a review period for participants. Reported delivered in commit 8c7a8271f0252d0ffa0a170731b5149e226e1849. Planned scope included endpoints, a self-review task fan-out job, a Redis queue/worker and a management screen.

- Ticket: US-017 HR opens a review period for participants.
- Status: delivered.
- Commit: 8c7a8271f0252d0ffa0a170731b5149e226e1849.
- Planned: 8 points, backend-agent.
- Planned sub-tasks:
  - T1 review period endpoints (backend).
  - T2 self-review task fan-out job (backend).
  - T3 Redis queue and worker deployment (devops).
  - T4 review period management screen (frontend).

**Related:** US-017, US-017-T1, US-017-T2, US-017-T3, US-017-T4, US-016, US-018, EPIC-004, DEV-SPRINT-6

- ⚠ Completion of each sub-task is not reported individually.
- ⚠ Whether the Redis queue and worker (T3) were actually deployed is not recorded.
- ⚠ Depends on US-016 (questionnaire), which has no delivery record.
- ⚠ No delivery date, reviewer or test result is recorded.

### DEV-TICKET-US-018 · draft · source: dev:US-018

Employee completes a self-review. Reported delivered in commit a01ce9e75e42eeb479cb499af55c2338fd938e80, which is shared with US-027 and US-028.

- Ticket: US-018 Employee completes a self-review.
- Status: delivered.
- Commit: a01ce9e75e42eeb479cb499af55c2338fd938e80 (shared with US-027 and US-028).
- Planned: 5 points, frontend-agent.

**Related:** US-018, US-017, US-016, US-019, EPIC-004, DEV-SPRINT-6

- ⚠ Depends on US-016 (questionnaire), which has no delivery record.
- ⚠ Post-submission locking (US-019) has no delivery record.
- ⚠ No delivery date, reviewer or test result is recorded.

### DEV-TICKET-US-027 · draft · source: dev:US-027

Track action items from a 1:1. Reported delivered in commit a01ce9e75e42eeb479cb499af55c2338fd938e80, which is shared with US-018 and US-028.

- Ticket: US-027 Track action items from a 1:1.
- Status: delivered.
- Commit: a01ce9e75e42eeb479cb499af55c2338fd938e80 (shared).
- Planned: 3 points, backend-agent.

**Related:** US-027, US-025, EPIC-006, DEV-SPRINT-6

- ⚠ Depends on US-025 (Create a 1:1 record), which has no delivery record.
- ⚠ No delivery date, reviewer or test result is recorded.

### DEV-TICKET-US-028 · draft · source: dev:US-028

Keep private manager notes. Reported delivered in commit a01ce9e75e42eeb479cb499af55c2338fd938e80, which is shared with US-018 and US-027.

- Ticket: US-028 Keep private manager notes.
- Status: delivered.
- Commit: a01ce9e75e42eeb479cb499af55c2338fd938e80 (shared).
- Planned: 3 points, backend-agent.

**Related:** US-028, US-025, US-010, EPIC-006, DEV-SPRINT-6

- ⚠ Privacy of these notes relies on the authorisation work in US-010, which has no delivery record.
- ⚠ Depends on US-025 (Create a 1:1 record), which has no delivery record.
- ⚠ No delivery date, reviewer or test result is recorded.

### DEV-GAP-UNRECORDED · draft

31 planned stories (120 points) have no ticket, status or commit in the development input. Delivery state is unknown for Sprints 1 to 5, 7 and 8.

Stories with no delivery record, grouped by inferred sprint:
- Sprint 1: US-001, US-002, US-007, US-035.
- Sprint 2: US-003, US-004, US-005, US-006, US-008.
- Sprint 3: US-009, US-010, US-011, US-012.
- Sprint 4: US-013, US-014, US-015, US-021, US-024.
- Sprint 5: US-016, US-022, US-023, US-025, US-026.
- Sprint 7: US-019, US-020, US-029, US-030, US-031.
- Sprint 8: US-033, US-034.
- No sprint referenced: US-032.

**Related:** US-001, US-002, US-003, US-004, US-005, US-006, US-007, US-008, US-009, US-010, US-011, US-012, US-013, US-014, US-015, US-016, US-019, US-020, US-021, US-022, US-023, US-024, US-025, US-026, US-029, US-030, US-031, US-032, US-033, US-034, US-035

- ⚠ Delivery status for these 31 stories must be confirmed. They are not documented as built.
- ⚠ Several of these stories are prerequisites of the delivered stories: US-001, US-003, US-007, US-010, US-016 and US-025.
<!-- sdlc:auto:end narrative -->
