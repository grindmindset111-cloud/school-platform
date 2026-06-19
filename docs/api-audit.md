# API Audit

Audit date: 2026-06-03

Base URL: `import.meta.env.VITE_API_URL || https://school-platform-bnpo.onrender.com`

HTTP client: `frontend/src/api/index.js`

## Global Behavior

| Concern | Implementation |
| --- | --- |
| Token persistence | `localStorage` key `school_platform_token` |
| Request auth header | `Authorization: Bearer <token>` when token exists |
| 401 handling | Token is removed, `auth:unauthorized` event is dispatched, browser redirects to `/login` |
| 403 handling | `auth:forbidden` event is dispatched and the page renders a normalized authorization error |
| Network failure handling | Pages render `Network error. Check the backend URL and connection.` |
| Response normalization | Lists accept array responses and common wrappers: `data`, `items`, `records`, resource-specific arrays |

## Endpoint Coverage

| Method | Route | Payload | Success response | Error response | Frontend consumer |
| --- | --- | --- | --- | --- | --- |
| `POST` | `/api/auth/login` | `{ email, password }` | Must include `token`; user may be returned as `{ user }`, `{ data: { user } }`, `{ data }`, or root payload | `{ message }`, `{ error }`, HTTP 401/403/404/500, or network failure | `useAuthStore.login`, `Login` |
| `POST` | `/api/auth/register` | `{ name, email, password, role, classLevel? }` | Any successful response; frontend redirects to `/login` | `{ message }`, `{ error }`, HTTP 401/403/404/500, validation errors, or network failure | `Register` |
| `GET` | `/api/auth/me` | None | User as `{ user }`, `{ data: { user } }`, `{ data }`, or root payload | `{ message }`, `{ error }`, HTTP 401/403/404/500, or network failure | `useAuthStore.fetchUser`, app session restore |
| `GET` | `/me` | None | Same as `/api/auth/me` | Used only if `/api/auth/me` returns 404; otherwise same error handling | `useAuthStore.fetchUser` fallback |
| `GET` | `/dashboard` | None | Dashboard object; stats read from `response.stats` when present | `{ message }`, `{ error }`, HTTP 401/403/404/500, or network failure | `getDashboard`, `Dashboard` |
| `GET` | `/api/dashboard` | None | Same as `/dashboard` | Used only if `/dashboard` returns 404 or 405; otherwise same error handling | `getDashboard` fallback |
| `GET` | `/api/students` | None | Array or wrapped list | `{ message }`, `{ error }`, HTTP 401/403/404/500, or network failure | `listResource('students')`, `ResourcePage` |
| `POST` | `/api/students` | `{ name, email, classLevel }` | Created student object or wrapped payload | `{ message }`, `{ error }`, HTTP 401/403/404/500, validation errors, or network failure | `createResource('students')`, `ResourcePage` |
| `PUT` | `/api/students/:id` | `{ name, email, classLevel }` | Updated student object or wrapped payload | `{ message }`, `{ error }`, HTTP 401/403/404/500, validation errors, or network failure | `updateResource('students')`, `ResourcePage` |
| `DELETE` | `/api/students/:id` | None | Deleted student confirmation or wrapped payload | `{ message }`, `{ error }`, HTTP 401/403/404/500, or network failure | `deleteResource('students')`, `ResourcePage` |
| `GET` | `/api/staff` | None | Array or wrapped list | `{ message }`, `{ error }`, HTTP 401/403/404/500, or network failure | `listResource('staff')`, `ResourcePage` |
| `GET` | `/api/users` | None | Array or wrapped list | Used only if `/api/staff` returns 404 or 405 | `listResource('staff')` fallback |
| `POST` | `/api/staff` | `{ name, email, role }` | Created staff object or wrapped payload | `{ message }`, `{ error }`, HTTP 401/403/404/500, validation errors, or network failure | `createResource('staff')`, `ResourcePage` |
| `POST` | `/api/users` | `{ name, email, role }` | Created user/staff object or wrapped payload | Used only if `/api/staff` returns 404 or 405 | `createResource('staff')` fallback |
| `PUT` | `/api/staff/:id` | `{ name, email, role }` | Updated staff object or wrapped payload | `{ message }`, `{ error }`, HTTP 401/403/404/500, validation errors, or network failure | `updateResource('staff')`, `ResourcePage` |
| `PUT` | `/api/users/:id` | `{ name, email, role }` | Updated user/staff object or wrapped payload | Used only if `/api/staff/:id` returns 404 or 405 | `updateResource('staff')` fallback |
| `DELETE` | `/api/staff/:id` | None | Deleted staff confirmation or wrapped payload | `{ message }`, `{ error }`, HTTP 401/403/404/500, or network failure | `deleteResource('staff')`, `ResourcePage` |
| `DELETE` | `/api/users/:id` | None | Deleted user/staff confirmation or wrapped payload | Used only if `/api/staff/:id` returns 404 or 405 | `deleteResource('staff')` fallback |
| `GET` | `/api/courses` | None | Array or wrapped list | `{ message }`, `{ error }`, HTTP 401/403/404/500, or network failure | `listResource('courses')`, `ResourcePage` |
| `POST` | `/api/courses` | `{ name, code, teacherId }` | Created course object or wrapped payload | `{ message }`, `{ error }`, HTTP 401/403/404/500, validation errors, or network failure | `createResource('courses')`, `ResourcePage` |
| `PUT` | `/api/courses/:id` | `{ name, code, teacherId }` | Updated course object or wrapped payload | `{ message }`, `{ error }`, HTTP 401/403/404/500, validation errors, or network failure | `updateResource('courses')`, `ResourcePage` |
| `DELETE` | `/api/courses/:id` | None | Deleted course confirmation or wrapped payload | `{ message }`, `{ error }`, HTTP 401/403/404/500, or network failure | `deleteResource('courses')`, `ResourcePage` |
| `GET` | `/api/attendance` | None | Array or wrapped list | `{ message }`, `{ error }`, HTTP 401/403/404/500, or network failure | `listResource('attendance')`, `ResourcePage` |
| `POST` | `/api/attendance` | `{ studentId, date, status }` | Created attendance object or wrapped payload | `{ message }`, `{ error }`, HTTP 401/403/404/500, validation errors, or network failure | `createResource('attendance')`, `ResourcePage` |
| `PUT` | `/api/attendance/:id` | `{ studentId, date, status }` | Updated attendance object or wrapped payload | `{ message }`, `{ error }`, HTTP 401/403/404/500, validation errors, or network failure | `updateResource('attendance')`, `ResourcePage` |
| `DELETE` | `/api/attendance/:id` | None | Deleted attendance confirmation or wrapped payload | `{ message }`, `{ error }`, HTTP 401/403/404/500, or network failure | `deleteResource('attendance')`, `ResourcePage` |
| `GET` | `/api/results` | None | Array or wrapped list | `{ message }`, `{ error }`, HTTP 401/403/404/500, or network failure | `listResource('results')`, `ResourcePage` |
| `POST` | `/api/results` | `{ studentId, courseId, score, term }` | Created result object or wrapped payload | `{ message }`, `{ error }`, HTTP 401/403/404/500, validation errors, or network failure | `createResource('results')`, `ResourcePage` |
| `PUT` | `/api/results/:id` | `{ studentId, courseId, score, term }` | Updated result object or wrapped payload | `{ message }`, `{ error }`, HTTP 401/403/404/500, validation errors, or network failure | `updateResource('results')`, `ResourcePage` |
| `DELETE` | `/api/results/:id` | None | Deleted result confirmation or wrapped payload | `{ message }`, `{ error }`, HTTP 401/403/404/500, or network failure | `deleteResource('results')`, `ResourcePage` |
| `GET` | `/api/notifications` | None | Array or wrapped list | `{ message }`, `{ error }`, HTTP 401/403/404/500, or network failure | `listResource('notifications')`, `ResourcePage` |
| `POST` | `/api/notifications` | `{ title, message, audience }` | Created notification object or wrapped payload | `{ message }`, `{ error }`, HTTP 401/403/404/500, validation errors, or network failure | `createResource('notifications')`, `ResourcePage` |
| `PUT` | `/api/notifications/:id` | `{ title, message, audience }` | Updated notification object or wrapped payload | `{ message }`, `{ error }`, HTTP 401/403/404/500, validation errors, or network failure | `updateResource('notifications')`, `ResourcePage` |
| `DELETE` | `/api/notifications/:id` | None | Deleted notification confirmation or wrapped payload | `{ message }`, `{ error }`, HTTP 401/403/404/500, or network failure | `deleteResource('notifications')`, `ResourcePage` |
| `GET` | `/api/settings` | None | Array or wrapped list | `{ message }`, `{ error }`, HTTP 401/403/404/500, or network failure | `listResource('settings')`, `ResourcePage` |
| `POST` | `/api/settings` | `{ key, value }` | Created setting object or wrapped payload | `{ message }`, `{ error }`, HTTP 401/403/404/500, validation errors, or network failure | `createResource('settings')`, `ResourcePage` |
| `PUT` | `/api/settings/:id` | `{ key, value }` | Updated setting object or wrapped payload | `{ message }`, `{ error }`, HTTP 401/403/404/500, validation errors, or network failure | `updateResource('settings')`, `ResourcePage` |
| `DELETE` | `/api/settings/:id` | None | Deleted setting confirmation or wrapped payload | `{ message }`, `{ error }`, HTTP 401/403/404/500, or network failure | `deleteResource('settings')`, `ResourcePage` |

## API Audit Result

All API calls found by scanning `frontend/src` are documented. No `fetch` calls or additional axios instances remain.
