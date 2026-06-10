// src/services/booking.service.js

const {
    Booking,
    Resource,
    User,
    Subject,
    sequelize
} = require('../models');

const { Op } = require('sequelize');

const bookingQueue = require('../queues/booking.queue');


/**
 * ============================
 * DB ERROR HANDLER
 * ============================
 */
const handleDbError = (err) => {

    if (err.name === 'SequelizeUniqueConstraintError') {
        throw {
            message: 'Duplicate booking detected',
            status: 400
        };
    }

    if (err.name === 'SequelizeValidationError') {
        throw {
            message: err.errors?.[0]?.message || 'Validation failed',
            status: 400
        };
    }

    throw err;
};


/**
 * ============================
 * NORMALIZE TIME
 * ============================
 */
const normalizeTime = (time) => {
    if (!time) return time;

    return time.length === 5
        ? `${time}:00`
        : time;
};


/**
 * ============================
 * CREATE BOOKING
 * ============================
 */
const createBooking = async (data) => {

    const {
        studentId,
        resourceId,
        subjectId,
        date,
        startTime,
        endTime
    } = data;

    try {

        return await sequelize.transaction(async (t) => {

            // 🔐 Normalize time
            const normalizedStart = normalizeTime(startTime);
            const normalizedEnd = normalizeTime(endTime);

            // 🔐 Validate student
            const student = await User.findByPk(studentId, {
                transaction: t,
                lock: t.LOCK.UPDATE
            });

            if (!student || student.role !== 'STUDENT') {
                throw {
                    message: 'Invalid student',
                    status: 403
                };
            }

            // 🔐 Validate subject
            const subject = await Subject.findByPk(subjectId, {
                transaction: t
            });

            if (!subject) {
                throw {
                    message: 'Subject not found',
                    status: 404
                };
            }

            // 🔐 Validate time order
            if (normalizedStart >= normalizedEnd) {
                throw {
                    message: 'Invalid time range',
                    status: 400
                };
            }

            // 🔐 Prevent past booking
            const now = new Date();

            const bookingDateTime =
                new Date(`${date}T${normalizedStart}`);

            if (bookingDateTime < now) {
                throw {
                    message: 'Cannot book past date/time',
                    status: 400
                };
            }

            // 🔐 Prevent overlap
            const conflict = await Booking.findOne({
                where: {
                    studentId,
                    date,

                    [Op.and]: [
                        {
                            startTime: {
                                [Op.lt]: normalizedEnd
                            }
                        },
                        {
                            endTime: {
                                [Op.gt]: normalizedStart
                            }
                        }
                    ]
                },

                transaction: t
            });

            if (conflict) {
                throw {
                    message: 'Time conflict detected',
                    status: 400
                };
            }

            // 🔐 Queue position
            const lastQueue =
                (await Booking.max('queuePosition', {
                    transaction: t
                })) || 0;

            // ✅ Create booking
            const booking = await Booking.create({
                studentId,

                classLevelId: student.classLevelId,

                resourceId: resourceId || null,

                subjectId,

                date,

                startTime: normalizedStart,
                endTime: normalizedEnd,

                status: 'pending',

                queueStatus: 'queued',
                queuePosition: lastQueue + 1,

                retryCount: 0,
                maxRetries: 3

            }, {
                transaction: t
            });

            // ✅ Push to Redis queue
            await bookingQueue.add(
                'process-booking',
                {
                    bookingId: booking.id
                },
                {
                    attempts: 3,

                    backoff: {
                        type: 'exponential',
                        delay: 2000
                    },

                    removeOnComplete: true,
                    removeOnFail: false
                }
            );

            return booking;
        });

    } catch (err) {
        handleDbError(err);
    }
};


/**
 * ============================
 * GET BOOKINGS
 * ============================
 */
const getBookings = async (user, query = {}) => {

    const {
        status,
        subjectId,
        date,
        classLevelId,
        limit = 20,
        offset = 0
    } = query;

    const where = {};

    // 🔐 Students only see their bookings
    if (user.role === 'STUDENT') {
        where.studentId = user.id;
    }

    if (status) where.status = status;
    if (subjectId) where.subjectId = subjectId;
    if (date) where.date = date;
    if (classLevelId) where.classLevelId = classLevelId;

    return Booking.findAndCountAll({
        where,

        include: [
            {
                model: User,
                as: 'student',
                attributes: ['id', 'name']
            },
            {
                model: Resource,
                as: 'resource',
                attributes: ['id', 'name']
            },
            {
                model: Subject,
                as: 'subject',
                attributes: ['id', 'name']
            }
        ],

        limit: Number(limit),
        offset: Number(offset),

        order: [
            ['date', 'ASC'],
            ['startTime', 'ASC']
        ]
    });
};


/**
 * ============================
 * UPDATE BOOKING
 * ============================
 */
const updateBooking = async (id, data, user) => {

    try {

        return await sequelize.transaction(async (t) => {

            const booking = await Booking.findByPk(id, {

                include: [
                    {
                        model: Subject,
                        as: 'subject',

                        include: [
                            {
                                model: User,
                                as: 'teachers',
                                attributes: ['id']
                            }
                        ]
                    }
                ],

                transaction: t,
                lock: t.LOCK.UPDATE
            });

            if (!booking) {
                throw {
                    message: 'Booking not found',
                    status: 404
                };
            }

            // 🔐 STAFF restriction
            if (user.role === 'STAFF') {

                const teachers =
                    booking.subject?.teachers || [];

                const isTeacher =
                    teachers.some(
                        tch => tch.id === user.id
                    );

                if (!isTeacher) {
                    throw {
                        message: 'Unauthorized',
                        status: 403
                    };
                }
            }

            // 🔄 Update fields
            if (data.status) {
                booking.status = data.status;
            }

            if (data.attendanceStatus) {
                booking.attendanceStatus =
                    data.attendanceStatus;
            }

            await booking.save({
                transaction: t
            });

            return booking;
        });

    } catch (err) {
        handleDbError(err);
    }
};


/**
 * ============================
 * BULK UPDATE BOOKINGS
 * ============================
 */
const bulkUpdateBookings = async (
    ids = [],
    data,
    user
) => {

    if (!ids.length) {
        throw {
            message: 'No booking IDs provided',
            status: 400
        };
    }

    try {

        return await sequelize.transaction(async (t) => {

            const bookings = await Booking.findAll({

                where: {
                    id: {
                        [Op.in]: ids
                    }
                },

                include: [
                    {
                        model: Subject,
                        as: 'subject',

                        include: [
                            {
                                model: User,
                                as: 'teachers',
                                attributes: ['id']
                            }
                        ]
                    }
                ],

                transaction: t,
                lock: t.LOCK.UPDATE
            });

            if (!bookings.length) {
                throw {
                    message: 'No bookings found',
                    status: 404
                };
            }

            let updated = 0;

            const skipped = [];

            for (const booking of bookings) {

                // 🔐 STAFF restriction
                if (user.role === 'STAFF') {

                    const isTeacher =
                        booking.subject?.teachers?.some(
                            tch => tch.id === user.id
                        );

                    if (!isTeacher) {
                        skipped.push(booking.id);
                        continue;
                    }
                }

                // 🔄 Update fields
                if (data.status) {
                    booking.status = data.status;
                }

                if (data.attendanceStatus) {
                    booking.attendanceStatus =
                        data.attendanceStatus;
                }

                await booking.save({
                    transaction: t
                });

                updated++;
            }

            return {
                updated,
                skipped,
                totalRequested: ids.length
            };
        });

    } catch (err) {
        handleDbError(err);
    }
};


/**
 * ============================
 * EXPORTS
 * ============================
 */
module.exports = {
    createBooking,
    getBookings,
    updateBooking,
    bulkUpdateBookings
};