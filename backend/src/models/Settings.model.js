// src/models/Settings.model.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('Settings', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        key: { type: DataTypes.STRING, unique: true },
        value: { type: DataTypes.STRING }
    });
};
