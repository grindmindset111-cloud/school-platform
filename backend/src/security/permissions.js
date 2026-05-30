// src/security/permissions.js

const permissions = {

    /**
     * ==========================================================
     * ADMIN (FULL ACCESS)
     * ==========================================================
     */
    ADMIN: [
        '*'
    ],


    /**
     * ==========================================================
     * STAFF (ACADEMIC OPERATIONS)
     * ==========================================================
     */
    STAFF: [
        // Dashboard
        'DASHBOARD_VIEW',

        // Bookings
        'BOOKING_VIEW',
        'BOOKING_UPDATE',

        // Students (limited)
        'STUDENT_VIEW',

        // Staff (optional self/view)
        'STAFF_VIEW',

        // Subjects
        'SUBJECT_VIEW',

        // Results
        'RESULT_VIEW',
        'RESULT_CREATE',
        'RESULT_UPDATE',
        'RESULT_BULK_UPLOAD',

        // Attendance
        'ATTENDANCE_MARK',

        // Reports
        'REPORT_VIEW',

        // Notifications
        'NOTIFICATION_VIEW',
        'NOTIFICATION_UPDATE',

        // Resources
        'RESOURCE_VIEW',

        // Sessions
        'SESSION_VIEW'
    ],


    /**
     * ==========================================================
     * STUDENT (SELF-SERVICE ACCESS)
     * ==========================================================
     */
    STUDENT: [
        'DASHBOARD_VIEW',

        'BOOKING_CREATE',
        'BOOKING_VIEW',

        'PROFILE_VIEW',

        'SUBJECT_VIEW',

        'RESULT_VIEW',

        'REPORT_VIEW',

        'NOTIFICATION_VIEW',

        'SESSION_VIEW'
    ]
};


/**
 * ==========================================================
 * PERMISSION CHECKER
 * ==========================================================
 */
const can = (user, action) => {

    if (!user || !user.role) {
        return false;
    }

    const rolePermissions =
        permissions[user.role] || [];

    // ADMIN wildcard
    if (rolePermissions.includes('*')) {
        return true;
    }

    return rolePermissions.includes(action);
};

module.exports = {
    can
};