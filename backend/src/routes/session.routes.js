// src/routes/session.routes.js

const router = require('express').Router();

const sessionController =
    require('../controllers/session.controller');


// 🔐 Auth middleware
const auth =
    require('../middlewares/auth.middleware');


// 🔐 Permission middleware
const permit =
    require('../middlewares/permission.middleware');


/*
|--------------------------------------------------------------------------
| SESSION ROUTES (HARDENED)
|--------------------------------------------------------------------------
*/


/**
 * ==========================================================
 * CREATE SESSION
 * ==========================================================
 */
router.post(
    '/',
    auth,
    permit('SESSION_CREATE'),
    sessionController.create
);



/**
 * ==========================================================
 * LIST SESSIONS
 * ==========================================================
 */
router.get(
    '/',
    auth,
    permit('SESSION_VIEW'),
    sessionController.list
);


module.exports = router;