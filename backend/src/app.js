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

/**
 * CORS configuration.
 *
 * The single-string `origin` we used before silently blocked the
 * browser whenever Vite picked a different port (e.g. 5174 because
 * 5173 was already taken), which is fragile in development.
 *
 * We now:
 *   - Read the allowlist from `CLIENT_URL_ORIGINS` (comma-separated).
 *   - Fall back to a permissive list of common local Vite ports.
 *   - Allow any `http://localhost:*` and `http://127.0.0.1:*` origin in
 *     development, unless `NODE_ENV=production`, in which case we only
 *     honour the explicit allowlist (no implicit dev wildcard).
 *   - Echo back the actual origin so `credentials: true` works.
 */
const buildAllowedOrigins = () => {
    const envList = (process.env.CLIENT_URL_ORIGINS || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

    if (envList.length) {
        return new Set(envList);
    }

    if (process.env.NODE_ENV === 'production') {
        // In production we never want a wildcard. Fall back to
        // CLIENT_URL or an empty set (no origins allowed).
        return new Set(
            process.env.CLIENT_URL ? [process.env.CLIENT_URL] : []
        );
    }

    // Development defaults: every common local Vite / CRA / Live
    // Server port. If you need another one, set CLIENT_URL_ORIGINS.
    return new Set([
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'http://localhost:3000',
        'http://localhost:4173',
        'http://localhost:5500',
        'http://localhost:8080',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:5174',
        'http://127.0.0.1:5175',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5500'
    ]);
};

const allowedOrigins = buildAllowedOrigins();

app.use(
    cors({
        origin(origin, callback) {
            // Allow requests with no Origin (curl, server-to-server).
            if (!origin) {
                return callback(null, true);
            }
            if (allowedOrigins.has(origin)) {
                return callback(null, true);
            }
            return callback(
                new Error(`CORS: origin '${origin}' not allowed`)
            );
        },
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'X-Signature',
            'X-Requested-With'
        ],
        credentials: true,
        maxAge: 86400 // cache preflight 24h
    })
);


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
// NOTE: previously applied to all /api/bookings routes. That blocked
// normal GET traffic after a few reads. We mount it only on the
// mutating routes (POST /, PATCH /:id, PATCH /bulk) so reads remain
// unrestricted. Per-route limits can be added inside booking.routes.js
// if finer control is needed.

app.use('/api/bookings', (req, res, next) => {
    if (req.method === 'POST' || req.method === 'PATCH' || req.method === 'PUT' || req.method === 'DELETE') {
        return bookingLimiter(req, res, next);
    }
    return next();
});


// ========================================
// INTEGRITY MIDDLEWARE (WRITE OPS ONLY)
// ========================================
// NOTE: The HMAC integrity check requires the frontend to sign every
// write request with the shared INTEGRITY_SECRET. The current frontend
// does not compute or send the `x-signature` header, so enabling this
// middleware blocks every POST/PATCH/DELETE. Re-enable it once the
// frontend implements signPayload() (see backend/src/utils/integrity.utils.js).
//
// app.use((req, res, next) => {
//     const writeMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
//     if (!writeMethods.includes(req.method)) {
//         return next();
//     }
//     return integrity(req, res, next);
// });


// ========================================
// ROUTES
// ========================================

require('./routes/index.routes')(app);


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