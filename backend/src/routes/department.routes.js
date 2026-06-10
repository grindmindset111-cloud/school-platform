// src/routes/department.routes.js

const router = require('express').Router();

const {
    create,
    list,
    update,
    remove
} = require('../controllers/department.controller');


// 🔐 Auth middleware
const auth =
    require('../middlewares/auth.middleware');


// 🔐 Permission middleware
const permit =
    require('../middlewares/permission.middleware');


/*
|--------------------------------------------------------------------------
| DEPARTMENT ROUTES (HARDENED)
|--------------------------------------------------------------------------
*/


/**
 * ==========================================================
 * CREATE DEPARTMENT
 * ==========================================================
 */
router.post(
    '/',
    auth,
    permit('DEPARTMENT_CREATE'),
    create
);



/**
 * ==========================================================
 * LIST DEPARTMENTS
 * ==========================================================
 */
router.get(
    '/',
    auth,
    permit('DEPARTMENT_VIEW'),
    list
);



/**
 * ==========================================================
 * UPDATE DEPARTMENT
 * ==========================================================
 */
router.put(
    '/:id',
    auth,
    permit('DEPARTMENT_UPDATE'),
    update
);



/**
 * ==========================================================
 * DELETE DEPARTMENT
 * ==========================================================
 */
router.delete(
    '/:id',
    auth,
    permit('DEPARTMENT_DELETE'),
    remove
);


module.exports = router;