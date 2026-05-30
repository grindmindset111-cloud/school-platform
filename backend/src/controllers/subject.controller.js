// src/controllers/subject.controller.js

const { Subject, User, ClassLevel, Course } = require('../models');
const { success, error } = require('../utils/response.utils');
const audit = require('../utils/audit.utils');


/**
 * ============================
 * CREATE SUBJECT
 * ============================
 */
exports.createSubject = async (req, res) => {
    try {
        const user = req.user;
        const { name, code, classLevelId, courseId } = req.body;

        if (!name || !code || !classLevelId || !courseId) {
            return error(res, 'name, code, classLevelId and courseId are required', 400);
        }

        if (user.role === 'STUDENT') {
            return error(res, 'Students cannot create subjects', 403);
        }

        const subject = await Subject.create({
            name: name.trim(),
            code: code.trim().toUpperCase(),
            classLevelId,
            courseId
        });

        await audit({
            action: 'CREATE_SUBJECT',
            entity: 'Subject',
            entityId: subject.id,
            userId: user.id
        });

        return success(res, subject, 'Subject created successfully');

    } catch (err) {
        console.error('Create subject error:', err);
        return error(res, err.message || 'Failed to create subject', 500);
    }
};


/**
 * ============================
 * ASSIGN TEACHER
 * ============================
 */
exports.assignTeacher = async (req, res) => {
    try {
        const user = req.user;

        if (user.role !== 'ADMIN') {
            return error(res, 'Only admin can assign teachers', 403);
        }

        const { subjectId, teacherId } = req.body;

        if (!subjectId || !teacherId) {
            return error(res, 'subjectId and teacherId are required', 400);
        }

        const subject = await Subject.findByPk(subjectId);
        if (!subject) return error(res, 'Subject not found', 404);

        const teacher = await User.findByPk(teacherId);
        if (!teacher || teacher.role !== 'STAFF') {
            return error(res, 'Invalid teacher', 400);
        }

        await subject.addTeacher(teacher);

        return success(res, null, 'Teacher assigned successfully');

    } catch (err) {
        console.error('Assign teacher error:', err);
        return error(res, err.message || 'Failed to assign teacher', 500);
    }
};


/**
 * ============================
 * REMOVE TEACHER 🔥
 * ============================
 */
exports.removeTeacher = async (req, res) => {
    try {
        const user = req.user;

        if (user.role !== 'ADMIN') {
            return error(res, 'Only admin can remove teachers', 403);
        }

        const { subjectId, teacherId } = req.body;

        if (!subjectId || !teacherId) {
            return error(res, 'subjectId and teacherId are required', 400);
        }

        const subject = await Subject.findByPk(subjectId);
        if (!subject) return error(res, 'Subject not found', 404);

        const teacher = await User.findByPk(teacherId);
        if (!teacher) return error(res, 'Teacher not found', 404);

        await subject.removeTeacher(teacher);

        return success(res, null, 'Teacher removed successfully');

    } catch (err) {
        console.error('Remove teacher error:', err);
        return error(res, err.message || 'Failed to remove teacher', 500);
    }
};


/**
 * ============================
 * UPDATE SUBJECT
 * ============================
 */
exports.updateSubject = async (req, res) => {
    try {
        const user = req.user;
        const { id } = req.params;

        const subject = await Subject.findByPk(id);
        if (!subject) return error(res, 'Subject not found', 404);

        const { name, code, classLevelId, courseId } = req.body;

        if (name) subject.name = name.trim();
        if (code) subject.code = code.trim().toUpperCase();
        if (classLevelId) subject.classLevelId = classLevelId;
        if (courseId) subject.courseId = courseId;

        await subject.save();

        await audit({
            action: 'UPDATE_SUBJECT',
            entity: 'Subject',
            entityId: subject.id,
            userId: user.id
        });

        return success(res, subject, 'Subject updated successfully');

    } catch (err) {
        console.error('Update subject error:', err);
        return error(res, err.message || 'Failed to update subject', 500);
    }
};


/**
 * ============================
 * DELETE SUBJECT
 * ============================
 */
exports.deleteSubject = async (req, res) => {
    try {
        const user = req.user;

        if (user.role !== 'ADMIN') {
            return error(res, 'Only admin can delete subjects', 403);
        }

        const subject = await Subject.findByPk(req.params.id);
        if (!subject) return error(res, 'Subject not found', 404);

        await subject.destroy();

        await audit({
            action: 'DELETE_SUBJECT',
            entity: 'Subject',
            entityId: subject.id,
            userId: user.id
        });

        return success(res, null, 'Subject deleted successfully');

    } catch (err) {
        console.error('Delete subject error:', err);
        return error(res, err.message || 'Failed to delete subject', 500);
    }
};


/**
 * ============================
 * GET ALL SUBJECTS
 * ============================
 */
exports.getAllSubjects = async (req, res) => {
    try {
        const subjects = await Subject.findAll({
            include: [
                {
                    model: User,
                    as: 'teachers', // ✅ MANY teachers now
                    attributes: ['id', 'name']
                },
                {
                    model: ClassLevel,
                    as: 'classLevel',
                    attributes: ['id', 'name']
                },
                {
                    model: Course,
                    as: 'course',
                    attributes: ['id', 'name']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        return success(res, subjects, 'Subjects fetched successfully');

    } catch (err) {
        console.error('Get subjects error:', err);
        return error(res, err.message || 'Failed to fetch subjects', 500);
    }
};