const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('Staff', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        userId: { type: DataTypes.INTEGER, allowNull: false }, // link to User
        phone: DataTypes.STRING,
        office: DataTypes.STRING,
        departmentId: { type: DataTypes.INTEGER }
    });
};
