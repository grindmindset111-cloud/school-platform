const { Audit } = require('../models');

/**
 * Audit logger — NEVER throws.
 *
 * Any failure (DB lock, missing column, schema mismatch) is logged to
 * the console and swallowed. The calling request path must not be
 * affected by audit logging problems.
 */
module.exports = async ({ action, entity, entityId, userId, metadata = {} }) => {
    try {
        await Audit.create({
            action,
            entity,
            entityId,
            userId,
            metadata
        });
    } catch (err) {
        // Intentionally swallow. Audit must never break a request.
        console.error('Audit failed (non-fatal):', err.message);
    }
};
