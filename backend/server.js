require('dotenv').config();

const app = require('./src/app');

const { sequelize, Booking } = require('./src/models');

const expireBookings = require('./src/jobs/booking.expiry.job');
const processQueue = require('./src/jobs/booking.queue.processor');

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

let server;
let bookingJob;
let queueJob;

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
        // SAFE DATABASE SYNC
        // ============================
        const isDev = process.env.NODE_ENV === 'development';

        await sequelize.sync({
            force: false,
            alter: isDev
        });

        console.log(`📦 Database synced (${isDev ? 'DEV ALTER MODE' : 'PRODUCTION SAFE MODE'})`);

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
        queueJob = setInterval(async () => {

            try {

                const hasQueue = await Booking.findOne({
                    where: {
                        queueStatus: 'queued'
                    }
                });

                if (hasQueue) {
                    await processQueue();
                }

            } catch (err) {

                console.error('❌ Queue processor error:', err.message);
            }

        }, 2000);

        console.log('🔥 Queue processor started');

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

                if (queueJob) {
                    clearInterval(queueJob);
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