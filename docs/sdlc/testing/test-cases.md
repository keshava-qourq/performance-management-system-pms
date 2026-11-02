# Tests

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start summary -->
555 tests · Passed 515 · Failed 0 · Skipped 0 · Not run 40

Acceptance criteria covered: 80/129 · passing: 36/129
<!-- sdlc:auto:end summary -->

<!-- sdlc:auto:start tests -->
## Sprint 1

### US-001: HR creates and maintains employee records

| Criteria | Test | Level | Result | File |
|---|---|---|---|---|
| AC-001 | People directory > [AC-001] creates an employee and lists it from GET /employees | Unit | Passed | `frontend/src/screens/PeopleDirectory.test.tsx` |
| AC-001 | People directory > [AC-001] explains an empty search result | Unit | Passed | `frontend/src/screens/PeopleDirectory.test.tsx` |
| AC-002 | People directory > [AC-002] shows API 422 messages beside the field and keeps the form open | Unit | Passed | `frontend/src/screens/PeopleDirectory.test.tsx` |
| AC-003 | People directory > [AC-003] editing job title calls PATCH and the row updates | Unit | Passed | `frontend/src/screens/PeopleDirectory.test.tsx` |
| AC-004 | People directory > [AC-004] a 403 shows a refusal and no data | Unit | Passed | `frontend/src/screens/PeopleDirectory.test.tsx` |
| AC-004 | People directory > [AC-004] employee sees no Add employee or Manage actions | Unit | Passed | `frontend/src/screens/PeopleDirectory.test.tsx` |
| AC-004 | People directory > [AC-004] executive sees no Add employee or Manage actions | Unit | Passed | `frontend/src/screens/PeopleDirectory.test.tsx` |
| AC-004 | People directory > [AC-004] manager sees no Add employee or Manage actions | Unit | Passed | `frontend/src/screens/PeopleDirectory.test.tsx` |
| AC-008 | People directory > [AC-008] a manager with nobody reporting to them sees an explanation, not an error | Unit | Passed | `frontend/src/screens/PeopleDirectory.test.tsx` |
| AC-008 | People directory > [AC-008] no sample employee data is shown before the API answers | Unit | Passed | `frontend/src/screens/PeopleDirectory.test.tsx` |
| AC-008 | People directory > [AC-008] setting a manager PUTs the reporting line and the manager column refetches | Unit | Passed | `frontend/src/screens/PeopleDirectory.test.tsx` |
| AC-008 | People directory > [AC-008] the manager's record lists the employee under direct reports | Unit | Passed | `frontend/src/screens/PeopleDirectory.test.tsx` |
| AC-009 | People directory > [AC-009] a 422 from the manager endpoint shows the circular message on the manager field | Unit | Passed | `frontend/src/screens/PeopleDirectory.test.tsx` |
| AC-010 | People directory > [AC-010] an employee with no manager shows an empty manager field and a missing-reporting-line flag | Unit | Passed | `frontend/src/screens/PeopleDirectory.test.tsx` |
| AC-011 | People directory > [AC-011] reassigning to a different manager shows the new manager after refetch | Unit | Passed | `frontend/src/screens/PeopleDirectory.test.tsx` |
| AC-011 | People directory > [AC-011] the employee cannot be chosen as their own manager | Unit | Passed | `frontend/src/screens/PeopleDirectory.test.tsx` |
| AC-012 | People directory > [AC-012] the role selector is available when editing and persists via PATCH | Unit | Passed | `frontend/src/screens/PeopleDirectory.test.tsx` |
| AC-013 | People directory > [AC-013] a 403 on save renders a read-only explanation rather than crashing | Unit | Passed | `frontend/src/screens/PeopleDirectory.test.tsx` |
| AC-013 | People directory > [AC-013] a 403 on the directory explains the refusal instead of crashing | Unit | Passed | `frontend/src/screens/PeopleDirectory.test.tsx` |
| AC-013 | People directory > [AC-013] an executive sees the directory read-only with no create, edit or save controls | Unit | Passed | `frontend/src/screens/PeopleDirectory.test.tsx` |
| AC-014 | People directory > [AC-014] a 422 on the role field shows the last-HR-Admin message against the role field | Unit | Passed | `frontend/src/screens/PeopleDirectory.test.tsx` |
| AC-001 | test_ac001_create_and_list | Integration | Passed | `backend/tests/integration/test_employees.py` |
| AC-002 | test_ac002_duplicate_email_case_insensitive_and_own_email_ok | Integration | Passed | `backend/tests/integration/test_employees.py` |
| AC-002 | test_ac002_missing_and_blank_422 | Integration | Passed | `backend/tests/integration/test_employees.py` |
| AC-003 | test_ac003_patch_persists_and_nonexistent_refs_422 | Integration | Passed | `backend/tests/integration/test_employees.py` |
| AC-004 | test_ac004_non_hr_403_empty[employee@example.com] | Integration | Passed | `backend/tests/integration/test_employees.py` |
| AC-004 | test_ac004_non_hr_403_empty[executive@example.com] | Integration | Passed | `backend/tests/integration/test_employees.py` |
| AC-004 | test_ac004_non_hr_403_empty[manager@example.com] | Integration | Passed | `backend/tests/integration/test_employees.py` |
| AC-004 | test_ac004_signed_out_401 | Integration | Passed | `backend/tests/integration/test_employees.py` |
| AC-001 | test_ac001_created_employee_listed_with_title_and_department | Integration | Passed | `backend/tests/integration/test_employees_qa.py` |
| AC-002 | test_ac002_duplicate_email_any_case_message | Integration | Passed | `backend/tests/integration/test_employees_qa.py` |
| AC-002 | test_ac002_missing_email_message_is_field_level_english | Integration | Passed | `backend/tests/integration/test_employees_qa.py` |
| AC-002 | test_ac002_missing_name_message_is_field_level_english | Integration | Passed | `backend/tests/integration/test_employees_qa.py` |
| AC-003 | test_ac003_edit_visible_on_next_get | Integration | Passed | `backend/tests/integration/test_employees_qa.py` |
| AC-004 | test_ac004_nfr001_server_refuses_post_and_patch_403_empty[employee@example.com] | Integration | Passed | `backend/tests/integration/test_employees_qa.py` |
| AC-004 | test_ac004_nfr001_server_refuses_post_and_patch_403_empty[executive@example.com] | Integration | Passed | `backend/tests/integration/test_employees_qa.py` |
| AC-004 | test_ac004_nfr001_server_refuses_post_and_patch_403_empty[manager@example.com] | Integration | Passed | `backend/tests/integration/test_employees_qa.py` |
| — | test_nfr001_non_hr_cannot_read_directory[employee@example.com] | Integration | Passed | `backend/tests/integration/test_employees_qa.py` |
| — | test_nfr001_non_hr_cannot_read_directory[executive@example.com] | Integration | Passed | `backend/tests/integration/test_employees_qa.py` |
| — | test_nfr001_non_hr_cannot_read_directory[manager@example.com] | Integration | Passed | `backend/tests/integration/test_employees_qa.py` |
| — | test_nfr015_directory_lists_under_200_quickly | Integration | Passed | `backend/tests/integration/test_employees_qa.py` |
| AC-001 | [AC-001] an HR Admin adds an employee who appears in the directory | E2E | Not run yet | `frontend/e2e/employees.spec.ts` |
| AC-002 | [AC-002] missing and duplicate values show field-level errors in English | E2E | Not run yet | `frontend/e2e/employees.spec.ts` |
| AC-003 | [AC-003] an edit shows immediately in the directory | E2E | Not run yet | `frontend/e2e/employees.spec.ts` |
| AC-004 | [AC-004] [NFR-001] a direct request by a non-HR user is refused by the server | E2E | Not run yet | `frontend/e2e/employees.spec.ts` |
| AC-004 | [AC-004] a non-HR user sees no Add or Manage actions | E2E | Not run yet | `frontend/e2e/employees.spec.ts` |

### US-007: Employee signs in and out

| Criteria | Test | Level | Result | File |
|---|---|---|---|---|
| AC-022 | App > [AC-022] sign-in calls /auth/login with cookies and goes to /my-performance | Unit | Passed | `frontend/src/App.test.tsx` |
| AC-023, AC-026 | App > [AC-023] [AC-026] a failed sign-in shows the API message and stays | Unit | Passed | `frontend/src/App.test.tsx` |
| AC-024 | App > [AC-024] a blocked account shows the blocked message and stays | Unit | Passed | `frontend/src/App.test.tsx` |
| AC-025 | App > [AC-025] Sign out calls /auth/logout and returns to sign-in | Unit | Passed | `frontend/src/App.test.tsx` |
| AC-025 | App > [AC-025] a later 401 clears the session and redirects to sign-in | Unit | Passed | `frontend/src/App.test.tsx` |
| AC-025 | App > [AC-025] protected routes redirect to sign-in when /auth/me is 401 | Unit | Passed | `frontend/src/App.test.tsx` |
| AC-022 | test_ac022_login_sets_cookie_and_me | Integration | Passed | `backend/tests/integration/test_auth.py` |
| AC-022 | test_ac022_mutation_requires_header_403_empty | Integration | Passed | `backend/tests/integration/test_auth.py` |
| AC-022 | test_ac022_require_role_403_empty_and_executive_cannot_mutate | Integration | Passed | `backend/tests/integration/test_auth.py` |
| AC-022 | test_ac022_validation_422_per_field | Integration | Passed | `backend/tests/integration/test_auth.py` |
| AC-023 | test_ac023_same_message_no_enumeration_no_session | Integration | Passed | `backend/tests/integration/test_auth.py` |
| AC-024 | test_ac024_lockout_recorded_and_threshold_from_settings | Integration | Passed | `backend/tests/integration/test_auth.py` |
| AC-025 | test_ac025_idle_timeout_is_a_setting | Integration | Passed | `backend/tests/integration/test_auth.py` |
| AC-025 | test_ac025_logout_and_idle_timeout | Integration | Passed | `backend/tests/integration/test_auth.py` |
| AC-026 | test_ac026_deactivated_refused_and_sessions_revoked | Integration | Passed | `backend/tests/integration/test_auth.py` |
| AC-022 | test_ac022_cookie_not_leaked_in_body | Integration | Passed | `backend/tests/integration/test_auth_qa.py` |
| AC-022 | test_ac022_email_case_insensitive | Integration | Passed | `backend/tests/integration/test_auth_qa.py` |
| AC-023 | test_ac023_wrong_password_and_unknown_email_identical_bytes | Integration | Passed | `backend/tests/integration/test_auth_qa.py` |
| AC-024 | test_ac024_below_threshold_still_signs_in | Integration | Passed | `backend/tests/integration/test_auth_qa.py` |
| AC-024 | test_ac024_block_is_per_account | Integration | Passed | `backend/tests/integration/test_auth_qa.py` |
| AC-024 | test_ac024_default_threshold_blocks_after_five | Integration | Passed | `backend/tests/integration/test_auth_qa.py` |
| AC-025 | test_ac025_logout_revokes_session_server_side | Integration | Passed | `backend/tests/integration/test_auth_qa.py` |
| AC-025 | test_ac025_logout_signed_out_is_401 | Integration | Passed | `backend/tests/integration/test_auth_qa.py` |
| AC-026 | test_ac026_deactivated_account_refused_without_failed_attempt | Integration | Passed | `backend/tests/integration/test_auth_qa.py` |
| AC-022 | [AC-022] sign in lands on /my-performance | E2E | Not run yet | `frontend/e2e/sign-in.spec.ts` |
| AC-023 | [AC-023] a wrong password shows a generic message and stays on sign-in | E2E | Not run yet | `frontend/e2e/sign-in.spec.ts` |
| AC-025 | [AC-025] Sign out returns to /sign-in and protected pages are closed | E2E | Not run yet | `frontend/e2e/sign-in.spec.ts` |
| AC-025 | [AC-025] a protected URL visited signed out redirects to /sign-in | E2E | Not run yet | `frontend/e2e/sign-in.spec.ts` |

### US-032: English-only interface

| Criteria | Test | Level | Result | File |
|---|---|---|---|---|
| AC-119 | [AC-119] English-only interface regardless of browser locale > offers no language-selection control before sign-in | Unit | Passed | `frontend/src/App.i18n.test.tsx` |
| AC-119 | [AC-119] English-only interface regardless of browser locale > renders English after sign-in even with a German browser preference, with no language control | Unit | Passed | `frontend/src/App.i18n.test.tsx` |
| AC-119 | [AC-119] English-only interface regardless of browser locale > the document declares lang=en | Unit | Passed | `frontend/src/App.i18n.test.tsx` |
| AC-118 | formatDate > [AC-118] formats an ISO date in English regardless of the runtime locale | Unit | Passed | `frontend/src/lib/dateFormat.test.ts` |
| AC-118 | formatDate > [AC-118] returns an empty string for a missing date | Unit | Passed | `frontend/src/lib/dateFormat.test.ts` |
| AC-118 | formatDate > [AC-118] stays English even when Intl's default locale would be German | Unit | Passed | `frontend/src/lib/dateFormat.test.ts` |
| AC-118 | formatDateTime > [AC-118] formats a Date in English | Unit | Passed | `frontend/src/lib/dateFormat.test.ts` |

## Sprint 2

### US-003: HR sets reporting lines

| Criteria | Test | Level | Result | File |
|---|---|---|---|---|
| AC-008 | test_ac008_manager_can_read_their_direct_report_record | Integration | Passed | `backend/tests/integration/test_reporting_qa.py` |
| AC-008 | test_ac008_manager_set_shows_direct_report_and_grants_manager_capability | Integration | Passed | `backend/tests/integration/test_reporting_qa.py` |
| AC-009 | test_ac009_self_manager_is_422_field_level_and_nothing_persisted | Integration | Passed | `backend/tests/integration/test_reporting_qa.py` |
| AC-009 | test_ac009_three_person_cycle_is_refused | Integration | Passed | `backend/tests/integration/test_reporting_qa.py` |
| AC-009 | test_ac009_two_person_cycle_is_422_field_level_and_nothing_persisted | Integration | Passed | `backend/tests/integration/test_reporting_qa.py` |
| AC-009 | test_ac009_unknown_manager_is_422_field_level | Integration | Passed | `backend/tests/integration/test_reporting_qa.py` |
| AC-010 | test_ac010_clearing_the_manager_restores_the_flag | Integration | Passed | `backend/tests/integration/test_reporting_qa.py` |
| AC-010 | test_ac010_missing_reporting_line_is_flagged_in_the_directory | Integration | Passed | `backend/tests/integration/test_reporting_qa.py` |
| AC-011 | test_ac011_reassignment_moves_visibility_and_old_manager_gets_403_empty | Integration | Passed | `backend/tests/integration/test_reporting_qa.py` |
| AC-012 | test_ac012_role_change_also_removes_access | Integration | Passed | `backend/tests/integration/test_reporting_qa.py` |
| AC-012 | test_ac012_role_change_grants_hr_directory_access_on_next_sign_in | Integration | Passed | `backend/tests/integration/test_reporting_qa.py` |
| AC-012 | test_ac012_unknown_role_is_422_field_level | Integration | Passed | `backend/tests/integration/test_reporting_qa.py` |
| AC-013 | test_ac013_executive_directory_read | Integration | Passed | `backend/tests/integration/test_reporting_qa.py` |
| AC-013 | test_ac013_executive_may_read_but_never_write | Integration | Passed | `backend/tests/integration/test_reporting_qa.py` |
| AC-014 | test_ac014_demotion_allowed_once_a_second_hr_admin_exists | Integration | Passed | `backend/tests/integration/test_reporting_qa.py` |
| AC-014 | test_ac014_last_hr_admin_cannot_demote_themselves | Integration | Passed | `backend/tests/integration/test_reporting_qa.py` |
| — | test_nfr015_cycle_detection_holds_on_a_deep_chain | Integration | Passed | `backend/tests/integration/test_reporting_qa.py` |
| — | test_nfr015_directory_of_200_with_reporting_lines_lists_without_timeout | Integration | Passed | `backend/tests/integration/test_reporting_qa.py` |
| AC-008, AC-010 | [AC-008] [AC-010] an HR Admin assigns a manager and the missing-line flag clears | E2E | Not run yet | `frontend/e2e/reporting.spec.ts` |
| AC-009 | [AC-009] [NFR-019] a circular reporting line is refused with an inline message | E2E | Not run yet | `frontend/e2e/reporting.spec.ts` |
| AC-009 | [AC-009] an employee cannot be set as their own manager | E2E | Not run yet | `frontend/e2e/reporting.spec.ts` |

### US-005: HR deactivates a leaver

| Criteria | Test | Level | Result | File |
|---|---|---|---|---|
| AC-015 | Leaver deactivation > [AC-015] a deactivated person is not offered as a manager for anyone else | Unit | Passed | `frontend/src/screens/PeopleDirectory.leaver.test.tsx` |
| AC-015 | Leaver deactivation > [AC-015] asks for the leaving date in plain English before calling the API | Unit | Passed | `frontend/src/screens/PeopleDirectory.leaver.test.tsx` |
| AC-015 | Leaver deactivation > [AC-015] deactivates an employee with a leaving date and shows them as deactivated | Unit | Passed | `frontend/src/screens/PeopleDirectory.leaver.test.tsx` |
| AC-015 | Leaver deactivation > [AC-015] the shared people filter leaves deactivated employees out of every picker | Unit | Passed | `frontend/src/screens/PeopleDirectory.leaver.test.tsx` |
| AC-016 | Leaver deactivation > [AC-016] a deactivated record still shows its history and offers no delete control | Unit | Passed | `frontend/src/screens/PeopleDirectory.leaver.test.tsx` |
| AC-016 | Leaver deactivation > [AC-016] explains plainly when a deactivated employee has no history yet | Unit | Passed | `frontend/src/screens/PeopleDirectory.leaver.test.tsx` |
| AC-017 | Leaver deactivation > [AC-017] an invalid reassignment target renders inline against the new-manager field | Unit | Passed | `frontend/src/screens/PeopleDirectory.leaver.test.tsx` |
| AC-017 | Leaver deactivation > [AC-017] the reassign-direct-reports 422 lists them and resubmits with the new manager | Unit | Passed | `frontend/src/screens/PeopleDirectory.leaver.test.tsx` |
| AC-015 | test_ac015_deactivated_employee_is_absent_from_active_pickers | Integration | Passed | `backend/tests/integration/test_leaver_qa.py` |
| AC-015 | test_ac015_deactivation_ends_the_leavers_sessions_at_once | Integration | Passed | `backend/tests/integration/test_leaver_qa.py` |
| AC-015 | test_ac015_next_sign_in_is_refused_with_the_generic_message | Integration | Passed | `backend/tests/integration/test_leaver_qa.py` |
| AC-016 | test_ac016_history_is_returned_unchanged_after_deactivation | Integration | Passed | `backend/tests/integration/test_leaver_qa.py` |
| AC-016 | test_ac016_no_endpoint_deletes_an_employee_or_their_history | Integration | Passed | `backend/tests/integration/test_leaver_qa.py` |
| AC-016 | test_ac016_record_stays_readable_by_the_executive | Integration | Passed | `backend/tests/integration/test_leaver_qa.py` |
| AC-017 | test_ac017_a_failed_reassignment_leaves_the_employee_active[circular] | Integration | Passed | `backend/tests/integration/test_leaver_qa.py` |
| AC-017 | test_ac017_a_failed_reassignment_leaves_the_employee_active[deactivated_manager] | Integration | Passed | `backend/tests/integration/test_leaver_qa.py` |
| AC-017 | test_ac017_a_failed_reassignment_leaves_the_employee_active[self] | Integration | Passed | `backend/tests/integration/test_leaver_qa.py` |
| AC-017 | test_ac017_a_failed_reassignment_leaves_the_employee_active[unknown_manager] | Integration | Passed | `backend/tests/integration/test_leaver_qa.py` |
| AC-017 | test_ac017_leaving_date_is_required_and_field_level | Integration | Passed | `backend/tests/integration/test_leaver_qa.py` |
| AC-017 | test_ac017_only_hr_can_deactivate | Integration | Passed | `backend/tests/integration/test_leaver_qa.py` |
| AC-017 | test_ac017_outstanding_direct_reports_block_deactivation_and_name_them | Integration | Passed | `backend/tests/integration/test_leaver_qa.py` |
| AC-017 | test_ac017_reassignment_and_deactivation_complete_atomically | Integration | Passed | `backend/tests/integration/test_leaver_qa.py` |
| — | test_nfr003_a_deactivated_employees_cookie_cannot_be_replayed | Integration | Passed | `backend/tests/integration/test_leaver_qa.py` |
| — | test_nfr003_deactivated_account_is_refused_without_counting_a_failed_attempt | Integration | Passed | `backend/tests/integration/test_leaver_qa.py` |
| — | test_nfr010_a_second_deactivation_is_idempotent_and_keeps_the_record | Integration | Passed | `backend/tests/integration/test_leaver_qa.py` |
| — | test_nfr010_nothing_is_hard_deleted_and_the_audit_event_is_complete | Integration | Passed | `backend/tests/integration/test_leaver_qa.py` |
| — | test_nfr015_a_leaver_with_many_reports_is_reassigned_in_one_request | Integration | Passed | `backend/tests/integration/test_leaver_qa.py` |
| AC-015, AC-016 | [AC-015] [AC-016] a deactivated leaver keeps their record and leaves the manager picker | E2E | Not run yet | `frontend/e2e/leaver.spec.ts` |
| AC-017, AC-015 | [AC-017] [AC-015] HR deactivating a manager is forced through the reassign prompt | E2E | Not run yet | `frontend/e2e/leaver.spec.ts` |

### US-006: HR invites an employee to create an account

| Criteria | Test | Level | Result | File |
|---|---|---|---|---|
| AC-027 | Change password > [AC-027] a password the API accepts is confirmed and the fields are cleared | Unit | Passed | `frontend/src/screens/MyPerformance.password.test.tsx` |
| AC-027 | Change password > [AC-027] lists the unmet rules the API returns against the password field | Unit | Passed | `frontend/src/screens/MyPerformance.password.test.tsx` |
| AC-027 | Change password > [AC-027] mismatched passwords are explained and nothing is sent | Unit | Passed | `frontend/src/screens/MyPerformance.password.test.tsx` |
| AC-018 | HR invitation controls > [AC-018] Invite issues a link, shows it with a copy control and the record reads Invited | Unit | Passed | `frontend/src/screens/PeopleDirectory.invitations.test.tsx` |
| AC-018 | HR invitation controls > [AC-018] a refused invitation shows a plain-English message, not a raw error | Unit | Passed | `frontend/src/screens/PeopleDirectory.invitations.test.tsx` |
| AC-021 | HR invitation controls > [AC-021] an outstanding invitation can be revoked, and the link disappears | Unit | Passed | `frontend/src/screens/PeopleDirectory.invitations.test.tsx` |
| AC-021 | HR invitation controls > [AC-021] reissuing says only the newest link works | Unit | Passed | `frontend/src/screens/PeopleDirectory.invitations.test.tsx` |
| AC-029 | HR invitation controls > [AC-029] HR issues a password-reset link, shown the same way with a copy control | Unit | Passed | `frontend/src/screens/PeopleDirectory.invitations.test.tsx` |
| AC-019 | Set-password screen > [AC-019] a valid invitation link accepts a password, signs the person in and lands them in the app | Unit | Passed | `frontend/src/screens/SetPassword.test.tsx` |
| AC-019 | Set-password screen > [AC-019] shows the link being checked before asking for anything | Unit | Passed | `frontend/src/screens/SetPassword.test.tsx` |
| AC-020 | Set-password screen > [AC-020] a link the API reports as not valid shows the same explanation | Unit | Passed | `frontend/src/screens/SetPassword.test.tsx` |
| AC-020 | Set-password screen > [AC-020] an expired or used link explains it is no longer valid and shows no password form | Unit | Passed | `frontend/src/screens/SetPassword.test.tsx` |
| AC-027 | Set-password screen > [AC-027] mismatched passwords are explained in context and nothing is sent | Unit | Passed | `frontend/src/screens/SetPassword.test.tsx` |
| AC-027 | Set-password screen > [AC-027] the unmet rules the API returns are listed against the password field | Unit | Passed | `frontend/src/screens/SetPassword.test.tsx` |
| AC-029 | Set-password screen > [AC-029] a reset link reads as a reset rather than an invitation | Unit | Passed | `frontend/src/screens/SetPassword.test.tsx` |
| AC-018 | test_ac018_invite_issues_a_unique_time_limited_link_and_sets_status_invited | Integration | Passed | `backend/tests/integration/test_invitations_qa.py` |
| AC-018 | test_ac018_only_hr_can_invite | Integration | Passed | `backend/tests/integration/test_invitations_qa.py` |
| AC-019 | test_ac019_accepting_activates_the_account_and_issues_a_session | Integration | Passed | `backend/tests/integration/test_invitations_qa.py` |
| AC-020 | test_ac020_an_already_used_link_creates_no_account_and_no_session | Integration | Passed | `backend/tests/integration/test_invitations_qa.py` |
| AC-020 | test_ac020_an_expired_link_creates_no_account_and_no_session | Integration | Passed | `backend/tests/integration/test_invitations_qa.py` |
| AC-020 | test_ac020_an_unknown_token_is_refused_without_enumerating | Integration | Passed | `backend/tests/integration/test_invitations_qa.py` |
| AC-021 | test_ac021_reissuing_invalidates_the_previous_link_and_only_the_newest_works | Integration | Passed | `backend/tests/integration/test_invitations_qa.py` |
| AC-021 | test_ac021_revoking_kills_the_link_immediately | Integration | Passed | `backend/tests/integration/test_invitations_qa.py` |
| — | test_nfr015_inviting_many_employees_stays_responsive | Integration | Passed | `backend/tests/integration/test_invitations_qa.py` |
| — | test_nfr020_the_link_lifetime_comes_from_system_settings | Integration | Passed | `backend/tests/integration/test_invitations_qa.py` |
| AC-027 | test_ac027_a_wrong_current_password_is_refused_field_level | Integration | Passed | `backend/tests/integration/test_passwords_qa.py` |
| AC-027 | test_ac027_all_unmet_rules_are_listed_at_once | Integration | Passed | `backend/tests/integration/test_passwords_qa.py` |
| AC-027 | test_ac027_every_unmet_rule_is_a_field_level_english_message_on_422[12345678901234] | Integration | Passed | `backend/tests/integration/test_passwords_qa.py` |
| AC-027 | test_ac027_every_unmet_rule_is_a_field_level_english_message_on_422[NODIGITSORLOWER] | Integration | Passed | `backend/tests/integration/test_passwords_qa.py` |
| AC-027 | test_ac027_every_unmet_rule_is_a_field_level_english_message_on_422[] | Integration | Passed | `backend/tests/integration/test_passwords_qa.py` |
| AC-027 | test_ac027_every_unmet_rule_is_a_field_level_english_message_on_422[a] | Integration | Passed | `backend/tests/integration/test_passwords_qa.py` |
| AC-027 | test_ac027_every_unmet_rule_is_a_field_level_english_message_on_422[alllowercaseletters] | Integration | Passed | `backend/tests/integration/test_passwords_qa.py` |
| AC-027 | test_ac027_every_unmet_rule_is_a_field_level_english_message_on_422[short1!] | Integration | Passed | `backend/tests/integration/test_passwords_qa.py` |
| AC-027 | test_ac027_signed_out_cannot_change_a_password | Integration | Passed | `backend/tests/integration/test_passwords_qa.py` |
| AC-028 | test_ac028_changed_password_works_next_sign_in_and_the_old_one_is_refused | Integration | Passed | `backend/tests/integration/test_passwords_qa.py` |
| AC-029 | test_ac029_a_reset_link_must_also_satisfy_the_password_rules | Integration | Passed | `backend/tests/integration/test_passwords_qa.py` |
| AC-029 | test_ac029_hr_issued_reset_link_works_exactly_once | Integration | Passed | `backend/tests/integration/test_passwords_qa.py` |
| AC-029 | test_ac029_only_hr_can_issue_a_reset_link | Integration | Passed | `backend/tests/integration/test_passwords_qa.py` |
| AC-029 | test_ac029_reissuing_a_reset_invalidates_the_previous_link | Integration | Passed | `backend/tests/integration/test_passwords_qa.py` |
| AC-030 | test_ac030_nfr004_the_stored_value_is_a_salted_argon2_hash | Integration | Passed | `backend/tests/integration/test_passwords_qa.py` |
| AC-030 | test_ac030_no_endpoint_returns_the_password_or_its_hash | Integration | Passed | `backend/tests/integration/test_passwords_qa.py` |
| — | test_nfr004_the_plain_text_is_never_stored_anywhere | Integration | Passed | `backend/tests/integration/test_passwords_qa.py` |
| — | test_nfr020_password_rules_come_from_system_settings | Integration | Passed | `backend/tests/integration/test_passwords_qa.py` |
| — | test_nfr020_the_rules_are_published_to_the_form | Integration | Passed | `backend/tests/integration/test_passwords_qa.py` |
| AC-018 | [AC-018] HR invites an employee and copies the invitation link | E2E | Not run yet | `frontend/e2e/invitations.spec.ts` |
| AC-019 | [AC-019] the invitee sets a password and lands signed in | E2E | Not run yet | `frontend/e2e/invitations.spec.ts` |
| AC-020 | [AC-020] an expired link shows the contact-HR page and no password form | E2E | Not run yet | `frontend/e2e/invitations.spec.ts` |
| AC-021 | [AC-021] reissuing an invitation leaves only the newest link working | E2E | Not run yet | `frontend/e2e/invitations.spec.ts` |
| AC-028 | [AC-028] a signed-in employee changes their password and the old one is refused | E2E | Not run yet | `frontend/e2e/invitations.spec.ts` |
| AC-029 | [AC-029] an HR-issued reset link works once and then is invalid | E2E | Not run yet | `frontend/e2e/invitations.spec.ts` |

## Sprint 3

### US-009: Employee maintains a personal profile

| Criteria | Test | Level | Result | File |
|---|---|---|---|---|
| AC-031 | Profile > [AC-031] shows name, email, job title, department and manager | Unit | Passed | `frontend/src/screens/Profile.test.tsx` |
| AC-032 | Profile > [AC-032] saving sends PATCH /me/profile with display name and pronouns | Unit | Passed | `frontend/src/screens/Profile.test.tsx` |
| AC-032 | Profile > [AC-032] uploading a photo calls PUT /me/profile/photo and renders the returned URL | Unit | Passed | `frontend/src/screens/Profile.test.tsx` |
| AC-033 | Profile > [AC-033] HR-owned fields are read-only and labelled as maintained by HR | Unit | Passed | `frontend/src/screens/Profile.test.tsx` |
| — | Profile > [NFR-019] shows the API's field message against the field | Unit | Passed | `frontend/src/screens/Profile.test.tsx` |
| AC-031 | test_ac031_profile_returns_identity_and_hr_fields | Integration | Passed | `backend/tests/integration/test_profile_qa.py` |
| AC-031 | test_ac031_signed_out_is_401 | Integration | Passed | `backend/tests/integration/test_profile_qa.py` |
| AC-032 | test_ac032_patch_persists_display_name_and_pronouns | Integration | Passed | `backend/tests/integration/test_profile_qa.py` |
| AC-032 | test_ac032_photo_upload_is_stored_and_returned_as_a_short_lived_url | Integration | Passed | `backend/tests/integration/test_profile_qa.py` |
| AC-032 | test_ac032_photo_upload_requires_the_mutation_header | Integration | Passed | `backend/tests/integration/test_profile_qa.py` |
| AC-032 | test_ac032_stored_values_show_in_the_directory_colleagues_see | Integration | Passed | `backend/tests/integration/test_profile_qa.py` |
| AC-032 | test_ac032_uploaded_image_is_downsized_by_pillow | Integration | Passed | `backend/tests/integration/test_profile_qa.py` |
| AC-033 | test_ac033_a_refused_field_changes_nothing | Integration | Passed | `backend/tests/integration/test_profile_qa.py` |
| AC-033 | test_ac033_hr_maintained_fields_are_labelled_for_the_ui | Integration | Passed | `backend/tests/integration/test_profile_qa.py` |
| AC-033 | test_ac033_hr_owned_fields_are_refused | Integration | Passed | `backend/tests/integration/test_profile_qa.py` |
| — | test_nfr019_a_missing_file_is_422 | Integration | Passed | `backend/tests/integration/test_profile_qa.py` |
| — | test_nfr019_an_invalid_image_is_422_with_a_field_level_english_message | Integration | Passed | `backend/tests/integration/test_profile_qa.py` |
| — | test_nfr019_an_oversized_image_is_422_with_a_field_level_english_message | Integration | Passed | `backend/tests/integration/test_profile_qa.py` |

### US-011: Create a personal goal

| Criteria | Test | Level | Result | File |
|---|---|---|---|---|
| AC-038 | Goals > [AC-038] creating a goal posts to POST /goals and it appears at 0% progress | Unit | Passed | `frontend/src/screens/Goals.test.tsx` |
| AC-038 | Goals > [AC-038] lists the signed-in user's goals from GET /goals with no seeded data | Unit | Passed | `frontend/src/screens/Goals.test.tsx` |
| AC-039 | Goals > [AC-039] shows the API's per-field messages and saves nothing | Unit | Passed | `frontend/src/screens/Goals.test.tsx` |
| AC-040 | Goals > [AC-040] shows the API's validation message on the weighting field | Unit | Passed | `frontend/src/screens/Goals.test.tsx` |
| AC-041 | Goals > [AC-041] shows the total with a warning when weightings exceed 100%, saving still allowed | Unit | Passed | `frontend/src/screens/Goals.test.tsx` |
| AC-042 | Goals > [AC-042] editing patches PATCH /goals/{id} and shows who last changed it and when | Unit | Passed | `frontend/src/screens/Goals.test.tsx` |
| AC-043, AC-045 | Goals > [AC-043] [AC-045] progress posts to /goals/{id}/progress and shows percentage, status, date and name | Unit | Passed | `frontend/src/screens/Goals.test.tsx` |
| AC-044 | Goals > [AC-044] progress above 100 shows the message and keeps the previously shown progress | Unit | Passed | `frontend/src/screens/Goals.test.tsx` |
| AC-046 | Goals > [AC-046] an overdue goal is flagged in both the list and the detail pane | Unit | Passed | `frontend/src/screens/Goals.test.tsx` |
| AC-047 | Goals > [AC-047] a 403 from the API turns the progress fields read-only | Unit | Passed | `frontend/src/screens/Goals.test.tsx` |
| AC-047 | Goals > [AC-047] a viewer who is neither owner nor HR Admin gets read-only progress and status | Unit | Passed | `frontend/src/screens/Goals.test.tsx` |
| — | Goals > [NFR-019] explains what will appear when the user has no goals | Unit | Passed | `frontend/src/screens/Goals.test.tsx` |
| AC-048, AC-053 | Goals alignment > [AC-048] [AC-053] parent select lists the API's options with level and shows parent_title | Unit | Passed | `frontend/src/screens/Goals.test.tsx` |
| AC-049 | Goals alignment > [AC-049] lists aligned children with owner, progress and status | Unit | Passed | `frontend/src/screens/Goals.test.tsx` |
| AC-049 | Goals alignment > [AC-049] shows an explanation, not an error, with no aligned goals | Unit | Passed | `frontend/src/screens/Goals.test.tsx` |
| AC-050 | Goals alignment > [AC-050] a 422 cycle message appears on the Aligned to field | Unit | Passed | `frontend/src/screens/Goals.test.tsx` |
| AC-051 | Goals alignment > [AC-051] HR sees the 409 as a re-align message and the goal stays | Unit | Passed | `frontend/src/screens/Goals.test.tsx` |
| AC-051 | Goals alignment > [AC-051] deleting a childless goal removes it from the list | Unit | Passed | `frontend/src/screens/Goals.test.tsx` |
| AC-052 | Goals alignment > [AC-052] HR gets a Level control; Department reveals a required selector | Unit | Passed | `frontend/src/screens/Goals.test.tsx` |
| AC-054 | Goals alignment > [AC-054] an employee has no Level control and sends no level | Unit | Passed | `frontend/src/screens/Goals.test.tsx` |
| — | Goals alignment > [NFR-019] an empty options list offers 'Not aligned' and a hint | Unit | Passed | `frontend/src/screens/Goals.test.tsx` |
| AC-038 | test_ac038_a_new_goal_is_owned_by_its_author_starts_at_zero_and_is_listed | Integration | Passed | `backend/tests/integration/test_goals_qa.py` |
| AC-038 | test_ac038_the_owner_is_the_caller_not_a_value_the_caller_sends | Integration | Passed | `backend/tests/integration/test_goals_qa.py` |
| AC-039 | test_ac039_a_blank_value_is_treated_as_missing_and_all_fields_are_reported_at_once | Integration | Passed | `backend/tests/integration/test_goals_qa.py` |
| AC-039 | test_ac039_a_malformed_due_date_is_field_level | Integration | Passed | `backend/tests/integration/test_goals_qa.py` |
| AC-039 | test_ac039_each_missing_mandatory_field_gets_its_own_english_message[due_date] | Integration | Passed | `backend/tests/integration/test_goals_qa.py` |
| AC-039 | test_ac039_each_missing_mandatory_field_gets_its_own_english_message[target] | Integration | Passed | `backend/tests/integration/test_goals_qa.py` |
| AC-039 | test_ac039_each_missing_mandatory_field_gets_its_own_english_message[title] | Integration | Passed | `backend/tests/integration/test_goals_qa.py` |
| AC-040 | test_ac040_a_weighting_inside_the_range_is_accepted[0] | Integration | Passed | `backend/tests/integration/test_goals_qa.py` |
| AC-040 | test_ac040_a_weighting_inside_the_range_is_accepted[100] | Integration | Passed | `backend/tests/integration/test_goals_qa.py` |
| AC-040 | test_ac040_a_weighting_inside_the_range_is_accepted[40] | Integration | Passed | `backend/tests/integration/test_goals_qa.py` |
| AC-040 | test_ac040_a_weighting_inside_the_range_is_accepted[50] | Integration | Passed | `backend/tests/integration/test_goals_qa.py` |
| AC-040 | test_ac040_an_edit_cannot_push_the_weighting_out_of_range | Integration | Passed | `backend/tests/integration/test_goals_qa.py` |
| AC-040 | test_ac040_an_out_of_range_or_non_numeric_weighting_is_refused[-1] | Integration | Passed | `backend/tests/integration/test_goals_qa.py` |
| AC-040 | test_ac040_an_out_of_range_or_non_numeric_weighting_is_refused[100.5] | Integration | Passed | `backend/tests/integration/test_goals_qa.py` |
| AC-040 | test_ac040_an_out_of_range_or_non_numeric_weighting_is_refused[101] | Integration | Passed | `backend/tests/integration/test_goals_qa.py` |
| AC-040 | test_ac040_an_out_of_range_or_non_numeric_weighting_is_refused[True] | Integration | Passed | `backend/tests/integration/test_goals_qa.py` |
| AC-040 | test_ac040_an_out_of_range_or_non_numeric_weighting_is_refused[] | Integration | Passed | `backend/tests/integration/test_goals_qa.py` |
| AC-040 | test_ac040_an_out_of_range_or_non_numeric_weighting_is_refused[abc] | Integration | Passed | `backend/tests/integration/test_goals_qa.py` |
| AC-040 | test_ac040_an_out_of_range_or_non_numeric_weighting_is_refused[weighting5] | Integration | Passed | `backend/tests/integration/test_goals_qa.py` |
| AC-040 | test_ac040_an_out_of_range_or_non_numeric_weighting_is_refused[weighting6] | Integration | Passed | `backend/tests/integration/test_goals_qa.py` |
| AC-041 | test_ac041_a_total_of_100_or_less_carries_no_warning | Integration | Passed | `backend/tests/integration/test_goals_qa.py` |
| AC-041 | test_ac041_weightings_over_100_for_a_period_warn_but_still_save | Integration | Passed | `backend/tests/integration/test_goals_qa.py` |
| AC-042 | test_ac042_an_edit_persists_with_who_changed_it_and_when | Integration | Passed | `backend/tests/integration/test_goals_qa.py` |
| AC-042 | test_ac042_an_hr_edit_records_hr_as_the_last_person_to_change_it | Integration | Passed | `backend/tests/integration/test_goals_qa.py` |
| AC-043 | test_ac043_progress_is_never_calculated_only_what_the_person_typed | Integration | Passed | `backend/tests/integration/test_goals_qa.py` |
| AC-043 | test_ac043_progress_is_stored_with_the_person_and_the_date | Integration | Passed | `backend/tests/integration/test_goals_qa.py` |
| AC-043 | test_ac043_the_boundaries_of_the_range_are_accepted[0] | Integration | Passed | `backend/tests/integration/test_goals_qa.py` |
| AC-043 | test_ac043_the_boundaries_of_the_range_are_accepted[100] | Integration | Passed | `backend/tests/integration/test_goals_qa.py` |
| AC-043 | test_ac043_the_boundaries_of_the_range_are_accepted[1] | Integration | Passed | `backend/tests/integration/test_goals_qa.py` |
| AC-043 | test_ac043_the_boundaries_of_the_range_are_accepted[99] | Integration | Passed | `backend/tests/integration/test_goals_qa.py` |
| AC-044 | test_ac044_out_of_range_progress_is_refused_and_the_previous_value_kept[-1] | Integration | Passed | `backend/tests/integration/test_goals_qa.py` |
| AC-044 | test_ac044_out_of_range_progress_is_refused_and_the_previous_value_kept[1000] | Integration | Passed | `backend/tests/integration/test_goals_qa.py` |
| AC-044 | test_ac044_out_of_range_progress_is_refused_and_the_previous_value_kept[101] | Integration | Passed | `backend/tests/integration/test_goals_qa.py` |
| AC-044 | test_ac044_out_of_range_progress_is_refused_and_the_previous_value_kept[True] | Integration | Passed | `backend/tests/integration/test_goals_qa.py` |
| AC-044 | test_ac044_out_of_range_progress_is_refused_and_the_previous_value_kept[] | Integration | Passed | `backend/tests/integration/test_goals_qa.py` |
| AC-044 | test_ac044_out_of_range_progress_is_refused_and_the_previous_value_kept[abc] | Integration | Passed | `backend/tests/integration/test_goals_qa.py` |
| AC-044 | test_ac044_out_of_range_progress_is_refused_and_the_previous_value_kept[value5] | Integration | Passed | `backend/tests/integration/test_goals_qa.py` |
| AC-045 | test_ac045_an_unknown_status_is_refused_field_level | Integration | Passed | `backend/tests/integration/test_goals_qa.py` |
| AC-045 | test_ac045_every_status_round_trips[Achieved] | Integration | Passed | `backend/tests/integration/test_goals_qa.py` |
| AC-045 | test_ac045_every_status_round_trips[At risk] | Integration | Passed | `backend/tests/integration/test_goals_qa.py` |
| AC-045 | test_ac045_every_status_round_trips[Cancelled] | Integration | Passed | `backend/tests/integration/test_goals_qa.py` |
| AC-045 | test_ac045_every_status_round_trips[Not started] | Integration | Passed | `backend/tests/integration/test_goals_qa.py` |
| AC-045 | test_ac045_every_status_round_trips[Off track] | Integration | Passed | `backend/tests/integration/test_goals_qa.py` |
| AC-045 | test_ac045_every_status_round_trips[On track] | Integration | Passed | `backend/tests/integration/test_goals_qa.py` |
| AC-046 | test_ac046_a_goal_due_today_or_later_is_not_overdue | Integration | Passed | `backend/tests/integration/test_goals_qa.py` |
| AC-046 | test_ac046_a_past_due_date_flags_the_goal_as_overdue | Integration | Passed | `backend/tests/integration/test_goals_qa.py` |
| AC-046 | test_ac046_an_open_status_keeps_the_overdue_flag[At risk] | Integration | Passed | `backend/tests/integration/test_goals_qa.py` |
| AC-046 | test_ac046_an_open_status_keeps_the_overdue_flag[Not started] | Integration | Passed | `backend/tests/integration/test_goals_qa.py` |
| AC-046 | test_ac046_an_open_status_keeps_the_overdue_flag[Off track] | Integration | Passed | `backend/tests/integration/test_goals_qa.py` |
| AC-046 | test_ac046_an_open_status_keeps_the_overdue_flag[On track] | Integration | Passed | `backend/tests/integration/test_goals_qa.py` |
| AC-046 | test_ac046_an_overdue_goal_stops_being_flagged_once_closed[Achieved] | Integration | Passed | `backend/tests/integration/test_goals_qa.py` |
| AC-046 | test_ac046_an_overdue_goal_stops_being_flagged_once_closed[Cancelled] | Integration | Passed | `backend/tests/integration/test_goals_qa.py` |
| AC-046 | test_ac046_moving_the_due_date_forward_clears_the_flag | Integration | Passed | `backend/tests/integration/test_goals_qa.py` |
| AC-047 | test_ac047_a_non_owner_non_hr_caller_is_refused_403_with_an_empty_body[executive@example.com] | Integration | Passed | `backend/tests/integration/test_goals_qa.py` |
| AC-047 | test_ac047_a_non_owner_non_hr_caller_is_refused_403_with_an_empty_body[manager@example.com] | Integration | Passed | `backend/tests/integration/test_goals_qa.py` |
| AC-047 | test_ac047_signed_out_calls_are_401 | Integration | Passed | `backend/tests/integration/test_goals_qa.py` |
| AC-047 | test_ac047_the_owner_and_hr_may_still_write | Integration | Passed | `backend/tests/integration/test_goals_qa.py` |
| — | test_nfr009_a_refused_change_writes_no_audit_row | Integration | Passed | `backend/tests/integration/test_goals_qa.py` |
| — | test_nfr009_create_edit_and_progress_each_append_an_audit_row_in_order | Integration | Passed | `backend/tests/integration/test_goals_qa.py` |
| — | test_nfr009_no_route_edits_or_deletes_an_audit_entry | Integration | Passed | `backend/tests/integration/test_goals_qa.py` |
| — | test_nfr009_the_trail_survives_a_goal_being_removed | Integration | Passed | `backend/tests/integration/test_goals_qa.py` |
| — | test_nfr015_listing_goals_in_an_organisation_of_200_returns_without_timing_out | Integration | Passed | `backend/tests/integration/test_goals_qa.py` |
| — | test_nfr019_an_employee_with_no_goals_gets_an_empty_list_not_an_error | Integration | Passed | `backend/tests/integration/test_goals_qa.py` |
| AC-038 | [AC-038] an employee writes a goal and it appears at 0% progress | E2E | Not run yet | `frontend/e2e/goals.spec.ts` |
| AC-039 | [AC-039] [NFR-019] saving a goal with nothing filled in names every missing field | E2E | Not run yet | `frontend/e2e/goals.spec.ts` |
| AC-041 | [AC-041] [NFR-019] weightings over 100% for a period warn without blocking the save | E2E | Not run yet | `frontend/e2e/goals.spec.ts` |
| AC-043, AC-045 | [AC-043] [AC-045] the owner records progress and a status against their goal | E2E | Not run yet | `frontend/e2e/goals.spec.ts` |
| AC-046 | [AC-046] a goal past its due date is flagged overdue until it is closed | E2E | Not run yet | `frontend/e2e/goals.spec.ts` |
| AC-047 | [AC-047] a non-owner, non-HR user is refused by the server with an empty body | E2E | Not run yet | `frontend/e2e/goals.spec.ts` |

## Sprint 4

### US-013: Align a goal to a parent company or department goal

| Criteria | Test | Level | Result | File |
|---|---|---|---|---|
| AC-048 | test_ac048_parent_set_and_cleared_on_edit | Integration | Passed | `backend/tests/integration/test_goal_alignment_qa.py` |
| AC-048 | test_ac048_parent_set_on_create_and_parent_title_returned | Integration | Passed | `backend/tests/integration/test_goal_alignment_qa.py` |
| AC-049 | test_ac049_a_peer_without_a_chain_link_does_not_see_the_child | Integration | Passed | `backend/tests/integration/test_goal_alignment_qa.py` |
| AC-049 | test_ac049_children_list_only_contains_children_the_caller_may_view | Integration | Passed | `backend/tests/integration/test_goal_alignment_qa.py` |
| AC-050 | test_ac050_self_parent_is_422_and_persists_nothing | Integration | Passed | `backend/tests/integration/test_goal_alignment_qa.py` |
| AC-050 | test_ac050_three_goal_loop_is_422_and_persists_nothing | Integration | Passed | `backend/tests/integration/test_goal_alignment_qa.py` |
| AC-050 | test_ac050_two_goal_loop_is_422_and_persists_nothing | Integration | Passed | `backend/tests/integration/test_goal_alignment_qa.py` |
| AC-051 | test_ac051_hr_delete_of_a_parent_with_children_is_409_until_unlinked | Integration | Passed | `backend/tests/integration/test_goal_alignment_qa.py` |
| AC-052 | test_ac052_hr_creates_company_and_department_goals_listed_in_parent_options | Integration | Passed | `backend/tests/integration/test_goal_alignment_qa.py` |
| AC-053 | test_ac053_employee_sees_company_and_own_department_goals_only | Integration | Passed | `backend/tests/integration/test_goal_alignment_qa.py` |
| AC-054 | test_ac054_non_hr_cannot_create_company_or_department_goals[company-employee@example.com] | Integration | Passed | `backend/tests/integration/test_goal_alignment_qa.py` |
| AC-054 | test_ac054_non_hr_cannot_create_company_or_department_goals[company-manager@example.com] | Integration | Passed | `backend/tests/integration/test_goal_alignment_qa.py` |
| AC-054 | test_ac054_non_hr_cannot_create_company_or_department_goals[department-employee@example.com] | Integration | Passed | `backend/tests/integration/test_goal_alignment_qa.py` |
| AC-054 | test_ac054_non_hr_cannot_create_company_or_department_goals[department-manager@example.com] | Integration | Passed | `backend/tests/integration/test_goal_alignment_qa.py` |
| — | test_fresh_client_helper_is_importable | Integration | Passed | `backend/tests/integration/test_goal_alignment_qa.py` |
| — | test_nfr001_non_hr_cannot_reach_another_departments_goal_by_id | Integration | Passed | `backend/tests/integration/test_goal_alignment_qa.py` |
| — | test_nfr015_parent_options_with_200_employees_responds_in_time | Integration | Passed | `backend/tests/integration/test_goal_alignment_qa.py` |
| AC-048, AC-052 | [AC-048] [AC-052] HR creates a company goal and an employee aligns to it | E2E | Not run yet | `frontend/e2e/goal-alignment.spec.ts` |
| AC-050 | [AC-050] a self-parent is refused and the message is shown | E2E | Not run yet | `frontend/e2e/goal-alignment.spec.ts` |
| AC-052, AC-054 | [AC-052] [AC-054] HR sees a Level control; an employee does not | E2E | Not run yet | `frontend/e2e/goal-alignment.spec.ts` |

### US-015: Manager oversees goals across their reporting line

| Criteria | Test | Level | Result | File |
|---|---|---|---|---|
| AC-055 | test_ac055_manager_without_reports_gets_empty_list | Integration | Passed | `backend/tests/integration/test_team_goals.py` |
| AC-055 | test_ac055_team_goals_lists_each_direct_report | Integration | Passed | `backend/tests/integration/test_team_goals.py` |
| AC-056 | test_ac056_blank_body_is_422 | Integration | Passed | `backend/tests/integration/test_team_goals.py` |
| AC-056 | test_ac056_comment_stored_and_returned_oldest_first | Integration | Passed | `backend/tests/integration/test_team_goals.py` |
| AC-056 | test_ac056_hr_may_comment_and_others_refused | Integration | Passed | `backend/tests/integration/test_team_goals.py` |
| AC-057 | test_ac057_outside_reports_excluded_and_403 | Integration | Passed | `backend/tests/integration/test_team_goals.py` |
| AC-057 | test_ac057_peer_goal_is_refused | Integration | Passed | `backend/tests/integration/test_team_goals.py` |
| — | test_nfr001_roles_deactivation_and_reassignment | Integration | Passed | `backend/tests/integration/test_team_goals.py` |
| — | test_nfr015_team_goals_with_200_reports | Integration | Passed | `backend/tests/integration/test_team_goals.py` |
| AC-055 | test_ac055_each_direct_report_with_goals_weighting_progress_status | Integration | Passed | `backend/tests/integration/test_team_goals_qa.py` |
| AC-055 | test_ac055_report_without_goals_is_still_listed | Integration | Passed | `backend/tests/integration/test_team_goals_qa.py` |
| AC-056 | test_ac056_blank_comment_is_422_and_stores_nothing[payload0] | Integration | Passed | `backend/tests/integration/test_team_goals_qa.py` |
| AC-056 | test_ac056_blank_comment_is_422_and_stores_nothing[payload1] | Integration | Passed | `backend/tests/integration/test_team_goals_qa.py` |
| AC-056 | test_ac056_blank_comment_is_422_and_stores_nothing[payload2] | Integration | Passed | `backend/tests/integration/test_team_goals_qa.py` |
| AC-056 | test_ac056_blank_comment_is_422_and_stores_nothing[payload3] | Integration | Passed | `backend/tests/integration/test_team_goals_qa.py` |
| AC-056 | test_ac056_comment_requires_mutation_header_and_session | Integration | Passed | `backend/tests/integration/test_team_goals_qa.py` |
| AC-056 | test_ac056_comment_visible_to_owner_and_manager_and_persisted | Integration | Passed | `backend/tests/integration/test_team_goals_qa.py` |
| AC-057 | test_ac057_grand_report_is_not_a_direct_report | Integration | Passed | `backend/tests/integration/test_team_goals_qa.py` |
| AC-057 | test_ac057_no_outside_goal_in_team_goals | Integration | Passed | `backend/tests/integration/test_team_goals_qa.py` |
| AC-057 | test_ac057_outside_goal_get_and_comment_403_empty | Integration | Passed | `backend/tests/integration/test_team_goals_qa.py` |
| AC-057 | test_ac057_reassigned_report_leaves_first_managers_view | Integration | Passed | `backend/tests/integration/test_team_goals_qa.py` |
| — | test_nfr001_employee_and_executive_refused_team_goals[employee@example.com] | Integration | Passed | `backend/tests/integration/test_team_goals_qa.py` |
| — | test_nfr001_employee_and_executive_refused_team_goals[executive@example.com] | Integration | Passed | `backend/tests/integration/test_team_goals_qa.py` |
| — | test_nfr001_executive_refused_comment_and_nothing_stored | Integration | Passed | `backend/tests/integration/test_team_goals_qa.py` |
| — | test_nfr001_signed_out_team_goals_is_401 | Integration | Passed | `backend/tests/integration/test_team_goals_qa.py` |
| — | test_nfr015_team_goals_for_many_reports_within_timeout | Integration | Passed | `backend/tests/integration/test_team_goals_qa.py` |
| AC-055, AC-056, AC-057 | [AC-055] [AC-056] [AC-057] manager sees reports' goals, comments, and reassigned report leaves | E2E | Not run yet | `frontend/e2e/team-goals.spec.ts` |
| — | [NFR-001] an employee gets 403 from /team/goals | E2E | Not run yet | `frontend/e2e/team-goals.spec.ts` |

### US-021: Give praise to a colleague

| Criteria | Test | Level | Result | File |
|---|---|---|---|---|
| AC-078 | Praise composer > [AC-078] sends POST /feedback and confirms with the recipient's name, excluding me | Unit | Passed | `frontend/src/screens/MyPerformance.praise.test.tsx` |
| AC-079 | Praise composer > [AC-079] shows the API's messages beside an empty message and missing recipient | Unit | Passed | `frontend/src/screens/MyPerformance.praise.test.tsx` |
| AC-080 | Praise composer > [AC-080] shows the self-recipient message on the recipient field | Unit | Passed | `frontend/src/screens/MyPerformance.praise.test.tsx` |
| AC-091 | Praise composer > [AC-091] shows the readers statement from GET /feedback/audience before sending | Unit | Passed | `frontend/src/screens/MyPerformance.praise.test.tsx` |
| AC-081 | Received feedback > [AC-081] lists each item with author and date, newest first | Unit | Passed | `frontend/src/screens/MyPerformance.praise.test.tsx` |
| AC-081 | Received feedback > [AC-081] shows an empty-state explanation, not an error, with none | Unit | Passed | `frontend/src/screens/MyPerformance.praise.test.tsx` |
| AC-078 | test_ac078_creates_praise_with_caller_as_author | Integration | Passed | `backend/tests/integration/test_feedback.py` |
| AC-079 | test_ac079_blank_body_and_missing_recipient_together | Integration | Passed | `backend/tests/integration/test_feedback.py` |
| AC-080 | test_ac080_self_and_unknown_recipient | Integration | Passed | `backend/tests/integration/test_feedback.py` |
| AC-081 | test_ac081_dashboard_and_feedback_lists | Integration | Passed | `backend/tests/integration/test_feedback.py` |
| — | test_nfr001_executive_refused_on_post | Integration | Passed | `backend/tests/integration/test_feedback.py` |
| — | test_nfr001_feedback_not_visible_to_others | Integration | Passed | `backend/tests/integration/test_feedback.py` |
| — | test_picker_scope | Integration | Passed | `backend/tests/integration/test_feedback.py` |

### US-024: HR configures manager visibility of feedback

| Criteria | Test | Level | Result | File |
|---|---|---|---|---|
| AC-089 | People settings > [AC-089] shows the stored value from GET /settings and the readers statement | Unit | Passed | `frontend/src/screens/People.settings.test.tsx` |
| AC-089 | People settings > [AC-089] switching on sends PUT and shows the saved message only after the API confirms | Unit | Passed | `frontend/src/screens/People.settings.test.tsx` |
| AC-090 | People settings > [AC-090] a failed save returns the switch to the stored value and shows an error | Unit | Passed | `frontend/src/screens/People.settings.test.tsx` |
| AC-090 | People settings > [AC-090] switching off says managers no longer see it and describes the off state | Unit | Passed | `frontend/src/screens/People.settings.test.tsx` |
| — | People settings > [NFR-020] non-HR users get no Settings tab and no settings calls | Unit | Passed | `frontend/src/screens/People.settings.test.tsx` |
| AC-089 | test_ac089_hr_put_stores_audits_and_rejects_bad_values | Integration | Passed | `backend/tests/integration/test_settings.py` |
| AC-089 | test_ac089_manager_reads_after_enable | Integration | Passed | `backend/tests/integration/test_settings.py` |
| AC-090 | test_ac090_off_state_per_role | Integration | Passed | `backend/tests/integration/test_settings.py` |
| AC-090 | test_ac090_on_state_per_role | Integration | Passed | `backend/tests/integration/test_settings.py` |
| AC-091 | test_ac091_audience_statement_tracks_setting | Integration | Passed | `backend/tests/integration/test_settings.py` |
| — | test_nfr008_no_caching_of_statement | Integration | Passed | `backend/tests/integration/test_settings.py` |
| — | test_nfr020_get_settings_hr_only_with_defaults | Integration | Passed | `backend/tests/integration/test_settings.py` |
| AC-089 | test_ac089_hr_switches_on_persists_manager_reads_and_audit_row | Integration | Passed | `backend/tests/integration/test_settings_qa.py` |
| AC-089 | test_ac089_switching_off_again_hides_it_and_audits | Integration | Passed | `backend/tests/integration/test_settings_qa.py` |
| AC-090 | test_ac090_manager_outside_the_line_is_403_empty[false] | Integration | Passed | `backend/tests/integration/test_settings_qa.py` |
| AC-090 | test_ac090_manager_outside_the_line_is_403_empty[true] | Integration | Passed | `backend/tests/integration/test_settings_qa.py` |
| AC-090 | test_ac090_off_recipient_hr_see_manager_and_executive_do_not | Integration | Passed | `backend/tests/integration/test_settings_qa.py` |
| AC-090 | test_ac090_on_executive_still_gets_no_individual_feedback | Integration | Passed | `backend/tests/integration/test_settings_qa.py` |
| AC-091 | test_ac091_audience_statement_for_off_and_on | Integration | Passed | `backend/tests/integration/test_settings_qa.py` |
| — | test_nfr008_statement_follows_hr_toggle_via_api | Integration | Passed | `backend/tests/integration/test_settings_qa.py` |
| — | test_nfr020_non_boolean_is_422_and_stores_nothing[0] | Integration | Passed | `backend/tests/integration/test_settings_qa.py` |
| — | test_nfr020_non_boolean_is_422_and_stores_nothing[1] | Integration | Passed | `backend/tests/integration/test_settings_qa.py` |
| — | test_nfr020_non_boolean_is_422_and_stores_nothing[None] | Integration | Passed | `backend/tests/integration/test_settings_qa.py` |
| — | test_nfr020_non_boolean_is_422_and_stores_nothing[bad5] | Integration | Passed | `backend/tests/integration/test_settings_qa.py` |
| — | test_nfr020_non_boolean_is_422_and_stores_nothing[bad6] | Integration | Passed | `backend/tests/integration/test_settings_qa.py` |
| — | test_nfr020_non_boolean_is_422_and_stores_nothing[true] | Integration | Passed | `backend/tests/integration/test_settings_qa.py` |
| — | test_nfr020_non_boolean_is_422_and_stores_nothing[yes] | Integration | Passed | `backend/tests/integration/test_settings_qa.py` |
| — | test_nfr020_non_hr_put_is_403_empty_and_changes_nothing[employee@example.com] | Integration | Passed | `backend/tests/integration/test_settings_qa.py` |
| — | test_nfr020_non_hr_put_is_403_empty_and_changes_nothing[executive@example.com] | Integration | Passed | `backend/tests/integration/test_settings_qa.py` |
| — | test_nfr020_non_hr_put_is_403_empty_and_changes_nothing[manager@example.com] | Integration | Passed | `backend/tests/integration/test_settings_qa.py` |
| — | test_nfr020_put_requires_mutation_header | Integration | Passed | `backend/tests/integration/test_settings_qa.py` |
| — | test_nfr020_signed_out_put_is_401 | Integration | Passed | `backend/tests/integration/test_settings_qa.py` |
| — | test_nfr020_value_is_held_in_system_setting_table | Integration | Passed | `backend/tests/integration/test_settings_qa.py` |
| AC-089 | [AC-089] HR switches the setting on, it survives a reload | E2E | Not run yet | `frontend/e2e/manager-feedback-visibility.spec.ts` |
| AC-091 | [AC-091] composer shows the readership statement and it updates after HR toggles | E2E | Not run yet | `frontend/e2e/manager-feedback-visibility.spec.ts` |
| — | [NFR-020] a non-HR user has no editable setting | E2E | Not run yet | `frontend/e2e/manager-feedback-visibility.spec.ts` |

## Sprint 5

### US-016: HR builds a competency questionnaire

| Criteria | Test | Level | Result | File |
|---|---|---|---|---|
| AC-058 | test_ac058_create_lists_with_status_and_available_once_published | Integration | Passed | `backend/tests/integration/test_questionnaires.py` |
| AC-059 | test_ac059_saved_type_returned_and_drives_what_an_answer_supplies | Integration | Passed | `backend/tests/integration/test_questionnaires.py` |
| AC-059 | test_ac059_unknown_question_type_is_422_field_level | Integration | Passed | `backend/tests/integration/test_questionnaires.py` |
| AC-060 | test_ac060_bad_points_are_422_per_field[points0-points] | Integration | Passed | `backend/tests/integration/test_questionnaires.py` |
| AC-060 | test_ac060_bad_points_are_422_per_field[points1-points.0.label] | Integration | Passed | `backend/tests/integration/test_questionnaires.py` |
| AC-060 | test_ac060_bad_points_are_422_per_field[points2-points.1.value] | Integration | Passed | `backend/tests/integration/test_questionnaires.py` |
| AC-060 | test_ac060_scale_stored_returned_and_embedded_on_rated_questions | Integration | Passed | `backend/tests/integration/test_questionnaires.py` |
| AC-061 | test_ac061_edit_creates_a_new_version_and_the_snapshot_is_byte_identical | Integration | Passed | `backend/tests/integration/test_questionnaires.py` |
| AC-062 | test_ac062_publish_without_questions_is_422_and_stays_draft | Integration | Passed | `backend/tests/integration/test_questionnaires.py` |
| — | test_nfr001_non_hr_is_403_empty_on_every_route[employee@example.com] | Integration | Passed | `backend/tests/integration/test_questionnaires.py` |
| — | test_nfr001_non_hr_is_403_empty_on_every_route[executive@example.com] | Integration | Passed | `backend/tests/integration/test_questionnaires.py` |
| — | test_nfr001_non_hr_is_403_empty_on_every_route[manager@example.com] | Integration | Passed | `backend/tests/integration/test_questionnaires.py` |
| — | test_nfr001_signed_out_is_401_and_mutation_needs_the_header | Integration | Passed | `backend/tests/integration/test_questionnaires.py` |
| — | test_nfr010_an_edit_leaves_the_previous_version_rows_untouched | Integration | Passed | `backend/tests/integration/test_questionnaires.py` |
| AC-058 | test_ac058_a_template_with_competencies_and_questions_is_listed_once_published | Integration | Passed | `backend/tests/integration/test_questionnaires_qa.py` |
| AC-059 | test_ac059_a_question_needs_text | Integration | Passed | `backend/tests/integration/test_questionnaires_qa.py` |
| AC-059 | test_ac059_an_invalid_question_type_is_422_and_stores_nothing[3] | Integration | Passed | `backend/tests/integration/test_questionnaires_qa.py` |
| AC-059 | test_ac059_an_invalid_question_type_is_422_and_stores_nothing[None] | Integration | Passed | `backend/tests/integration/test_questionnaires_qa.py` |
| AC-059 | test_ac059_an_invalid_question_type_is_422_and_stores_nothing[RATED ] | Integration | Passed | `backend/tests/integration/test_questionnaires_qa.py` |
| AC-059 | test_ac059_an_invalid_question_type_is_422_and_stores_nothing[] | Integration | Passed | `backend/tests/integration/test_questionnaires_qa.py` |
| AC-059 | test_ac059_an_invalid_question_type_is_422_and_stores_nothing[multiple_choice] | Integration | Passed | `backend/tests/integration/test_questionnaires_qa.py` |
| AC-059 | test_ac059_an_invalid_question_type_is_422_and_stores_nothing[rating] | Integration | Passed | `backend/tests/integration/test_questionnaires_qa.py` |
| AC-059 | test_ac059_rated_text_and_both_question_types_persist | Integration | Passed | `backend/tests/integration/test_questionnaires_qa.py` |
| AC-060 | test_ac060_bad_scale_points_or_labels_are_422_and_store_nothing[labels0] | Integration | Passed | `backend/tests/integration/test_questionnaires_qa.py` |
| AC-060 | test_ac060_bad_scale_points_or_labels_are_422_and_store_nothing[labels1] | Integration | Passed | `backend/tests/integration/test_questionnaires_qa.py` |
| AC-060 | test_ac060_bad_scale_points_or_labels_are_422_and_store_nothing[labels2] | Integration | Passed | `backend/tests/integration/test_questionnaires_qa.py` |
| AC-060 | test_ac060_bad_scale_points_or_labels_are_422_and_store_nothing[labels3] | Integration | Passed | `backend/tests/integration/test_questionnaires_qa.py` |
| AC-060 | test_ac060_bad_scale_points_or_labels_are_422_and_store_nothing[labels4] | Integration | Passed | `backend/tests/integration/test_questionnaires_qa.py` |
| AC-060 | test_ac060_bad_scale_points_or_labels_are_422_and_store_nothing[labels5] | Integration | Passed | `backend/tests/integration/test_questionnaires_qa.py` |
| AC-060 | test_ac060_bad_scale_points_or_labels_are_422_and_store_nothing[not-a-list] | Integration | Passed | `backend/tests/integration/test_questionnaires_qa.py` |
| AC-060 | test_ac060_scale_points_and_labels_are_saved_and_shown_on_rated_questions | Integration | Passed | `backend/tests/integration/test_questionnaires_qa.py` |
| AC-061 | test_ac061_a_captured_snapshot_is_untouched_by_a_later_edit | Integration | Passed | `backend/tests/integration/test_questionnaires_qa.py` |
| AC-061 | test_ac061_editing_a_published_template_never_destroys_the_earlier_wording | Integration | Passed | `backend/tests/integration/test_questionnaires_qa.py` |
| AC-062 | test_ac062_a_competency_with_no_questions_still_cannot_be_published | Integration | Passed | `backend/tests/integration/test_questionnaires_qa.py` |
| AC-062 | test_ac062_publishing_without_questions_is_422_and_the_template_stays_unpublished | Integration | Passed | `backend/tests/integration/test_questionnaires_qa.py` |
| — | test_nfr001_mutations_require_the_mutation_header | Integration | Passed | `backend/tests/integration/test_questionnaires_qa.py` |
| — | test_nfr001_non_hr_roles_are_refused_403_with_an_empty_body[employee@example.com] | Integration | Passed | `backend/tests/integration/test_questionnaires_qa.py` |
| — | test_nfr001_non_hr_roles_are_refused_403_with_an_empty_body[executive@example.com] | Integration | Passed | `backend/tests/integration/test_questionnaires_qa.py` |
| — | test_nfr001_non_hr_roles_are_refused_403_with_an_empty_body[manager@example.com] | Integration | Passed | `backend/tests/integration/test_questionnaires_qa.py` |
| — | test_nfr001_signed_out_calls_are_401 | Integration | Passed | `backend/tests/integration/test_questionnaires_qa.py` |
| — | test_nfr010_no_route_hard_deletes_a_template | Integration | Passed | `backend/tests/integration/test_questionnaires_qa.py` |
| — | test_nfr015_a_large_framework_is_built_and_published_within_time | Integration | Passed | `backend/tests/integration/test_questionnaires_qa.py` |
| — | test_nfr020_the_questions_and_the_scale_live_in_the_database_not_in_code | Integration | Passed | `backend/tests/integration/test_questionnaires_qa.py` |

## Sprint 6

### US-017: HR opens a review period for participants

| Criteria | Test | Level | Result | File |
|---|---|---|---|---|
| AC-063 | Review periods > [AC-063] creating and opening posts the period then POST /review-periods/{id}/open | Unit | Passed | `frontend/src/screens/Reviews.periods.test.tsx` |
| AC-063 | Review periods > [AC-063] the picker and the period list come from the API, not from seeded constants | Unit | Passed | `frontend/src/screens/Reviews.periods.test.tsx` |
| AC-064 | Review periods > [AC-064] editing a draft saves through PATCH and says no tasks exist until it is opened | Unit | Passed | `frontend/src/screens/Reviews.periods.test.tsx` |
| AC-065 | Review periods > [AC-065] a submitted participant cannot be removed: the API's refusal shows and they stay | Unit | Passed | `frontend/src/screens/Reviews.periods.test.tsx` |
| AC-066 | Review periods > [AC-066] outstanding people are not marked overdue before the deadline | Unit | Passed | `frontend/src/screens/Reviews.periods.test.tsx` |
| AC-066 | Review periods > [AC-066] the tracker reads the status endpoint and marks outstanding people overdue | Unit | Passed | `frontend/src/screens/Reviews.periods.test.tsx` |
| — | Review periods > [NFR-019] shows the API's per-field messages against the fields on a 422 | Unit | Passed | `frontend/src/screens/Reviews.periods.test.tsx` |
| AC-063 | test_ac063_a_participant_added_after_opening_also_gets_a_task | Integration | Passed | `backend/tests/integration/test_review_periods_qa.py` |
| AC-063 | test_ac063_each_participant_sees_the_task_on_their_dashboard | Integration | Passed | `backend/tests/integration/test_review_periods_qa.py` |
| AC-063 | test_ac063_opening_creates_exactly_one_self_review_task_per_participant | Integration | Passed | `backend/tests/integration/test_review_periods_qa.py` |
| AC-064 | test_ac064_a_draft_needs_a_published_questionnaire_and_real_participants | Integration | Passed | `backend/tests/integration/test_review_periods_qa.py` |
| AC-064 | test_ac064_an_invalid_draft_edit_is_422_field_level_and_changes_nothing[end_date-] | Integration | Passed | `backend/tests/integration/test_review_periods_qa.py` |
| AC-064 | test_ac064_an_invalid_draft_edit_is_422_field_level_and_changes_nothing[name-  ] | Integration | Passed | `backend/tests/integration/test_review_periods_qa.py` |
| AC-064 | test_ac064_an_invalid_draft_edit_is_422_field_level_and_changes_nothing[participant_ids-value4] | Integration | Passed | `backend/tests/integration/test_review_periods_qa.py` |
| AC-064 | test_ac064_an_invalid_draft_edit_is_422_field_level_and_changes_nothing[start_date-31/12/2026] | Integration | Passed | `backend/tests/integration/test_review_periods_qa.py` |
| AC-064 | test_ac064_an_invalid_draft_edit_is_422_field_level_and_changes_nothing[submission_deadline-not-a-date] | Integration | Passed | `backend/tests/integration/test_review_periods_qa.py` |
| AC-064 | test_ac064_draft_edits_persist_and_no_task_exists_before_open | Integration | Passed | `backend/tests/integration/test_review_periods_qa.py` |
| AC-064 | test_ac064_the_end_date_cannot_precede_the_start_date | Integration | Passed | `backend/tests/integration/test_review_periods_qa.py` |
| AC-065 | test_ac065_an_outstanding_participant_can_still_be_removed | Integration | Passed | `backend/tests/integration/test_review_periods_qa.py` |
| AC-065 | test_ac065_removing_a_submitted_participant_is_refused_in_english_and_changes_nothing | Integration | Passed | `backend/tests/integration/test_review_periods_qa.py` |
| AC-065 | test_ac065_removing_twice_or_removing_a_non_participant_is_a_clean_404 | Integration | Passed | `backend/tests/integration/test_review_periods_qa.py` |
| AC-066 | test_ac066_an_unknown_period_is_404_on_every_read | Integration | Passed | `backend/tests/integration/test_review_periods_qa.py` |
| AC-066 | test_ac066_nothing_is_overdue_before_the_deadline | Integration | Passed | `backend/tests/integration/test_review_periods_qa.py` |
| AC-066 | test_ac066_outstanding_participants_are_flagged_overdue_after_the_deadline | Integration | Passed | `backend/tests/integration/test_review_periods_qa.py` |
| AC-066 | test_ac066_status_of_a_draft_period_lists_everyone_as_outstanding | Integration | Passed | `backend/tests/integration/test_review_periods_qa.py` |
| AC-066 | test_ac066_status_separates_submitted_from_outstanding | Integration | Passed | `backend/tests/integration/test_review_periods_qa.py` |
| — | test_nfr010_a_leaver_with_a_review_is_deactivated_not_deleted | Integration | Passed | `backend/tests/integration/test_review_periods_qa.py` |
| — | test_nfr010_a_submitted_review_keeps_the_questions_and_scale_it_was_sat_on | Integration | Passed | `backend/tests/integration/test_review_periods_qa.py` |
| — | test_nfr010_no_route_hard_deletes_a_review_period_or_a_self_review | Integration | Passed | `backend/tests/integration/test_review_periods_qa.py` |
| — | test_nfr014_closing_a_period_keeps_its_tasks_and_refuses_reopening | Integration | Passed | `backend/tests/integration/test_review_periods_qa.py` |
| — | test_nfr014_open_returns_promptly_and_queues_the_work | Integration | Passed | `backend/tests/integration/test_review_periods_qa.py` |
| — | test_nfr014_running_the_queued_job_twice_creates_no_duplicate_tasks | Integration | Passed | `backend/tests/integration/test_review_periods_qa.py` |
| — | test_nfr014_the_job_does_nothing_for_a_period_that_is_not_open | Integration | Passed | `backend/tests/integration/test_review_periods_qa.py` |
| — | test_nfr015_a_period_of_200_participants_opens_within_the_time_budget | Integration | Passed | `backend/tests/integration/test_review_periods_qa.py` |
| — | test_roles_mutations_require_the_custom_header | Integration | Passed | `backend/tests/integration/test_review_periods_qa.py` |
| — | test_roles_non_hr_is_403_with_an_empty_body_on_every_route[employee@example.com] | Integration | Passed | `backend/tests/integration/test_review_periods_qa.py` |
| — | test_roles_non_hr_is_403_with_an_empty_body_on_every_route[executive@example.com] | Integration | Passed | `backend/tests/integration/test_review_periods_qa.py` |
| — | test_roles_non_hr_is_403_with_an_empty_body_on_every_route[manager@example.com] | Integration | Passed | `backend/tests/integration/test_review_periods_qa.py` |
| — | test_roles_signed_out_calls_are_401 | Integration | Passed | `backend/tests/integration/test_review_periods_qa.py` |
| — | test_roles_the_executive_may_not_mutate_a_period | Integration | Passed | `backend/tests/integration/test_review_periods_qa.py` |

### US-018: Employee completes a self-review

| Criteria | Test | Level | Result | File |
|---|---|---|---|---|
| AC-067 | Employee self-review > [AC-067] renders every competency, question, scale label and free-text box from the API | Unit | Passed | `frontend/src/screens/Reviews.selfReview.test.tsx` |
| AC-068 | Employee self-review > [AC-068] Save as draft calls PUT /self-reviews/{id}/answers with the ratings and comments | Unit | Passed | `frontend/src/screens/Reviews.selfReview.test.tsx` |
| AC-068 | Employee self-review > [AC-068] a reload restores the ratings and comments the API has stored | Unit | Passed | `frontend/src/screens/Reviews.selfReview.test.tsx` |
| AC-069 | Employee self-review > [AC-069] submitting with mandatory questions unanswered is blocked and explained in place | Unit | Passed | `frontend/src/screens/Reviews.selfReview.test.tsx` |
| AC-069 | Employee self-review > [AC-069] the API's 422 per-field messages are shown against each question | Unit | Passed | `frontend/src/screens/Reviews.selfReview.test.tsx` |
| AC-070 | Employee self-review > [AC-070] confirming Submit posts to /submit and the review becomes read-only with name and time | Unit | Passed | `frontend/src/screens/Reviews.selfReview.test.tsx` |
| AC-071 | Employee self-review > [AC-071] a closed period explains why submission is no longer offered | Unit | Passed | `frontend/src/screens/Reviews.selfReview.test.tsx` |
| AC-071 | Employee self-review > [AC-071] an overdue task is flagged and submission is still offered | Unit | Passed | `frontend/src/screens/Reviews.selfReview.test.tsx` |
| — | Employee self-review > [NFR-019] a participant with no open self-review sees an explanation, not an error | Unit | Passed | `frontend/src/screens/Reviews.selfReview.test.tsx` |
| AC-067 | test_ac067_the_task_carries_the_questionnaire_with_its_scale_and_labels | Integration | Passed | `backend/tests/integration/test_self_reviews_qa.py` |
| AC-068 | test_ac068_a_part_complete_draft_round_trips_unchanged | Integration | Passed | `backend/tests/integration/test_self_reviews_qa.py` |
| AC-068 | test_ac068_a_rating_outside_the_scale_is_422_and_stores_nothing | Integration | Passed | `backend/tests/integration/test_self_reviews_qa.py` |
| AC-068 | test_ac068_a_second_draft_save_keeps_the_answers_it_does_not_mention | Integration | Passed | `backend/tests/integration/test_self_reviews_qa.py` |
| AC-068 | test_ac068_an_empty_draft_is_accepted_and_changes_nothing | Integration | Passed | `backend/tests/integration/test_self_reviews_qa.py` |
| AC-069 | test_ac069_a_rated_question_with_only_a_comment_is_still_blocked | Integration | Passed | `backend/tests/integration/test_self_reviews_qa.py` |
| AC-069 | test_ac069_only_the_still_missing_questions_are_named_on_a_part_complete_review | Integration | Passed | `backend/tests/integration/test_self_reviews_qa.py` |
| AC-069 | test_ac069_submitting_with_mandatory_questions_unanswered_is_422_per_question | Integration | Passed | `backend/tests/integration/test_self_reviews_qa.py` |
| AC-069 | test_ac069_whitespace_only_comment_does_not_count_as_an_answer | Integration | Passed | `backend/tests/integration/test_self_reviews_qa.py` |
| AC-070 | test_ac070_a_submitted_review_records_the_submitter_and_the_timestamp | Integration | Passed | `backend/tests/integration/test_self_reviews_qa.py` |
| AC-070 | test_ac070_a_submitted_review_refuses_every_further_edit | Integration | Passed | `backend/tests/integration/test_self_reviews_qa.py` |
| AC-070 | test_ac070_mutations_need_the_custom_header_and_a_session | Integration | Passed | `backend/tests/integration/test_self_reviews_qa.py` |
| AC-070 | test_ac070_the_submission_is_recorded_in_the_reviews_history | Integration | Passed | `backend/tests/integration/test_self_reviews_qa.py` |
| AC-071 | test_ac071_a_closed_period_also_refuses_a_draft_save | Integration | Passed | `backend/tests/integration/test_self_reviews_qa.py` |
| AC-071 | test_ac071_a_closed_period_refuses_submission_and_keeps_the_draft | Integration | Passed | `backend/tests/integration/test_self_reviews_qa.py` |
| AC-071 | test_ac071_an_overdue_unsubmitted_review_can_still_be_submitted | Integration | Passed | `backend/tests/integration/test_self_reviews_qa.py` |
| — | test_nfr001_one_employee_cannot_read_or_write_another_persons_review | Integration | Passed | `backend/tests/integration/test_self_reviews_qa.py` |
| — | test_nfr010_a_questionnaire_edit_after_submission_does_not_change_the_review | Integration | Passed | `backend/tests/integration/test_self_reviews_qa.py` |
| — | test_nfr010_an_edit_while_a_review_is_still_a_draft_also_leaves_it_alone | Integration | Passed | `backend/tests/integration/test_self_reviews_qa.py` |
| — | test_nfr015_a_period_of_200_people_gives_each_one_a_usable_task_in_time | Integration | Passed | `backend/tests/integration/test_self_reviews_qa.py` |
| — | test_nfr019_a_participant_with_no_open_task_gets_an_empty_list_not_an_error | Integration | Passed | `backend/tests/integration/test_self_reviews_qa.py` |
| — | test_nfr019_every_validation_message_is_plain_english_about_the_question | Integration | Passed | `backend/tests/integration/test_self_reviews_qa.py` |
| — | test_nfr019_someone_left_out_of_the_period_sees_no_task | Integration | Passed | `backend/tests/integration/test_self_reviews_qa.py` |
| AC-067, AC-068, AC-069, AC-070 | [AC-067] [AC-068] [AC-069] [AC-070] an employee completes, drafts and submits a self-review | E2E | Not run yet | `frontend/e2e/self-review.spec.ts` |
| AC-069 | [AC-069] [NFR-019] a participant with no open task sees the empty state, not an error | E2E | Not run yet | `frontend/e2e/self-review.spec.ts` |

### US-027: Track action items from a 1:1

| Criteria | Test | Level | Result | File |
|---|---|---|---|---|
| AC-100 | 1:1 action items > [AC-100] a 422 is shown against the field in plain English and nothing is listed | Unit | Passed | `frontend/src/screens/OneOnOnes.test.tsx` |
| AC-100 | 1:1 action items > [AC-100] adding an item posts to the API and it appears on the 1:1 and in the owner's open items | Unit | Passed | `frontend/src/screens/OneOnOnes.test.tsx` |
| AC-101 | 1:1 action items > [AC-101] marking complete posts to the API and the row shows the date and who completed it | Unit | Passed | `frontend/src/screens/OneOnOnes.test.tsx` |
| AC-102 | 1:1 action items > [AC-102] an item the API flags overdue is flagged for the viewer | Unit | Passed | `frontend/src/screens/OneOnOnes.test.tsx` |
| AC-102 | 1:1 action items > [AC-102] the other participant sees the same overdue flag on an item they do not own | Unit | Passed | `frontend/src/screens/OneOnOnes.test.tsx` |
| AC-103 | 1:1 action items > [AC-103] a new 1:1 lists the still-open items carried over from previous 1:1s | Unit | Passed | `frontend/src/screens/OneOnOnes.test.tsx` |
| AC-103 | 1:1 action items > [AC-103] with nothing outstanding the carry-over section explains rather than erroring | Unit | Passed | `frontend/src/screens/OneOnOnes.test.tsx` |
| AC-104 | 1:1 private note > [AC-104] [NFR-019] a refusal from the API is shown in plain English against the field | Unit | Passed | `frontend/src/screens/OneOnOnes.test.tsx` |
| AC-104 | 1:1 private note > [AC-104] the manager's note saves through PUT /one-on-ones/{id}/private-note | Unit | Passed | `frontend/src/screens/OneOnOnes.test.tsx` |
| AC-106 | 1:1 private note > [AC-106] falls back to GET /settings when the record does not carry the setting | Unit | Passed | `frontend/src/screens/OneOnOnes.test.tsx` |
| AC-106 | 1:1 private note > [AC-106] the label says HR cannot read the note when the API setting is off | Unit | Passed | `frontend/src/screens/OneOnOnes.test.tsx` |
| AC-106 | 1:1 private note > [AC-106] the same label says HR can read it when the API setting is on | Unit | Passed | `frontend/src/screens/OneOnOnes.test.tsx` |
| — | 1:1 private note > [NFR-007] a direct report's view has no private-note field or placeholder anywhere | Unit | Passed | `frontend/src/screens/OneOnOnes.test.tsx` |
| AC-100 | test_ac100_an_action_item_saves_with_its_owner_and_due_date | Integration | Passed | `backend/tests/integration/test_one_on_one_actions_qa.py` |
| AC-100 | test_ac100_an_incomplete_action_item_is_422_field_level_and_saves_nothing[description-  ] | Integration | Passed | `backend/tests/integration/test_one_on_one_actions_qa.py` |
| AC-100 | test_ac100_an_incomplete_action_item_is_422_field_level_and_saves_nothing[due_date-31/12/2026] | Integration | Passed | `backend/tests/integration/test_one_on_one_actions_qa.py` |
| AC-100 | test_ac100_an_incomplete_action_item_is_422_field_level_and_saves_nothing[due_date-] | Integration | Passed | `backend/tests/integration/test_one_on_one_actions_qa.py` |
| AC-100 | test_ac100_an_owner_who_is_not_a_participant_is_refused | Integration | Passed | `backend/tests/integration/test_one_on_one_actions_qa.py` |
| AC-100 | test_ac100_either_participant_may_own_and_either_may_add | Integration | Passed | `backend/tests/integration/test_one_on_one_actions_qa.py` |
| AC-100 | test_ac100_the_item_appears_in_the_owners_open_items | Integration | Passed | `backend/tests/integration/test_one_on_one_actions_qa.py` |
| AC-101 | test_ac101_a_completed_item_is_no_longer_overdue | Integration | Passed | `backend/tests/integration/test_one_on_one_actions_qa.py` |
| AC-101 | test_ac101_completing_records_the_date_and_who_completed_it | Integration | Passed | `backend/tests/integration/test_one_on_one_actions_qa.py` |
| AC-102 | test_ac102_an_item_due_today_is_not_yet_overdue | Integration | Passed | `backend/tests/integration/test_one_on_one_actions_qa.py` |
| AC-102 | test_ac102_an_overdue_open_item_is_flagged_for_both_participants | Integration | Passed | `backend/tests/integration/test_one_on_one_actions_qa.py` |
| AC-102 | test_ac102_the_overdue_item_also_shows_on_the_other_participants_1_to_1_list | Integration | Passed | `backend/tests/integration/test_one_on_one_actions_qa.py` |
| AC-102 | test_ac102_the_overdue_item_reaches_the_owners_dashboard | Integration | Passed | `backend/tests/integration/test_one_on_one_actions_qa.py` |
| AC-103 | test_ac103_a_first_1_to_1_carries_nothing_over | Integration | Passed | `backend/tests/integration/test_one_on_one_actions_qa.py` |
| AC-103 | test_ac103_carry_over_is_limited_to_the_same_pair | Integration | Passed | `backend/tests/integration/test_one_on_one_actions_qa.py` |
| AC-103 | test_ac103_still_open_items_from_earlier_1_to_1s_are_listed_as_carry_over | Integration | Passed | `backend/tests/integration/test_one_on_one_actions_qa.py` |
| AC-104 | test_ac104_an_edited_note_replaces_the_previous_one | Integration | Passed | `backend/tests/integration/test_one_on_one_actions_qa.py` |
| AC-104 | test_ac104_the_manager_saves_a_private_note_and_reads_it_back | Integration | Passed | `backend/tests/integration/test_one_on_one_actions_qa.py` |
| AC-105 | test_ac105_nfr007_no_response_to_the_direct_report_contains_the_note | Integration | Passed | `backend/tests/integration/test_one_on_one_actions_qa.py` |
| AC-105 | test_ac105_the_report_cannot_write_or_read_the_note_through_its_own_route | Integration | Passed | `backend/tests/integration/test_one_on_one_actions_qa.py` |
| AC-106 | test_ac106_hr_cannot_read_the_note_while_the_setting_is_off | Integration | Passed | `backend/tests/integration/test_one_on_one_actions_qa.py` |
| AC-106 | test_ac106_hr_reads_the_note_once_the_setting_is_on | Integration | Passed | `backend/tests/integration/test_one_on_one_actions_qa.py` |
| AC-106 | test_ac106_the_manager_is_told_which_state_the_setting_is_in | Integration | Passed | `backend/tests/integration/test_one_on_one_actions_qa.py` |
| AC-106 | test_ac106_the_setting_change_never_exposes_the_note_to_the_report | Integration | Passed | `backend/tests/integration/test_one_on_one_actions_qa.py` |
| — | test_nfr015_a_1_to_1_with_many_action_items_loads_within_the_time_budget | Integration | Passed | `backend/tests/integration/test_one_on_one_actions_qa.py` |
| — | test_nfr020_non_hr_cannot_change_the_visibility_setting[employee@example.com] | Integration | Passed | `backend/tests/integration/test_one_on_one_actions_qa.py` |
| — | test_nfr020_non_hr_cannot_change_the_visibility_setting[executive@example.com] | Integration | Passed | `backend/tests/integration/test_one_on_one_actions_qa.py` |
| — | test_nfr020_non_hr_cannot_change_the_visibility_setting[manager@example.com] | Integration | Passed | `backend/tests/integration/test_one_on_one_actions_qa.py` |
| — | test_nfr020_signed_out_cannot_change_the_visibility_setting | Integration | Passed | `backend/tests/integration/test_one_on_one_actions_qa.py` |
| — | test_nfr020_the_visibility_state_lives_in_system_setting | Integration | Passed | `backend/tests/integration/test_one_on_one_actions_qa.py` |
| — | test_roles_a_non_participant_is_403_with_an_empty_body | Integration | Passed | `backend/tests/integration/test_one_on_one_actions_qa.py` |
| — | test_roles_mutations_require_the_custom_header | Integration | Passed | `backend/tests/integration/test_one_on_one_actions_qa.py` |
| — | test_roles_signed_out_calls_are_401 | Integration | Passed | `backend/tests/integration/test_one_on_one_actions_qa.py` |
| AC-100, AC-101 | [AC-100] [AC-101] the manager adds an action item and the owner marks it complete | E2E | Not run yet | `frontend/e2e/one-on-one-actions.spec.ts` |
| AC-102 | [AC-102] an open action item past its due date is flagged as overdue | E2E | Not run yet | `frontend/e2e/one-on-one-actions.spec.ts` |
| AC-104, AC-105 | [AC-104] [AC-105] [NFR-007] only the manager sees the private note and its visibility statement | E2E | Not run yet | `frontend/e2e/one-on-one-actions.spec.ts` |

## Project setup

| Criteria | Test | Level | Result | File |
|---|---|---|---|---|
| — | test_health_reports_ok | Unit | Passed | `backend/tests/test_health.py` |
| — | test_the_openapi_document_builds | Unit | Passed | `backend/tests/test_health.py` |
| — | the app loads | E2E | Not run yet | `frontend/e2e/example.spec.ts` |
<!-- sdlc:auto:end tests -->
