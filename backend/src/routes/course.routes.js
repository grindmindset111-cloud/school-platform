// src/routes/course.routes.js

const router = require('express').Router();

const {
    createCourse,
    getCourses,
    updateCourse,
    deleteCourse
} = require('../controllers/course.controller');


// 🔐 Auth middleware
const auth =
    require('../middlewares/auth.middleware');


// 🔐 Permission middleware
const permit =
    require('../middlewares/permission.middleware');


/*
|--------------------------------------------------------------------------
| COURSE ROUTES (HARDENED)
|--------------------------------------------------------------------------
*/


/**
 * ==========================================================
 * CREATE COURSE
 * ==========================================================
 */
router.post(
    '/',
    auth,
    permit('COURSE_CREATE'),
    createCourse
);



/**
 * ==========================================================
 * UPDATE COURSE
 * ==========================================================
 */
router.put(
    '/:id',
    auth,
    permit('COURSE_UPDATE'),
    updateCourse
);



/**
 * ==========================================================
 * DELETE COURSE
 * ==========================================================
 */
router.delete(
    '/:id',
    auth,
    permit('COURSE_DELETE'),
    deleteCourse
);



/**
 * ==========================================================
 * GET COURSES
 * ==========================================================
 */
router.get(
    '/',
    auth,
    permit('COURSE_VIEW'),
    getCourses
);


module.exports = router;