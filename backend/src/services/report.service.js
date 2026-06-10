// src/services/report.service.js

const { Booking, User, Subject } = require('../models');
const { Op } = require('sequelize');


/**
 * ============================
 * BUILD DATE FILTER
 * ============================
 */
const buildDateFilter = (filters = {}) => {
    const where = {};

    if (filters.startDate || filters.endDate) {
        where.date = {};

        if (filters.startDate) {
            where.date[Op.gte] = filters.startDate;
        }

        if (filters.endDate) {
            where.date[Op.lte] = filters.endDate;
        }
    }

    return where;
};


/**
 * ============================
 * BUILD ATTENDANCE SUMMARY
 * ============================
 */
const buildAttendanceSummary = (bookings = []) => {
    return {
        total: bookings.length,
        present: bookings.filter(b => b.attendanceStatus === 'present').length,
        absent: bookings.filter(b => b.attendanceStatus === 'absent').length,
        late: bookings.filter(b => b.attendanceStatus === 'late').length,
        excused: bookings.filter(b => b.attendanceStatus === 'excused').length,
        unmarked: bookings.filter(b => b.attendanceStatus === 'unmarked').length
    };
};


/**
 * ============================
 * STUDENT ATTENDANCE REPORT
 * ============================
 */
const getStudentAttendanceReport = async (studentId, filters = {}) => {

    const where = {
        studentId,
        ...buildDateFilter(filters)
    };

    const bookings = await Booking.findAll({
        where,
        include: [
            {
                model: Subject,
                as: 'subject',
                attributes: ['id', 'name']
            }
        ],
        order: [['date', 'ASC']]
    });

    return {
        bookings,
        summary: buildAttendanceSummary(bookings)
    };
};


/**
 * ============================
 * CLASS ATTENDANCE REPORT
 * ============================
 */
const getClassAttendanceReport = async (classLevelId, filters = {}) => {

    const where = {
        classLevelId,
        ...buildDateFilter(filters)
    };

    const bookings = await Booking.findAll({
        where,
        include: [
            {
                model: User,
                as: 'student',
                attributes: ['id', 'name']
            },
            {
                model: Subject,
                as: 'subject',
                attributes: ['id', 'name']
            }
        ],
        order: [['date', 'ASC']]
    });

    return {
        bookings,
        summary: buildAttendanceSummary(bookings)
    };
};


/**
 * ============================
 * ATTENDANCE PERCENTAGE BY CLASS
 * ============================
 */
const getAttendancePercentageByClass = async (classLevelId, filters = {}) => {

    const where = {
        classLevelId,
        ...buildDateFilter(filters)
    };

    const bookings = await Booking.findAll({
        where,
        include: [
            {
                model: User,
                as: 'student',
                attributes: ['id', 'name']
            }
        ]
    });

    const studentMap = {};

    bookings.forEach(b => {

        const studentId = b.studentId;

        if (!studentMap[studentId]) {
            studentMap[studentId] = {
                studentId,
                name: b.student?.name || 'Unknown',
                totalClasses: 0,
                present: 0,
                absent: 0,
                late: 0,
                excused: 0
            };
        }

        studentMap[studentId].totalClasses++;

        if (b.attendanceStatus === 'present') {
            studentMap[studentId].present++;
        }

        if (b.attendanceStatus === 'absent') {
            studentMap[studentId].absent++;
        }

        if (b.attendanceStatus === 'late') {
            studentMap[studentId].late++;
        }

        if (b.attendanceStatus === 'excused') {
            studentMap[studentId].excused++;
        }
    });

    return Object.values(studentMap).map(student => {

        const percentage =
            student.totalClasses === 0
                ? 0
                : ((student.present / student.totalClasses) * 100);

        return {
            ...student,
            attendancePercentage: Number(percentage.toFixed(2))
        };
    });
};


/**
 * ============================
 * BOOKING SUMMARY REPORT
 * ============================
 */
const getBookingSummary = async (filters = {}) => {

    const where = {
        ...buildDateFilter(filters)
    };

    if (filters.classLevelId) {
        where.classLevelId = filters.classLevelId;
    }

    const bookings = await Booking.findAll({ where });

    return {
        total: bookings.length,
        pending: bookings.filter(b => b.status === 'pending').length,
        approved: bookings.filter(b => b.status === 'approved').length,
        rejected: bookings.filter(b => b.status === 'rejected').length,
        cancelled: bookings.filter(b => b.status === 'cancelled').length
    };
};


module.exports = {
    getStudentAttendanceReport,
    getClassAttendanceReport,
    getAttendancePercentageByClass,
    getBookingSummary
};