// src/routes/settings.routes.js

const router = require('express').Router();

const settingsController =
    require('../controllers/settings.controller');


// 🔐 Auth middleware
const auth =
    require('../middlewares/auth.middleware');


// 🔐 Permission middleware
const permit =
    require('../middlewares/permission.middleware');


/*
|--------------------------------------------------------------------------
| SETTINGS ROUTES (HARDENED)
|--------------------------------------------------------------------------
*/


/**
 * ==========================================================
 * CREATE / UPDATE SETTING
 * ==========================================================
 */
router.post(
    '/',
    auth,
    permit('SETTINGS_UPDATE'),
    settingsController.upsertSetting
);



/**
 * ==========================================================
 * GET ALL SETTINGS
 * ==========================================================
 */
router.get(
    '/',
    auth,
    permit('SETTINGS_VIEW'),
    settingsController.getAllSettings
);



/**
 * ==========================================================
 * GET SINGLE SETTING
 * ==========================================================
 */
router.get(
    '/:key',
    auth,
    permit('SETTINGS_VIEW'),
    settingsController.getSetting
);


module.exports = router;