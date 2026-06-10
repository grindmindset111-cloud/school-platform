// src/routes/attendance.routes.js

const router = require('express').Router();

const attendanceController =
    require('../controllers/attendance.controller');


// 🔐 Auth middleware
const auth =
    require('../middlewares/auth.middleware');


// 🔐 Permission middleware
const permit =
    require('../middlewares/permission.middleware');


/*
|--------------------------------------------------------------------------
| ATTENDANCE ROUTES (HARDENED)
|--------------------------------------------------------------------------
*/


/**
 * ==========================================================
 * BULK ATTENDANCE MARKING
 * ==========================================================
 */
router.patch(
    '/bulk',

    auth,

    permit('ATTENDANCE_MARK'),

    attendanceController.bulkAttendance
);


module.exports = router;