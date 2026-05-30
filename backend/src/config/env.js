// src/config/env.js
const path = require('path');
const dotenv = require('dotenv');

// Load .env file from /src folder
dotenv.config({ path: path.resolve(__dirname, '../.env') });

module.exports = {
    PORT: process.env.PORT || 3000,
    JWT_SECRET: process.env.JWT_SECRET || 'supersecret',
    DB_STORAGE: process.env.DB_STORAGE || './database.sqlite'
};
