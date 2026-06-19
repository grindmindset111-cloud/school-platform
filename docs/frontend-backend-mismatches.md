# Frontend/Backend Mismatches Report

**Generated:** 2026-06-06  
**Status:** ⚠️ Critical issues identified - require fixes before integration ready

---

## Critical Issues (Must Fix)

### 1. ❌ Result Delete Endpoint Not Supported

**Issue:** Delete button is functional in UI but backend has no delete endpoint.

**Location:** [frontend/src/pages/ResourcePage.jsx](frontend/src/pages/ResourcePage.jsx#L193-L199)

**Current Code:**
```javascript
{config.canDelete !== false && (
  <button type="button" onClick={() => handleDelete(item)}>
    Delete
  </button>
)}
```

**Backend Truth:** 
- NO delete endpoint exists for results (`DELETE /api/results/:id`)
- DELETE requests will return 404 Not Found

**Required Fix:**
- Set `canDelete: true` for results (not false)
- Or: Remove delete button entirely from results UI
- Recommendation: Remove delete functionality for results

**Impact:** Users can click delete and get confusing error; unclear why delete doesn't work

---

### 2. ❌ Password Minimum Length Not Validated on Frontend

**Issue:** Registration allows passwords shorter than backend requirement.

**Location:** [frontend/src/pages/Register.jsx](frontend/src/pages/Register.jsx)

**Backend Requirement:**
- Minimum 9 characters

**Current Frontend:**
- No `minLength` validation
- Users can submit 5-8 character passwords
- Backend will reject with validation error

**Required Fix:**
- Add `minLength="9"` to password input
- Add validation rule in form submission

**Impact:** UX issue - form accepts invalid input, backend rejects later

---

### 3. ❌ Missing 'expired' Booking Status

**Issue:** Frontend cannot display/filter bookings with 'expired' status.

**Location:** [frontend/src/api/bookings.js](frontend/src/api/bookings.js#L2)

**Backend Truth:**
```javascript
status: ENUM: 'pending', 'approved', 'rejected', 'cancelled', 'expired'
```

**Current Frontend:**
```javascript
export const BOOKING_STATUSES = ['pending', 'approved', 'rejected', 'cancelled']
```

**Backend Lifecycle:**
- Expiry job runs daily
- Marks all `pending` bookings with date < today as `expired`
- No UI to view/filter these

**Required Fix:**
- Add `'expired'` to BOOKING_STATUSES array
- Show expired bookings in list with distinct styling
- Add filter option for expired status

**Impact:** Old pending bookings silently disappear from UI (actually marked expired server-side)

---

## High-Priority Issues

### 4. ⚠️ Result Fields Not Displayed

**Issue:** Grade, released, and locked states not shown in UI despite backend supporting them.

**Location:** [frontend/src/pages/ResourcePage.jsx](frontend/src/pages/ResourcePage.jsx#L27-L31)

**Missing Fields:**
- `grade`: Auto-calculated by backend (A/B/C/D/E/F based on score)
- `released`: Boolean - false until admin unlocks via `/unlock` endpoint
- `locked`: Boolean - admin can lock results

**Current Display:**
- Only shows: studentId, subjectId, score
- Missing: grade, released, locked

**Required Fix:**
- Add `grade` to display (auto-calculated)
- Add `released` indicator (shows if result published to student)
- Add `locked` indicator (shows if result final/immutable)

**Impact:** Staff cannot see if results are published or locked

---

## Medium-Priority Issues

### 5. ⚠️ Role Name Case Inconsistency

**Issue:** Role names use different cases in different files.

**Locations:**
- Register form: `['ADMIN', 'STAFF', 'STUDENT']` (uppercase)
- ProtectedRoute: Uses lowercase with `.toLowerCase()` conversion

**Current Code in ProtectedRoute:**
```javascript
String(user.role).toLowerCase() === 'admin'
```

**Issue:** Inconsistent approach - some files use uppercase, some lowercase

**Recommendation:**
- Define role constants in single location: `src/constants/roles.js`
- Use consistently across codebase

---

## Low-Priority Issues (Non-Blocking)

### 6. ℹ️ No Permission Constants Defined

**Issue:** Frontend only checks roles, not permissions.

**Backend Supports:**
- Fine-grained permissions (BOOKING_CREATE, RESULT_VIEW, etc.)
- Permission checking at route level

**Current Frontend:**
- Only role-based access control
- No permission constant definitions
- All role checks do `if (user.role === 'ADMIN')` etc

**Recommendation:**
- Not critical for MVP
- Can add permission constants later
- Current role-based approach sufficient for basic access control

---

## Verified as Correct ✅

- ✅ Registration requires `classLevelId` for STUDENT role
- ✅ Registration forbids `classLevelId` for STAFF/ADMIN
- ✅ Login payload: `{ email, password }`
- ✅ Booking create fields: `subjectId, date, startTime, endTime, resourceId` (optional)
- ✅ Result create fields: `studentId, subjectId, score` (NOT courseId or term)
- ✅ Booking pagination uses `limit/offset`
- ✅ Result pagination uses `page/limit`
- ✅ Auth token in `Authorization: Bearer` format
- ✅ Booking statuses (minus expired) correctly named
- ✅ Queue fields displayed (queueStatus, queuePosition)
- ✅ Attendance status handled separately from booking status

---

## Recommended Fix Priority

1. **CRITICAL** - Remove result delete functionality (or verify it's truly disabled)
2. **CRITICAL** - Add password minimum length validation (9 chars)
3. **HIGH** - Add 'expired' booking status support
4. **HIGH** - Display grade/released/locked for results
5. **MEDIUM** - Centralize role constants
6. **LOW** - Add permission constants (future enhancement)

---

## Frontend Implementation Checklist

- [ ] Fix result delete button (remove or disable)
- [ ] Add password minLength validation (9 chars)
- [ ] Add 'expired' to booking statuses
- [ ] Update booking status filters/displays
- [ ] Display grade for results
- [ ] Display released/locked state for results
- [ ] Centralize role constants
- [ ] Test all workflows end-to-end
- [ ] Verify error messages from backend match expectations

---

## Validation Against Backend Contract

All changes must be verified against: [backend-contract-audit.md](../backend-contract-audit.md)

No endpoints should be called that don't exist in backend.
No fields should be expected that backend doesn't provide.
All payloads must match exactly.
