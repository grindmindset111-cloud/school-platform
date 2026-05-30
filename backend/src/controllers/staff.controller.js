const { Staff, User, Department } = require('../models');
const { success, error } = require('../utils/response.utils');


exports.create = async (req, res) => {
    try {
        const staff = await Staff.create(req.body);
        success(res, staff, 'Staff profile created');
    } catch (err) {
        error(res, err.message, err.status || 500);
    }
};

exports.list = async (req, res) => {
    try {
        const staffList = await Staff.findAll({
            include: [User, Department]
        });
        success(res, staffList);
    } catch (err) {
        error(res, err.message, err.status || 500);
    }
};
