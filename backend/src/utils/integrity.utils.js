// src/utils/integrity.utils.js

const crypto = require('crypto');

const SECRET = process.env.INTEGRITY_SECRET || 'dev_secret_change_me';

/**
 * Create request signature
 */
const signPayload = (payload) => {
    return crypto
        .createHmac('sha256', SECRET)
        .update(JSON.stringify(payload))
        .digest('hex');
};

/**
 * Verify request signature
 */
const verifySignature = (payload, signature) => {
    const expected = signPayload(payload);
    return expected === signature;
};

module.exports = {
    signPayload,
    verifySignature
};