// src/middlewares/error.middleware.js

module.exports = (err, req, res, next) => {

    console.error('🔥 ERROR:', err);

    const statusCode = err.status || 500;

    res.status(statusCode).json({
        success: false,
        status: 'error',
        message: err.message || 'Internal Server Error',
        errors: err.errors || null,

        // Show stack only in development
        ...(process.env.NODE_ENV === 'development' && {
            stack: err.stack
        })
    });
};