# API Reference

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start endpoints -->
| Method | Path | Handler | Source | Summary |
|---|---|---|---|---|
| POST | /auth/login | login | `backend/app/routers/auth.py:31` | — |
| POST | /auth/logout | logout | `backend/app/routers/auth.py:72` | — |
| GET | /auth/me | me | `backend/app/routers/auth.py:85` | — |
| GET | /departments | list_departments | `backend/app/routers/employees.py:128` | — |
| GET | /employees | list_employees | `backend/app/routers/employees.py:79` | — |
| POST | /employees | create_employee | `backend/app/routers/employees.py:85` | — |
| PATCH | /employees/{employee_id} | update_employee | `backend/app/routers/employees.py:102` | — |
| GET | /health | health | `backend/app/main.py:65` | Liveness probe, and the only route here that is not a stub. |
| GET | /job-titles | list_job_titles | `backend/app/routers/employees.py:134` | — |
<!-- sdlc:auto:end endpoints -->

<!-- sdlc:auto:start drift -->
**Designed but missing:**

- DELETE /employees/{id}/invitations
- DELETE /goals/{id}
- DELETE /review-periods/{id}/participants/{employee_id}
- GET /audit-events
- GET /auth/tokens/{token}
- GET /employees/{id}/record
- GET /feedback
- GET /feedback/audience
- GET /goals
- GET /goals/parent-options
- GET /goals/{id}
- GET /me/dashboard
- GET /me/profile
- GET /me/record
- GET /one-on-ones
- GET /one-on-ones/{id}
- GET /org/summary
- GET /review-periods/{id}/status
- GET /self-reviews/{id}
- GET /self-reviews/{id}/history
- GET /settings
- GET /team/goals
- PATCH /employees/{id}
- PATCH /goals/{id}
- PATCH /me/profile
- PATCH /one-on-ones/{id}
- POST /action-items/{id}/complete
- POST /auth/password
- POST /auth/tokens/{token}/accept
- POST /employees/{id}/deactivate
- POST /employees/{id}/invitations
- POST /employees/{id}/password-resets
- POST /feedback
- POST /feedback/{id}/withdraw
- POST /goals
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
- PUT /me/profile/photo
- PUT /one-on-ones/{id}/private-note
- PUT /one-on-ones/{id}/talking-points/order
- PUT /self-reviews/{id}/answers

**Code only:**

- PATCH /employees/{employee_id}
<!-- sdlc:auto:end drift -->

<!-- sdlc:auto:start source -->
Generated from commit `66559e2`
<!-- sdlc:auto:end source -->
