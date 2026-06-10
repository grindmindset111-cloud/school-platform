// src/services/timetable.service.js

const { Timetable, Subject, Resource, Booking, User, ClassLevel, sequelize } = require('../models');
const { Op } = require('sequelize');


/**
 * ============================
 * CREATE TIMETABLE (ADMIN - HARDENED)
 * ============================
 */
const createTimetable = async (data) => {

    return await sequelize.transaction(async (t) => {

        const {
            subjectId,
            resourceId,
            classLevelId,
            dayOfWeek,
            startTime,
            endTime,
            isActive
        } = data;

        // 🔐 REQUIRED FIELDS
        if (!subjectId || !resourceId || !classLevelId || !dayOfWeek || !startTime || !endTime) {
            throw { message: 'All fields are required', status: 400 };
        }

        // 🔐 TIME VALIDATION
        if (startTime >= endTime) {
            throw { message: 'End time must be after start time', status: 400 };
        }

        // 🔐 VALIDATE REFERENCES (HARD CHECKS)
        const [subject, resource, classLevel] = await Promise.all([
            Subject.findByPk(subjectId, { transaction: t }),
            Resource.findByPk(resourceId, { transaction: t }),
            ClassLevel.findByPk(classLevelId, { transaction: t })
        ]);

        if (!subject) throw { message: 'Subject not found', status: 404 };
        if (!resource) throw { message: 'Resource not found', status: 404 };
        if (!classLevel) throw { message: 'Class level not found', status: 404 };

        // 🔐 ENSURE SUBJECT BELONGS TO CLASS
        if (subject.classLevelId !== classLevelId) {
            throw { message: 'Subject does not belong to this class level', status: 400 };
        }

        // 🔥 LOCK + OVERLAP CHECK (CLASS-LEVEL AUTHORITY)
        const classConflict = await Timetable.findOne({
            where: {
                classLevelId,
                dayOfWeek,
                [Op.and]: [
                    { startTime: { [Op.lt]: endTime } },
                    { endTime: { [Op.gt]: startTime } }
                ]
            },
            transaction: t,
            lock: t.LOCK.UPDATE
        });

        if (classConflict) {
            throw { message: 'Class already has a timetable in this time range', status: 400 };
        }

        // 🔥 RESOURCE CONFLICT (ROOM DOUBLE-BOOKING)
        const resourceConflict = await Timetable.findOne({
            where: {
                resourceId,
                dayOfWeek,
                [Op.and]: [
                    { startTime: { [Op.lt]: endTime } },
                    { endTime: { [Op.gt]: startTime } }
                ]
            },
            transaction: t,
            lock: t.LOCK.UPDATE
        });

        if (resourceConflict) {
            throw { message: 'Resource is already occupied in this time range', status: 400 };
        }

        // ✅ CREATE TIMETABLE
        const timetable = await Timetable.create({
            subjectId,
            resourceId,
            classLevelId,
            dayOfWeek,
            startTime,
            endTime,
            isActive: isActive ?? true
        }, { transaction: t });

        return timetable;
    });
};


/**
 * ============================
 * GET TIMETABLE WITH BOOKINGS (OPTIMIZED)
 * ============================
 */
const getTimetable = async (classLevelId, date = null) => {

    const where = {};
    if (classLevelId) where.classLevelId = classLevelId;

    const includeBookings = {
        model: Booking,
        as: 'bookings',
        attributes: [
            'id',
            'studentId',
            'date',
            'startTime',
            'endTime',
            'status',
            'attendanceStatus'
        ],
        include: [
            {
                model: User,
                as: 'student',
                attributes: ['id', 'name', 'email', 'classLevelId']
            }
        ],
        required: false
    };

    if (date) {
        includeBookings.where = { date };
    }

    return Timetable.findAll({
        where,
        include: [
            { model: Subject, as: 'subject', attributes: ['id', 'name'] },
            { model: Resource, as: 'resource', attributes: ['id', 'name'] },
            includeBookings
        ],
        order: [
            ['dayOfWeek', 'ASC'],
            ['startTime', 'ASC']
        ]
    });
};


module.exports = {
    createTimetable,
    getTimetable
};