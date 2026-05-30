// src/controllers/user.controller.js
const fs = require('fs');
const csv = require('csv-parser');
const bcrypt = require('bcryptjs');
const { User, ClassLevel } = require('../models');
const { success, error } = require('../utils/response.utils');
const audit = require('../utils/audit.utils');

exports.bulkUploadStudents = async (req, res) => {
    try {
        if (req.user.role !== 'ADMIN') {
            return error(res, 'Unauthorized', 403);
        }

        if (!req.file) {
            return error(res, 'CSV file required', 400);
        }

        // 1️⃣ Read CSV
        const rows = [];
        await new Promise((resolve, reject) => {
            fs.createReadStream(req.file.path)
                .pipe(csv())
                .on('data', (row) => rows.push(row))
                .on('end', resolve)
                .on('error', reject);
        });

        if (rows.length === 0) {
            try { fs.unlinkSync(req.file.path); } catch {}
            return error(res, 'CSV file is empty', 400);
        }

        // 2️⃣ Fetch valid classLevels
        const classLevels = await ClassLevel.findAll({ attributes: ['id'] });
        const validClassLevelIds = new Set(classLevels.map(c => c.id));

        // 3️⃣ Fetch existing emails in DB to skip duplicates
        const existingEmails = new Set(
            (await User.findAll({ where: { email: rows.map(r => r.email?.trim().toLowerCase()) }, attributes: ['email'] }))
                .map(u => u.email)
        );

        const studentsToInsert = [];
        let skipped = 0;

        // 4️⃣ Prepare data for bulk insert
        for (const r of rows) {
            const name = r.name?.trim();
            const email = r.email?.trim().toLowerCase();
            const password = r.password?.trim();
            const classLevelId = r.classLevelId ? Number(r.classLevelId) : null;

            if (!name || !email || !password) { skipped++; continue; }
            if (classLevelId && !validClassLevelIds.has(classLevelId)) { skipped++; continue; }
            if (existingEmails.has(email)) { skipped++; continue; }

            studentsToInsert.push({ name, email, password, role: 'STUDENT', classLevelId });
        }

        // 5️⃣ Hash passwords in parallel
        await Promise.all(
            studentsToInsert.map(async (s) => {
                s.password = await bcrypt.hash(s.password, 10);
            })
        );

        // 6️⃣ Bulk insert
        if (studentsToInsert.length > 0) {
            await User.bulkCreate(studentsToInsert);
        }

        // 7️⃣ Audit
        await audit({
            action: 'BULK_UPLOAD_STUDENTS',
            entity: 'User',
            entityId: null,
            userId: req.user.id
        });

        // 8️⃣ Delete uploaded CSV
        try { fs.unlinkSync(req.file.path); } catch {}

        return success(res, {
            created: studentsToInsert.length,
            skipped
        }, 'Students imported successfully');

    } catch (err) {
        console.error('Bulk upload error:', err);
        try { if (req.file?.path) fs.unlinkSync(req.file.path); } catch {}
        return error(res, 'Failed to import students', 500);
    }
};
