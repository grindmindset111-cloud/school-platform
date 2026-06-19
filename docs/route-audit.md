# Route Audit

Audit date: 2026-06-03

Frontend app: `frontend/src/routes/index.jsx`

## Route Coverage

| Route | Component | Required API endpoint | Authentication requirement | Current status |
| --- | --- | --- | --- | --- |
| `/login` | `Login` | `POST /api/auth/login` | Public | Ready. Handles loading, success redirect, validation-required fields, API errors, 401/403/404/500, and network failure messaging. |
| `/register` | `Register` | `POST /api/auth/register` | Public | Ready. Handles loading, success redirect, required fields, API errors, 401/403/404/500, and network failure messaging. |
| `/` | `ProtectedRoute` + `Layout` index redirect | `GET /api/auth/me`, fallback `GET /me` | Protected: `admin`, `teacher`, `student` | Ready. Restores session from persisted token, redirects authenticated users to `/dashboard`, redirects unauthenticated users to `/login`. |
| `/dashboard` | `Dashboard` inside `Layout` | `GET /dashboard`, fallback `GET /api/dashboard` | Protected: `admin`, `teacher`, `student` | Ready. Handles loading, success, empty dashboard data, API errors, unauthorized redirect, forbidden error, not found, server error, and network failure. |
| `/students` | `ResourcePage` with `resource="students"` | `GET/POST /api/students`; `PUT/DELETE /api/students/:id` | Protected: `admin`, `teacher`, `student` | Ready. Handles loading, table success, empty dataset, create/update/delete failures, unauthorized redirect, forbidden error, not found, server error, and network failure. |
| `/staff` | `ResourcePage` with `resource="staff"` | `GET/POST /api/staff`, fallback `GET/POST /api/users`; `PUT/DELETE /api/staff/:id`, fallback `PUT/DELETE /api/users/:id` | Protected: `admin`, `teacher`, `student` | Ready with contract risk. Frontend supports both known staff/user paths and handles loading, success, empty, error, unauthorized, forbidden, not found, server error, and network failure. |
| `/courses` | `ResourcePage` with `resource="courses"` | `GET/POST /api/courses`; `PUT/DELETE /api/courses/:id` | Protected: `admin`, `teacher`, `student` | Ready. Handles loading, success, empty, error, unauthorized, forbidden, not found, server error, and network failure. |
| `/attendance` | `ResourcePage` with `resource="attendance"` | `GET/POST /api/attendance`; `PUT/DELETE /api/attendance/:id` | Protected: `admin`, `teacher`, `student` | Ready. Handles loading, success, empty, error, unauthorized, forbidden, not found, server error, and network failure. |
| `/results` | `ResourcePage` with `resource="results"` | `GET/POST /api/results`; `PUT/DELETE /api/results/:id` | Protected: `admin`, `teacher`, `student` | Ready. Handles loading, success, empty, error, unauthorized, forbidden, not found, server error, and network failure. |
| `/notifications` | `ResourcePage` with `resource="notifications"` | `GET/POST /api/notifications`; `PUT/DELETE /api/notifications/:id` | Protected: `admin`, `teacher`, `student` | Ready. Handles loading, success, empty, error, unauthorized, forbidden, not found, server error, and network failure. |
| `/settings` | `ResourcePage` with `resource="settings"` | `GET/POST /api/settings`; `PUT/DELETE /api/settings/:id` | Protected: `admin`, `teacher`, `student` | Ready. Handles loading, success, empty, error, unauthorized, forbidden, not found, server error, and network failure. |
| `/unauthorized` | `Unauthorized` | None | Public route used by protected route role rejection | Ready. Displays access-denied state when role enforcement blocks a user. |
| `*` | `Navigate` to `/login` | None | Public catch-all | Ready. Unknown frontend routes redirect to login. |

## State Validation Matrix

| Page group | Loading | Success | Empty | Error | Unauthorized |
| --- | --- | --- | --- | --- | --- |
| Auth pages | Yes | Yes: redirect after success | Not applicable | Yes | Yes: normalized auth/API error text |
| Dashboard | Yes | Yes: stats grid | Yes: no dashboard data | Yes | Yes: 401 clears token and redirects; 403 displays authorization error |
| Resource pages | Yes | Yes: table view | Yes: no records found | Yes | Yes: 401 clears token and redirects; 403 displays authorization error |
| Protected shell | Yes: session restore | Yes: layout and outlet | Not applicable | Yes through child routes | Yes: unauthenticated users cannot access protected children |

## Route Audit Result

100% of routes declared in `frontend/src/routes/index.jsx` are documented.
