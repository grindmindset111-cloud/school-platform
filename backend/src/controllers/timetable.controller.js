// src/controllers/timetable.controller.js

const { createTimetable, getTimetable } = require('../services/timetable.service');
const { success, error } = require('../utils/response.utils');
const audit = require('../utils/audit.utils');


/**
 * ============================
 * CREATE TIMETABLE (ADMIN ONLY - STRICT)
 * ============================
 */
exports.create = async (req, res) => {
    try {
        const user = req.user;

        // 🔐 HARD ROLE ENFORCEMENT
        if (user.role !== 'ADMIN') {
            return error(res, 'Only admin can create timetable', 403);
        }

        const {
            subjectId,
            resourceId,
            classLevelId,
            dayOfWeek,
            startTime,
            endTime,
            isActive
        } = req.body;

        // 🔐 STRICT INPUT VALIDATION
        if (!subjectId || !resourceId || !classLevelId || !dayOfWeek || !startTime || !endTime) {
            return error(res, 'All fields are required', 400);
        }

        // 🔐 ENUM VALIDATION (defensive layer)
        const validDays = [
            'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'
        ];

        if (!validDays.includes(dayOfWeek)) {
            return error(res, 'Invalid dayOfWeek value', 400);
        }

        // 🔐 SERVICE CALL (authoritative logic inside)
        const timetable = await createTimetable({
            subjectId,
            resourceId,
            classLevelId,
            dayOfWeek,
            startTime,
            endTime,
            isActive
        });

        // 🧾 AUDIT
        audit({
            action: 'CREATE_TIMETABLE',
            entity: 'Timetable',
            entityId: timetable.id,
            userId: user.id,
            metadata: { classLevelId, dayOfWeek, startTime, endTime }
        }).catch(console.error);

        return success(res, timetable, 'Timetable created successfully');

    } catch (err) {
        console.error('Create timetable error:', err);

        return error(
            res,
            err.message || 'Failed to create timetable',
            err.status || 500
        );
    }
};


/**
 * ============================
 * LIST TIMETABLE (CONTROLLED + FILTERED)
 * ============================
 */
exports.list = async (req, res) => {
    try {
        const user = req.user;

        const { classLevelId, date } = req.query;

        let effectiveClassLevelId;

        // 🔐 ROLE-BASED ACCESS CONTROL
        if (user.role === 'STUDENT') {
            // Student can ONLY see their own class timetable
            effectiveClassLevelId = user.classLevelId;
        } else if (user.role === 'STAFF') {
            // Staff can view their class OR filtered class
            effectiveClassLevelId = classLevelId || user.classLevelId;
        } else {
            // ADMIN can view everything
            effectiveClassLevelId = classLevelId || null;
        }

        const timetable = await getTimetable(effectiveClassLevelId, date);

        // 🧾 AUDIT
        audit({
            action: 'VIEW_TIMETABLE',
            entity: 'Timetable',
            entityId: null,
            userId: user.id,
            metadata: { classLevelId: effectiveClassLevelId, date }
        }).catch(console.error);

        return success(res, timetable);

    } catch (err) {
        console.error('List timetable error:', err);

        return error(
            res,
            err.message || 'Failed to fetch timetable',
            err.status || 500
        );
    }
};