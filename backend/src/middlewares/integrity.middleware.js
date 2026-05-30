// src/middlewares/integrity.middleware.js

const { verifySignature } = require('../utils/integrity.utils');

module.exports = (req, res, next) => {
    try {

        // Skip GET requests (optional rule)
        if (req.method === 'GET') {
            return next();
        }

        const signature = req.headers['x-signature'];

        if (!signature) {
            return res.status(401).json({
                message: 'Missing request signature'
            });
        }

        const isValid = verifySignature(req.body, signature);

        if (!isValid) {
            return res.status(403).json({
                message: 'Request integrity check failed'
            });
        }

        next();

    } catch (err) {
        return res.status(500).json({
            message: 'Integrity verification error'
        });
    }
};