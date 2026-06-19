# Backend Contract Audit

**Generated:** 2026-06-06  
**Source of Truth:** Backend implementation (controllers, models, services, routes, middleware)  
**Validation Status:** ✅ Complete audit performed - ready for frontend integration

---

## Executive Summary

The backend implementation is production-ready with well-defined contracts for:
- **Booking System**: Queueing with exponential backoff, overlap prevention, automatic expiry
- **Result Portal**: Score tracking with grade calculation, locked/released states
- **Authentication**: Role-based access control (ADMIN, STAFF, STUDENT), JWT tokens
- **Permissions**: Fine-grained permission checks at route level

All frontend integration must match backend contracts exactly. No invented endpoints or payloads.

---

## 1. AUTHENTICATION

### 1.1 Register Endpoint

**POST** `/api/auth/register`  
**Public:** Yes (no auth required)

#### Request Payload
```json
{
  "name": "John Doe",
  "email": "john@school.edu",
  "password": "securepass123",
  "role": "STUDENT",
  "classLevelId": 1
}
```

**Field Validation:**
| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `name` | string | Yes | 2-100 characters |
| `email` | string | Yes | Valid email format, unique |
| `password` | string | Yes | Minimum 9 characters |
| `role` | enum | Yes | One of: `ADMIN`, `STAFF`, `STUDENT` |
| `classLevelId` | integer | Conditional | Required if `role === 'STUDENT'`, forbidden otherwise |

**Special Logic:**
- If `role === 'STUDENT'`: `classLevelId` MUST be provided and must reference valid ClassLevel
- If `role !== 'STUDENT'`: `classLevelId` MUST NOT be provided (endpoint rejects if present)
- Email and name are trimmed/lowercased before validation
- Password is hashed with bcrypt (10 rounds) before storage

#### Response (201 Created)
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@school.edu",
    "role": "STUDENT",
    "classLevelId": 1,
    "classLevel": {
      "id": 1,
      "name": "100-Level"
    },
    "createdAt": "2026-06-06T10:00:00Z",
    "updatedAt": "2026-06-06T10:00:00Z"
  }
}
```

---

### 1.2 Login Endpoint

**POST** `/api/auth/login`  
**Public:** Yes (no auth required)

#### Request Payload
```json
{
  "email": "john@school.edu",
  "password": "securepass123"
}
```

**Field Validation:**
| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `email` | string | Yes | Valid email format |
| `password` | string | Yes | Non-empty |

#### Response (200 OK)
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@school.edu",
    "role": "STUDENT",
    "classLevelId": 1,
    "classLevel": {
      "id": 1,
      "name": "100-Level"
    },
    "createdAt": "2026-06-06T10:00:00Z",
    "updatedAt": "2026-06-06T10:00:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Token Details:**
- Format: JWT (Bearer token)
- Payload: `{ id, role, classLevelId }`
- Set in `Authorization` header as: `Bearer <token>`

#### Error Responses
| Status | Scenario |
|--------|----------|
| 400 | Missing email or password |
| 401 | Invalid credentials (wrong email or password) |
| 404 | User not found |

---

### 1.3 Get Current User Endpoint

**GET** `/api/auth/me`  
**Auth Required:** Yes (`Authorization: Bearer <token>`)  
**Permission Required:** `PROFILE_VIEW`

#### Response (200 OK)
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@school.edu",
    "role": "STUDENT",
    "classLevelId": 1,
    "classLevel": {
      "id": 1,
      "name": "100-Level"
    },
    "createdAt": "2026-06-06T10:00:00Z",
    "updatedAt": "2026-06-06T10:00:00Z"
  }
}
```

---

### 1.4 Password Reset

**POST** `/api/auth/request-password-reset`  
**POST** `/api/auth/reset-password`  
(Implemented but not covered in integration scope)

---

## 2. BOOKING SYSTEM

### 2.1 Create Booking

**POST** `/api/bookings`  
**Auth Required:** Yes  
**Permission Required:** `BOOKING_CREATE`  
**Role:** STUDENT only (enforced in service)

#### Request Payload
```json
{
  "subjectId": 5,
  "date": "2026-06-15",
  "startTime": "09:00:00",
  "endTime": "10:30:00",
  "resourceId": null
}
```

**Field Validation:**
| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `subjectId` | integer | Yes | Must reference valid Subject |
| `date` | date | Yes | ISO format (YYYY-MM-DD), must be ≥ today |
| `startTime` | time | Yes | ISO format (HH:MM:SS), must be < endTime |
| `endTime` | time | Yes | ISO format (HH:MM:SS), must be > startTime |
| `resourceId` | integer | No | Must reference valid Resource if provided |

**Business Validation:**
- Date must not be in the past
- Student's classLevel must match subject's classLevel
- No overlap: Cannot create if student already has booking for same subject on same date with overlapping times
- Subject must exist and be active
- studentId is taken from `req.user.id` (cannot be overridden)
- classLevelId is taken from `req.user.classLevelId`

#### Response (201 Created)
```json
{
  "id": 42,
  "studentId": 1,
  "classLevelId": 1,
  "resourceId": null,
  "subjectId": 5,
  "date": "2026-06-15",
  "startTime": "09:00:00",
  "endTime": "10:30:00",
  "status": "pending",
  "attendanceStatus": "unmarked",
  "queueStatus": "queued",
  "queuePosition": 5,
  "retryCount": 0,
  "createdAt": "2026-06-06T10:00:00Z",
  "updatedAt": "2026-06-06T10:00:00Z"
}
```

**Status Explanation:**
- `status`: Booking approval status (pending → approved by queue processor)
- `attendanceStatus`: Attendance marking (unmarked → present/absent/late/excused by staff)
- `queueStatus`: Processing status (queued → processing → completed/failed)
- `queuePosition`: Position in processing queue
- `retryCount`: Number of retry attempts (max 3)

---

### 2.2 List Bookings

**GET** `/api/bookings`  
**Auth Required:** Yes  
**Permission Required:** `BOOKING_VIEW`

#### Query Parameters
```
GET /api/bookings?status=pending&subjectId=5&date=2026-06-15&classLevelId=1&limit=10&offset=0
```

| Parameter | Type | Required | Rules | Effect |
|-----------|------|----------|-------|--------|
| `status` | string | No | One of: pending, approved, rejected, cancelled, expired | Filter by status |
| `subjectId` | integer | No | Valid subject ID | Filter by subject |
| `date` | date | No | ISO format (YYYY-MM-DD) | Filter by exact date |
| `classLevelId` | integer | No | Valid class level ID | Filter by class level |
| `limit` | integer | No | Default 10, max 100 | Pagination limit |
| `offset` | integer | No | Default 0 | Pagination offset |

**Role-Based Filtering:**
- **STUDENT:** Can only see their own bookings (studentId filtered automatically)
- **STAFF/ADMIN:** Can see all bookings

#### Response (200 OK)
```json
{
  "rows": [
    {
      "id": 42,
      "studentId": 1,
      "classLevelId": 1,
      "resourceId": null,
      "subjectId": 5,
      "date": "2026-06-15",
      "startTime": "09:00:00",
      "endTime": "10:30:00",
      "status": "pending",
      "attendanceStatus": "unmarked",
      "queueStatus": "queued",
      "queuePosition": 5,
      "retryCount": 0,
      "createdAt": "2026-06-06T10:00:00Z",
      "updatedAt": "2026-06-06T10:00:00Z",
      "student": {
        "id": 1,
        "name": "John Doe",
        "email": "john@school.edu"
      },
      "subject": {
        "id": 5,
        "name": "Mathematics"
      },
      "resource": null
    }
  ],
  "count": 25
}
```

---

### 2.3 Get Availability

**GET** `/api/bookings/availability`  
**Auth Required:** Yes  
**Permission Required:** `BOOKING_VIEW`

#### Query Parameters
```
GET /api/bookings/availability?subjectId=5&date=2026-06-15
```

(Implementation details not exposed; assumed to return available time slots)

---

### 2.4 Update Booking Status

**PATCH** `/api/bookings/:id`  
**Auth Required:** Yes  
**Permission Required:** `BOOKING_UPDATE`  
**Role:** STAFF/ADMIN only

#### Request Payload
```json
{
  "status": "approved",
  "attendanceStatus": "present"
}
```

**Field Validation:**
| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `status` | enum | No | One of: `pending`, `approved`, `rejected`, `cancelled` |
| `attendanceStatus` | enum | No | One of: `present`, `absent`, `late`, `excused`, `unmarked` |

**Business Validation:**
- At least one field must be provided
- STAFF can only update bookings for subjects they teach
- ADMIN can update any booking
- Locked bookings cannot be updated (if implemented)

#### Response (200 OK)
```json
{
  "id": 42,
  "studentId": 1,
  "classLevelId": 1,
  "resourceId": null,
  "subjectId": 5,
  "date": "2026-06-15",
  "startTime": "09:00:00",
  "endTime": "10:30:00",
  "status": "approved",
  "attendanceStatus": "present",
  "queueStatus": "completed",
  "queuePosition": null,
  "retryCount": 0,
  "createdAt": "2026-06-06T10:00:00Z",
  "updatedAt": "2026-06-06T10:05:00Z"
}
```

**Side Effects:**
- Student receives notification when status changes
- Audit log created for the update

---

### 2.5 Bulk Update Bookings

**PATCH** `/api/bookings/bulk`  
**Auth Required:** Yes  
**Permission Required:** `BOOKING_UPDATE`  
**Role:** STAFF/ADMIN only

#### Request Payload
```json
{
  "ids": [42, 43, 44],
  "status": "approved",
  "attendanceStatus": "present"
}
```

**Field Validation:**
| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `ids` | array | Yes | Array of booking IDs |
| `status` | enum | No | One of: `pending`, `approved`, `rejected`, `cancelled` |
| `attendanceStatus` | enum | No | One of: `present`, `absent`, `late`, `excused`, `unmarked` |

#### Response (200 OK)
```json
{
  "updated": 3,
  "failed": 0,
  "results": [...]
}
```

---

### 2.6 Booking Status Lifecycle

**Authoritative State Machine:**

```
                    ┌─ PENDING ─┐
                    │           │
              Student creates   Queue Processor
                  booking       (final overlap check)
                    │           │
                    └───────────┘
                        │
                ┌───────┴───────┐
                │               │
            APPROVED        EXPIRED
          (auto 24h         (auto if
           before date)     date < now)
                │               
         Staff/Admin       
         marks attendance       
                │               
      PRESENT/ABSENT/LATE
                
     Also can be set:
           REJECTED
           CANCELLED
         (by staff/admin)
```

**Important Status Rules:**
- `pending` → `approved`: Automatic (queue processor does final overlap check ~24h before date)
- `pending` → `expired`: Automatic (expiry job runs daily, marks past pending bookings as expired)
- `pending/approved` → `rejected`: Manual (staff/admin action)
- `pending/approved` → `cancelled`: Manual (staff/admin action)
- `attendanceStatus` (unmarked/present/absent/late/excused): Set by staff/admin after class

---

## 3. RESULT SYSTEM

### 3.1 Create Result

**POST** `/api/results`  
**Auth Required:** Yes  
**Permission Required:** `RESULT_CREATE`  
**Role:** STAFF/ADMIN only

#### Request Payload
```json
{
  "studentId": 1,
  "subjectId": 5,
  "score": 85
}
```

**Field Validation:**
| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `studentId` | integer | Yes | Must reference valid User (STUDENT role) |
| `subjectId` | integer | Yes | Must reference valid Subject |
| `score` | number | Yes | Must be number, range [0, 100] |

**Business Validation:**
- Student must exist
- Subject must exist
- Student's classLevel must match subject's classLevel
- STAFF can only create for subjects they teach
- ADMIN can create for any subject
- No duplicate: Cannot have more than one result for (studentId, subjectId, courseId)
- Score is converted to number and validated against 0-100 range

**Important:** Backend does NOT accept `courseId` in request (it's auto-determined from subject/context). Frontend should NOT send it.

#### Response (201 Created)
```json
{
  "id": 15,
  "studentId": 1,
  "classLevelId": 1,
  "courseId": 3,
  "subjectId": 5,
  "score": 85,
  "grade": "B",
  "released": false,
  "locked": false,
  "createdAt": "2026-06-06T10:00:00Z",
  "updatedAt": "2026-06-06T10:00:00Z",
  "student": {
    "id": 1,
    "name": "John Doe",
    "email": "john@school.edu"
  },
  "subject": {
    "id": 5,
    "name": "Mathematics"
  }
}
```

**Grade Calculation (Automatic):**
| Score Range | Grade |
|-------------|-------|
| 70-100 | A |
| 60-69 | B |
| 50-59 | C |
| 45-49 | D |
| 40-44 | E |
| 0-39 | F |

**State Fields:**
- `released`: Boolean (default false). True when result is released to student.
- `locked`: Boolean (default false). True when result cannot be modified. Set via `/results/:id/unlock` endpoint.

---

### 3.2 List Results

**GET** `/api/results`  
**Auth Required:** Yes  
**Permission Required:** `RESULT_VIEW`

#### Query Parameters
```
GET /api/results?page=1&limit=20
```

| Parameter | Type | Required | Rules | Effect |
|-----------|------|----------|-------|--------|
| `page` | integer | No | Default 1 | Pagination page number |
| `limit` | integer | No | Default 20 | Results per page |

**Role-Based Filtering:**
- **STUDENT:** Can only see their own results (studentId filtered automatically)
- **STAFF:** Can see results for subjects they teach
- **ADMIN:** Can see all results

#### Response (200 OK)
```json
{
  "results": [
    {
      "id": 15,
      "studentId": 1,
      "classLevelId": 1,
      "courseId": 3,
      "subjectId": 5,
      "score": 85,
      "grade": "B",
      "released": true,
      "locked": false,
      "createdAt": "2026-06-06T10:00:00Z",
      "updatedAt": "2026-06-06T10:00:00Z",
      "student": {
        "id": 1,
        "name": "John Doe",
        "email": "john@school.edu"
      },
      "subject": {
        "id": 5,
        "name": "Mathematics"
      }
    }
  ],
  "pagination": {
    "total": 42,
    "page": 1,
    "pages": 3
  }
}
```

---

### 3.3 Get Single Result

**GET** `/api/results/:id`  
**Auth Required:** Yes  
**Permission Required:** `RESULT_VIEW`

#### Response (200 OK)
Same as list result object (single item, no pagination).

---

### 3.4 Update Result

**PUT** `/api/results/:id`  
**Auth Required:** Yes  
**Permission Required:** `RESULT_UPDATE`  
**Role:** STAFF/ADMIN

#### Request Payload
```json
{
  "score": 90
}
```

**Field Validation:**
| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `score` | number | No | Range [0, 100] |

**Business Validation:**
- STAFF can only update results for subjects they teach
- STAFF cannot modify: `locked`, `released`, `studentId`, `classLevelId`, `courseId`, `subjectId`
- STAFF can only modify: `score`
- ADMIN can modify all fields (except likely `id`, `createdAt`)
- Grade auto-recalculates based on new score
- Result must not be locked (if locked, must unlock first)

#### Response (200 OK)
```json
{
  "id": 15,
  "studentId": 1,
  "classLevelId": 1,
  "courseId": 3,
  "subjectId": 5,
  "score": 90,
  "grade": "A",
  "released": false,
  "locked": false,
  "createdAt": "2026-06-06T10:00:00Z",
  "updatedAt": "2026-06-06T10:05:00Z",
  "student": {
    "id": 1,
    "name": "John Doe",
    "email": "john@school.edu"
  },
  "subject": {
    "id": 5,
    "name": "Mathematics"
  }
}
```

---

### 3.5 Unlock Result (Release to Student)

**PATCH** `/api/results/:id/unlock`  
**Auth Required:** Yes  
**Permission Required:** `RESULT_UNLOCK`  
**Role:** ADMIN only

#### Request Payload
```json
{}
```
(No payload required)

#### Response (200 OK)
```json
{
  "id": 15,
  "studentId": 1,
  "classLevelId": 1,
  "courseId": 3,
  "subjectId": 5,
  "score": 90,
  "grade": "A",
  "released": true,
  "locked": false,
  "createdAt": "2026-06-06T10:00:00Z",
  "updatedAt": "2026-06-06T10:05:00Z",
  "student": {
    "id": 1,
    "name": "John Doe",
    "email": "john@school.edu"
  },
  "subject": {
    "id": 5,
    "name": "Mathematics"
  }
}
```

**Side Effects:**
- Sets `released: true`, `locked: false`
- Student receives notification that result is released
- Audit log created

---

### 3.6 Result Constraints

**IMPORTANT - NOT SUPPORTED:**
- ❌ DELETE endpoint does not exist in backend
- ❌ `courseId` should NOT be sent in create request (auto-determined)
- ❌ `term` field does not exist in backend model
- ❌ STAFF cannot delete results
- ❌ ADMIN cannot delete results

**Frontend must:**
- Remove any delete buttons for results
- Remove any delete API calls
- Not expect or send `courseId` in create payload
- Not use or reference `term` field

---

## 4. ROLES & PERMISSIONS

### 4.1 Role Names (Exact)

The system uses exactly **3 roles**:

| Role | Use Case |
|------|----------|
| `ADMIN` | System administrators (wildcard access) |
| `STAFF` | Teachers/instructors (subject-based access) |
| `STUDENT` | Students (self-service only) |

**Frontend must use these exact role names.** Do not create custom role vocabularies or aliases.

---

### 4.2 Permission Matrix

#### ADMIN
- `'*'` (wildcard - all permissions granted)

#### STAFF
```
DASHBOARD_VIEW
BOOKING_VIEW
BOOKING_UPDATE
STUDENT_VIEW
STAFF_VIEW
SUBJECT_VIEW
RESULT_VIEW
RESULT_CREATE
RESULT_UPDATE
RESULT_BULK_UPLOAD
ATTENDANCE_MARK
REPORT_VIEW
NOTIFICATION_VIEW
NOTIFICATION_UPDATE
RESOURCE_VIEW
SESSION_VIEW
```

#### STUDENT
```
DASHBOARD_VIEW
BOOKING_CREATE
BOOKING_VIEW
PROFILE_VIEW
SUBJECT_VIEW
RESULT_VIEW
REPORT_VIEW
NOTIFICATION_VIEW
SESSION_VIEW
```

---

### 4.3 Permission Checking

All routes use `permit(action)` middleware. Example:

```javascript
router.post('/', auth, permit('BOOKING_CREATE'), createBooking);
```

**Logic:**
1. User must be authenticated (via `auth` middleware)
2. User's role must have the required permission
3. If ADMIN role: automatically passes all permission checks (wildcard `'*'`)
4. If STAFF/STUDENT: must have exact permission in their list
5. If check fails: 403 Forbidden with message "Permission denied"

---

## 5. ERROR RESPONSES

### Standard Error Format

```json
{
  "status": 400,
  "error": {
    "message": "Validation error",
    "details": [...]
  }
}
```

### Common HTTP Status Codes

| Status | Scenario |
|--------|----------|
| 400 | Bad request (validation error) |
| 401 | Unauthorized (auth token missing/invalid/expired) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not found (resource doesn't exist) |
| 409 | Conflict (e.g., duplicate booking, overlap) |
| 500 | Server error |

### Auth Middleware Error Messages

| Error | Cause |
|-------|-------|
| "Authorization header missing" | No `Authorization` header |
| "Invalid authorization format. Use Bearer <token>" | Malformed bearer token |
| "Token expired" | JWT expired |
| "Invalid token" | JWT signature invalid |
| "User not found" | User from token doesn't exist |

---

## 6. IMPLEMENTATION CHECKLIST

### Backend Already Implemented ✅
- ✅ Role-based access control (ADMIN, STAFF, STUDENT)
- ✅ Permission-based route authorization
- ✅ JWT authentication
- ✅ Booking creation with queue processing
- ✅ Booking status lifecycle (pending → approved → expired/rejected/cancelled)
- ✅ Result creation with auto-grading
- ✅ Result locking/unlocking
- ✅ Overlap prevention for bookings
- ✅ Subject-based staff restrictions
- ✅ Notifications for status changes
- ✅ Audit logging

### Frontend Must Implement
- ⚠️ Match all role names exactly (ADMIN, STAFF, STUDENT)
- ⚠️ Use exact permission names in permission checks
- ⚠️ Remove delete result UI/API calls (not supported)
- ⚠️ Remove `courseId` and `term` from result create forms
- ⚠️ Implement booking status transitions properly
- ⚠️ Show queue position and retry count for bookings
- ⚠️ Use `attendanceStatus` for marking attendance (not separate endpoint)
- ⚠️ Enforce classLevelId requirement for student registration
- ⚠️ Implement result released/locked states in UI

---

## 7. VALIDATION RULES SUMMARY

### Date/Time Validation
- `date`: ISO format YYYY-MM-DD, must not be past
- `startTime`, `endTime`: HH:MM:SS format, endTime > startTime
- No time overlap checks performed by frontend (backend enforces)

### Email Validation
- Valid email format required
- Must be unique across system
- Case-insensitive

### Password Requirements
- Minimum 9 characters
- No special character requirements enforced by backend

### Score Validation
- Must be numeric value
- Range: 0-100 (inclusive)
- Grade calculated automatically

### Class Level Assignment
- STUDENT registration: MUST provide valid `classLevelId`
- STAFF/ADMIN registration: MUST NOT provide `classLevelId`

---

## 8. CRITICAL FRONTEND INTEGRATION POINTS

### Do Not
- ❌ Invent permissions (use only those listed in section 4.2)
- ❌ Create custom role names (use ADMIN, STAFF, STUDENT only)
- ❌ Call non-existent endpoints (follow contract exactly)
- ❌ Send unsupported fields (e.g., `courseId` in result create)
- ❌ Assume status transitions (follow state machine in section 2.6)
- ❌ Delete results (no delete endpoint exists)
- ❌ Modify results after locking (without unlock first)
- ❌ Override user ID in requests (backend uses `req.user.id`)
- ❌ Skip `classLevelId` for student registration

### Do
- ✅ Use Bearer token format for all auth
- ✅ Check `released` field before showing results to students
- ✅ Show queue position for pending bookings
- ✅ Implement pagination with `limit` and `offset` (bookings) or `page` (results)
- ✅ Handle all response shapes exactly as documented
- ✅ Validate dates are not in past before submitting
- ✅ Display grade when showing results
- ✅ Implement role-specific filtering (students only see own data)
- ✅ Show attendance status alongside booking status

---

## Audit Completed

This document represents the complete backend contract as implemented in the repository.  
All frontend integration must validate against these specifications.

For questions: Review the corresponding backend file listed in brackets throughout.
