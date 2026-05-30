// src/middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt.config');
const { User } = require('../models');
const { error } = require('../utils/response.utils');

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return error(res, 'Authorization header missing', 401);
        }

        const [scheme, token] = authHeader.split(' ');

        if (scheme !== 'Bearer' || !token) {
            return error(res, 'Invalid authorization format. Use Bearer <token>', 401);
        }

        // Verify JWT token
        const decoded = jwt.verify(token, jwtConfig.secret);

        // Fetch user from DB (adjust for your ORM, Sequelize or Mongoose)
        const user = await User.findByPk(decoded.id, {
            attributes: ['id', 'name', 'email', 'role', 'classLevelId'],
        });

        if (!user) {
            return error(res, 'User not found', 401);
        }

        // Attach user to request for next middlewares
        req.user = user;

        next(); // continue to next middleware/route

    } catch (err) {
        console.error('Auth middleware error:', err);

        if (err.name === 'TokenExpiredError') {
            return error(res, 'Token expired', 401);
        }

        if (err.name === 'JsonWebTokenError') {
            return error(res, 'Invalid token', 401);
        }

        return error(res, 'Authentication failed', 401);
    }
};

module.exports = authMiddleware;
