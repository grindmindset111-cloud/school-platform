// src/security/rateLimit.js

const rateLimit = require('express-rate-limit');

/**
 * GENERAL API LIMIT
 */
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300, // max requests per IP
    message: {
        message: 'Too many requests, please try again later.'
    }
});


/**
 * STRICT LIMIT (LOGIN / AUTH)
 */
const authLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 10,
    message: {
        message: 'Too many login attempts, slow down.'
    }
});


/**
 * BOOKING LIMIT (IMPORTANT FOR YOUR SYSTEM)
 */
const bookingLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // prevent spam booking
    message: {
        message: 'You are booking too fast. Please wait a moment.'
    }
});

module.exports = {
    apiLimiter,
    authLimiter,
    bookingLimiter
};