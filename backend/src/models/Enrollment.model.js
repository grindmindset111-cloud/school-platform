const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('Enrollment', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        studentId: { type: DataTypes.INTEGER, allowNull: false }, // link to User
        courseId: { type: DataTypes.INTEGER, allowNull: false },  // link to Course
        session: DataTypes.STRING,
        semester: DataTypes.STRING
    });
};
