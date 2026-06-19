// src/utils/notify.utils.js
const { Notification } = require('../models');
const { sendEmail } = require('./email.utils');

/**
 * Send notifications and optional emails to users.
 *
 * Failure isolation:
 *  - DB bulkCreate is awaited once. If it throws, the whole call throws.
 *  - Email sends run in parallel but each one has its own try/catch,
 *    so a single EAUTH or network failure does not reject the others.
 *
 * @param {Object} params
 * @param {Array} params.users - Array of user objects {id, name, email}
 * @param {string} params.title - Notification title
 * @param {string} params.message - Notification message
 * @param {string} [params.type='alert'] - Notification type ('booking', 'result', 'alert', 'announcement')
 * @param {string} [params.emailSubject] - Email subject
 * @param {function} [params.emailTextBuilder] - Function(user) => string, builds email text
 * @param {number} [params.referenceId] - Optional related entity ID
 * @param {string} [params.url] - Optional URL for notification
 */
async function notify({ users, title, message, type = 'alert', emailSubject, emailTextBuilder, referenceId = null, url = null }) {
    if (!Array.isArray(users) || users.length === 0) return;

    try {
        // Filter valid users
        const validUsers = users.filter(u => u.id);

        if (validUsers.length === 0) return;

        // 1️⃣ Create notifications in DB
        const notifications = validUsers.map(user => ({
            userId: user.id,
            title,
            message,
            type,
            isRead: false,
            referenceId,
            url
        }));

        await Notification.bulkCreate(notifications);

        // 2️⃣ Send emails if email info exists. Each send is wrapped
        //    in its own try/catch so one failure doesn't sink the batch.
        if (emailSubject && emailTextBuilder) {
            await Promise.all(
                validUsers
                    .filter(u => u.email)
                    .map(async (user) => {
                        try {
                            await sendEmail({
                                to: user.email,
                                subject: emailSubject,
                                text: emailTextBuilder(user)
                            });
                        } catch (err) {
                            console.error(
                                `Email failed for user ${user.id}:`,
                                err.message
                            );
                        }
                    })
            );
        }
    } catch (err) {
        console.error('Notify error:', err);
    }
}

module.exports = { notify };
