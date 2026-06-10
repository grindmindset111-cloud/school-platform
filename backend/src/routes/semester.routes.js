// src/routes/semester.routes.js

const router = require('express').Router();

const semesterController =
    require('../controllers/semester.controller');


// 🔐 Auth middleware
const auth =
    require('../middlewares/auth.middleware');


// 🔐 Permission middleware
const permit =
    require('../middlewares/permission.middleware');


/*
|--------------------------------------------------------------------------
| SEMESTER ROUTES (HARDENED)
|--------------------------------------------------------------------------
*/


/**
 * ==========================================================
 * CREATE SEMESTER
 * ==========================================================
 */
router.post(
    '/',
    auth,
    permit('SEMESTER_CREATE'),
    semesterController.create
);



/**
 * ==========================================================
 * LIST SEMESTERS
 * ==========================================================
 */
router.get(
    '/',
    auth,
    permit('SEMESTER_VIEW'),
    semesterController.list
);


module.exports = router;