// src/controllers/auth.controller.js
const jwt = require('jsonwebtoken');
const { User, ClassLevel } = require('../models');
const jwtConfig = require('../config/jwt.config');
const { success, error } = require('../utils/response.utils');
const audit = require('../utils/audit.utils');
const crypto = require('crypto');
const { Op } = require('sequelize');
const { sendEmail } = require('../utils/email.utils');

// ================= SANITIZE USER =================
const sanitizeUser = (user) => {
    if (!user) return null;
    const { password, resetToken, resetTokenExpiry, ...safeUser } = user.dataValues;
    return safeUser;
};

// ======================= REGISTER =======================
exports.register = async (req, res) => {
    try {
        const { name, email, password, role, classLevelId } = req.body;

        if (!name || !email || !password || !role) {
            return error(res, 'Name, email, password and role are required', 400);
        }

        if (!['STUDENT', 'STAFF', 'ADMIN'].includes(role)) {
            return error(res, 'Invalid role value', 400);
        }

        let assignedClassLevelId = null;

        // STUDENT RULES
        if (role === 'STUDENT') {
            if (!classLevelId) return error(res, 'classLevelId is required for students', 400);

            const classLevel = await ClassLevel.findByPk(classLevelId);
            if (!classLevel) return error(res, 'Invalid classLevelId selected', 400);

            assignedClassLevelId = classLevelId;
        }

        // STAFF/ADMIN RULE
        if (role !== 'STUDENT' && classLevelId) {
            return error(res, 'Only students can have a class level', 400);
        }

        // CREATE USER
        const user = await User.create({
            name,
            email,
            password,
            role,
            classLevelId: assignedClassLevelId
        });

        await audit({
            action: 'REGISTER',
            entity: 'User',
            entityId: user.id,
            userId: user.id
        });

        // Fetch user with classLevel for response
        const userWithClass = await User.findByPk(user.id, {
            attributes: { exclude: ['password', 'resetToken', 'resetTokenExpiry'] },
            include: [{ model: ClassLevel, as: 'classLevel', attributes: ['id', 'name'] }]
        });

        // SEND EMAIL
        try {
            await sendEmail({
                to: user.email,
                subject: 'Welcome to School Platform!',
                text: `Hello ${user.name},\n\nYour account has been successfully created.\nLogin using your email and password.\n\nThanks,\nSchool Platform Team.`
            });
        } catch (emailErr) {
            console.error('Email failed:', emailErr.message);
        }

        return success(res, { user: userWithClass }, 'User registered successfully');

    } catch (err) {
        console.error('Registration error:', err);

        if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
            return error(res, err.errors.map(e => e.message).join(', '), 400);
        }

        return error(res, err.message || 'Failed to register user', 500);
    }
};

// ======================= LOGIN =======================
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return error(res, 'Email and password are required', 400);

        const user = await User.scope('withSensitiveData').findOne({ where: { email } });
        if (!user) return error(res, 'Invalid credentials', 401);

        const valid = await user.comparePassword(password);
        if (!valid) return error(res, 'Invalid credentials', 401);

        const token = jwt.sign(
            { id: user.id, role: user.role, classLevelId: user.classLevelId },
            jwtConfig.secret,
            { expiresIn: jwtConfig.expiresIn }
        );

        await audit({
            action: 'LOGIN',
            entity: 'User',
            entityId: user.id,
            userId: user.id
        });

        // Fetch user with classLevel for response
        const userWithClass = await User.findByPk(user.id, {
            attributes: { exclude: ['password', 'resetToken', 'resetTokenExpiry'] },
            include: [{ model: ClassLevel, as: 'classLevel', attributes: ['id', 'name'] }]
        });

        return success(res, { user: userWithClass, token }, 'Login successful');

    } catch (err) {
        console.error('Login error:', err);
        return error(res, err.message || 'Failed to login', 500);
    }
};

// ================= PASSWORD RESET REQUEST =================
exports.requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return error(res, 'Email is required', 400);

        const user = await User.findOne({ where: { email } });
        if (!user) return error(res, 'User not found', 404);

        const resetToken = crypto.randomBytes(20).toString('hex');

        user.resetToken = resetToken;
        user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
        await user.save();

        await audit({
            action: 'PASSWORD_RESET_REQUEST',
            entity: 'User',
            entityId: user.id,
            userId: user.id
        });

        try {
            await sendEmail({
                to: user.email,
                subject: 'Password Reset Request',
                text: `Hello ${user.name},\n\nYou requested a password reset.\nToken: ${resetToken}\nIt expires in 1 hour.\nIf you did not request this, ignore this email.`
            });
        } catch (emailErr) {
            console.error('Email failed:', emailErr.message);
        }

        return success(res, null, 'Password reset token generated');

    } catch (err) {
        console.error(err);
        return error(res, err.message || 'Failed to generate reset token', 500);
    }
};

// ======================= RESET PASSWORD =======================
exports.resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) return error(res, 'Token and newPassword are required', 400);

        const user = await User.scope('withSensitiveData').findOne({
            where: { resetToken: token, resetTokenExpiry: { [Op.gt]: Date.now() } }
        });

        if (!user) return error(res, 'Invalid or expired token', 400);

        user.password = newPassword;
        user.resetToken = null;
        user.resetTokenExpiry = null;
        await user.save();

        await audit({
            action: 'PASSWORD_RESET',
            entity: 'User',
            entityId: user.id,
            userId: user.id
        });

        return success(res, null, 'Password reset successfully');

    } catch (err) {
        console.error(err);
        return error(res, err.message || 'Failed to reset password', 500);
    }
};

// ======================= GET CURRENT USER (/me) =======================
exports.getMe = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password', 'resetToken', 'resetTokenExpiry'] },
            include: [
                {
                    model: ClassLevel,
                    as: 'classLevel', // ✅ must match User model alias
                    attributes: ['id', 'name']
                }
            ]
        });

        if (!user) return error(res, 'User not found', 404);

        return success(res, { user: user.toJSON() }, 'User fetched successfully');

    } catch (err) {
        console.error('GetMe error:', err);
        return error(res, err.message || 'Failed to fetch user', 500);
    }
};