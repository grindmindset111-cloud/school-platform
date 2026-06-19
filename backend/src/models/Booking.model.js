module.exports = (sequelize, DataTypes) => {

    const Booking = sequelize.define(
        'Booking',
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

            resourceId: {
                type: DataTypes.INTEGER,
                allowNull: true
            },

            subjectId: {
                type: DataTypes.INTEGER,
                allowNull: false
            },

            date: {
                type: DataTypes.DATEONLY,
                allowNull: false,
                validate: {
                    isDate: true
                }
            },

            startTime: {
                type: DataTypes.TIME,
                allowNull: false
            },

            endTime: {
                type: DataTypes.TIME,
                allowNull: false
            },

            status: {
                type: DataTypes.ENUM('pending', 'approved', 'rejected', 'cancelled', 'expired'),
                defaultValue: 'pending'
            },

            attendanceStatus: {
                type: DataTypes.ENUM('present', 'absent', 'late', 'excused', 'unmarked'),
                defaultValue: 'unmarked'
            },

            // =========================
            // QUEUE SYSTEM (SIMPLIFIED + CLEAN)
            // =========================
            queueStatus: {
                type: DataTypes.ENUM('queued', 'processing', 'completed', 'failed'),
                defaultValue: 'queued'
            },

            queuePosition: {
                type: DataTypes.INTEGER,
                allowNull: true
            },

            retryCount: {
                type: DataTypes.INTEGER,
                defaultValue: 0
            }
        },
        {
            tableName: 'bookings',
            timestamps: true,

            indexes: [
                // 🚨 Prevent SAME exact duplicate booking (keep but safe)
                {
                    unique: true,
                    fields: ['studentId', 'date', 'startTime', 'endTime']
                },

                // ⚡ Performance indexes
                { fields: ['studentId'] },
                { fields: ['date'] },
                { fields: ['status'] },
                { fields: ['queueStatus'] },
                { fields: ['queuePosition'] },
                { fields: ['resourceId'] },
                { fields: ['subjectId'] }
            ],

            validate: {
                timeOrder() {
                    if (this.startTime >= this.endTime) {
                        throw new Error('End time must be after start time');
                    }
                }
            }
        }
    );

    // =========================
    // ASSOCIATIONS
    // =========================
    Booking.associate = (models) => {

        Booking.belongsTo(models.User, {
            as: 'student',
            foreignKey: 'studentId',
            onDelete: 'CASCADE'
        });

        Booking.belongsTo(models.ClassLevel, {
            as: 'classLevel',
            foreignKey: 'classLevelId',
            onDelete: 'RESTRICT'
        });

        Booking.belongsTo(models.Resource, {
            as: 'resource',
            foreignKey: 'resourceId',
            onDelete: 'SET NULL'
        });

        Booking.belongsTo(models.Subject, {
            as: 'subject',
            foreignKey: 'subjectId',
            onDelete: 'RESTRICT'
        });
    };

    return Booking;
};