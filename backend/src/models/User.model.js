// src/models/user.model.js
const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
    const User = sequelize.define(
        'User',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            name: {
                type: DataTypes.STRING(100),
                allowNull: false,
                validate: {
                    notEmpty: { msg: 'Name is required' },
                    len: { args: [2, 100], msg: 'Name must be between 2 and 100 characters' }
                }
            },
            email: {
                type: DataTypes.STRING(150),
                allowNull: false,
                unique: true,
                validate: {
                    isEmail: { msg: 'Invalid email format' },
                    notEmpty: { msg: 'Email is required' }
                }
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    len: { args: [9, 100], msg: 'Password must be at least 9 characters' }
                }
            },
            role: {
                type: DataTypes.ENUM('ADMIN', 'STAFF', 'STUDENT'),
                allowNull: false,
                defaultValue: 'STUDENT'
            },
            classLevelId: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            resetToken: DataTypes.STRING,
            resetTokenExpiry: DataTypes.DATE
        },
        {
            tableName: 'users',
            timestamps: true,
            paranoid: true,
            indexes: [{ unique: true, fields: ['email'] }],
            hooks: {
                beforeValidate(user) {
                    if (user.email) user.email = user.email.trim().toLowerCase();
                    if (user.name) user.name = user.name.trim();
                },
                async beforeCreate(user) {
                    if (user.password) user.password = await bcrypt.hash(user.password, 10);
                },
                async beforeUpdate(user) {
                    if (user.changed('password')) user.password = await bcrypt.hash(user.password, 10);
                }
            },
            defaultScope: {
                attributes: { exclude: ['password', 'resetToken', 'resetTokenExpiry'] }
            },
            scopes: {
                withSensitiveData: {
                    attributes: { include: ['password', 'resetToken', 'resetTokenExpiry'] }
                }
            }
        }
    );

    // =========================
    // ASSOCIATIONS
    // =========================
    User.associate = (models) => {

        // 🔥 MANY-TO-MANY: TEACHERS ↔ SUBJECTS
        User.belongsToMany(models.Subject, {
            through: 'SubjectTeachers', // junction table
            as: 'teachingSubjects',
            foreignKey: 'teacherId',
            otherKey: 'subjectId',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });

        // STUDENT → BOOKINGS
        User.hasMany(models.Booking, {
            as: 'bookings',
            foreignKey: 'studentId',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });

        // STUDENT → RESULTS
        User.hasMany(models.Result, {
            as: 'results',
            foreignKey: 'studentId',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });

        // USER → CLASS LEVEL
        User.belongsTo(models.ClassLevel, {
            as: 'classLevel',
            foreignKey: 'classLevelId',
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE'
        });

        // USER → NOTIFICATIONS
        User.hasMany(models.Notification, {
            as: 'notifications',
            foreignKey: 'userId',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });
    };

    // =========================
    // PASSWORD COMPARISON
    // =========================
    User.prototype.comparePassword = async function (password) {
        return bcrypt.compare(password, this.password);
    };

    return User;
};