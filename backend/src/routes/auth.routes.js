// src/routes/auth.routes.js

const router = require('express').Router();

const {
    register,
    login,
    requestPasswordReset,
    resetPassword,
    getMe
} = require('../controllers/auth.controller');


// 🔐 Authentication middleware
const auth =
    require('../middlewares/auth.middleware');


// 🔐 Permission middleware
const permit =
    require('../middlewares/permission.middleware');


/*
|--------------------------------------------------------------------------
| AUTH ROUTES (HARDENED)
|--------------------------------------------------------------------------
| POST /register
| POST /login
| GET  /me
| POST /request-password-reset
| POST /reset-password
|--------------------------------------------------------------------------
*/


/**
 * =========================================================================
 * REGISTER
 * =========================================================================
 * Public
 */
router.post(
    '/register',
    register
);


/**
 * =========================================================================
 * LOGIN
 * =========================================================================
 * Public
 */
router.post(
    '/login',
    login
);


/**
 * =========================================================================
 * CURRENT USER
 * =========================================================================
 * Protected
 */
router.get(
    '/me',
    auth,
    permit('PROFILE_VIEW'),
    getMe
);


/**
 * =========================================================================
 * REQUEST PASSWORD RESET
 * =========================================================================
 * Public
 */
router.post(
    '/request-password-reset',
    requestPasswordReset
);


/**
 * =========================================================================
 * RESET PASSWORD
 * =========================================================================
 * Public
 */
router.post(
    '/reset-password',
    resetPassword
);


module.exports = router;