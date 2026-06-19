const { Booking } = require('../models');
const audit = require('../utils/audit.utils');

/**
 * Find pending bookings whose date/time has passed and mark them
 * expired. Each row is processed in its own try/catch so one bad row
 * does not stop the rest of the batch.
 *
 * The job itself never throws — any unexpected error is logged and
 * swallowed so the server keeps running.
 */
module.exports = async () => {
    let expiredCount = 0;

    try {
        const now = new Date();
        const { Op } = require('sequelize');

        // Find bookings that are still pending but the date/time has passed
        const expiredBookings = await Booking.findAll({
            where: {
                status: 'pending',
                date: { [Op.lt]: now }
            }
        });

        for (const booking of expiredBookings) {
            try {
                booking.status = 'expired';
                await booking.save();
                expiredCount += 1;
            } catch (saveErr) {
                // One bad row must not stop the rest.
                console.error(
                    `Expiry: failed to save booking ${booking.id}:`,
                    saveErr.message
                );
                continue;
            }

            // Audit is fire-and-forget; it never throws.
            try {
                await audit({
                    action: 'BOOKING_EXPIRED',
                    entity: 'Booking',
                    entityId: booking.id,
                    userId: booking.studentId
                });
            } catch (auditErr) {
                // Defensive — audit is already non-throwing but keep the
                // job totally isolated.
                console.error(
                    `Expiry: audit failed for booking ${booking.id}:`,
                    auditErr.message
                );
            }
        }

        if (expiredCount > 0) {
            console.log(`Booking expiry job marked ${expiredCount} booking(s) expired at ${now.toISOString()}`);
        }
    } catch (err) {
        console.error('Booking expiry job failed:', err.message);
    }
};
