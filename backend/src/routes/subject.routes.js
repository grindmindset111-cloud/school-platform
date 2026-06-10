// src/routes/subject.routes.js

const router = require('express').Router();

const subjectController =
    require('../controllers/subject.controller');


// 🔐 Auth middleware
const auth =
    require('../middlewares/auth.middleware');


// 🔐 Permission middleware
const permit =
    require('../middlewares/permission.middleware');


/*
|--------------------------------------------------------------------------
| SUBJECT ROUTES (HARDENED)
|--------------------------------------------------------------------------
*/


/**
 * ==========================================================
 * CREATE SUBJECT
 * ==========================================================
 */
router.post(
    '/',
    auth,
    permit('SUBJECT_CREATE'),
    subjectController.createSubject
);



/**
 * ==========================================================
 * GET ALL SUBJECTS
 * ==========================================================
 */
router.get(
    '/',
    auth,
    permit('SUBJECT_VIEW'),
    subjectController.getAllSubjects
);



/**
 * ==========================================================
 * UPDATE SUBJECT
 * ==========================================================
 */
router.patch(
    '/:id',
    auth,
    permit('SUBJECT_UPDATE'),
    subjectController.updateSubject
);



/**
 * ==========================================================
 * DELETE SUBJECT
 * ==========================================================
 */
router.delete(
    '/:id',
    auth,
    permit('SUBJECT_DELETE'),
    subjectController.deleteSubject
);



/**
 * ==========================================================
 * ASSIGN TEACHER
 * ==========================================================
 */
router.post(
    '/assign-teacher',
    auth,
    permit('SUBJECT_ASSIGN_TEACHER'),
    subjectController.assignTeacher
);



/**
 * ==========================================================
 * REMOVE TEACHER
 * ==========================================================
 */
router.post(
    '/remove-teacher',
    auth,
    permit('SUBJECT_REMOVE_TEACHER'),
    subjectController.removeTeacher
);


module.exports = router;