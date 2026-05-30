// src/routes/audit.routes.js

const router = require('express').Router();

const auditController =
    require('../controllers/audit.controller');


// 🔐 Auth middleware
const auth =
    require('../middlewares/auth.middleware');


// 🔐 Permission middleware
const permit =
    require('../middlewares/permission.middleware');


/*
|--------------------------------------------------------------------------
| AUDIT ROUTES (HARDENED)
|--------------------------------------------------------------------------
*/


/**
 * ==========================================================
 * VIEW AUDIT LOGS
 * ==========================================================
 */
router.get(
    '/',
    auth,
    permit('AUDIT_VIEW'),
    auditController.list
);


module.exports = router;