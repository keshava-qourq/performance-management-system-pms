# API Reference

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start endpoints -->
| Method | Path | Handler | Source | Summary |
|---|---|---|---|---|
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
| GET | /feedback | list_feedback | `backend/app/routers/feedback.py:101` | — |
| POST | /feedback | send_feedback | `backend/app/routers/feedback.py:49` | — |
| GET | /feedback/audience | audience | `backend/app/routers/feedback.py:80` | — |
| GET | /goals | list_goals | `backend/app/routers/goals.py:295` | — |
| POST | /goals | create_goal | `backend/app/routers/goals.py:324` | — |
| GET | /goals/parent-options | parent_options | `backend/app/routers/goals.py:288` | — |
| DELETE | /goals/{goal_id} | delete_goal | `backend/app/routers/goals.py:541` | Soft-delete; blocked while child goals are aligned to it. |
| GET | /goals/{goal_id} | get_goal | `backend/app/routers/goals.py:375` | — |
| PATCH | /goals/{goal_id} | update_goal | `backend/app/routers/goals.py:422` | — |
| POST | /goals/{goal_id}/comments | add_comment | `backend/app/routers/goals.py:264` | — |
| POST | /goals/{goal_id}/progress | record_progress | `backend/app/routers/goals.py:495` | — |
| GET | /health | health | `backend/app/main.py:70` | Liveness probe. |
| GET | /job-titles | list_job_titles | `backend/app/routers/employees.py:442` | — |
| GET | /me/dashboard | dashboard | `backend/app/routers/feedback.py:112` | — |
| GET | /me/profile | get_profile | `backend/app/routers/profile.py:77` | — |
| PATCH | /me/profile | update_profile | `backend/app/routers/profile.py:82` | — |
| PUT | /me/profile/photo | upload_photo | `backend/app/routers/profile.py:115` | — |
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
- GET /one-on-ones
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
- POST /one-on-ones
- POST /one-on-ones/{id}/action-items
- POST /one-on-ones/{id}/talking-points
- POST /questionnaires
- POST /questionnaires/{id}/publish
- POST /rating-scales
- POST /review-periods
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
- GET /employees/{employee_id}/record
- GET /goals/{goal_id}
- PATCH /employees/{employee_id}
- PATCH /goals/{goal_id}
- POST /employees/{employee_id}/deactivate
- POST /employees/{employee_id}/invitations
- POST /employees/{employee_id}/password-resets
- POST /goals/{goal_id}/comments
- POST /goals/{goal_id}/progress
- PUT /employees/{employee_id}/manager
- PUT /settings
<!-- sdlc:auto:end drift -->

<!-- sdlc:auto:start source -->
Generated from commit `33e15d7`
<!-- sdlc:auto:end source -->
