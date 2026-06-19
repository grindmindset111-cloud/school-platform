// src/queues/booking.queue.js

const Queue = require('bull');

/**
 * =========================
 * REDIS CONNECTION (BULL)
 * =========================
 * We attempt to construct a Bull Queue against REDIS_URL (default
 * localhost:6379). If Redis is unreachable at startup we fall back to
 * a no-op in-memory stub so the rest of the booking flow still works
 * (bookings still get created; only the post-create async processing
 * pipeline is skipped). When Redis becomes available, restart the
 * server to activate the real queue.
 */
let bookingQueue;
let queueDisabledReason = null;

try {
    bookingQueue = new Queue('booking-queue', {
        redis: process.env.REDIS_URL,

        // =========================
        // RELIABILITY SETTINGS
        // =========================
        settings: {
            stalledInterval: 5000,   // checks stuck jobs
            maxStalledCount: 2       // retries stuck jobs before failing
        },

        // =========================
        // DEFAULT JOB OPTIONS
        // =========================
        defaultJobOptions: {
            attempts: 5, // retry up to 5 times

            backoff: {
                type: 'exponential',
                delay: 3000
            },

            removeOnComplete: true, // clean successful jobs
            removeOnFail: false     // keep failed jobs for debugging
        }
    });

    bookingQueue.on('error', (err) => {
        // Bull emits 'error' when it cannot reach Redis. Downgrade to
        // a single warning instead of crashing the process.
        if (!queueDisabledReason) {
            queueDisabledReason = err.message || 'redis unavailable';
            console.warn(
                `⚠️  Booking queue disabled: ${queueDisabledReason}. ` +
                'Bookings will still be created; the async post-create ' +
                'pipeline is skipped. Start Redis and restart the server ' +
                'to re-enable.'
            );
        }
    });
} catch (err) {
    queueDisabledReason = err.message;
    console.warn(
        `⚠️  Booking queue could not be initialized: ${queueDisabledReason}. ` +
        'Falling back to no-op queue.'
    );
    bookingQueue = {
        async add() { return null; },
        on() { return this; },
        process() { return this; },
        close() { return Promise.resolve(); }
    };
}


/**
 * =========================
 * QUEUE EVENTS (MONITORING)
 * =========================
 */

if (bookingQueue.on) {
    // Job completed
    bookingQueue.on('completed', (job) => {
        console.log(`✅ Booking job completed: ${job.id}`);
    });

    // Job failed
    bookingQueue.on('failed', (job, err) => {
        console.error(`❌ Booking job failed: ${job.id}`, err.message);
    });

    // Stuck job warning
    bookingQueue.on('stalled', (job) => {
        console.warn(`⚠️ Booking job stalled: ${job.id}`);
    });
}


module.exports = bookingQueue;