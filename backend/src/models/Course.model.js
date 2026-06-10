// src/models/course.model.js
module.exports = (sequelize, DataTypes) => {
    const Course = sequelize.define(
        'Course',
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
                    notEmpty: { msg: 'Course name cannot be empty' },
                    len: { args: [2, 100], msg: 'Course name must be 2-100 characters' }
                }
            }
        },
        {
            tableName: 'courses',
            timestamps: true // keeps track of createdAt / updatedAt
        }
    );

    Course.associate = (models) => {
        // A Course has many Subjects
        Course.hasMany(models.Subject, {
            foreignKey: 'courseId',
            onDelete: 'RESTRICT', // prevent deletion if subjects exist
            onUpdate: 'CASCADE'
        });

        // A Course has many Results
        Course.hasMany(models.Result, {
            foreignKey: 'courseId',
            onDelete: 'RESTRICT', // prevent deletion if results exist
            onUpdate: 'CASCADE'
        });
    };

    return Course;
};