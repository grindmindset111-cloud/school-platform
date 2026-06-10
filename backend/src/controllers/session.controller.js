// src/controllers/session.controller.js
const { Session } = require('../models');
const { success, error } = require('../utils/response.utils');


// Create a new academic session (ADMIN only)
exports.create = async (req, res) => {
    try {
        const { name, startDate, endDate } = req.body;

        const session = await Session.create({ name, startDate, endDate });
        success(res, session, 'Session created successfully');
    } catch (err) {
        error(res, err.message, err.status || 500);
    }
};

// List all academic sessions
exports.list = async (req, res) => {
    try {
        const sessions = await Session.findAll();
        success(res, sessions, 'Sessions retrieved successfully');
    } catch (err) {
        error(res, err.message, err.status || 500);
    }
};
