const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('Resource', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING, allowNull: false },
        description: DataTypes.STRING,
        capacity: { type: DataTypes.INTEGER, defaultValue: 1 }
    });
};
