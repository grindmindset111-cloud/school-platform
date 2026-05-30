// src/routes/staff.routes.js

const router = require('express').Router();

const {
    create,
    list
} = require('../controllers/staff.controller');


// 🔐 Auth middleware
const auth =
    require('../middlewares/auth.middleware');


// 🔐 Permission middleware
const permit =
    require('../middlewares/permission.middleware');


/*
|--------------------------------------------------------------------------
| STAFF ROUTES (HARDENED)
|--------------------------------------------------------------------------
*/


/**
 * ==========================================================
 * CREATE STAFF
 * ==========================================================
 */
router.post(
    '/',
    auth,
    permit('STAFF_CREATE'),
    create
);



/**
 * ==========================================================
 * LIST STAFF
 * ==========================================================
 */
router.get(
    '/',
    auth,
    permit('STAFF_VIEW'),
    list
);


module.exports = router;