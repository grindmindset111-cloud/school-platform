const { Audit } = require('../models');

module.exports = async ({ action, entity, entityId, userId, metadata = {} }) => {
    await Audit.create({
        action,
        entity,
        entityId,
        userId,
        metadata
    });
};
