// src/routes/settings.routes.js
const router = require('express').Router();
const settingsController = require('../controllers/settings.controller');
const auth = require('../middlewares/auth.middleware');
const role = require('../middlewares/role.middleware');

/**
 * =========================
 * SETTINGS ROUTES (ADMIN ONLY)
 * =========================
 */

// Create or update setting
router.post(
    '/',
    auth,
    role('ADMIN'),
    settingsController.upsertSetting
);

// Get all settings
router.get(
    '/',
    auth,
    role('ADMIN'),
    settingsController.getAllSettings
);

// Get single setting by key
router.get(
    '/:key',
    auth,
    role('ADMIN'),
    settingsController.getSetting
);

module.exports = router;