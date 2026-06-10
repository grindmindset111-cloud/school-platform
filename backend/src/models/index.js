// src/models/index.js

const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database.config');

// =========================
// MODEL CONTAINER
// =========================
const models = {};

// =========================
// LOAD MODEL FILES
// =========================
const modelFiles = fs
    .readdirSync(__dirname)
    .filter(file =>
        file !== 'index.js' &&
        file.endsWith('.model.js')
    );

// Fail fast if no models exist
if (!modelFiles.length) {
    throw new Error('❌ No model files found in models directory');
}

// =========================
// LOAD MODELS SAFELY
// =========================
for (const file of modelFiles) {
    try {

        const modelDefiner = require(path.join(__dirname, file));

        // Validate export
        if (typeof modelDefiner !== 'function') {
            throw new Error(`${file} does not export a valid Sequelize model function`);
        }

        // Initialize model
        const model = modelDefiner(sequelize, DataTypes);

        // Validate model
        if (!model || !model.name) {
            throw new Error(`${file} failed to initialize properly`);
        }

        // Store model
        models[model.name] = model;

        console.log(`📦 Loaded model: ${model.name}`);

    } catch (err) {

        console.error(`❌ Failed to load model file: ${file}`);
        console.error(err.message);

        // Fail fast to prevent partial boot
        process.exit(1);
    }
}

// =========================
// RUN ASSOCIATIONS SAFELY
// =========================
for (const modelName of Object.keys(models)) {

    try {

        const model = models[modelName];

        if (typeof model.associate === 'function') {

            model.associate(models);

            console.log(`🔗 Associated model: ${modelName}`);
        }

    } catch (err) {

        console.error(`❌ Association failed for model: ${modelName}`);
        console.error(err.message);

        process.exit(1);
    }
}

// =========================
// CRITICAL MODEL CHECKS
// =========================
const requiredModels = [
    'User',
    'Booking'
];

for (const modelName of requiredModels) {

    if (!models[modelName]) {

        console.error(`❌ Critical model missing: ${modelName}`);

        process.exit(1);
    }
}

// =========================
// EXPORT EVERYTHING
// =========================
module.exports = {
    sequelize,
    Sequelize,
    ...models
};