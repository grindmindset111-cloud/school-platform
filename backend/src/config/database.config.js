const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: process.env.DB_STORAGE || './database.sqlite',
    logging: false,

    // Small connection pool — too many concurrent writers cause SQLITE_BUSY.
    pool: {
        max: 5,
        min: 0,
        idle: 10000,
        acquire: 30000
    },

    // SQLite-only options. Wait up to 10s for a busy lock instead of
    // throwing immediately (SequelizeTimeoutError / SQLITE_BUSY).
    dialectOptions: {
        busyTimeout: 10000
    },

    // Run PRAGMA journal_mode=WAL on every new connection so SQLite
    // uses write-ahead logging. WAL allows concurrent readers while a
    // writer holds the lock, dramatically reducing SQLITE_BUSY.
    hooks: {
        afterConnect: async (connection) => {
            try {
                await connection.query('PRAGMA journal_mode=WAL;');
                await connection.query('PRAGMA synchronous=NORMAL;');
                await connection.query('PRAGMA busy_timeout=10000;');
                await connection.query('PRAGMA foreign_keys=ON;');
            } catch (err) {
                // Non-fatal — fall back to default journal mode.
                console.warn('⚠️  Could not apply SQLite PRAGMA:', err.message);
            }
        }
    }
});

module.exports = sequelize;
