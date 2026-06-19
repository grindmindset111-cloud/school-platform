// src/services/dashboard.service.js

const {
    User,
    Booking,
    Resource,
    Result,
    Subject,
    Notification,
    ClassLevel
} = require('../models');

const { Op, Sequelize } = require('sequelize');

const getDashboard = async (user) => {

    const role = user.role.toUpperCase();
    const userId = user.id;

    const today = new Date();

    const currentMonth = (today.getMonth() + 1)
        .toString()
        .padStart(2, '0');

    const currentYear = today
        .getFullYear()
        .toString();

    // =========================
    // COMMON NOTIFICATIONS
    // =========================

    const notifications = await Notification.findAll({
        where: {
            userId,
            isRead: false
        },
        order: [['createdAt', 'DESC']],
        limit: 10
    });

    const unreadCount = notifications.length;

    // =========================
    // SQLITE MONTH FILTER
    // =========================

    const dateFilter = (column) => ({
        [Op.and]: [
            Sequelize.where(
                Sequelize.fn('strftime', '%m', Sequelize.col(column)),
                currentMonth
            ),
            Sequelize.where(
                Sequelize.fn('strftime', '%Y', Sequelize.col(column)),
                currentYear
            )
        ]
    });

    // =========================
    // BOOKING TRENDS
    // =========================

    const bookingTrendsQuery = (where = {}) =>
        Booking.findAll({
            where: {
                ...where,
                ...dateFilter('date')
            },

            attributes: [
                [
                    Sequelize.fn('strftime', '%d', Sequelize.col('date')),
                    'day'
                ],
                [
                    Sequelize.fn('COUNT', Sequelize.col('id')),
                    'count'
                ]
            ],

            group: [
                Sequelize.fn('strftime', '%d', Sequelize.col('date'))
            ],

            order: [
                [
                    Sequelize.fn('strftime', '%d', Sequelize.col('date')),
                    'ASC'
                ]
            ],

            raw: true
        });

    // =====================================================
    // ADMIN DASHBOARD
    // =====================================================

    if (role === 'ADMIN') {

        const [
            totalStudents,
            totalStaff,
            totalResources,
            totalBookings,
            pendingBookings,
            monthlyBookings,
            monthlyBookingTrends,
            totalResults,
            releasedResults,
            topResources
        ] = await Promise.all([

            User.count({
                where: { role: 'STUDENT' }
            }),

            User.count({
                where: { role: 'STAFF' }
            }),

            Resource.count(),

            Booking.count(),

            Booking.count({
                where: { status: 'pending' }
            }),

            Booking.count({
                where: dateFilter('date')
            }),

            bookingTrendsQuery(),

            Result.count(),

            Result.count({
                where: { released: true }
            }),

            Booking.findAll({
                attributes: [
                    'resourceId',
                    [
                        Sequelize.fn(
                            'COUNT',
                            Sequelize.col('resourceId')
                        ),
                        'count'
                    ]
                ],

                where: dateFilter('date'),

                group: ['resourceId'],

                order: [
                    [
                        Sequelize.fn(
                            'COUNT',
                            Sequelize.col('resourceId')
                        ),
                        'DESC'
                    ]
                ],

                limit: 5,

                include: [
                    {
                        model: Resource,
                        as: 'resource',
                        attributes: ['id', 'name']
                    }
                ]
            })
        ]);

        return {
            role: 'ADMIN',

            users: {
                students: totalStudents,
                staff: totalStaff
            },

            bookings: {
                total: totalBookings,
                pending: pendingBookings,
                thisMonth: monthlyBookings
            },

            results: {
                total: totalResults,
                released: releasedResults
            },

            resources: totalResources,

            monthlyBookingTrends,

            topResources: topResources.map(r => ({
                id: r.resource?.id,
                name: r.resource?.name,
                bookings: parseInt(r.dataValues.count)
            })),

            notifications,
            unreadNotifications: unreadCount
        };
    }

    // =====================================================
    // STAFF DASHBOARD
    // =====================================================

    if (role === 'STAFF') {

        const mySubjects = await Subject.findAll({
            include: [{
                model: User,
                as: 'teachers',
                where: { id: userId },
                attributes: [],
                through: { attributes: [] }
            }],
            attributes: ['id']
        });

        const mySubjectIds = mySubjects.map(s => s.id);

        const [
            totalResults,
            pendingResults,
            pendingBookings,
            monthlyBookings,
            monthlyBookingTrends
        ] = await Promise.all([

            Result.count({
                where: {
                    subjectId: mySubjectIds
                }
            }),

            Result.count({
                where: {
                    subjectId: mySubjectIds,
                    released: false
                }
            }),

            Booking.count({
                where: {
                    subjectId: mySubjectIds,
                    status: 'pending'
                }
            }),

            Booking.count({
                where: {
                    subjectId: mySubjectIds,
                    ...dateFilter('date')
                }
            }),

            bookingTrendsQuery({
                subjectId: mySubjectIds
            })
        ]);

        return {
            role: 'STAFF',

            results: {
                total: totalResults,
                pendingRelease: pendingResults
            },

            bookings: {
                pending: pendingBookings,
                thisMonth: monthlyBookings
            },

            monthlyBookingTrends,

            notifications,
            unreadNotifications: unreadCount
        };
    }

    // =====================================================
    // STUDENT DASHBOARD
    // =====================================================

    if (role === 'STUDENT') {

        const student = await User.findByPk(userId, {
            include: [
                {
                    model: ClassLevel,
                    as: 'classLevel',
                    attributes: ['id', 'name']
                }
            ]
        });

        const [
            totalBookings,
            upcomingBookings,
            monthlyBookings,
            monthlyBookingTrends,
            totalResults,
            avgResult
        ] = await Promise.all([

            Booking.count({
                where: {
                    studentId: userId
                }
            }),

            Booking.count({
                where: {
                    studentId: userId,
                    date: {
                        [Op.gte]: today
                    }
                }
            }),

            Booking.count({
                where: {
                    studentId: userId,
                    ...dateFilter('date')
                }
            }),

            bookingTrendsQuery({
                studentId: userId
            }),

            Result.count({
                where: {
                    studentId: userId
                }
            }),

            Result.findOne({
                where: {
                    studentId: userId
                },

                attributes: [
                    [
                        Sequelize.fn(
                            'AVG',
                            Sequelize.col('score')
                        ),
                        'average'
                    ]
                ],

                raw: true
            })
        ]);

        return {
            role: 'STUDENT',

            classLevel: student?.classLevel || null,

            bookings: {
                total: totalBookings,
                upcoming: upcomingBookings,
                thisMonth: monthlyBookings
            },

            monthlyBookingTrends,

            results: {
                total: totalResults,
                averageScore: parseFloat(
                    avgResult?.average || 0
                )
            },

            notifications,
            unreadNotifications: unreadCount
        };
    }

    // =========================
    // INVALID ROLE
    // =========================

    throw {
        message: 'Role not recognized',
        status: 403
    };
};

module.exports = {
    getDashboard
};