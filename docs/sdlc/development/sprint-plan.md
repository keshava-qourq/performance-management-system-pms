# Sprint Plan

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start sprints -->
## Sprint 1: Sprint 1

EU production environment with encryption and backups, departments/job titles, employee records and email/password sign-in

Capacity: 20 points · Committed: 19

| Key | Type | Title | Points | Role | Depends on |
|---|---|---|---|---|---|
| US-001 | Story | HR creates and maintains employee records | 5 | backend-agent | US-002 |
| US-002 | Story | HR maintains departments and job titles | 3 | backend-agent | — |
| US-007 | Story | Employee signs in and out | 5 | backend-agent | US-001 |
| US-032 | Story | English-only interface | 1 | frontend-agent | — |
| US-035 | Story | Sensitive data is protected and recoverable | 5 | devops-agent | — |

## Sprint 2: Sprint 2

Complete org model and account lifecycle: reporting lines, roles, invitations, password rules/reset, deactivation

Capacity: 20 points · Committed: 19

| Key | Type | Title | Points | Role | Depends on |
|---|---|---|---|---|---|
| US-003 | Story | HR sets reporting lines | 5 | backend-agent | US-001 |
| US-004 | Story | HR assigns system roles | 3 | backend-agent | US-001, US-007 |
| US-005 | Story | HR deactivates a leaver | 3 | backend-agent | US-003, US-007 |
| US-006 | Story | HR invites an employee to create an account | 5 | backend-agent | US-001, US-007 |
| US-008 | Story | Password rules and reset | 3 | backend-agent | US-006 |

## Sprint 3: Sprint 3

Server-side role and reporting-line authorisation, personal profile, personal goals with manual progress and status

Capacity: 20 points · Committed: 19

| Key | Type | Title | Points | Role | Depends on |
|---|---|---|---|---|---|
| US-009 | Story | Employee maintains a personal profile | 3 | frontend-agent | US-007 |
| US-010 | Story | Role-based least-privilege access is enforced | 8 | security-agent | US-003, US-004, US-007 |
| ↳ US-010-T1 | Task | Implement authorisation policy module | — | security-agent | — |
| ↳ US-010-T2 | Task | Add reporting-line scope resolution | — | backend-agent | — |
| ↳ US-010-T3 | Task | Add authorisation negative test suite | — | qa-agent | — |
| US-011 | Story | Create a personal goal | 5 | backend-agent | US-010 |
| US-012 | Story | Update goal progress and status manually | 3 | backend-agent | US-011 |

## Sprint 4: Sprint 4

Goal alignment, company/department goals, manager team goals view, praise and the manager feedback-visibility setting

Capacity: 20 points · Committed: 19

| Key | Type | Title | Points | Role | Depends on |
|---|---|---|---|---|---|
| US-013 | Story | Align a goal to a parent company or department goal | 5 | backend-agent | US-014 |
| US-014 | Story | HR maintains company and department goals | 3 | backend-agent | US-011, US-002 |
| US-015 | Story | Manager oversees goals across their reporting line | 5 | frontend-agent | US-011, US-010 |
| US-021 | Story | Give praise to a colleague | 3 | backend-agent | US-010 |
| US-024 | Story | HR configures manager visibility of feedback | 3 | backend-agent | US-021 |

## Sprint 5: Sprint 5

Competency questionnaire builder, constructive feedback and feedback lists, 1:1 creation and shared agenda

Capacity: 20 points · Committed: 20

| Key | Type | Title | Points | Role | Depends on |
|---|---|---|---|---|---|
| US-016 | Story | HR builds a competency questionnaire | 8 | backend-agent | US-010 |
| ↳ US-016-T1 | Task | Add questionnaire schema with versioning | — | backend-agent | — |
| ↳ US-016-T2 | Task | Implement questionnaire and rating-scale endpoints | — | backend-agent | — |
| ↳ US-016-T3 | Task | Build questionnaire builder screen | — | frontend-agent | — |
| US-022 | Story | Give written constructive feedback | 3 | backend-agent | US-021, US-011 |
| US-023 | Story | View feedback received and given | 3 | frontend-agent | US-021 |
| US-025 | Story | Create a 1:1 record | 3 | backend-agent | US-010 |
| US-026 | Story | Build a shared agenda and talking points | 3 | frontend-agent | US-025 |

## Sprint 6: Sprint 6

Review periods with background task fan-out, self-review completion, 1:1 action items and private notes

Capacity: 20 points · Committed: 19

| Key | Type | Title | Points | Role | Depends on |
|---|---|---|---|---|---|
| US-017 | Story | HR opens a review period for participants | 8 | backend-agent | US-016 |
| ↳ US-017-T1 | Task | Implement review period endpoints | — | backend-agent | — |
| ↳ US-017-T2 | Task | Add self-review task fan-out job | — | backend-agent | — |
| ↳ US-017-T3 | Task | Wire Redis queue and worker deployment | — | devops-agent | — |
| ↳ US-017-T4 | Task | Build review period management screen | — | frontend-agent | — |
| US-018 | Story | Employee completes a self-review | 5 | frontend-agent | US-017 |
| US-027 | Story | Track action items from a 1:1 | 3 | backend-agent | US-025 |
| US-028 | Story | Keep private manager notes | 3 | backend-agent | US-025 |

## Sprint 7: Sprint 7

Review locking and history, manager reading of self-reviews, performance dashboard and review records

Capacity: 20 points · Committed: 20

| Key | Type | Title | Points | Role | Depends on |
|---|---|---|---|---|---|
| US-019 | Story | Submitted reviews lock and record who changed what | 5 | backend-agent | US-018 |
| US-020 | Story | Manager sees a direct report's submitted self-review | 2 | backend-agent | US-018, US-010 |
| US-029 | Story | See my performance at a glance | 5 | frontend-agent | US-012, US-018, US-023, US-027 |
| US-030 | Story | Browse a single employee's review record | 5 | backend-agent | US-019, US-024, US-012 |
| US-031 | Story | See my own full review record | 3 | frontend-agent | US-030 |

## Sprint 8: Sprint 8

Verify responsive layout across devices and the absence of any payment functionality

Capacity: 20 points · Committed: 4

| Key | Type | Title | Points | Role | Depends on |
|---|---|---|---|---|---|
| US-033 | Story | No payment, billing or subscription functionality | 1 | qa-agent | US-029 |
| US-034 | Story | Responsive web access on any device | 3 | frontend-agent | US-029, US-026, US-023, US-015 |

## Unscheduled

_Nothing unscheduled._
<!-- sdlc:auto:end sprints -->
