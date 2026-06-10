const { Booking } = require('../models');

/**
 * In-memory lock (prevents duplicate execution in same instance)
 */
const processingJobs = new Set();

module.exports = async (job) => {
    const { bookingId } = job.data;

    // 🚫 prevent duplicate execution in same worker instance
    if (processingJobs.has(bookingId)) {
        return;
    }

    processingJobs.add(bookingId);

    try {

        const booking = await Booking.findByPk(bookingId);

        if (!booking) {
            return;
        }

        /**
         * =====================================
         * IDEMPOTENCY CHECK (CRITICAL)
         * =====================================
         */

        if (booking.status === 'confirmed') {
            return;
        }

        if (booking.status === 'processing') {
            return;
        }

        /**
         * =====================================
         * MARK AS PROCESSING
         * =====================================
         */
        booking.status = 'processing';
        await booking.save();

        /**
         * =====================================
         * BUSINESS LOGIC (PLACEHOLDER)
         * =====================================
         * Here you can later:
         * - notify student
         * - reserve resource
         * - trigger email
         * - update timetable conflicts (if re-enabled)
         */

        // Simulated processing completion
        booking.status = 'confirmed';
        booking.queueStatus = 'completed';

        await booking.save();

        return booking;

    } catch (err) {

        console.error('Booking worker error:', err);

        /**
         * =====================================
         * SAFE FAILURE STATE
         * =====================================
         */
        await Booking.update(
            {
                status: 'failed',
                queueStatus: 'failed'
            },
            {
                where: { id: bookingId }
            }
        );

        throw err;

    } finally {
        processingJobs.delete(bookingId);
    }
};