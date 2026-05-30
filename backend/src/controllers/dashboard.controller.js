// src/controllers/dashboard.controller.js
const { success, error } = require('../utils/response.utils');
const dashboardService = require('../services/dashboard.service');
const audit = require('../utils/audit.utils');

exports.dashboard = async (req, res) => {
    try {
        const data = await dashboardService.getDashboard(req.user);

        // Audit logging
        await audit({
            action: 'VIEW_DASHBOARD',
            entity: 'Dashboard',
            entityId: null,
            userId: req.user.id
        });

        return success(res, data);
    } catch (err) {
        console.error('Dashboard error:', err);
        return error(res, err.message || 'Dashboard failed', err.status || 500);
    }
};