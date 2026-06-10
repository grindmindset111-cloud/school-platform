// src/routes/report.routes.js

const router = require('express').Router();

const reportController =
    require('../controllers/report.controller');


// 🔐 Auth middleware
const auth =
    require('../middlewares/auth.middleware');


// 🔐 Permission middleware
const permit =
    require('../middlewares/permission.middleware');


/*
|--------------------------------------------------------------------------
| REPORT ROUTES (HARDENED)
|--------------------------------------------------------------------------
*/


/**
 * ==========================================================
 * STUDENT REPORT
 * ==========================================================
 */
router.get(
    '/student/:studentId',
    auth,
    permit('REPORT_VIEW'),
    reportController.studentReport
);



/**
 * ==========================================================
 * CLASS REPORT
 * ==========================================================
 */
router.get(
    '/class/:classLevelId',
    auth,
    permit('REPORT_VIEW'),
    reportController.classReport
);



/**
 * ==========================================================
 * BOOKING SUMMARY
 * ==========================================================
 */
router.get(
    '/bookings/summary',
    auth,
    permit('REPORT_VIEW'),
    reportController.bookingSummary
);



/**
 * ==========================================================
 * ATTENDANCE PERCENTAGE
 * ==========================================================
 */
router.get(
    '/class/:classLevelId/attendance-percentage',
    auth,
    permit('REPORT_VIEW'),
    reportController.attendancePercentage
);


module.exports = router;