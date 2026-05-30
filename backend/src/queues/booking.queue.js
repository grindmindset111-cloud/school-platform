// src/queues/booking.queue.js

const Queue = require('bull');

/**
 * =========================
 * REDIS CONNECTION (BULL)
 * =========================
 */
const bookingQueue = new Queue('booking-queue', {
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


/**
 * =========================
 * QUEUE EVENTS (MONITORING)
 * =========================
 */

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


module.exports = bookingQueue;