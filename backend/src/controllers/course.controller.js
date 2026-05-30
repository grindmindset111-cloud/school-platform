// src/controllers/course.controller.js
const { Course, Department } = require('../models');
const { success, error } = require('../utils/response.utils');

/**
 * ➕ Create course (ADMIN only)
 */
exports.createCourse = async (req, res) => {
    try {
        const { name, departmentId } = req.body;

        if (!name) return error(res, 'Field "name" is required', 400);
        if (!departmentId) return error(res, 'Field "departmentId" is required', 400);

        const department = await Department.findByPk(departmentId);
        if (!department) return error(res, 'Department not found', 404);

        const course = await Course.create({ name: name.trim(), departmentId });
        return success(res, course, 'Course created successfully');
    } catch (err) {
        console.error('Create course error:', err);
        return error(res, err.message || 'Failed to create course', 500);
    }
};

/**
 * 📄 Get all courses
 */
exports.getCourses = async (req, res) => {
    try {
        const courses = await Course.findAll({ include: Department });
        return success(res, courses, 'Courses fetched successfully');
    } catch (err) {
        console.error('Get courses error:', err);
        return error(res, err.message || 'Failed to fetch courses', 500);
    }
};

/**
 * ✏️ Update course (ADMIN only)
 */
exports.updateCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, departmentId } = req.body;

        const course = await Course.findByPk(id);
        if (!course) return error(res, 'Course not found', 404);

        if (departmentId) {
            const department = await Department.findByPk(departmentId);
            if (!department) return error(res, 'Department not found', 404);
            course.departmentId = departmentId;
        }

        if (name) course.name = name.trim();

        await course.save();
        return success(res, course, 'Course updated successfully');
    } catch (err) {
        console.error('Update course error:', err);
        return error(res, err.message || 'Failed to update course', 500);
    }
};

/**
 * 🗑 Delete course (ADMIN only)
 */
exports.deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const course = await Course.findByPk(id);
        if (!course) return error(res, 'Course not found', 404);

        await course.destroy();
        return success(res, null, 'Course deleted successfully');
    } catch (err) {
        console.error('Delete course error:', err);
        return error(res, err.message || 'Failed to delete course', 500);
    }
};
