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
 * SQLITE BUSY RETRY (Tier-1 + Tier-2)
 * ============================
 * SQLite is single-writer. The booking queue processor
 * (server.js → jobs/booking.queue.processor.js) opens short write
 * transactions every 5s; while one is in flight, our INSERT may
 * receive SQLITE_BUSY. The pool-wide busy_timeout configured in
 * config/database.config.js is not always re-applied per
 * connection checkout in this Sequelize 6.32.1 + sqlite3 5.1.6
 * stack, so we also re-apply it inline and retry with backoff.
 * Only used inside createBooking; read paths are unchanged.
 */
const BUSY_RETRY_DELAYS_MS = [0, 100, 250, 500];

const isSqliteBusy = (err) => {
    if (!err) return false;
    const code = err.parent && err.parent.code;
    const errno = err.parent && err.parent.errno;
    const msg = String(err.message || err.parent?.message || '');
    return (
        code === 'SQLITE_BUSY' ||
        errno === 5 ||
        msg.includes('SQLITE_BUSY') ||
        msg.includes('database is locked') ||
        (err.name === 'SequelizeTimeoutError' &&
            (msg.includes('SQLITE_BUSY') || msg.includes('database is locked')))
    );
};

const reapplyBusyTimeout = async () => {
    try {
        await sequelize.query('PRAGMA busy_timeout = 10000;');
    } catch (_) {
        // Non-fatal: PRAGMA may not be supported on every connection;
        // the retry loop below still handles contention.
    }
};

const runWithBusyRetry = async (fn) => {
    let lastErr;
    for (let i = 0; i < BUSY_RETRY_DELAYS_MS.length; i++) {
        const delay = BUSY_RETRY_DELAYS_MS[i];
        if (delay > 0) {
            await new Promise((r) => setTimeout(r, delay));
        }
        await reapplyBusyTimeout();
        try {
            return await fn();
        } catch (err) {
            lastErr = err;
            if (!isSqliteBusy(err)) throw err;
            // else: retry
        }
    }
    throw lastErr;
};


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

            return await runWithBusyRetry(() =>
                sequelize.transaction(async (t) => {

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
            // The queue is a post-create async pipeline, not part of the
            // critical booking path. If Redis is unreachable we log a
            // warning and continue — the booking still gets persisted.
            try {
                            await bookingQueue.add(
                                'process-booking',
                                { bookingId: booking.id },
                                {
                                    attempts: 3,
                                    backoff: { type: 'exponential', delay: 2000 },
                                    removeOnComplete: true,
                                    removeOnFail: false
                                }
                            );
                        } catch (queueErr) {
                            console.warn(
                                `⚠️  Failed to enqueue booking ${booking.id}:`,
                                queueErr.message
                            );
                        }

                        return booking;
                    }));

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
 * GET BOOKING BY ID
 * ============================
 * Returns a single booking with the same relations used by
 * getBookings, plus the subject's teachers so the controller
 * (and any downstream authorization check) can verify staff
 * scope. Throws {message, status} on not-found / forbidden.
 */
const getBookingById = async (id, user) => {

    if (!id || Number.isNaN(Number(id))) {
        throw {
            message: 'Invalid booking id',
            status: 400
        };
    }

    const booking = await Booking.findByPk(id, {
        include: [
            {
                model: User,
                as: 'student',
                attributes: ['id', 'name', 'email']
            },
            {
                model: Resource,
                as: 'resource',
                attributes: ['id', 'name']
            },
            {
                model: Subject,
                as: 'subject',
                attributes: ['id', 'name', 'code'],
                include: [
                    {
                        model: User,
                        as: 'teachers',
                        attributes: ['id']
                    }
                ]
            }
        ]
    });

    if (!booking) {
        throw {
            message: 'Booking not found',
            status: 404
        };
    }

    // 🔐 Authorization
    if (user.role === 'STUDENT') {
        if (booking.studentId !== user.id) {
            throw {
                message: 'You are not allowed to view this booking',
                status: 403
            };
        }
    } else if (user.role === 'STAFF') {
        const teacherIds = (booking.subject?.teachers || []).map(
            (t) => t.id
        );

        if (!teacherIds.includes(user.id)) {
            throw {
                message: 'You are not assigned to this booking\'s subject',
                status: 403
            };
        }
    }
    // ADMIN: full access (no extra check)

    return booking;
};


/**
 * ============================
 * UPDATE BOOKING
 * ============================
 */
const updateBooking = async (id, data, user) => {

    try {

        return await runWithBusyRetry(() =>
            sequelize.transaction(async (t) => {

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
        }));

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

        return await runWithBusyRetry(() =>
            sequelize.transaction(async (t) => {

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
        }));

    } catch (err) {
        handleDbError(err);
    }
};


/**
 * ============================
 * GET AVAILABILITY
 * ============================
 * Returns basic availability metadata for a given date / subject /
 * class level. The frontend does not currently consume this, but the
 * route is wired, so we return an empty result set rather than crashing.
 */
const getAvailability = async (query = {}) => {
    return {
        date: query.date || null,
        subjectId: query.subjectId || null,
        classLevelId: query.classLevelId || null,
        slots: []
    };
};


/**
 * ============================
 * EXPORTS
 * ============================
 */
module.exports = {
    createBooking,
    getBookings,
    getBookingById,
    updateBooking,
    bulkUpdateBookings,
    getAvailability
};