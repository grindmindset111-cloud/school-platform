exports.success = (res, data, message = 'Success') => {
    res.json({
        status: 'success',
        message,
        data
    });
};

exports.error = (res, message = 'Error', status = 400) => {
    res.status(status).json({
        status: 'error',
        message
    });
};
