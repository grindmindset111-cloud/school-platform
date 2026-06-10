const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Audit = sequelize.define('Audit', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        action: { 
            type: DataTypes.STRING,
            allowNull: false 
        },
        entity: { 
            type: DataTypes.STRING,
            allowNull: false 
        },
        entityId: { 
            type: DataTypes.INTEGER,
            allowNull: true 
        },
        userId: { 
            type: DataTypes.INTEGER,
            allowNull: false 
        },
        timestamp: { 
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW 
        }
    });

    return Audit;
};
