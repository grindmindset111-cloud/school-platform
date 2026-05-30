// src/controllers/adminImportController.js
const fs = require("fs");
const csv = require("csv-parser");
const bcrypt = require("bcryptjs");
const { User, ClassLevel, sequelize } = require("../models");

exports.importStudentsFromFile = async (filePath) => {
    return new Promise((resolve, reject) => {
        const rows = [];

        fs.createReadStream(filePath)
            .pipe(csv())
            .on("data", (data) => rows.push(data))
            .on("end", async () => {
                const transaction = await sequelize.transaction();

                try {
                    if (!rows.length) {
                        fs.unlinkSync(filePath);
                        return resolve({ created: 0, skipped: 0 });
                    }

                    let skipped = 0;

                    // Normalize emails first
                    const emails = rows
                        .map(r => r.email?.trim().toLowerCase())
                        .filter(Boolean);

                    // Get all existing users at once (FAST)
                    const existingUsers = await User.findAll({
                        where: { email: emails },
                        attributes: ["email"],
                        transaction
                    });

                    const existingEmails = new Set(
                        existingUsers.map(u => u.email)
                    );

                    const usersToCreate = [];

                    for (const row of rows) {
                        const firstName = row.firstName?.trim();
                        const lastName = row.lastName?.trim();
                        const email = row.email?.trim().toLowerCase();
                        const password = row.password;
                        const classLevelName = row.classLevelName?.trim();

                        // Basic validation
                        if (!firstName || !lastName || !email || !password) {
                            skipped++;
                            continue;
                        }

                        // Skip duplicate emails
                        if (existingEmails.has(email)) {
                            skipped++;
                            continue;
                        }

                        // Find or create class level
                        let classLevel = await ClassLevel.findOne({
                            where: { name: classLevelName },
                            transaction
                        });

                        if (!classLevel && classLevelName) {
                            classLevel = await ClassLevel.create(
                                { name: classLevelName },
                                { transaction }
                            );
                        }

                        usersToCreate.push({
                            name: `${firstName} ${lastName}`,
                            email,
                            password, // Let model hook hash it
                            role: "STUDENT",
                            classLevelId: classLevel ? classLevel.id : null
                        });

                        existingEmails.add(email);
                    }

                    // 🔥 BULK INSERT WITH HOOKS
                    if (usersToCreate.length > 0) {
                        await User.bulkCreate(usersToCreate, {
                            individualHooks: true,
                            transaction
                        });
                    }

                    await transaction.commit();

                    fs.unlinkSync(filePath);

                    resolve({
                        created: usersToCreate.length,
                        skipped
                    });

                } catch (error) {
                    await transaction.rollback();
                    reject(error);
                }
            })
            .on("error", reject);
    });
};
