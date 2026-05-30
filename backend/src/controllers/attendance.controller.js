// src/controllers/attendance.controller.js
const { bulkUpdateAttendance } = require('../services/attendance.service');
const { success, error } = require('../utils/response.utils');

exports.bulkAttendance = async (req, res) => {
    try {
        const user = req.user;

        if (!['STAFF', 'ADMIN'].includes(user.role)) {
            return error(res, 'Unauthorized', 403);
        }

        const { bookingIds, attendanceStatus } = req.body;

        if (!bookingIds || !attendanceStatus) {
            return error(res, 'bookingIds and attendanceStatus required', 400);
        }

        const result = await bulkUpdateAttendance(bookingIds, attendanceStatus, user);

        return success(res, result, 'Attendance updated');
    } catch (err) {
        return error(res, err.message, err.status || 500);
    }
};