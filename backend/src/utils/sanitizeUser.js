module.exports = (user) => {
    if (!user) return null;

    const {
        password,
        resetToken,
        resetTokenExpiry,
        ...safeUser
    } = user.dataValues;

    return safeUser;
};
