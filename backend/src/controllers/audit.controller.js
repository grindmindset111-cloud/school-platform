const { Audit } = require('../models');
const { success, error } = require('../utils/response.utils');

// Admin can view all audit logs
exports.list = async (req, res) => {
    try {
        const logs = await Audit.findAll({
            order: [['timestamp', 'DESC']]
        });
        success(res, logs, 'Audit logs retrieved');
    } catch (err) {
        error(res, err.message);
    }
};
