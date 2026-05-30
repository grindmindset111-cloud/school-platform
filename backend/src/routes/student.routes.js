// src/routes/student.routes.js

const router = require('express').Router();

const multer = require('multer');
const path = require('path');

const studentController =
    require('../controllers/student.controller');


// 🔐 Auth middleware
const auth =
    require('../middlewares/auth.middleware');


// 🔐 Permission middleware
const permit =
    require('../middlewares/permission.middleware');


/*
|--------------------------------------------------------------------------
| FILE UPLOAD CONFIG (optional CSV import)
|--------------------------------------------------------------------------
*/

const upload = multer({
    dest: 'uploads/',
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});


/*
|--------------------------------------------------------------------------
| STUDENT ROUTES (HARDENED)
|--------------------------------------------------------------------------
*/


/**
 * ==========================================================
 * CREATE STUDENT
 * ==========================================================
 */
router.post(
    '/',
    auth,
    permit('STUDENT_CREATE'),
    studentController.create
);



/**
 * ==========================================================
 * GET ALL STUDENTS
 * ==========================================================
 */
router.get(
    '/',
    auth,
    permit('STUDENT_VIEW'),
    studentController.list
);



/**
 * ==========================================================
 * GET SINGLE STUDENT
 * ==========================================================
 */
router.get(
    '/:id',
    auth,
    permit('STUDENT_VIEW'),
    studentController.getOne
);



/**
 * ==========================================================
 * UPDATE STUDENT
 * ==========================================================
 */
router.put(
    '/:id',
    auth,
    permit('STUDENT_UPDATE'),
    studentController.update
);



/**
 * ==========================================================
 * DELETE STUDENT
 * ==========================================================
 */
router.delete(
    '/:id',
    auth,
    permit('STUDENT_DELETE'),
    studentController.remove
);



/**
 * ==========================================================
 * BULK IMPORT STUDENTS (CSV)
 * ==========================================================
 */
router.post(
    '/import',
    auth,
    permit('STUDENT_IMPORT'),
    upload.single('file'),
    studentController.bulkImport
);


module.exports = router;