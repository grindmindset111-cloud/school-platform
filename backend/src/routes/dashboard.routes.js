// src/routes/dashboard.routes.js

const router = require('express').Router();

const dashboardController =
    require('../controllers/dashboard.controller');


// 🔐 Auth middleware
const auth =
    require('../middlewares/auth.middleware');


// 🔐 Permission middleware
const permit =
    require('../middlewares/permission.middleware');


/*
|--------------------------------------------------------------------------
| DASHBOARD ROUTES (HARDENED)
|--------------------------------------------------------------------------
*/


/**
 * ==========================================================
 * DASHBOARD DATA (ROLE-SCOPED VIA PERMISSIONS)
 * ==========================================================
 */
router.get(
    '/',
    auth,
    permit('DASHBOARD_VIEW'),
    dashboardController.dashboard
);


module.exports = router;