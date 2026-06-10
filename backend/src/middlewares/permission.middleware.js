// src/middlewares/permission.middleware.js

const { can } = require('../security/permissions');


/**
 * =========================================================================
 * PERMISSION MIDDLEWARE
 * =========================================================================
 */
module.exports = (action) => {

    return async (req, res, next) => {

        try {

            // 🔐 User must exist
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: {
                        message: 'Authentication required'
                    }
                });
            }

            // 🔐 Action required
            if (!action) {
                return res.status(500).json({
                    success: false,
                    error: {
                        message: 'Permission action not configured'
                    }
                });
            }

            // 🔐 Permission check
            const allowed =
                can(req.user, action);

            if (!allowed) {

                // 🚨 Optional audit logging point
                console.warn(
                    `[PERMISSION DENIED] User ${req.user.id} attempted ${action}`
                );

                return res.status(403).json({
                    success: false,
                    error: {
                        message: 'Permission denied',
                        action
                    }
                });
            }

            // ✅ Continue
            next();

        } catch (err) {

            console.error(
                'Permission middleware error:',
                err
            );

            return res.status(500).json({
                success: false,
                error: {
                    message: 'Authorization system failure'
                }
            });
        }
    };
};