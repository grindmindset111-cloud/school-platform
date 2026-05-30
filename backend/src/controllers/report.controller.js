// src/controllers/report.controller.js
const {
    getStudentAttendanceReport,
    getClassAttendanceReport,
    getBookingSummary
} = require('../services/report.service');

const { success, error } = require('../utils/response.utils');

/**
 * STUDENT REPORT
 */
exports.studentReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const data = await getStudentAttendanceReport(
            req.params.studentId,
            { startDate, endDate }
        );

        return success(res, data);
    } catch (err) {
        return error(res, err.message, err.status || 500);
    }
};

/**
 * CLASS REPORT
 */
exports.classReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const data = await getClassAttendanceReport(
            req.params.classLevelId,
            { startDate, endDate }
        );

        return success(res, data);
    } catch (err) {
        return error(res, err.message, err.status || 500);
    }
};

/**
 * BOOKING SUMMARY
 */
exports.bookingSummary = async (req, res) => {
    try {
        const { startDate, endDate, classLevelId } = req.query;

        const data = await getBookingSummary({
            startDate,
            endDate,
            classLevelId
        });

        return success(res, data);
    } catch (err) {
        return error(res, err.message, err.status || 500);
    }
};
// ============================
// CLASS ATTENDANCE PERCENTAGE
// ============================
exports.attendancePercentage = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const data = await require('../services/report.service')
            .getAttendancePercentageByClass(
                req.params.classLevelId,
                { startDate, endDate }
            );

        return success(res, data);
    } catch (err) {
        return error(res, err.message, err.status || 500);
    }
};