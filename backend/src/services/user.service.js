// seed/importStudents.js
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const bcrypt = require('bcryptjs');
const { User, ClassLevel, sequelize } = require('../src/models');

const CSV_FILE = path.join(__dirname, '../students.csv');

(async () => {
    try {
        await sequelize.authenticate();
        console.log('🟢 Database connected');

        const rows = [];

        // =========================
        // READ CSV
        // =========================
        await new Promise((resolve, reject) => {
            fs.createReadStream(CSV_FILE)
                .pipe(csv())
                .on('data', (row) => rows.push(row))
                .on('end', resolve)
                .on('error', reject);
        });

        console.log(`📄 Read ${rows.length} rows from CSV`);

        // =========================
        // CLASS LEVEL CACHE
        // =========================
        const classLevelMap = {};

        for (const row of rows) {
            const name = row.classLevelName?.trim()?.toUpperCase();

            if (!name) continue;

            if (!classLevelMap[name]) {
                const [classLevel] = await ClassLevel.findOrCreate({
                    where: { name }
                });

                classLevelMap[name] = classLevel.id;
            }
        }

        // =========================
        // EXISTING USERS CACHE
        // =========================
        const existingUsers = await User.findAll({
            attributes: ['email']
        });

        const existingEmails = new Set(
            existingUsers.map(u => u.email)
        );

        // =========================
        // BUILD USERS
        // =========================
        const usersToInsert = [];

        for (const row of rows) {
            const email = row.email?.trim().toLowerCase();

            if (!row.name || !email || !row.password) {
                console.log(`⚠️ Skipping invalid row: ${JSON.stringify(row)}`);
                continue;
            }

            if (existingEmails.has(email)) {
                console.log(`⏭️ Duplicate skipped: ${email}`);
                continue;
            }

            const classLevelId = row.classLevelName
                ? classLevelMap[row.classLevelName.trim().toUpperCase()]
                : null;

            usersToInsert.push({
                name: row.name.trim(),
                email,
                password: await bcrypt.hash(row.password, 10),
                role: 'STUDENT',
                classLevelId
            });
        }

        // =========================
        // INSERT USERS SAFELY
        // =========================
        let inserted = [];

        if (usersToInsert.length > 0) {
            inserted = await User.bulkCreate(usersToInsert, {
                ignoreDuplicates: true
            });
        }

        // =========================
        // CLEANUP
        // =========================
        fs.unlinkSync(CSV_FILE);

        console.log(`✅ Imported students: ${inserted.length}`);
        console.log(`⏭️ Total processed: ${rows.length}`);
        console.log('🎉 Import finished successfully');

        process.exit(0);

    } catch (err) {
        console.error('❌ Import failed:', err.message || err);
        process.exit(1);
    }
})();