// src/routes/result.routes.js

const router = require('express').Router();

const resultController =
    require('../controllers/result.controller');


// 🔐 Auth + Permission system
const auth =
    require('../middlewares/auth.middleware');

const permit =
    require('../middlewares/permission.middleware');


/*
|--------------------------------------------------------------------------
| RESULT ROUTES (HARDENED)
|--------------------------------------------------------------------------
*/


/**
 * ==========================================================
 * GLOBAL AUTH FOR ALL RESULT ROUTES
 * ==========================================================
 */
router.use(auth);



/**
 * ==========================================================
 * LIST RESULTS
 * ==========================================================
 */
router.get(
    '/',
    permit('RESULT_VIEW'),
    resultController.list
);



/**
 * ==========================================================
 * GET SINGLE RESULT
 * ==========================================================
 */
router.get(
    '/:id',
    permit('RESULT_VIEW'),
    resultController.getOne
);



/**
 * ==========================================================
 * CREATE RESULT
 * ==========================================================
 */
router.post(
    '/',
    permit('RESULT_CREATE'),
    resultController.create
);



/**
 * ==========================================================
 * UPDATE RESULT
 * ==========================================================
 */
router.put(
    '/:id',
    permit('RESULT_UPDATE'),
    resultController.update
);



/**
 * ==========================================================
 * UNLOCK RESULT (ADMIN ONLY)
 * ==========================================================
 */
router.patch(
    '/:id/unlock',
    permit('RESULT_UNLOCK'),
    resultController.unlock
);


module.exports = router;