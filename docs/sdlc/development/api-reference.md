# API Reference

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start endpoints -->
| Method | Path | Handler | Source | Summary |
|---|---|---|---|---|
| POST | /action-items/{item_id}/complete | complete_action_item | `backend/app/routers/one_on_ones.py:341` | — |
| POST | /auth/login | login | `backend/app/routers/auth.py:32` | — |
| POST | /auth/logout | logout | `backend/app/routers/auth.py:73` | — |
| GET | /auth/me | me | `backend/app/routers/auth.py:180` | — |
| POST | /auth/password | change_password | `backend/app/routers/auth.py:106` | — |
| GET | /auth/tokens/{token} | check_token | `backend/app/routers/auth.py:139` | — |
| POST | /auth/tokens/{token}/accept | accept_token | `backend/app/routers/auth.py:147` | Set a password from an invitation or reset link. Single-use (NFR-005). |
| GET | /departments | list_departments | `backend/app/routers/employees.py:436` | — |
| GET | /employees | list_employees | `backend/app/routers/employees.py:123` | — |
| POST | /employees | create_employee | `backend/app/routers/employees.py:161` | — |
| PATCH | /employees/{employee_id} | update_employee | `backend/app/routers/employees.py:178` | — |
| POST | /employees/{employee_id}/deactivate | deactivate | `backend/app/routers/employees.py:254` | — |
| DELETE | /employees/{employee_id}/invitations | revoke_invitation | `backend/app/routers/employees.py:349` | — |
| POST | /employees/{employee_id}/invitations | issue_invitation | `backend/app/routers/employees.py:321` | — |
| PUT | /employees/{employee_id}/manager | set_manager | `backend/app/routers/employees.py:216` | — |
| POST | /employees/{employee_id}/password-resets | issue_password_reset | `backend/app/routers/employees.py:373` | — |
| GET | /employees/{employee_id}/record | employee_record | `backend/app/routers/employees.py:398` | — |
| GET | /feedback | list_feedback | `backend/app/routers/feedback.py:102` | — |
| POST | /feedback | send_feedback | `backend/app/routers/feedback.py:50` | — |
| GET | /feedback/audience | audience | `backend/app/routers/feedback.py:81` | — |
| GET | /goals | list_goals | `backend/app/routers/goals.py:295` | — |
| POST | /goals | create_goal | `backend/app/routers/goals.py:324` | — |
| GET | /goals/parent-options | parent_options | `backend/app/routers/goals.py:288` | — |
| DELETE | /goals/{goal_id} | delete_goal | `backend/app/routers/goals.py:541` | Soft-delete; blocked while child goals are aligned to it. |
| GET | /goals/{goal_id} | get_goal | `backend/app/routers/goals.py:375` | — |
| PATCH | /goals/{goal_id} | update_goal | `backend/app/routers/goals.py:422` | — |
| POST | /goals/{goal_id}/comments | add_comment | `backend/app/routers/goals.py:264` | — |
| POST | /goals/{goal_id}/progress | record_progress | `backend/app/routers/goals.py:495` | — |
| GET | /health | health | `backend/app/main.py:78` | Liveness probe. |
| GET | /job-titles | list_job_titles | `backend/app/routers/employees.py:442` | — |
| GET | /me/dashboard | dashboard | `backend/app/routers/feedback.py:113` | — |
| GET | /me/profile | get_profile | `backend/app/routers/profile.py:77` | — |
| PATCH | /me/profile | update_profile | `backend/app/routers/profile.py:82` | — |
| PUT | /me/profile/photo | upload_photo | `backend/app/routers/profile.py:115` | — |
| GET | /one-on-ones | list_one_on_ones | `backend/app/routers/one_on_ones.py:143` | — |
| POST | /one-on-ones | create_one_on_one | `backend/app/routers/one_on_ones.py:156` | A manager names the report; a report is paired with their own manager. |
| GET | /one-on-ones/{one_on_one_id} | get_one_on_one | `backend/app/routers/one_on_ones.py:230` | — |
| PATCH | /one-on-ones/{one_on_one_id} | update_one_on_one | `backend/app/routers/one_on_ones.py:247` | — |
| POST | /one-on-ones/{one_on_one_id}/action-items | add_action_item | `backend/app/routers/one_on_ones.py:303` | — |
| PUT | /one-on-ones/{one_on_one_id}/private-note | save_private_note | `backend/app/routers/one_on_ones.py:270` | — |
| GET | /questionnaires | list_questionnaires | `backend/app/routers/questionnaires.py:289` | Every template with its latest version; `status` narrows the list. |
| POST | /questionnaires | create_questionnaire | `backend/app/routers/questionnaires.py:303` | — |
| GET | /questionnaires/{template_id} | get_questionnaire | `backend/app/routers/questionnaires.py:319` | — |
| PUT | /questionnaires/{template_id} | update_questionnaire | `backend/app/routers/questionnaires.py:327` | — |
| POST | /questionnaires/{template_id}/publish | publish_questionnaire | `backend/app/routers/questionnaires.py:349` | — |
| GET | /rating-scales | list_rating_scales | `backend/app/routers/questionnaires.py:117` | — |
| POST | /rating-scales | create_rating_scale | `backend/app/routers/questionnaires.py:86` | — |
| GET | /rating-scales/{scale_id} | get_rating_scale | `backend/app/routers/questionnaires.py:123` | Read only: a scale's labels are never edited in place, a new scale is |
| GET | /review-periods | list_periods | `backend/app/routers/review_periods.py:189` | — |
| POST | /review-periods | create_period | `backend/app/routers/review_periods.py:168` | — |
| GET | /review-periods/{period_id} | get_period | `backend/app/routers/review_periods.py:195` | — |
| PATCH | /review-periods/{period_id} | update_period | `backend/app/routers/review_periods.py:203` | — |
| POST | /review-periods/{period_id}/close | close_period | `backend/app/routers/review_periods.py:251` | — |
| POST | /review-periods/{period_id}/open | open_period | `backend/app/routers/review_periods.py:234` | Mark the period open and hand the task creation to the queue (NFR-014). |
| DELETE | /review-periods/{period_id}/participants/{employee_id} | remove_participant | `backend/app/routers/review_periods.py:264` | — |
| GET | /review-periods/{period_id}/status | period_status | `backend/app/routers/review_periods.py:307` | Per participant: submitted or outstanding, when, and whether overdue. |
| GET | /self-reviews/{review_id} | get_self_review | `backend/app/routers/self_reviews.py:102` | — |
| PUT | /self-reviews/{review_id}/answers | save_answers | `backend/app/routers/self_reviews.py:115` | — |
| GET | /self-reviews/{review_id}/history | self_review_history | `backend/app/routers/self_reviews.py:230` | — |
| POST | /self-reviews/{review_id}/reopen | reopen_self_review | `backend/app/routers/self_reviews.py:204` | — |
| POST | /self-reviews/{review_id}/submit | submit_self_review | `backend/app/routers/self_reviews.py:156` | — |
| GET | /settings | get_settings | `backend/app/routers/settings.py:35` | — |
| PUT | /settings | put_settings | `backend/app/routers/settings.py:40` | — |
| GET | /team/goals | team_goals | `backend/app/routers/goals.py:217` | Active direct reports with their goals, loaded in two queries. |
<!-- sdlc:auto:end endpoints -->

<!-- sdlc:auto:start drift -->
**Designed but missing:**

- DELETE /employees/{id}/invitations
- DELETE /goals/{id}
- DELETE /review-periods/{id}/participants/{employee_id}
- GET /audit-events
- GET /employees/{id}/record
- GET /goals/{id}
- GET /me/record
- GET /one-on-ones/{id}
- GET /org/summary
- GET /review-periods/{id}/status
- GET /self-reviews/{id}
- GET /self-reviews/{id}/history
- PATCH /employees/{id}
- PATCH /goals/{id}
- PATCH /one-on-ones/{id}
- POST /action-items/{id}/complete
- POST /employees/{id}/deactivate
- POST /employees/{id}/invitations
- POST /employees/{id}/password-resets
- POST /feedback/{id}/withdraw
- POST /goals/{id}/comments
- POST /goals/{id}/progress
- POST /one-on-ones/{id}/action-items
- POST /one-on-ones/{id}/talking-points
- POST /questionnaires/{id}/publish
- POST /review-periods/{id}/close
- POST /review-periods/{id}/open
- POST /self-reviews/{id}/reopen
- POST /self-reviews/{id}/submit
- PUT /employees/{id}/manager
- PUT /one-on-ones/{id}/private-note
- PUT /one-on-ones/{id}/talking-points/order
- PUT /self-reviews/{id}/answers

**Code only:**

- DELETE /employees/{employee_id}/invitations
- DELETE /goals/{goal_id}
- DELETE /review-periods/{period_id}/participants/{employee_id}
- GET /employees/{employee_id}/record
- GET /goals/{goal_id}
- GET /one-on-ones/{one_on_one_id}
- GET /questionnaires
- GET /questionnaires/{template_id}
- GET /rating-scales
- GET /rating-scales/{scale_id}
- GET /review-periods
- GET /review-periods/{period_id}
- GET /review-periods/{period_id}/status
- GET /self-reviews/{review_id}
- GET /self-reviews/{review_id}/history
- PATCH /employees/{employee_id}
- PATCH /goals/{goal_id}
- PATCH /one-on-ones/{one_on_one_id}
- PATCH /review-periods/{period_id}
- POST /action-items/{item_id}/complete
- POST /employees/{employee_id}/deactivate
- POST /employees/{employee_id}/invitations
- POST /employees/{employee_id}/password-resets
- POST /goals/{goal_id}/comments
- POST /goals/{goal_id}/progress
- POST /one-on-ones/{one_on_one_id}/action-items
- POST /questionnaires/{template_id}/publish
- POST /review-periods/{period_id}/close
- POST /review-periods/{period_id}/open
- POST /self-reviews/{review_id}/reopen
- POST /self-reviews/{review_id}/submit
- PUT /employees/{employee_id}/manager
- PUT /one-on-ones/{one_on_one_id}/private-note
- PUT /questionnaires/{template_id}
- PUT /self-reviews/{review_id}/answers
- PUT /settings
<!-- sdlc:auto:end drift -->

<!-- sdlc:auto:start source -->
Generated from commit `9c9667e`
<!-- sdlc:auto:end source -->
