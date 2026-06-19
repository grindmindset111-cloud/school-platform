require('dotenv').config();

const app = require('./src/app');

const { sequelize, Booking } = require('./src/models');

const expireBookings = require('./src/jobs/booking.expiry.job');
const processQueue = require('./src/jobs/booking.queue.processor');

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

let server;
let bookingJob;
let queueTimer = null;
let isProcessingQueue = false;

/**
 * ============================
 * START SERVER
 * ============================
 */
async function startServer() {

    try {

        console.log('🚀 Starting server...');

        // ============================
        // DATABASE CONNECTION
        // ============================
        await sequelize.authenticate();
        console.log('✅ Database connected');

        // ============================
        // SQLITE PRAGMAS
        // ============================
        // Applied here (not via hooks.afterConnect) because Sequelize
        // 6.32.1 + sqlite3 5.1.6 do not surface afterConnect hooks to
        // the underlying driver. Executing the PRAGMAs on the same
        // connection that authenticated ensures they persist for the
        // pool's lifetime and apply to every subsequent query.
        await sequelize.query('PRAGMA journal_mode=WAL;');
        await sequelize.query('PRAGMA synchronous=NORMAL;');
        await sequelize.query('PRAGMA foreign_keys=ON;');
        console.log('📝 SQLite PRAGMAs applied: WAL, synchronous=NORMAL, foreign_keys=ON');

        // ============================
        // SAFE DATABASE SYNC
        //
        // ALTER MODE only when explicitly enabled via DB_SYNC_ALTER=1.
        // SQLite + sequelize alter is unreliable (drop+recreate FK
        // tables fails when other tables reference them). Most schema
        // changes should be done via migrations instead.
        const allowAlter =
            process.env.NODE_ENV === 'development' &&
            process.env.DB_SYNC_ALTER === '1';

        await sequelize.sync({
            force: false,
            alter: allowAlter
        });

        console.log(
            `📦 Database synced (${allowAlter ? 'DEV ALTER MODE' : 'SAFE MODE'})`
        );

        // ============================
        // START EXPRESS SERVER
        // ============================
        server = app.listen(PORT, HOST, () => {
            console.log(`🌐 Server running on http://${HOST}:${PORT}`);
        });

        // ============================
        // INITIAL BOOKING EXPIRY
        // ============================
        try {

            await expireBookings();

            console.log('⏰ Initial booking expiry completed');

        } catch (err) {

            console.error('❌ Initial expiry job failed:', err.message);
        }

        // ============================
        // RUN BOOKING EXPIRY EVERY HOUR
        // ============================
        bookingJob = setInterval(async () => {

            try {

                await expireBookings();

            } catch (err) {

                console.error('❌ Expiry job error:', err.message);
            }

        }, 1000 * 60 * 60);

        // ============================
        // SMART QUEUE PROCESSOR
        // ============================
        // Self-scheduling loop with a re-entry guard. Prevents overlapping
        // transactions when a booking flow is holding the SQLite write lock.
        // Minimum interval between runs is QUEUE_INTERVAL_MS.
        const QUEUE_INTERVAL_MS = 5000;

        const runQueueTick = async () => {
            if (isProcessingQueue) {
                // Previous tick still running — skip this one.
                queueTimer = setTimeout(runQueueTick, QUEUE_INTERVAL_MS);
                return;
            }
            isProcessingQueue = true;
            try {
                const hasQueue = await Booking.findOne({
                    where: { queueStatus: 'queued' }
                });
                if (hasQueue) {
                    await processQueue();
                }
            } catch (err) {
                console.error('❌ Queue processor error:', err.message);
            } finally {
                isProcessingQueue = false;
                queueTimer = setTimeout(runQueueTick, QUEUE_INTERVAL_MS);
            }
        };

        queueTimer = setTimeout(runQueueTick, QUEUE_INTERVAL_MS);
        console.log('🔥 Queue processor started (5s interval, single-flight)');

        // ============================
        // GLOBAL ERROR SAFETY
        // ============================
        process.on('unhandledRejection', (err) => {
            console.error('🔥 Unhandled Rejection:', err);
        });

        process.on('uncaughtException', (err) => {

            console.error('💥 Uncaught Exception:', err);

            process.exit(1);
        });

        // ============================
        // GRACEFUL SHUTDOWN
        // ============================
        const shutdown = async (signal) => {

            console.log(`\n🛑 ${signal} received. Shutting down...`);

            try {

                if (bookingJob) {
                    clearInterval(bookingJob);
                }

                if (queueTimer) {
                    clearTimeout(queueTimer);
                }

                if (server) {

                    server.close(async () => {

                        try {

                            await sequelize.close();

                            console.log('✅ Database connection closed');

                            process.exit(0);

                        } catch (err) {

                            console.error('❌ Error closing database:', err.message);

                            process.exit(1);
                        }
                    });
                }

            } catch (err) {

                console.error('❌ Shutdown error:', err.message);

                process.exit(1);
            }
        };

        process.on('SIGINT', () => shutdown('SIGINT'));
        process.on('SIGTERM', () => shutdown('SIGTERM'));

    } catch (error) {

        console.error('❌ Startup failed:', error);

        process.exit(1);
    }
}

/**
 * ============================
 * RUN SERVER
 * ============================
 */
startServer();