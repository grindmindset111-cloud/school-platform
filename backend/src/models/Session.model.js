// src/models/Session.model.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('Session', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING, allowNull: false }, // e.g. "2026/2027"
        startDate: { type: DataTypes.DATEONLY, allowNull: false },
        endDate: { type: DataTypes.DATEONLY, allowNull: false }
    });
};
