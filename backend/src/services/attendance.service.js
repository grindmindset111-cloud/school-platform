// src/services/attendance.service.js
const { Booking, Subject, User, sequelize } = require('../models');

/**
 * ============================
 * BULK UPDATE ATTENDANCE (SAFE + TRANSACTIONAL)
 * ============================
 */
const bulkUpdateAttendance = async (bookingIds = [], attendanceStatus, user) => {

    const allowed = ['present', 'absent', 'late', 'excused', 'unmarked'];

    // Validate input
    if (!Array.isArray(bookingIds) || bookingIds.length === 0) {
        throw { message: 'No booking IDs provided', status: 400 };
    }

    if (!allowed.includes(attendanceStatus)) {
        throw { message: 'Invalid attendance status', status: 400 };
    }

    return await sequelize.transaction(async (t) => {

        const bookings = await Booking.findAll({
            where: { id: bookingIds },
            include: [
                {
                    model: Subject,
                    as: 'subject',
                    include: [
                        { model: User, as: 'teachers', attributes: ['id'] }
                    ]
                }
            ],
            transaction: t,
            lock: t.LOCK.UPDATE
        });

        if (!bookings.length) {
            throw { message: 'No bookings found', status: 404 };
        }

        const updated = [];
        const skipped = [];

        for (const booking of bookings) {

            // STAFF restriction (safe skip instead of crash)
            if (user.role === 'STAFF') {
                const isTeacher = booking.subject?.teachers?.some(
                    t => t.id === user.id
                );

                if (!isTeacher) {
                    skipped.push(booking.id);
                    continue;
                }
            }

            booking.attendanceStatus = attendanceStatus;
            await booking.save({ transaction: t });

            updated.push(booking);
        }

        return {
            updatedCount: updated.length,
            skippedCount: skipped.length,
            skippedIds: skipped,
            updated
        };
    });
};

module.exports = {
    bulkUpdateAttendance
};