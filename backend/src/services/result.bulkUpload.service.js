// src/services/result.bulkUpload.service.js
const csv = require('csv-parser');
const fs = require('fs');
const { Result, Course, User, sequelize } = require('../models');

exports.bulkUploadResults = async (file) => {
    if (!file) {
        throw { message: 'CSV file required', status: 400 };
    }

    const rows = [];

    return new Promise((resolve, reject) => {

        fs.createReadStream(file.path)
            .pipe(csv())

            .on('data', (row) => {
                rows.push(row);
            })

            .on('end', async () => {
                const transaction = await sequelize.transaction();

                try {
                    const formatted = [];
                    let skipped = 0;

                    for (const r of rows) {

                        if (!r.email || !r.course || !r.score) {
                            skipped++;
                            continue;
                        }

                        const student = await User.findOne({
                            where: {
                                email: r.email,
                                role: 'STUDENT'
                            },
                            transaction
                        });

                        const course = await Course.findOne({
                            where: { name: r.course },
                            transaction
                        });

                        if (!student || !course) {
                            skipped++;
                            continue;
                        }

                        const score = Number(r.score);

                        if (isNaN(score)) {
                            skipped++;
                            continue;
                        }

                        formatted.push({
                            studentId: student.id,
                            courseId: course.id,
                            score,
                            grade: r.grade || null
                        });
                    }

                    // 🔥 bulk insert safely
                    if (formatted.length > 0) {
                        await Result.bulkCreate(formatted, { transaction });
                    }

                    await transaction.commit();

                    // 🧹 cleanup uploaded file
                    fs.unlink(file.path, () => {});

                    resolve({
                        message: 'Results uploaded successfully',
                        inserted: formatted.length,
                        skipped
                    });

                } catch (err) {
                    await transaction.rollback();

                    fs.unlink(file.path, () => {});

                    reject({
                        message: err.message || 'Bulk upload failed',
                        status: 500
                    });
                }
            })

            .on('error', (err) => {
                fs.unlink(file.path, () => {});

                reject({
                    message: err.message || 'CSV parsing failed',
                    status: 400
                });
            });
    });
};