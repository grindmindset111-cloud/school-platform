# School Platform Integration Report

## Phase 1 Endpoint Map

Backend source code was not present in this workspace. The only local backend contract found was the historical `frontend/js/API_CONTRACT.md`, which documents `https://school-platform-bnpo.onrender.com`, `POST /api/auth/login`, `POST /api/auth/register`, and `GET /dashboard`. Direct route probing failed because DNS resolution for `school-platform-bnpo.onrender.com` failed in this environment.

| Page | Endpoint | Status | Missing Requirements |
| --- | --- | --- | --- |
| Login | `POST /api/auth/login` | Integrated from documented contract | Backend must return `token` and user data as `{ token, user }` or `{ data: { token, user } }`. |
| Register | `POST /api/auth/register` | Integrated from documented contract | Backend validation details are undocumented. |
| Session | `GET /api/auth/me`, fallback `GET /me` | Compatibility integration | Existing backend session endpoint was not documented. |
| Dashboard | `GET /dashboard`, fallback `GET /api/dashboard` | Integrated with documented endpoint | Backend response fields beyond `stats` are undocumented. |
| Students | `GET/POST /api/students`, `PUT/DELETE /api/students/:id` | Frontend integrated | Backend routes were not discoverable locally. |
| Staff | `GET/POST /api/staff`, fallback `GET/POST /api/users`; `PUT/DELETE` equivalents | Frontend integrated | Staff endpoint name is undocumented. |
| Courses | `GET/POST /api/courses`, `PUT/DELETE /api/courses/:id` | Frontend integrated | Backend routes were not discoverable locally. |
| Attendance | `GET/POST /api/attendance`, `PUT/DELETE /api/attendance/:id` | Frontend integrated | Backend routes were not discoverable locally. |
| Results | `GET/POST /api/results`, `PUT/DELETE /api/results/:id` | Frontend integrated | Backend routes were not discoverable locally. |
| Notifications | `GET/POST /api/notifications`, `PUT/DELETE /api/notifications/:id` | Frontend integrated | Backend routes were not discoverable locally. |
| Settings | `GET/POST /api/settings`, `PUT/DELETE /api/settings/:id` | Frontend integrated | Backend routes were not discoverable locally. |

## Completed Integrations

- Login, logout, token storage, protected routes, unauthorized redirects, and session persistence.
- Dashboard reads from the real backend with no mock fallback.
- Students, staff, courses, attendance, results, notifications, and settings use real GET, POST, PUT, and DELETE calls.
- Loading, empty, error, unauthorized, and network failure states are surfaced in the UI.
- Removed the retired booking page because it used hardcoded placeholder request data.

## Broken Endpoints

- The deployed backend host `school-platform-bnpo.onrender.com` could not be resolved from this environment, so live API communication could not be verified.
- Any module endpoint that does not exist on the backend will now fail visibly with the backend/network error instead of showing mock data.

## Missing Backend Functionality

- Confirm or add `GET /api/auth/me` for session restoration, or keep `GET /me` available.
- Confirm REST CRUD endpoints for students, staff, courses, attendance, results, notifications, and settings.
- Confirm each resource returns a stable `id` or `_id` so frontend updates and deletes can target records.

## Frontend Defects Fixed

- Login previously called `/auth/login`; it now uses documented `/api/auth/login`.
- Register previously called `/auth/register`; it now uses documented `/api/auth/register`.
- JWT storage now uses one shared key and is cleared on unauthorized responses.
- React Router protection now handles loading session state and normalizes role casing.
- Vite config now uses an ESM-safe path resolver.
- Removed mock-style booking code that violated the no mock data rule.

## Recommended Fixes

- Add an OpenAPI document or route manifest to the backend so frontend endpoint discovery is deterministic.
- Standardize backend response shapes for list endpoints, preferably `{ data: [] }`.
- Return validation errors as `{ message, errors }` for consistent form rendering.
- Add automated integration tests against a reachable backend test environment.
