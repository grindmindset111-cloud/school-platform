const { Department, Course } = require('../models');
const { success, error } = require('../utils/response.utils');

/**
 * ➕ CREATE DEPARTMENT (ADMIN)
 */
exports.create = async (req, res) => {
    try {
        const department = await Department.create(req.body);
        success(res, department, 'Department created');
    } catch (err) {
        console.error('Create department error:', err);
        error(res, err.message, err.status || 500);
    }
};

/**
 * 📄 LIST ALL DEPARTMENTS
 */
exports.list = async (req, res) => {
    try {
        const departments = await Department.findAll();
        success(res, departments);
    } catch (err) {
        console.error('List departments error:', err);
        error(res, err.message, err.status || 500);
    }
};

/**
 * ✏️ UPDATE DEPARTMENT (ADMIN)
 */
exports.update = async (req, res) => {
    try {
        const department = await Department.findByPk(req.params.id);
        if (!department) return error(res, 'Department not found', 404);

        Object.assign(department, req.body);
        await department.save();

        success(res, department, 'Department updated');
    } catch (err) {
        console.error('Update department error:', err);
        error(res, err.message, err.status || 500);
    }
};

/**
 * 🗑 DELETE DEPARTMENT (ADMIN)
 * Prevent deletion if courses exist
 */
exports.remove = async (req, res) => {
    try {
        const department = await Department.findByPk(req.params.id, { include: Course });
        if (!department) return error(res, 'Department not found', 404);

        if (department.Courses.length > 0) {
            return error(res, 'Cannot delete department with existing courses', 400);
        }

        await department.destroy();
        success(res, null, 'Department deleted');
    } catch (err) {
        console.error('Delete department error:', err);
        error(res, err.message, err.status || 500);
    }
};
