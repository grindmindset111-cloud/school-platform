// src/routes/notifications.routes.js

const router = require('express').Router();

const notificationController =
    require('../controllers/notification.controller');


// 🔐 Auth middleware
const auth =
    require('../middlewares/auth.middleware');


// 🔐 Permission middleware
const permit =
    require('../middlewares/permission.middleware');


/*
|--------------------------------------------------------------------------
| NOTIFICATION ROUTES (HARDENED)
|--------------------------------------------------------------------------
*/


/**
 * ==========================================================
 * GET USER NOTIFICATIONS
 * ==========================================================
 */
router.get(
    '/',
    auth,
    permit('NOTIFICATION_VIEW'),
    notificationController.getNotifications
);



/**
 * ==========================================================
 * CREATE NOTIFICATION (SYSTEM / ADMIN)
 * ==========================================================
 */
router.post(
    '/',
    auth,
    permit('NOTIFICATION_CREATE'),
    notificationController.createNotification
);



/**
 * ==========================================================
 * GET UNREAD COUNT
 * ==========================================================
 */
router.get(
    '/unread-count',
    auth,
    permit('NOTIFICATION_VIEW'),
    notificationController.getUnreadCount
);



/**
 * ==========================================================
 * MARK AS READ
 * ==========================================================
 */
router.patch(
    '/:id/read',
    auth,
    permit('NOTIFICATION_UPDATE'),
    notificationController.markAsRead
);


module.exports = router;