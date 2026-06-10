// src/models/notification.model.js
module.exports = (sequelize, DataTypes) => {
    const Notification = sequelize.define(
        'Notification',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            title: {
                type: DataTypes.STRING(150),
                allowNull: false,
                validate: {
                    notEmpty: { msg: 'Notification title cannot be empty' }
                }
            },
            message: {
                type: DataTypes.TEXT,
                allowNull: false,
                validate: {
                    notEmpty: { msg: 'Notification message cannot be empty' }
                }
            },
            type: {
                type: DataTypes.ENUM('booking', 'result', 'alert', 'announcement'),
                allowNull: false,
                defaultValue: 'alert'
            },
            isRead: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            },
            referenceId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                comment: 'Optional: ID of related entity (booking/result/etc.)'
            },
            url: {
                type: DataTypes.STRING(255),
                allowNull: true,
                comment: 'Optional: frontend URL to navigate when clicking notification'
            }
        },
        {
            tableName: 'notifications',
            timestamps: true,
            indexes: [
                {
                    fields: ['userId', 'isRead']
                }
            ]
        }
    );

    // =========================
    // ASSOCIATIONS
    // =========================
    Notification.associate = (models) => {
        Notification.belongsTo(models.User, {
            as: 'user',
            foreignKey: 'userId',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });
        // Ensure User.hasMany(Notification) exists in User model
    };

    return Notification;
};