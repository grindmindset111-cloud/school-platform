// src/models/timetable.model.js

module.exports = (sequelize, DataTypes) => {

    const Timetable = sequelize.define(
        'Timetable',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },

            subjectId: {
                type: DataTypes.INTEGER,
                allowNull: false
            },

            resourceId: {
                type: DataTypes.INTEGER,
                allowNull: false
            },

            classLevelId: {
                type: DataTypes.INTEGER,
                allowNull: false
            },

            dayOfWeek: {
                type: DataTypes.ENUM(
                    'Monday',
                    'Tuesday',
                    'Wednesday',
                    'Thursday',
                    'Friday',
                    'Saturday',
                    'Sunday'
                ),
                allowNull: false
            },

            startTime: {
                type: DataTypes.TIME,
                allowNull: false
            },

            endTime: {
                type: DataTypes.TIME,
                allowNull: false
            },

            isActive: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true
            }
        },

        {
            tableName: 'timetables',
            timestamps: true,

            // =========================
            // INDEXES
            // =========================
            indexes: [

                // Prevent exact duplicate slots
                {
                    unique: true,
                    fields: [
                        'classLevelId',
                        'dayOfWeek',
                        'startTime',
                        'endTime'
                    ]
                },

                // Performance indexes
                { fields: ['classLevelId'] },
                { fields: ['subjectId'] },
                { fields: ['resourceId'] },
                { fields: ['dayOfWeek'] },
                { fields: ['isActive'] }
            ],

            // =========================
            // MODEL VALIDATION
            // =========================
            validate: {

                timeOrder() {

                    if (this.startTime >= this.endTime) {
                        throw new Error(
                            'End time must be after start time'
                        );
                    }
                }
            }
        }
    );

    // =========================
    // ASSOCIATIONS
    // =========================
    Timetable.associate = (models) => {

        // Timetable → Subject
        Timetable.belongsTo(models.Subject, {
            as: 'subject',

            foreignKey: {
                name: 'subjectId',
                allowNull: false
            },

            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE'
        });

        // Timetable → Resource
        Timetable.belongsTo(models.Resource, {
            as: 'resource',

            foreignKey: {
                name: 'resourceId',
                allowNull: false
            },

            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE'
        });

        // Timetable → ClassLevel
        Timetable.belongsTo(models.ClassLevel, {
            as: 'classLevel',

            foreignKey: {
                name: 'classLevelId',
                allowNull: false
            },

            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE'
        });
    };

    // =========================
    // OVERLAP PROTECTION
    // =========================
    Timetable.addHook(
        'beforeCreate',
        async (newSlot) => {

            const conflict =
                await Timetable.findOne({

                    where: {
                        classLevelId: newSlot.classLevelId,

                        dayOfWeek: newSlot.dayOfWeek,

                        [sequelize.Sequelize.Op.and]: [

                            {
                                startTime: {
                                    [sequelize.Sequelize.Op.lt]:
                                        newSlot.endTime
                                }
                            },

                            {
                                endTime: {
                                    [sequelize.Sequelize.Op.gt]:
                                        newSlot.startTime
                                }
                            }
                        ]
                    }
                });

            if (conflict) {
                throw new Error(
                    'Overlapping timetable slot detected'
                );
            }
        }
    );

    return Timetable;
};