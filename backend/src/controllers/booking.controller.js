const {
    createBooking,
    getBookings,
    updateBooking: updateBookingService,
    bulkUpdateBookings,
    getAvailability
} = require('../services/booking.service');

const { User } = require('../models');

const { success, error } = require('../utils/response.utils');
const audit = require('../utils/audit.utils');
const { notify } = require('../utils/notify.utils');


// ====================================
// CREATE BOOKING
// ====================================
exports.createBooking = async (req, res) => {
    try {

        const user = req.user;

        if (user.role !== 'STUDENT') {
            return error(res, 'Only students can create bookings', 403);
        }

        const {
            resourceId,
            subjectId,
            date,
            startTime,
            endTime
        } = req.body;

        if (!subjectId || !date || !startTime || !endTime) {
            return error(
                res,
                'Required fields: subjectId, date, startTime, endTime',
                400
            );
        }

        const booking = await createBooking({
            studentId: user.id,
            resourceId,
            subjectId,
            date,
            startTime,
            endTime
        });

        audit({
            action: 'CREATE_BOOKING',
            entity: 'Booking',
            entityId: booking.id,
            userId: user.id
        }).catch(console.error);

        // Notify admins (async safe)
        (async () => {
            try {

                const admins = await User.findAll({
                    where: { role: 'ADMIN' }
                });

                if (!admins.length) return;

                await notify({
                    users: admins.map(a => ({
                        id: a.id,
                        name: a.name,
                        email: a.email
                    })),
                    title: 'New Booking Created',
                    message: `Student ${user.name} created a booking on ${date}.`,
                    emailSubject: 'New Booking Created',
                    emailTextBuilder: admin => `
Hello ${admin.name},

Student ${user.name} created a booking on ${date}
from ${startTime} to ${endTime}.

Check dashboard.
`
                });

            } catch (err) {
                console.error('Admin notification failed:', err);
            }
        })();

        return success(res, booking, 'Booking created successfully');

    } catch (err) {
        console.error('Create booking error:', err);

        return error(
            res,
            err.message || 'Failed to create booking',
            err.status || 500
        );
    }
};


// ====================================
// GET BOOKINGS
// ====================================
exports.getBookings = async (req, res) => {
    try {

        const bookings = await getBookings(req.user, req.query);

        audit({
            action: 'VIEW_BOOKINGS',
            entity: 'Booking',
            userId: req.user.id
        }).catch(console.error);

        return success(res, bookings);

    } catch (err) {
        console.error('Get bookings error:', err);

        return error(
            res,
            err.message || 'Failed to fetch bookings',
            err.status || 500
        );
    }
};


// ====================================
// UPDATE BOOKING
// ====================================
exports.updateBooking = async (req, res) => {
    try {

        const user = req.user;

        if (!['STAFF', 'ADMIN'].includes(user.role)) {
            return error(res, 'Unauthorized', 403);
        }

        const { status, attendanceStatus } = req.body;

        if (!status && !attendanceStatus) {
            return error(res, 'Provide status or attendanceStatus', 400);
        }

        const booking = await updateBookingService(
            req.params.id,
            { status, attendanceStatus },
            user
        );

        audit({
            action: 'UPDATE_BOOKING',
            entity: 'Booking',
            entityId: booking.id,
            userId: user.id
        }).catch(console.error);

        // Notify student
        (async () => {
            try {

                const student = await User.findByPk(booking.studentId);
                if (!student) return;

                const messages = [];

                if (status) messages.push(`Booking: ${status}`);
                if (attendanceStatus) messages.push(`Attendance: ${attendanceStatus}`);

                await notify({
                    users: [{
                        id: student.id,
                        name: student.name,
                        email: student.email
                    }],
                    title: 'Booking Update',
                    message: messages.join(' | '),
                    emailSubject: 'Booking Update',
                    emailTextBuilder: s => `
Hello ${s.name},

${messages.join(' | ')}

Date: ${booking.date}
Time: ${booking.startTime} - ${booking.endTime}
`
                });

            } catch (err) {
                console.error('Student notification failed:', err);
            }
        })();

        return success(res, booking, 'Booking updated successfully');

    } catch (err) {
        console.error('Update booking error:', err);

        return error(
            res,
            err.message || 'Failed to update booking',
            err.status || 500
        );
    }
};


// ====================================
// BULK UPDATE BOOKINGS
// ====================================
exports.bulkUpdateBookings = async (req, res) => {
    try {

        const user = req.user;

        if (!['STAFF', 'ADMIN'].includes(user.role)) {
            return error(res, 'Unauthorized', 403);
        }

        const { ids, status, attendanceStatus } = req.body;

        if (!ids?.length) {
            return error(res, 'Provide booking IDs', 400);
        }

        if (!status && !attendanceStatus) {
            return error(res, 'Provide status or attendanceStatus', 400);
        }

        const result = await bulkUpdateBookings(
            ids,
            { status, attendanceStatus },
            user
        );

        audit({
            action: 'BULK_UPDATE_BOOKINGS',
            entity: 'Booking',
            userId: user.id
        }).catch(console.error);

        return success(res, result, 'Bulk update successful');

    } catch (err) {
        console.error('Bulk update error:', err);

        return error(
            res,
            err.message || 'Bulk update failed',
            err.status || 500
        );
    }
};


// ====================================
// AVAILABILITY
// ====================================
exports.getAvailability = async (req, res) => {
    try {

        const data = await getAvailability(req.query);

        return success(res, data, 'Availability fetched');

    } catch (err) {
        return error(
            res,
            err.message || 'Failed to fetch availability',
            err.status || 500
        );
    }
};