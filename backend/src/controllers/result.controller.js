// src/controllers/result.controller.js

const { createResult, getResults, updateResult, lockResult } = require('../services/result.service');
const { success, error } = require('../utils/response.utils');
const audit = require('../utils/audit.utils');
const { notify } = require('../utils/notify.utils');
const { User } = require('../models');

/**
 * ============================
 * CREATE RESULT (STAFF / ADMIN)
 * ============================
 */
exports.create = async (req, res) => {
    try {
        const user = req.user;
        if (!['STAFF', 'ADMIN'].includes(user.role)) return error(res, 'Unauthorized', 403);

        let { studentId, subjectId, score } = req.body;

        // Convert to number
        score = Number(score);

        // 🔍 Debug log to see type and value of score
        console.log('DEBUG: Score value:', score, 'Type:', typeof score);

        if (isNaN(score)) return error(res, 'Score must be a number', 400);

        const result = await createResult({ studentId, subjectId, score }, user);

        // Notification (non-blocking)
        User.findByPk(studentId)
            .then(student => {
                if (student) {
                    return notify({
                        users: [{ id: student.id, name: student.name, email: student.email }],
                        title: 'New Result Added',
                        message: `A new result has been added for your subject.`,
                        emailSubject: 'New Result Added',
                        emailTextBuilder: s => `Hello ${s.name},\n\nYour result for the recently added subject has been uploaded. Check your dashboard.\n\nSchool Platform`
                    });
                }
            })
            .catch(err => console.error('Notification failed:', err));

        await audit({ action: 'CREATE_RESULT', entity: 'Result', entityId: result.id, userId: user.id });

        return success(res, result, 'Result added successfully');
    } catch (err) {
        console.error('Create result error:', { err, body: req.body, userId: req.user.id });
        return error(res, err.message || 'Failed to create result', err.status || 500);
    }
};
/**
 * ============================
 * UPDATE RESULT (STAFF / ADMIN)
 * ============================
 */
exports.update = async (req, res) => {
    try {
        const user = req.user;
        if (!['STAFF', 'ADMIN'].includes(user.role)) return error(res, 'Unauthorized', 403);

        let data = { ...req.body };

        // ✅ Convert score to number if it exists
        if (data.score !== undefined) {
            data.score = Number(data.score);
            if (isNaN(data.score)) return error(res, 'Score must be a number', 400);
        }

        const updated = await updateResult(req.params.id, data, user);

        await audit({ action: 'UPDATE_RESULT', entity: 'Result', entityId: updated.id, userId: user.id });

        return success(res, updated, 'Result updated successfully');
    } catch (err) {
        console.error('Update result error:', { err, resultId: req.params.id, userId: req.user.id });
        return error(res, err.message || 'Failed to update result', err.status || 500);
    }
};

/**
 * ============================
 * GET SINGLE RESULT
 * ============================
 */
exports.getOne = async (req, res) => {
    try {
        const user = req.user;
        const { id } = req.params;

        const { rows } = await getResults(user, 1, 0, { id });

        if (!rows || rows.length === 0) return error(res, 'Result not found or access denied', 404);

        await audit({ action: 'VIEW_SINGLE_RESULT', entity: 'Result', entityId: id, userId: user.id });

        return success(res, rows[0]);
    } catch (err) {
        console.error('Get single result error:', { err, resultId: req.params.id, userId: req.user.id });
        return error(res, err.message || 'Failed to fetch result', err.status || 500);
    }
};

/**
 * ============================
 * LIST RESULTS
 * ============================
 */
exports.list = async (req, res) => {
    try {
        let { page = 1, limit = 10 } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);
        const offset = (page - 1) * limit;

        const { rows, count } = await getResults(req.user, limit, offset);

        await audit({ action: 'VIEW_RESULTS', entity: 'Result', entityId: null, userId: req.user.id });

        return success(res, {
            results: rows,
            pagination: { total: count, page, pages: Math.ceil(count / limit) }
        });
    } catch (err) {
        console.error('List results error:', { err, userId: req.user.id });
        return error(res, err.message || 'Failed to fetch results', err.status || 500);
    }
};

/**
 * ============================
 * UNLOCK & RELEASE RESULT (ADMIN ONLY)
 * ============================
 */
exports.unlock = async (req, res) => {
    try {
        const user = req.user;
        if (user.role !== 'ADMIN') return error(res, 'Only admin can unlock results', 403);

        const result = await lockResult(req.params.id, true); // unlock + release

        // Non-blocking notification
        User.findByPk(result.studentId)
            .then(student => {
                if (student) {
                    return notify({
                        users: [{ id: student.id, name: student.name, email: student.email }],
                        title: 'Result Released',
                        message: `Your result has been released.`,
                        emailSubject: 'Result Released',
                        emailTextBuilder: s => `Hello ${s.name},\n\nYour result has been released. Check your dashboard.\n\nSchool Platform`
                    });
                }
            })
            .catch(err => console.error('Notification failed:', err));

        await audit({ action: 'UNLOCK_RESULT', entity: 'Result', entityId: result.id, userId: user.id });

        return success(res, result, 'Result unlocked successfully');
    } catch (err) {
        console.error('Unlock result error:', { err, resultId: req.params.id, userId: req.user.id });
        return error(res, err.message || 'Failed to unlock result', err.status || 500);
    }
};