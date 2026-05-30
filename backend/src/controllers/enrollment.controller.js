const { Enrollment, User, Course } = require('../models');
const { success, error } = require('../utils/response.utils');


/**
 * Create a new enrollment (ADMIN / STAFF)
 */
exports.create = async (req, res) => {
    try {
        const { studentId, courseId } = req.body;

        // Check if student exists
        const student = await User.findByPk(studentId);
        if (!student || student.role !== 'STUDENT') {
            return error(res, 'Student not found or invalid', 404);
        }

        // Check if course exists
        const course = await Course.findByPk(courseId);
        if (!course) {
            return error(res, 'Course not found', 404);
        }

        // Optional: Prevent duplicate enrollment
        const existing = await Enrollment.findOne({ where: { studentId, courseId } });
        if (existing) {
            return error(res, 'Student already enrolled in this course', 400);
        }

        // Create enrollment
        const enrollment = await Enrollment.create({ studentId, courseId });
        success(res, enrollment, 'Enrollment created');
    } catch (err) {
        error(res, err.message);
    }
};

/**
 * List all enrollments (ADMIN / STAFF)
 */
exports.list = async (req, res) => {
    try {
        const enrollments = await Enrollment.findAll({
            include: [
                { model: User, attributes: ['id', 'name', 'email'] },
                { model: Course, attributes: ['id', 'name'] }
            ]
        });
        success(res, enrollments);
    } catch (err) {
        error(res, err.message);
    }
};

/**
 * Get enrollments for logged-in student
 */
exports.myEnrollments = async (req, res) => {
    try {
        const studentId = req.user.id;

        const enrollments = await Enrollment.findAll({
            where: { studentId },
            include: [
                { model: Course, attributes: ['id', 'name'] }
            ]
        });

        success(res, enrollments, 'My enrollments');
    } catch (err) {
        error(res, err.message);
    }
};
