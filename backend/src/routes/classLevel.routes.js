// src/routes/classLevel.routes.js

const router = require('express').Router();

const {
    createClassLevel,
    getClassLevels,
    updateClassLevel,
    deleteClassLevel
} = require('../controllers/classLevel.controller');


// 🔐 Auth middleware
const auth =
    require('../middlewares/auth.middleware');


// 🔐 Permission middleware
const permit =
    require('../middlewares/permission.middleware');


/*
|--------------------------------------------------------------------------
| CLASS LEVEL ROUTES (HARDENED)
|--------------------------------------------------------------------------
*/


/**
 * ==========================================================
 * CREATE CLASS LEVEL
 * ==========================================================
 */
router.post(
    '/',
    auth,
    permit('CLASSLEVEL_CREATE'),
    createClassLevel
);



/**
 * ==========================================================
 * GET CLASS LEVELS
 * ==========================================================
 */
router.get(
    '/',
    auth,
    permit('CLASSLEVEL_VIEW'),
    getClassLevels
);



/**
 * ==========================================================
 * UPDATE CLASS LEVEL
 * ==========================================================
 */
router.put(
    '/:id',
    auth,
    permit('CLASSLEVEL_UPDATE'),
    updateClassLevel
);



/**
 * ==========================================================
 * DELETE CLASS LEVEL
 * ==========================================================
 */
router.delete(
    '/:id',
    auth,
    permit('CLASSLEVEL_DELETE'),
    deleteClassLevel
);


module.exports = router;