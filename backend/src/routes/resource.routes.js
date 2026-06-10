// src/routes/resource.routes.js

const router = require('express').Router();

const resourceController =
    require('../controllers/resource.controller');


// 🔐 Auth middleware
const auth =
    require('../middlewares/auth.middleware');


// 🔐 Permission middleware
const permit =
    require('../middlewares/permission.middleware');


/*
|--------------------------------------------------------------------------
| RESOURCE ROUTES (HARDENED)
|--------------------------------------------------------------------------
*/


/**
 * ==========================================================
 * CREATE RESOURCE
 * ==========================================================
 */
router.post(
    '/',
    auth,
    permit('RESOURCE_CREATE'),
    resourceController.create
);



/**
 * ==========================================================
 * UPDATE RESOURCE
 * ==========================================================
 */
router.put(
    '/:id',
    auth,
    permit('RESOURCE_UPDATE'),
    resourceController.update
);



/**
 * ==========================================================
 * DELETE RESOURCE
 * ==========================================================
 */
router.delete(
    '/:id',
    auth,
    permit('RESOURCE_DELETE'),
    resourceController.delete
);



/**
 * ==========================================================
 * LIST RESOURCES
 * ==========================================================
 */
router.get(
    '/',
    auth,
    permit('RESOURCE_VIEW'),
    resourceController.list
);


module.exports = router;