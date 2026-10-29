# Traceability Matrix

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start legend -->
Built from recorded links, not written by a model: requirement key → plan item (`source_stable_key`) → development ticket (`stable_key`) → the ticket's test steps → the last live deployment that started after the work finished. **AC tests** counts the story's acceptance criteria that have a test case, and those whose test cases all passed in the latest finished E2E run.
<!-- sdlc:auto:end legend -->

<!-- sdlc:auto:start matrix -->
| Requirement | Epic | Title | Plan items | Sprint | Design | Code | Commits | Ticket | Tests | AC tests | Deployed |
|---|---|---|---|---|---|---|---|---|---|---|---|
| US-001 | EPIC-001 | HR creates and maintains employee records | US-001 | 1 | GET /employees, PATCH /employees/{id}, POST /employees, database, department, employee, job_title, org, web_app | backend/app/main.py, backend/app/routers/employees.py, backend/tests/integration/test_employees.py, backend/tests/integration/test_employees_qa.py, frontend/e2e/employees.spec.ts +4 more | 4a98e5d | delivered | not run | 0/4 tested · 0/4 passing | 66559e219ee3 |
| US-002 | EPIC-001 | HR maintains departments and job titles | US-002 | 1 | GET /departments, GET /job-titles, database, department, job_title, org, web_app | — | — | skipped | not run | 0/3 tested · 0/3 passing | — |
| US-003 | EPIC-001 | HR sets reporting lines | US-003 | 2 | PUT /employees/{id}/manager, employee, org, web_app | — | — | not started | not run | 0/4 tested · 0/4 passing | — |
| US-004 | EPIC-001 | HR assigns system roles | US-004 | 2 | PATCH /employees/{id}, auth, employee, org | — | — | not started | not run | 0/3 tested · 0/3 passing | — |
| US-005 | EPIC-001 | HR deactivates a leaver | US-005 | 2 | POST /employees/{id}/deactivate, auth, employee, org, session, web_app | — | — | not started | not run | 0/3 tested · 0/3 passing | — |
| US-006 | EPIC-002 | HR invites an employee to create an account | US-006 | 2 | DELETE /employees/{id}/invitations, GET /auth/tokens/{token}, POST /auth/tokens/{token}/accept, POST /employees/{id}/invitations, account_token, auth, employee, org, user_credential, web_app | — | — | not started | not run | 0/4 tested · 0/4 passing | — |
| US-007 | EPIC-002 | Employee signs in and out | US-007 | 1 | GET /auth/me, POST /auth/login, POST /auth/logout, audit, audit_event, auth, session, system_setting, user_credential, web_app | backend/alembic/versions/0001_auth.py, backend/app/auth.py, backend/app/main.py, backend/app/models.py, backend/app/routers/auth.py +14 more | 2f2069e | delivered | not run | 0/5 tested · 0/5 passing | 66559e219ee3 |
| US-008 | EPIC-002 | Password rules and reset | US-008 | 2 | POST /auth/password, POST /employees/{id}/password-resets, account_token, auth, system_setting, user_credential, web_app | — | — | not started | not run | 0/4 tested · 0/4 passing | — |
| US-009 | EPIC-002 | Employee maintains a personal profile | US-009 | 3 | GET /me/profile, PATCH /me/profile, PUT /me/profile/photo, employee, file_store, org, web_app | — | — | not started | not run | 0/3 tested · 0/3 passing | — |
| US-010 | EPIC-002 | Role-based least-privilege access is enforced | US-010, US-010-T1, US-010-T2, US-010-T3 | 3 | access_policy, auth, employee, org, session | — | — | not started | not run | 0/4 tested · 0/4 passing | — |
| US-011 | EPIC-003 | Create a personal goal | US-011 | 3 | GET /goals, GET /goals/{id}, PATCH /goals/{id}, POST /goals, audit, audit_event, goal, goals, web_app | — | — | not started | not run | 0/5 tested · 0/5 passing | — |
| US-012 | EPIC-003 | Update goal progress and status manually | US-012 | 3 | POST /goals/{id}/progress, audit, audit_event, goal, goal_progress_update, goals, web_app | — | — | not started | not run | 0/5 tested · 0/5 passing | — |
| US-013 | EPIC-003 | Align a goal to a parent company or department goal | US-013 | 4 | DELETE /goals/{id}, GET /goals/parent-options, GET /goals/{id}, access_policy, department, goal, goals, web_app | — | — | not started | not run | 0/4 tested · 0/4 passing | — |
| US-014 | EPIC-003 | HR maintains company and department goals | US-014 | 4 | POST /goals, department, goal, goals, web_app | — | — | not started | not run | 0/3 tested · 0/3 passing | — |
| US-015 | EPIC-003 | Manager oversees goals across their reporting line | US-015 | 4 | GET /team/goals, POST /goals/{id}/comments, access_policy, goal, goal_comment, goals, web_app | — | — | not started | not run | 0/3 tested · 0/3 passing | — |
| US-016 | EPIC-004 | HR builds a competency questionnaire | US-016, US-016-T1, US-016-T2, US-016-T3 | 5 | POST /questionnaires, POST /questionnaires/{id}/publish, POST /rating-scales, competency, database, question, questionnaire_template, rating_scale, reviews, web_app | — | — | not started | not run | 0/5 tested · 0/5 passing | — |
| US-017 | EPIC-004 | HR opens a review period for participants | US-017, US-017-T1, US-017-T2, US-017-T3, US-017-T4 | 6 | DELETE /review-periods/{id}/participants/{employee_id}, GET /review-periods/{id}/status, POST /review-periods, POST /review-periods/{id}/close, POST /review-periods/{id}/open, queue, review_participant, review_period, reviews, self_review, web_app, worker | — | — | not started | not run | 0/4 tested · 0/4 passing | — |
| US-018 | EPIC-004 | Employee completes a self-review | US-018 | 6 | GET /self-reviews/{id}, POST /self-reviews/{id}/submit, PUT /self-reviews/{id}/answers, review_period, reviews, self_review, self_review_answer, web_app | — | — | not started | not run | 0/5 tested · 0/5 passing | — |
| US-019 | EPIC-004 | Submitted reviews lock and record who changed what | US-019 | 7 | GET /self-reviews/{id}, POST /self-reviews/{id}/reopen, audit, audit_event, reviews, self_review, self_review_history, web_app | — | — | not started | not run | 0/3 tested · 0/3 passing | — |
| US-020 | EPIC-004 | Manager sees a direct report's submitted self-review | US-020 | 7 | GET /self-reviews/{id}, access_policy, reviews, self_review, self_review_answer | — | — | not started | not run | 0/3 tested · 0/3 passing | — |
| US-021 | EPIC-005 | Give praise to a colleague | US-021 | 4 | employee, feedback, web_app | — | — | not started | not run | 0/4 tested · 0/4 passing | — |
| US-022 | EPIC-005 | Give written constructive feedback | US-022 | 5 | audit, audit_event, feedback, goal, goals, web_app | — | — | not started | not run | 0/3 tested · 0/3 passing | — |
| US-023 | EPIC-005 | View feedback received and given | US-023 | 5 | feedback, web_app | — | — | not started | not run | 0/4 tested · 0/4 passing | — |
| US-024 | EPIC-005 | HR configures manager visibility of feedback | US-024 | 4 | access_policy, feedback, system_setting, web_app | — | — | not started | not run | 0/3 tested · 0/3 passing | — |
| US-025 | EPIC-006 | Create a 1:1 record | US-025 | 5 | employee, one_on_one, one_on_ones, web_app | — | — | not started | not run | 0/4 tested · 0/4 passing | — |
| US-026 | EPIC-006 | Build a shared agenda and talking points | US-026 | 5 | one_on_one, one_on_ones, talking_point, web_app | — | — | not started | not run | 0/4 tested · 0/4 passing | — |
| US-027 | EPIC-006 | Track action items from a 1:1 | US-027 | 6 | action_item, one_on_one, one_on_ones, web_app | — | — | not started | not run | 0/4 tested · 0/4 passing | — |
| US-028 | EPIC-006 | Keep private manager notes | US-028 | 6 | access_policy, one_on_one_private_note, one_on_ones, system_setting, web_app | — | — | not started | not run | 0/3 tested · 0/3 passing | — |
| US-029 | EPIC-007 | See my performance at a glance | US-029 | 7 | action_item, dashboard, feedback, goal, self_review, web_app | — | — | not started | not run | 0/4 tested · 0/4 passing | — |
| US-030 | EPIC-007 | Browse a single employee's review record | US-030 | 7 | access_policy, audit, audit_event, dashboard, feedback, goal, review_period, self_review, web_app | — | — | not started | not run | 0/5 tested · 0/5 passing | — |
| US-031 | EPIC-007 | See my own full review record | US-031 | 7 | dashboard, feedback, goal, review_period, self_review, web_app | — | — | not started | not run | 0/2 tested · 0/2 passing | — |
| US-032 | EPIC-008 | English-only interface | US-032 | 1 | web_app | frontend/src/App.i18n.test.tsx, frontend/src/App.tsx, frontend/src/lib/dateFormat.test.ts, frontend/src/lib/dateFormat.ts, frontend/src/main.tsx +2 more | 3d14a91 | delivered | not run | 0/2 tested · 0/2 passing | 66559e219ee3 |
| US-033 | EPIC-008 | No payment, billing or subscription functionality | US-033 | 8 | — | — | — | not started | not run | 0/3 tested · 0/3 passing | — |
| US-034 | EPIC-008 | Responsive web access on any device | US-034 | 8 | web_app | — | — | not started | not run | 0/2 tested · 0/2 passing | — |
| US-035 | EPIC-008 | Sensitive data is protected and recoverable | US-035 | 1 | database, file_store | — | — | skipped | not run | 0/5 tested · 0/5 passing | — |
<!-- sdlc:auto:end matrix -->
