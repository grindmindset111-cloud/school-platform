const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const integrity = require('./middlewares/integrity.middleware');

const {
    apiLimiter,
    authLimiter,
    bookingLimiter
} = require('./security/rateLimit');

const app = express();


// ========================================
// SECURITY MIDDLEWARE
// ========================================

app.use(helmet());
app.use(compression());

app.use(cors({
    origin: process.env.CLIENT_URL || 'http://127.0.0.1:5500',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true
}));


// ========================================
// BODY PARSING
// ========================================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


// ========================================
// GLOBAL RATE LIMITING
// ========================================

app.use('/api', apiLimiter);


// ========================================
// AUTH RATE LIMITING
// ========================================

app.use('/api/auth', authLimiter, require('./routes/auth.routes'));


// ========================================
// BOOKING RATE LIMITING
// ========================================

app.use('/api/bookings', bookingLimiter, require('./routes/booking.routes'));


// ========================================
// INTEGRITY MIDDLEWARE (WRITE OPS ONLY)
// ========================================

app.use((req, res, next) => {

    const writeMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];

    if (!writeMethods.includes(req.method)) {
        return next();
    }

    return integrity(req, res, next);
});


// ========================================
// ROUTES
// ========================================

require('./index.routes')(app);


// ========================================
// HEALTH CHECK
// ========================================

app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});


// ========================================
// 404 HANDLER
// ========================================

app.use((req, res) => {
    return res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});


// ========================================
// GLOBAL ERROR HANDLER
// ========================================

app.use(require('./middlewares/error.middleware'));


// ========================================
// EXPORT
// ========================================

module.exports = app;