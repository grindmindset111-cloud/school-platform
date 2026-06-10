// src/models/subject.model.js
module.exports = (sequelize, DataTypes) => {
    const Subject = sequelize.define(
        'Subject',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },

            name: {
                type: DataTypes.STRING(100),
                allowNull: false,
                unique: true,
                validate: {
                    notEmpty: { msg: 'Subject name cannot be empty' },
                    len: { args: [2, 100], msg: 'Subject name must be 2-100 characters' }
                }
            },

            code: {
                type: DataTypes.STRING(20),
                allowNull: false,
                unique: true,
                validate: {
                    notEmpty: { msg: 'Subject code cannot be empty' },
                    is: {
                        args: /^[A-Z0-9]+$/,
                        msg: 'Subject code must be uppercase alphanumeric'
                    }
                }
            },

            classLevelId: {
                type: DataTypes.INTEGER,
                allowNull: false
            },

            courseId: {
                type: DataTypes.INTEGER,
                allowNull: false
            }
        },
        {
            tableName: 'subjects',
            timestamps: true
        }
    );

    // =========================
    // ASSOCIATIONS
    // =========================
    Subject.associate = (models) => {

        // 🔥 MANY-TO-MANY: SUBJECT ↔ TEACHERS
        Subject.belongsToMany(models.User, {
            through: 'SubjectTeachers', // junction table
            as: 'teachers',
            foreignKey: 'subjectId',
            otherKey: 'teacherId',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });

        // 🔗 SUBJECT → CLASS LEVEL
        Subject.belongsTo(models.ClassLevel, {
            as: 'classLevel',
            foreignKey: { name: 'classLevelId', allowNull: false },
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE'
        });

        // 🔗 SUBJECT → COURSE
        Subject.belongsTo(models.Course, {
            as: 'course',
            foreignKey: { name: 'courseId', allowNull: false },
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE'
        });

        // 🔗 SUBJECT → BOOKINGS
        Subject.hasMany(models.Booking, {
            as: 'bookings',
            foreignKey: 'subjectId',
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE'
        });

        // 🔗 SUBJECT → RESULTS
        Subject.hasMany(models.Result, {
            as: 'results',
            foreignKey: 'subjectId',
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE'
        });
    };

    return Subject;
};