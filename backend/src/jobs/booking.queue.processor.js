// src/jobs/booking.queue.processor.js

const { Booking, sequelize } = require('../models');
const { Op } = require('sequelize');


/**
 * ============================
 * PROCESS NEXT QUEUED BOOKING
 * ============================
 */
const processQueue = async () => {

    const transaction = await sequelize.transaction();

    try {

        // 🔍 Find next queued booking
        const booking = await Booking.findOne({
            where: {
                queueStatus: 'queued'
            },
            order: [['queuePosition', 'ASC']],
            transaction,
            lock: transaction.LOCK.UPDATE
        });

        // ✅ No queued bookings
        if (!booking) {
            await transaction.commit();
            return;
        }

        // 🔄 Mark as processing
        booking.queueStatus = 'processing';

        await booking.save({ transaction });

        await transaction.commit();

        // 🚀 Finalize booking safely
        await finalizeBooking(booking);

    } catch (err) {

        await transaction.rollback();

        console.error('Queue processor error:', err);
    }
};


/**
 * ============================
 * FINALIZE BOOKING
 * ============================
 */
const finalizeBooking = async (booking) => {

    const t = await sequelize.transaction();

    try {

        // 🔒 Final overlap check
        const conflict = await Booking.findOne({
            where: {
                id: { [Op.ne]: booking.id },
                studentId: booking.studentId,
                date: booking.date,

                [Op.and]: [
                    { startTime: { [Op.lt]: booking.endTime } },
                    { endTime: { [Op.gt]: booking.startTime } }
                ]
            },
            transaction: t,
            lock: t.LOCK.UPDATE
        });

        /**
         * ❌ CONFLICT FOUND
         * Retry safely
         */
        if (conflict) {

            booking.retryCount += 1;

            // 🚫 Max retries reached
            if (booking.retryCount >= booking.maxRetries) {

                booking.queueStatus = 'failed';

            } else {

                // 🔁 Requeue booking
                booking.queueStatus = 'queued';
            }

            await booking.save({ transaction: t });

            await t.commit();

            return;
        }

        /**
         * ✅ SUCCESS
         */
        booking.queueStatus = 'completed';
        booking.status = 'approved';

        await booking.save({ transaction: t });

        await t.commit();

    } catch (err) {

        await t.rollback();

        console.error('Finalize booking error:', err);

        try {

            booking.retryCount += 1;

            if (booking.retryCount >= booking.maxRetries) {
                booking.queueStatus = 'failed';
            } else {
                booking.queueStatus = 'queued';
            }

            await booking.save();

        } catch (saveErr) {

            console.error('Failed to update booking after error:', saveErr);
        }
    }
};


module.exports = processQueue;