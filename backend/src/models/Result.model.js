// src/models/result.model.js
module.exports = (sequelize, DataTypes) => {
    const Result = sequelize.define(
        'Result',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },

            studentId: {
                type: DataTypes.INTEGER,
                allowNull: false
            },

            classLevelId: {
                type: DataTypes.INTEGER,
                allowNull: false
            },

            courseId: {
                type: DataTypes.INTEGER,
                allowNull: false
            },

            subjectId: {
                type: DataTypes.INTEGER,
                allowNull: false
            },

            score: {
                type: DataTypes.FLOAT,
                allowNull: false,
                defaultValue: 0, // ✅ Ensure DB default is numeric
                set(value) {
                    // Always store a number
                    const numeric = Number(value);
                    this.setDataValue('score', isNaN(numeric) ? 0 : numeric);
                },
                validate: {
                    min: { args: [0], msg: 'Score cannot be less than 0' },
                    max: { args: [100], msg: 'Score cannot exceed 100' },
                    isFloat: { msg: 'Score must be a number' } // ✅ Extra safety
                }
            },

            grade: {
                type: DataTypes.STRING(5),
                allowNull: false,
                validate: {
                    notEmpty: { msg: 'Grade is required' }
                }
            },

            released: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            },

            locked: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            }
        },
        {
            tableName: 'results',
            timestamps: true,
            indexes: [
                {
                    unique: true,
                    fields: ['studentId', 'subjectId', 'courseId']
                }
            ]
        }
    );

    // =========================
    // ASSOCIATIONS
    // =========================
    Result.associate = (models) => {
        Result.belongsTo(models.User, {
            as: 'student',
            foreignKey: 'studentId',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });

        Result.belongsTo(models.ClassLevel, {
            as: 'classLevel',
            foreignKey: 'classLevelId',
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE'
        });

        Result.belongsTo(models.Course, {
            as: 'course',
            foreignKey: 'courseId',
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE'
        });

        Result.belongsTo(models.Subject, {
            as: 'subject',
            foreignKey: 'subjectId',
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE'
        });
    };

    return Result;
};