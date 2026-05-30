// src/controllers/notification.controller.js
const { Notification, User } = require('../models');
const { success, error } = require('../utils/response.utils');

// 🔔 Central function to create notifications (can be used internally)
const notify = async ({ userId, title, message, type = 'alert' }) => {
    return Notification.create({ userId, title, message, type, isRead: false });
};

// ============================
// CREATE A NOTIFICATION (ADMIN ONLY)
// ============================
const createNotification = async (req, res) => {
    try {
        const { userId, title, message, type } = req.body;

        if (!userId || !title || !message || !type) {
            return error(res, 'Missing required fields', 400);
        }

        // Verify user exists
        const user = await User.findByPk(userId);
        if (!user) return error(res, 'Target user not found', 404);

        const notification = await notify({ userId, title, message, type });
        return success(res, notification, 'Notification created successfully');
    } catch (err) {
        console.error('Create notification error:', err);
        return error(res, err.message, 500);
    }
};

// ============================
// GET ALL NOTIFICATIONS FOR LOGGED-IN USER
// ============================
const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']]
        });

        return success(res, notifications, 'Notifications retrieved successfully');
    } catch (err) {
        console.error('Get notifications error:', err);
        return error(res, err.message, 500);
    }
};

// ============================
// MARK NOTIFICATION AS READ
// ============================
const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;

        const notification = await Notification.findOne({
            where: { id, userId: req.user.id }
        });

        if (!notification) {
            return error(res, 'Notification not found', 404);
        }

        notification.isRead = true;
        await notification.save();

        return success(res, notification, 'Notification marked as read');
    } catch (err) {
        console.error('Mark notification as read error:', err);
        return error(res, err.message, 500);
    }
};

// ============================
// GET UNREAD NOTIFICATION COUNT (FOR BADGE)
// ============================
const getUnreadCount = async (req, res) => {
    try {
        const count = await Notification.count({
            where: { userId: req.user.id, isRead: false }
        });

        return success(res, { unreadCount: count }, 'Unread notifications count retrieved');
    } catch (err) {
        console.error('Get unread count error:', err);
        return error(res, err.message, 500);
    }
};

module.exports = {
    createNotification,
    getNotifications,
    markAsRead,
    getUnreadCount,
    notify // ✅ export central notify function for other controllers
};
