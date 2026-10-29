# Development

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start narrative -->
### PLAN-V1 · approved · source: plan:v1

The development plan for PMS is approved at version 1. It defines 8 sprints of capacity 20 covering 8 epics and 35 user stories (US-001 to US-035). Story points total 139 against 160 points of total sprint capacity.

- Plan status: approved; version: 1.
- Sprints: 8, each with capacity = 20 (total capacity 160).
- Epics: EPIC-001 to EPIC-008. Epics have no points and no assigned role.
- Stories: 35 (US-001 to US-035). Total story points = 139.
- Tasks: US-010-T1/T2/T3, US-016-T1/T2/T3 and US-017-T1/T2/T3/T4. Tasks carry no points.
- Agent roles used: backend-agent, frontend-agent, security-agent, qa-agent, devops-agent.
- Points by epic:
  - EPIC-001: 19
  - EPIC-002: 24
  - EPIC-003: 21
  - EPIC-004: 28
  - EPIC-005: 12
  - EPIC-006: 12
  - EPIC-007: 13
  - EPIC-008: 10

**Related:** SPRINT-1, SPRINT-2, SPRINT-3, SPRINT-4, SPRINT-5, SPRINT-6, SPRINT-7, SPRINT-8, EPIC-001, EPIC-002, EPIC-003, EPIC-004, EPIC-005, EPIC-006, EPIC-007, EPIC-008

- ⚠ No approver, approval date or plan creation date is recorded.
- ⚠ The plan does not explicitly assign items to sprints. Sprint mappings in this documentation are inferred from sprint goal text and need confirmation.
- ⚠ No sprint start or end dates are given.
- ⚠ User guide not written: the application is not recorded as built (no completed development work in the input), so there is no confirmed usage to document.

### DEV-STATUS · draft

No development execution has been recorded. Progress of any story or task cannot be documented.

- The input contains only the approved plan.
- Nothing is reported for any of the following:
  - ticket or story status
  - commits or pull requests
  - code reviews
  - completed sprints
  - burndown or velocity
  - blockers
  - deviations from the plan

**Related:** PLAN-V1

- ⚠ Development phase has no execution records yet. Need per-story status, links to code changes, and sprint completion outcomes.
- ⚠ Assignees are given only as agent roles. No individual owners are recorded.

### SPRINT-1 · approved · source: plan:SPRINT-1

Sprint 1 lays the foundations: the EU production environment with encryption and backups, departments and job titles, employee records, and email/password sign-in.

- Goal: EU production environment with encryption and backups, departments/job titles, employee records and email/password sign-in.
- Capacity: 20.
- Inferred items:
  - US-035 (5 pts, devops-agent)
  - US-002 (3 pts, backend-agent)
  - US-001 (5 pts, backend-agent)
  - US-007 (5 pts, backend-agent)
- Inferred load: 18 points.

**Related:** US-035, US-002, US-001, US-007, EPIC-001, EPIC-002, EPIC-008

- ⚠ The goal mentions sign-in only. It is unclear whether sign-out (part of US-007) is in scope for this sprint.
- ⚠ No sprint status or outcome is recorded.

### SPRINT-2 · approved · source: plan:SPRINT-2

Sprint 2 completes the org model and the account lifecycle: reporting lines, roles, invitations, password rules and reset, and deactivation.

- Goal: Complete org model and account lifecycle: reporting lines, roles, invitations, password rules/reset, deactivation.
- Capacity: 20.
- Inferred items:
  - US-003 (5 pts)
  - US-004 (3 pts)
  - US-006 (5 pts)
  - US-008 (3 pts)
  - US-005 (3 pts)
  - All assigned to backend-agent.
- Inferred load: 19 points.

**Related:** US-003, US-004, US-006, US-008, US-005, EPIC-001, EPIC-002

- ⚠ No sprint status or outcome is recorded.

### SPRINT-3 · approved · source: plan:SPRINT-3

Sprint 3 delivers server-side authorisation based on role and reporting line, the personal profile, and personal goals with manual progress and status.

- Goal: Server-side role and reporting-line authorisation, personal profile, personal goals with manual progress and status.
- Capacity: 20.
- Inferred items:
  - US-010 (8 pts, security-agent), with tasks:
    - T1: authorisation policy module (security-agent)
    - T2: reporting-line scope resolution (backend-agent)
    - T3: authorisation negative test suite (qa-agent)
  - US-009 (3 pts, frontend-agent)
  - US-011 (5 pts, backend-agent)
  - US-012 (3 pts, backend-agent)
- Inferred load: 19 points.

**Related:** US-010, US-010-T1, US-010-T2, US-010-T3, US-009, US-011, US-012, EPIC-002, EPIC-003

- ⚠ Role-based authorisation (US-010) is planned after roles (Sprint 2) and employee data (Sprint 1) exist. The input does not say how access is restricted before Sprint 3, or whether production data is loaded before then.
- ⚠ No sprint status or outcome is recorded.

### SPRINT-4 · approved · source: plan:SPRINT-4

Sprint 4 adds goal alignment, company and department goals, the manager team-goals view, praise, and the manager feedback-visibility setting.

- Goal: Goal alignment, company/department goals, manager team goals view, praise and the manager feedback-visibility setting.
- Capacity: 20.
- Inferred items:
  - US-013 (5 pts, backend-agent)
  - US-014 (3 pts, backend-agent)
  - US-015 (5 pts, frontend-agent)
  - US-021 (3 pts, backend-agent)
  - US-024 (3 pts, backend-agent)
- Inferred load: 19 points.

**Related:** US-013, US-014, US-015, US-021, US-024, EPIC-003, EPIC-005

- ⚠ No sprint status or outcome is recorded.

### SPRINT-5 · approved · source: plan:SPRINT-5

Sprint 5 delivers the competency questionnaire builder, constructive feedback and feedback lists, and 1:1 creation with a shared agenda.

- Goal: Competency questionnaire builder, constructive feedback and feedback lists, 1:1 creation and shared agenda.
- Capacity: 20.
- Inferred items:
  - US-016 (8 pts, backend-agent), with tasks:
    - T1: questionnaire schema with versioning (backend-agent)
    - T2: questionnaire and rating-scale endpoints (backend-agent)
    - T3: questionnaire builder screen (frontend-agent)
  - US-022 (3 pts, backend-agent)
  - US-023 (3 pts, frontend-agent)
  - US-025 (3 pts, backend-agent)
  - US-026 (3 pts, frontend-agent)
- Inferred load: 20 points, which is exactly at capacity.

**Related:** US-016, US-016-T1, US-016-T2, US-016-T3, US-022, US-023, US-025, US-026, EPIC-004, EPIC-005, EPIC-006

- ⚠ The sprint is planned at full capacity with no buffer.
- ⚠ No sprint status or outcome is recorded.

### SPRINT-6 · approved · source: plan:SPRINT-6

Sprint 6 delivers review periods with background fan-out of self-review tasks, self-review completion, and 1:1 action items and private notes.

- Goal: Review periods with background task fan-out, self-review completion, 1:1 action items and private notes.
- Capacity: 20.
- Inferred items:
  - US-017 (8 pts, backend-agent), with tasks:
    - T1: review period endpoints (backend-agent)
    - T2: self-review task fan-out job (backend-agent)
    - T3: wire Redis queue and worker deployment (devops-agent)
    - T4: review period management screen (frontend-agent)
  - US-018 (5 pts, frontend-agent)
  - US-027 (3 pts, backend-agent)
  - US-028 (3 pts, backend-agent)
- Inferred load: 19 points.

**Related:** US-017, US-017-T1, US-017-T2, US-017-T3, US-017-T4, US-018, US-027, US-028, EPIC-004, EPIC-006

- ⚠ No sprint status or outcome is recorded.

### SPRINT-7 · approved · source: plan:SPRINT-7

Sprint 7 delivers review locking and change history, manager reading of self-reviews, the performance dashboard, and review records.

- Goal: Review locking and history, manager reading of self-reviews, performance dashboard and review records.
- Capacity: 20.
- Inferred items:
  - US-019 (5 pts, backend-agent)
  - US-020 (2 pts, backend-agent)
  - US-029 (5 pts, frontend-agent)
  - US-030 (5 pts, backend-agent)
  - US-031 (3 pts, frontend-agent)
- Inferred load: 20 points, which is exactly at capacity.

**Related:** US-019, US-020, US-029, US-030, US-031, EPIC-004, EPIC-007

- ⚠ Review locking and history (US-019) is planned one sprint after self-review completion (US-018, Sprint 6). The input does not say whether self-reviews submitted between those sprints would be locked and audited.
- ⚠ The sprint is planned at full capacity with no buffer.
- ⚠ No sprint status or outcome is recorded.

### SPRINT-8 · approved · source: plan:SPRINT-8

Sprint 8 is a verification sprint. It checks the responsive layout across devices and confirms that no payment functionality exists.

- Goal: Verify responsive layout across devices and the absence of any payment functionality.
- Capacity: 20.
- Inferred items:
  - US-034 (3 pts, frontend-agent)
  - US-033 (1 pt, qa-agent)
- Inferred load: 4 points.

**Related:** US-034, US-033, EPIC-008

- ⚠ Only 4 of 20 capacity points are mapped. The use of the remaining capacity is not stated.
- ⚠ US-032 (English-only interface) does not appear in this or any other sprint goal. Its scheduling is unknown.
- ⚠ No sprint status or outcome is recorded.

### EPIC-001 · approved · source: plan:EPIC-001

This epic covers employee records, org structure and reporting lines, all maintained by HR. It has 5 stories totalling 19 points, all assigned to backend-agent.

- US-001: HR creates and maintains employee records (5 pts, backend-agent).
- US-002: HR maintains departments and job titles (3 pts, backend-agent).
- US-003: HR sets reporting lines (5 pts, backend-agent).
- US-004: HR assigns system roles (3 pts, backend-agent).
- US-005: HR deactivates a leaver (3 pts, backend-agent).

**Related:** US-001, US-002, US-003, US-004, US-005, SPRINT-1, SPRINT-2

- ⚠ No implementation status is recorded for any story.

### EPIC-002 · approved · source: plan:EPIC-002

This epic covers account access, sign-in, the personal profile and least-privilege authorisation. It has 5 stories totalling 24 points.

- US-006: HR invites an employee to create an account (5 pts, backend-agent).
- US-007: Employee signs in and out (5 pts, backend-agent).
- US-008: Password rules and reset (3 pts, backend-agent).
- US-009: Employee maintains a personal profile (3 pts, frontend-agent).
- US-010: Role-based least-privilege access is enforced (8 pts, security-agent).
  - T1: Implement authorisation policy module (security-agent).
  - T2: Add reporting-line scope resolution (backend-agent).
  - T3: Add authorisation negative test suite (qa-agent).

**Related:** US-006, US-007, US-008, US-009, US-010, US-010-T1, US-010-T2, US-010-T3, SPRINT-1, SPRINT-2, SPRINT-3

- ⚠ No implementation status is recorded for any story or task.

### EPIC-003 · approved · source: plan:EPIC-003

This epic covers goals and OKRs: personal goals, manual progress tracking, alignment to company and department goals, and manager oversight. It has 5 stories totalling 21 points.

- US-011: Create a personal goal (5 pts, backend-agent).
- US-012: Update goal progress and status manually (3 pts, backend-agent).
- US-013: Align a goal to a parent company or department goal (5 pts, backend-agent).
- US-014: HR maintains company and department goals (3 pts, backend-agent).
- US-015: Manager oversees goals across their reporting line (5 pts, frontend-agent).

**Related:** US-011, US-012, US-013, US-014, US-015, SPRINT-3, SPRINT-4

- ⚠ No implementation status is recorded for any story.

### EPIC-004 · approved · source: plan:EPIC-004

This epic covers the competency questionnaire and the self-review cycle: questionnaire builder, review periods, self-review completion, locking and history, and manager visibility. It has 5 stories totalling 28 points, the largest epic.

- US-016: HR builds a competency questionnaire (8 pts, backend-agent).
  - T1: Add questionnaire schema with versioning (backend-agent).
  - T2: Implement questionnaire and rating-scale endpoints (backend-agent).
  - T3: Build questionnaire builder screen (frontend-agent).
- US-017: HR opens a review period for participants (8 pts, backend-agent).
  - T1: Implement review period endpoints (backend-agent).
  - T2: Add self-review task fan-out job (backend-agent).
  - T3: Wire Redis queue and worker deployment (devops-agent).
  - T4: Build review period management screen (frontend-agent).
- US-018: Employee completes a self-review (5 pts, frontend-agent).
- US-019: Submitted reviews lock and record who changed what (5 pts, backend-agent).
- US-020: Manager sees a direct report's submitted self-review (2 pts, backend-agent).

**Related:** US-016, US-016-T1, US-016-T2, US-016-T3, US-017, US-017-T1, US-017-T2, US-017-T3, US-017-T4, US-018, US-019, US-020, SPRINT-5, SPRINT-6, SPRINT-7

- ⚠ No implementation status is recorded for any story or task.

### EPIC-005 · approved · source: plan:EPIC-005

This epic covers praise and continuous feedback, including HR control over whether managers can see feedback. It has 4 stories totalling 12 points.

- US-021: Give praise to a colleague (3 pts, backend-agent).
- US-022: Give written constructive feedback (3 pts, backend-agent).
- US-023: View feedback received and given (3 pts, frontend-agent).
- US-024: HR configures manager visibility of feedback (3 pts, backend-agent).

**Related:** US-021, US-022, US-023, US-024, SPRINT-4, SPRINT-5

- ⚠ No implementation status is recorded for any story.

### EPIC-006 · approved · source: plan:EPIC-006

This epic covers 1:1 check-ins: 1:1 records, a shared agenda, action items, and private manager notes. It has 4 stories totalling 12 points.

- US-025: Create a 1:1 record (3 pts, backend-agent).
- US-026: Build a shared agenda and talking points (3 pts, frontend-agent).
- US-027: Track action items from a 1:1 (3 pts, backend-agent).
- US-028: Keep private manager notes (3 pts, backend-agent).

**Related:** US-025, US-026, US-027, US-028, SPRINT-5, SPRINT-6

- ⚠ No implementation status is recorded for any story.

### EPIC-007 · approved · source: plan:EPIC-007

This epic covers the personal performance dashboard and employee review records. It has 3 stories totalling 13 points.

- US-029: See my performance at a glance (5 pts, frontend-agent).
- US-030: Browse a single employee's review record (5 pts, backend-agent).
- US-031: See my own full review record (3 pts, frontend-agent).

**Related:** US-029, US-030, US-031, SPRINT-7

- ⚠ No implementation status is recorded for any story.

### EPIC-008 · approved · source: plan:EPIC-008

This epic covers platform foundations: English-only language, the no-payments scope boundary, responsive access, and protection and recovery of sensitive data. It has 4 stories totalling 10 points.

- US-032: English-only interface (1 pt, frontend-agent).
- US-033: No payment, billing or subscription functionality (1 pt, qa-agent).
- US-034: Responsive web access on any device (3 pts, frontend-agent).
- US-035: Sensitive data is protected and recoverable (5 pts, devops-agent). Inferred to Sprint 1 (EU environment with encryption and backups).

**Related:** US-032, US-033, US-034, US-035, SPRINT-1, SPRINT-8

- ⚠ US-032 is not referenced by any sprint goal, so it may be unscheduled.
- ⚠ No implementation status is recorded for any story.
<!-- sdlc:auto:end narrative -->
