// src/controllers/resource.controller.js
const { Resource } = require('../models');
const { success, error } = require('../utils/response.utils');
const audit = require('../utils/audit.utils');

// Create a new resource (Admin only)
exports.create = async (req, res) => {
    try {
        const resource = await Resource.create(req.body);

        // Log creation
        await audit({
            action: 'CREATE_RESOURCE',
            entity: 'Resource',
            entityId: resource.id,
            userId: req.user.id
        });

        success(res, resource, 'Resource created successfully');
    } catch (err) {
        error(res, err.message, err.status);
    }
};

// List all resources
exports.list = async (req, res) => {
    try {
        const resources = await Resource.findAll();
        success(res, resources, 'Resources retrieved');

        // Optional: log view
        await audit({
            action: 'VIEW_RESOURCES',
            entity: 'Resource',
            entityId: null,
            userId: req.user.id
        });
    } catch (err) {
        error(res, err.message, err.status);
    }
};

// Update a resource
exports.update = async (req, res) => {
    try {
        const resource = await Resource.findByPk(req.params.id);
        if (!resource) return error(res, 'Resource not found', 404);

        Object.assign(resource, req.body);
        await resource.save();

        await audit({
            action: 'UPDATE_RESOURCE',
            entity: 'Resource',
            entityId: resource.id,
            userId: req.user.id
        });

        success(res, resource, 'Resource updated successfully');
    } catch (err) {
        error(res, err.message, err.status);
    }
};

// Delete a resource
exports.delete = async (req, res) => {
    try {
        const resource = await Resource.findByPk(req.params.id);
        if (!resource) return error(res, 'Resource not found', 404);

        await resource.destroy();

        await audit({
            action: 'DELETE_RESOURCE',
            entity: 'Resource',
            entityId: resource.id,
            userId: req.user.id
        });

        success(res, null, 'Resource deleted successfully');
    } catch (err) {
        error(res, err.message, err.status);
    }
};
