// src/models/Semester.model.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('Semester', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING, allowNull: false }, // e.g. "First", "Second"
        startDate: { type: DataTypes.DATEONLY, allowNull: false },
        endDate: { type: DataTypes.DATEONLY, allowNull: false },
        sessionId: { type: DataTypes.INTEGER, allowNull: false }
    });
};
