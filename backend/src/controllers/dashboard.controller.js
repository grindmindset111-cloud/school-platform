// src/controllers/dashboard.controller.js
const { success, error } = require('../utils/response.utils');
const dashboardService = require('../services/dashboard.service');
const audit = require('../utils/audit.utils');

exports.dashboard = async (req, res) => {
    try {
        const data = await dashboardService.getDashboard(req.user);

        // Fire-and-forget: audit failures must never break dashboard load.
        audit({
            action: 'VIEW_DASHBOARD',
            entity: 'Dashboard',
            entityId: null,
            userId: req.user.id
        }).catch(err => console.error('Audit failed (non-fatal):', err.message));

        return success(res, data);
    } catch (err) {
        console.error('Dashboard error:', err);
        return error(res, err.message || 'Dashboard failed', err.status || 500);
    }
};