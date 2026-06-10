// src/controllers/result.bulkUpload.controller.js
const csv = require('csv-parser');
const fs = require('fs');
const { Result } = require('../models');
const { success, error } = require('../utils/response.utils');
const audit = require('../utils/audit.utils');

/**
 * Bulk upload results from CSV
 * Admin / Staff only
 */
exports.bulkUploadResults = async (req, res) => {
    try {
        if (!req.file) return error(res, 'CSV file required', 400);

        const results = [];
        fs.createReadStream(req.file.path)
            .pipe(csv())
            .on('data', (row) => results.push(row))
            .on('end', async () => {
                const createdResults = await Result.bulkCreate(
                    results.map(r => ({
                        studentId: r.studentId,
                        courseId: r.courseId,
                        score: r.score,
                        grade: r.grade,
                        semester: r.semester,
                        session: r.session,
                        locked: false
                    }))
                );

                // Log the bulk upload action
                await audit({
                    action: 'BULK_UPLOAD_RESULTS',
                    entity: 'Result',
                    entityId: null,
                    userId: req.user.id,
                    metadata: { count: createdResults.length }
                });

                success(res, createdResults, 'Results uploaded successfully');
            });
    } catch (err) {
        error(res, err.message, err.status);
    }
};
