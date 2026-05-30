// src/utils/audit.utils.js
const { Audit } = require('../models');

/**
 * Logs an action in the audit table.
 * @param {Object} params
 * @param {string} params.action - Action performed (e.g., 'CREATE_BOOKING')
 * @param {string} params.entity - Entity type (e.g., 'Booking', 'Result')
 * @param {number|null} [params.entityId=null] - Optional ID of the entity affected
 * @param {number} params.userId - ID of the user performing the action
 * @param {Object|null} [params.metadata=null] - Optional additional info (e.g., IP, request payload)
 */
const audit = async ({ action, entity, entityId = null, userId, metadata = null }) => {
    if (!action || !entity || !userId) {
        console.warn('Audit skipped: missing required fields', { action, entity, userId });
        return;
    }

    try {
        await Audit.create({
            action,
            entity,
            entityId,
            userId,
            metadata: metadata ? JSON.stringify(metadata) : null
        });
    } catch (err) {
        console.error('Audit logging failed:', err.message);
    }
};

module.exports = audit;