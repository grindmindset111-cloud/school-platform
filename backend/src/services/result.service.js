// src/services/result.service.js
const { Result, User, Course, Subject } = require('../models');

/**
 * ============================
 * GRADE CALCULATOR
 * ============================
 */
const calculateGrade = (score) => {
    if (score >= 70) return 'A';
    if (score >= 60) return 'B';
    if (score >= 50) return 'C';
    if (score >= 45) return 'D';
    if (score >= 40) return 'E';
    return 'F';
};

/**
 * ============================
 * VALIDATE SCORE
 * ============================
 */
const validateScore = (score) => {
    const num = Number(score);

    if (isNaN(num)) {
        throw { message: 'Score must be a number', status: 400 };
    }

    if (num < 0 || num > 100) {
        throw { message: 'Score must be between 0 and 100', status: 400 };
    }

    return num;
};

/**
 * ============================
 * CREATE RESULT
 * ============================
 */
const createResult = async ({ studentId, subjectId, score }, user) => {

    if (!studentId || !subjectId || score === undefined) {
        throw { message: 'studentId, subjectId and score are required', status: 400 };
    }

    const numericScore = validateScore(score);

    // Student check
    const student = await User.findByPk(studentId);
    if (!student || student.role !== 'STUDENT') {
        throw { message: 'Invalid student', status: 404 };
    }

    // Subject check
    const subject = await Subject.findByPk(subjectId, {
        include: [{ association: 'teachers', attributes: ['id'] }]
    });

    if (!subject) {
        throw { message: 'Subject not found', status: 404 };
    }

    if (student.classLevelId !== subject.classLevelId) {
        throw { message: 'Student not in this class level', status: 403 };
    }

    // STAFF restriction
    if (user.role === 'STAFF') {
        const isAssigned = subject.teachers?.some(t => t.id === user.id);
        if (!isAssigned) {
            throw { message: 'You can only upload results for assigned subjects', status: 403 };
        }
    }

    // Duplicate prevention
    const existing = await Result.findOne({
        where: { studentId, subjectId }
    });

    if (existing) {
        throw { message: 'Result already exists', status: 400 };
    }

    const result = await Result.create({
        studentId,
        classLevelId: student.classLevelId,
        courseId: subject.courseId,
        subjectId,
        score: numericScore,
        grade: calculateGrade(numericScore),
        locked: false,
        released: false
    });

    return Result.findByPk(result.id, {
        include: [
            { model: User, as: 'student', attributes: ['id', 'name', 'email'] },
            { model: Subject, as: 'subject', attributes: ['id', 'name'] }
        ]
    });
};

/**
 * ============================
 * GET RESULTS
 * ============================
 */
const getResults = async (user, limit = 10, offset = 0, filters = {}) => {

    const where = { ...filters };

    const include = [
        { model: User, as: 'student', attributes: ['id', 'name', 'email'] },
        { model: Course, as: 'course', attributes: ['id', 'name'] },
        {
            model: Subject,
            as: 'subject',
            attributes: ['id', 'name', 'classLevelId'],
            include: [
                { association: 'teachers', attributes: ['id'] }
            ]
        }
    ];

    if (user.role === 'STUDENT') {
        where.studentId = user.id;
    }

    if (user.role === 'STAFF') {
        include[2].include = [
            {
                association: 'teachers',
                where: { id: user.id },
                required: false
            }
        ];
    }

    return Result.findAndCountAll({
        where,
        include,
        limit,
        offset,
        distinct: true,
        order: [['createdAt', 'DESC']]
    });
};

/**
 * ============================
 * UPDATE RESULT
 * ============================
 */
const updateResult = async (id, data, user) => {

    const result = await Result.findByPk(id, {
        include: [{
            model: Subject,
            as: 'subject',
            include: [{ association: 'teachers', attributes: ['id'] }]
        }]
    });

    if (!result) {
        throw { message: 'Result not found', status: 404 };
    }

    if (result.locked && user.role !== 'ADMIN') {
        throw { message: 'Result is locked', status: 403 };
    }

    if (user.role === 'STAFF') {
        const isAssigned = result.subject.teachers?.some(t => t.id === user.id);
        if (!isAssigned) {
            throw { message: 'Not authorized for this subject', status: 403 };
        }

        // prevent sensitive updates
        const restrictedFields = [
            'locked',
            'released',
            'studentId',
            'classLevelId',
            'courseId',
            'subjectId'
        ];

        restrictedFields.forEach(field => delete data[field]);
    }

    if (data.score !== undefined) {
        const numericScore = validateScore(data.score);
        data.score = numericScore;
        data.grade = calculateGrade(numericScore);
    }

    delete data.grade; // prevent manual override

    Object.assign(result, data);
    await result.save();

    return result;
};

/**
 * ============================
 * LOCK / UNLOCK RESULT
 * ============================
 */
const lockResult = async (id, unlock = false) => {

    const result = await Result.findByPk(id, {
        include: [
            { model: User, as: 'student', attributes: ['id', 'name', 'email'] },
            { model: Subject, as: 'subject', attributes: ['id', 'name'] }
        ]
    });

    if (!result) {
        throw { message: 'Result not found', status: 404 };
    }

    result.locked = !unlock;
    result.released = unlock;

    await result.save();

    return result;
};

module.exports = {
    createResult,
    getResults,
    updateResult,
    lockResult
};