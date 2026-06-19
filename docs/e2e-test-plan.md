# E2E Test Plan

Audit date: 2026-06-03

Scope: frontend deployment readiness and integration testing once the backend URL is available.

## Authentication

| Flow | Preconditions | Steps | Expected result | Failure conditions |
| --- | --- | --- | --- | --- |
| Login succeeds | Backend available; valid user exists | Open `/login`, enter valid email/password, submit | Token is stored, user is redirected to `/dashboard`, dashboard request includes bearer token | No token returned, wrong redirect, dashboard unauthorized, generic or blank error |
| Login fails | Backend available; invalid credentials | Open `/login`, enter invalid credentials, submit | Form stays on `/login`, submit button recovers, clear error is shown | Blank page, stale loading state, token stored after failure |
| Logout | Authenticated session exists | Click `Logout` in topbar | Token is removed and browser navigates to `/login` | Token remains, protected page is still accessible |
| Session restore | Token exists in `localStorage` | Refresh `/dashboard` | App calls session endpoint and keeps user on protected route | User is logged out despite valid token, session loading hangs |
| Token expiration | Expired token exists | Open any protected route | Token is removed and user is redirected to `/login` | Protected content remains visible after 401 |
| Protected route enforcement | No token exists | Open `/dashboard`, `/students`, `/staff`, `/courses`, `/attendance`, `/results`, `/notifications`, `/settings` | User is redirected to `/login` | Any protected route renders without authentication |
| Role forbidden | Authenticated user lacks an allowed role | Open protected app route | User is redirected to `/unauthorized` or sees authorization error for API 403 | Forbidden response appears as empty data or protected action succeeds |

## Dashboard

| Flow | Preconditions | Steps | Expected result | Failure conditions |
| --- | --- | --- | --- | --- |
| Load dashboard data | Authenticated user; backend returns stats | Open `/dashboard` | Loading state appears, then stats render | Loading never clears, stats render as raw objects, console error |
| Empty dashboard | Authenticated user; backend returns no stats | Open `/dashboard` | Empty state reads `No dashboard data available.` | Blank content or false success data |
| Dashboard API failures | Backend can return 401, 403, 404, 500, and network failure | Force each failure and open `/dashboard` | 401 redirects to login; 403/404/500/network render clear error states | App crashes, infinite redirect, stale data remains |

## Students

| Flow | Preconditions | Steps | Expected result | Failure conditions |
| --- | --- | --- | --- | --- |
| List students | Authenticated user; backend returns students | Open `/students` | Loading state appears, then table renders records | Missing rows, missing IDs for actions, loading hangs |
| Empty students | Backend returns empty list | Open `/students` | Empty state reads `No students found.` | Blank table or mock rows |
| Create student | Backend accepts `{ name, email, classLevel }` | Fill form and submit | Button shows saving state, form resets, list refreshes | Duplicate stale row, form stuck saving, contract mismatch |
| Update student | At least one student exists with `id` or `_id` | Click Edit, change a field, submit | Record updates and list refreshes | Missing ID prevents update, wrong endpoint called |
| Delete student | At least one student exists with `id` or `_id` | Click Delete | Record is removed after list refresh | Delete silently fails, missing ID not reported |

## Staff

| Flow | Preconditions | Steps | Expected result | Failure conditions |
| --- | --- | --- | --- | --- |
| Staff CRUD | Authenticated user; backend supports `/api/staff` or `/api/users` | Open `/staff`, list, create, update, delete staff | Frontend uses first available endpoint and refreshes list after mutations | Both endpoint names missing, role payload rejected, missing ID |
| Empty staff | Backend returns empty list | Open `/staff` | Empty state reads `No staff found.` | Blank content or mock rows |

## Booking System

| Flow | Preconditions | Steps | Expected result | Failure conditions |
| --- | --- | --- | --- | --- |
| Backend route confirmation | Backend deployment pending | Confirm whether booking endpoints and frontend route are in scope for the deployed contract | No booking frontend route exists in the current app; team records backend decision before testing | Testers expect a booking UI that is not present, or mock booking data is reintroduced |

## Attendance

| Flow | Preconditions | Steps | Expected result | Failure conditions |
| --- | --- | --- | --- | --- |
| Attendance CRUD | Authenticated user; backend supports attendance endpoints | Open `/attendance`, list, create, update, delete attendance records | Loading, success, empty, save, delete, and error states behave consistently | Date/status payload rejected without useful error, stale table after mutation |
| Attendance failures | Backend can return 401, 403, 404, 500, network failure | Exercise each response | 401 redirects; other failures render normalized errors | App crashes or shows empty state for failed request |

## Results Portal

| Flow | Preconditions | Steps | Expected result | Failure conditions |
| --- | --- | --- | --- | --- |
| Results CRUD | Authenticated user; backend supports results endpoints | Open `/results`, list, create, update, delete result records | Records render in table; form uses `{ studentId, courseId, score, term }` | Score/term validation mismatch, missing ID, stale data |
| Empty results | Backend returns empty list | Open `/results` | Empty state reads `No results found.` | Blank content or mock rows |

## Notifications

| Flow | Preconditions | Steps | Expected result | Failure conditions |
| --- | --- | --- | --- | --- |
| Notifications CRUD | Authenticated user; backend supports notification endpoints | Open `/notifications`, list, create, update, delete notifications | Records render and list refreshes after mutations | Audience contract mismatch, save/delete error hidden |
| Empty notifications | Backend returns empty list | Open `/notifications` | Empty state reads `No notifications found.` | Blank content or mock rows |

## Settings

| Flow | Preconditions | Steps | Expected result | Failure conditions |
| --- | --- | --- | --- | --- |
| Settings CRUD | Authenticated user; backend supports settings endpoints | Open `/settings`, list, create, update, delete settings | Records render and list refreshes after mutations | Key/value contract mismatch, missing ID, stale data |
| Empty settings | Backend returns empty list | Open `/settings` | Empty state reads `No settings found.` | Blank content or mock rows |

## Cross-Module UI Consistency

| Area | Validation |
| --- | --- |
| Buttons | Submit buttons disable and change text while saving; secondary action buttons use `type="button"` |
| Forms | Required fields use native validation; backend errors render with `role="alert"` |
| Tables | Resource pages share the same table wrapper, generated columns, and action layout |
| Modals | No modal UI exists in the current frontend |
| Pagination | No pagination UI exists in the current frontend |
| Search | No search UI exists in the current frontend |
| Filters | No filter UI exists in the current frontend |
| Notifications | System notifications page follows the shared resource pattern; toast notifications are not implemented |

## Execution Exit Criteria

The frontend is ready for full system validation when all listed flows pass against the deployed backend URL, every protected request includes the bearer token, all empty datasets render explicit empty states, and all 401/403/404/500/network failure cases produce either the expected redirect or a visible error state.
