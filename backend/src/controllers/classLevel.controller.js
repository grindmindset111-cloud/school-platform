const { ClassLevel } = require('../models');
const { success, error } = require('../utils/response.utils');
const audit = require('../utils/audit.utils');

/**
 * ➕ CREATE CLASS LEVEL (ADMIN)
 */
exports.createClassLevel = async (req, res) => {
    try {
        const classLevel = await ClassLevel.create(req.body);

        await audit({
            action: 'CREATE_CLASSLEVEL',
            entity: 'ClassLevel',
            entityId: classLevel.id,
            userId: req.user.id
        });

        return success(res, classLevel, 'Class level created');
    } catch (err) {
        return error(res, err.message || 'Failed to create class level', 500);
    }
};

/**
 * 📄 GET ALL CLASS LEVELS
 */
exports.getClassLevels = async (req, res) => {
    try {
        const levels = await ClassLevel.findAll();
        return success(res, levels);
    } catch (err) {
        return error(res, err.message || 'Failed to fetch class levels', 500);
    }
};

/**
 * ✏️ UPDATE CLASS LEVEL (ADMIN)
 */
exports.updateClassLevel = async (req, res) => {
    try {
        const classLevel = await ClassLevel.findByPk(req.params.id);
        if (!classLevel) return error(res, 'Class level not found', 404);

        Object.assign(classLevel, req.body);
        await classLevel.save();

        await audit({
            action: 'UPDATE_CLASSLEVEL',
            entity: 'ClassLevel',
            entityId: classLevel.id,
            userId: req.user.id
        });

        return success(res, classLevel, 'Class level updated');
    } catch (err) {
        return error(res, err.message || 'Failed to update class level', 500);
    }
};

/**
 * ❌ DELETE CLASS LEVEL (ADMIN)
 */
exports.deleteClassLevel = async (req, res) => {
    try {
        const classLevel = await ClassLevel.findByPk(req.params.id);
        if (!classLevel) return error(res, 'Class level not found', 404);

        await classLevel.destroy();

        await audit({
            action: 'DELETE_CLASSLEVEL',
            entity: 'ClassLevel',
            entityId: classLevel.id,
            userId: req.user.id
        });

        return success(res, null, 'Class level deleted');
    } catch (err) {
        return error(res, err.message || 'Failed to delete class level', 500);
    }
};
