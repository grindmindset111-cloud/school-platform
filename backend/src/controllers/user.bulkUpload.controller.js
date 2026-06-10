// src/controllers/user.bulkUpload.controller.js
const csv = require('csv-parser');
const fs = require('fs');
const { User } = require('../models');
const { success, error } = require('../utils/response.utils');
const audit = require('../utils/audit.utils');

/**
 * Bulk upload students from CSV (disk storage)
 * Admin only
 */
exports.bulkUploadStudents = async (req, res) => {
    try {
        if (!req.file) return error(res, 'CSV file required', 400);

        const results = [];

        fs.createReadStream(req.file.path)
            .pipe(csv())
            .on('data', (row) => {
                // Only accept rows that have all required fields
                if (row.name && row.email && row.password) {
                    results.push({
                        name: row.name.trim(),
                        email: row.email.trim(),
                        password: row.password.trim(),
                        role: 'STUDENT'
                    });
                }
            })
            .on('end', async () => {
                if (!results.length) return error(res, 'No valid rows found', 400);

                const createdUsers = await User.bulkCreate(results);

                // Log bulk upload
                await audit({
                    action: 'BULK_UPLOAD_STUDENTS',
                    entity: 'User',
                    entityId: null,
                    userId: req.user.id,
                    metadata: { count: createdUsers.length }
                });

                // Optionally, delete the uploaded file after processing
                fs.unlinkSync(req.file.path);

                success(res, createdUsers, 'Students uploaded successfully');
            })
            .on('error', (err) => {
                console.error('CSV read error:', err.message);
                error(res, 'Failed to read CSV file', 500);
            });

    } catch (err) {
        console.error(err);
        error(res, err.message, err.status || 500);
    }
};
