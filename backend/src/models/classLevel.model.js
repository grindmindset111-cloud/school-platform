// src/models/classLevel.model.js
module.exports = (sequelize, DataTypes) => {
    const ClassLevel = sequelize.define(
        'ClassLevel',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            name: {
                type: DataTypes.STRING(50),
                allowNull: false,
                unique: true,
                validate: {
                    notEmpty: { msg: 'Class level name cannot be empty' },
                    len: { args: [2, 50], msg: 'Class level name must be 2-50 characters' }
                }
            }
        },
        {
            tableName: 'class_levels',
            timestamps: true,
            hooks: {
                beforeValidate(classLevel) {
                    if (classLevel.name) classLevel.name = classLevel.name.trim().toUpperCase();
                }
            }
        }
    );

    ClassLevel.associate = (models) => {
        // Users (students/teachers)
        ClassLevel.hasMany(models.User, {
            foreignKey: 'classLevelId',
            onDelete: 'SET NULL', // keep user but remove classLevel
            onUpdate: 'CASCADE'
        });

        // Subjects
        ClassLevel.hasMany(models.Subject, {
            foreignKey: 'classLevelId',
            onDelete: 'RESTRICT', // cannot delete classLevel if subjects exist
            onUpdate: 'CASCADE'
        });

        // Bookings
        ClassLevel.hasMany(models.Booking, {
            foreignKey: 'classLevelId',
            onDelete: 'RESTRICT', // safer: cannot delete classLevel if bookings exist
            onUpdate: 'CASCADE'
        });

        // Results
        ClassLevel.hasMany(models.Result, {
            foreignKey: 'classLevelId',
            onDelete: 'RESTRICT', // safer: prevent accidental loss of results
            onUpdate: 'CASCADE'
        });
    };

    return ClassLevel;
};