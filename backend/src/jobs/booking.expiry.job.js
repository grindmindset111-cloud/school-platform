const { Booking } = require('../models');
const audit = require('../utils/audit.utils');

module.exports = async () => {
    try {
        const now = new Date();

        // Find bookings that are still pending but the date/time has passed
        const expiredBookings = await Booking.findAll({
            where: {
                status: 'pending',
                date: { [require('sequelize').Op.lt]: now }
            }
        });

        for (let booking of expiredBookings) {
            booking.status = 'expired';
            await booking.save();

            await audit({
                action: 'BOOKING_EXPIRED',
                entity: 'Booking',
                entityId: booking.id,
                userId: booking.studentId
            });
        }

        console.log(`Booking expiry job completed at ${now}`);
    } catch (err) {
        console.error('Booking expiry job failed:', err.message);
    }
};
