// src/middlewares/requireAdmin.js
const { error } = require('../utils/response.utils');

const requireAdmin = (req, res, next) => {
  // Check if user is attached by authMiddleware
    if (!req.user) {
        return error(res, 'User not authenticated', 401);
    }

  // Check if user role is ADMIN
    if (req.user.role !== 'ADMIN') {
        return error(res, 'Admin access required', 403);
    }

  // User is admin, proceed
    next();
};

module.exports = requireAdmin;
