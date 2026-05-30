// src/controllers/semester.controller.js
const { Semester, Session } = require('../models');
const { success, error } = require('../utils/response.utils');


// Create a new semester (ADMIN only)
exports.create = async (req, res) => {
    try {
        const { name, startDate, endDate, sessionId } = req.body;

        // Check session exists
        const session = await Session.findByPk(sessionId);
        if (!session) return error(res, 'Session not found', 404);

        const semester = await Semester.create({ name, startDate, endDate, sessionId });
        success(res, semester, 'Semester created');
    } catch (err) {
        error(res, err.message);
    }
};

// List all semesters
exports.list = async (req, res) => {
    try {
        const semesters = await Semester.findAll({ include: Session });
        success(res, semesters);
    } catch (err) {
        error(res, err.message);
    }
};
