const nodemailer = require('nodemailer');

// Lazy transporter. Created on first send so module load never fails.
let transporter = null;
let transporterInitFailed = false;

function getTransporter() {
    if (transporter) return transporter;
    if (transporterInitFailed) return null;

    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    if (!user || !pass) {
        // Don't try to construct a transporter — nodemailer would just
        // throw EAUTH on the first send. Disable email for this process.
        transporterInitFailed = true;
        return null;
    }

    try {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user, pass }
        });
        return transporter;
    } catch (err) {
        console.warn('⚠️  Could not initialize email transporter:', err.message);
        transporterInitFailed = true;
        return null;
    }
}

/**
 * Send an email. Never throws.
 *
 * Behaviour:
 *  - If EMAIL_USER / EMAIL_PASS are missing → log a warning and return.
 *  - If SMTP send fails (EAUTH, network, etc.) → log and return.
 *  - In development mode, always log a warning instead of attempting
 *    SMTP unless credentials are explicitly configured.
 */
exports.sendEmail = async ({ to, subject, text }) => {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    if (!user || !pass) {
        console.warn(
            '⚠️  Email disabled (EMAIL_USER / EMAIL_PASS not set). ' +
            `Skipping email "${subject}" to ${to}.`
        );
        return;
    }

    const tx = getTransporter();
    if (!tx) {
        console.warn(
            '⚠️  Email transporter unavailable. ' +
            `Skipping email "${subject}" to ${to}.`
        );
        return;
    }

    try {
        await tx.sendMail({
            from: `"School Platform" <${user}>`,
            to,
            subject,
            text
        });
    } catch (err) {
        // Never propagate email failures to the caller.
        console.error(
            `⚠️  Email send failed for "${subject}" to ${to}:`,
            err.message
        );
    }
};
