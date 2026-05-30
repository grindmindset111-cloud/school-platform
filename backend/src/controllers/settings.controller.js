// src/controllers/settings.controller.js
const { Settings } = require('../models');
const { success, error } = require('../utils/response.utils');
const audit = require('../utils/audit.utils');

// Create or update a setting (ADMIN only)
exports.upsertSetting = async (req, res) => {
    try {
        const { key, value } = req.body;
        if (!key || !value) return error(res, 'Key and value are required', 400);

        let setting = await Settings.findOne({ where: { key } });

        if (setting) {
            // Update existing setting
            setting.value = value;
            await setting.save();

            await audit({
                action: 'UPDATE_SETTING',
                entity: 'Settings',
                entityId: setting.id,
                userId: req.user.id
            });

            success(res, setting, 'Setting updated successfully');
        } else {
            // Create new setting
            setting = await Settings.create({ key, value });

            await audit({
                action: 'CREATE_SETTING',
                entity: 'Settings',
                entityId: setting.id,
                userId: req.user.id
            });

            success(res, setting, 'Setting created successfully');
        }
    } catch (err) {
        error(res, err.message, err.status || 500);
    }
};

// Get all settings (ADMIN only)
exports.getAllSettings = async (req, res) => {
    try {
        const settings = await Settings.findAll();
        success(res, settings, 'Settings retrieved successfully');
    } catch (err) {
        error(res, err.message, err.status || 500);
    }
};

// Get a single setting by key
exports.getSetting = async (req, res) => {
    try {
        const { key } = req.params;
        const setting = await Settings.findOne({ where: { key } });
        if (!setting) return error(res, 'Setting not found', 404);
        success(res, setting);
    } catch (err) {
        error(res, err.message, err.status || 500);
    }
};
