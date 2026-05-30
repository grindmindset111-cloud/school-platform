// src/routes/booking.routes.js

const router = require('express').Router();

const bookingController =
    require('../controllers/booking.controller');

// 🔐 Authentication middleware
const auth =
    require('../middlewares/auth.middleware');

// 🔐 Permission middleware
const permit =
    require('../middlewares/permission.middleware');


/*
|------------------------------------------------------------------
| BOOKING ROUTES (HARDENED)
|------------------------------------------------------------------
*/


/**
 * ==========================================================
 * CREATE BOOKING
 * ==========================================================
 */
router.post(
    '/',
    auth,
    permit('BOOKING_CREATE'),
    bookingController.createBooking
);


/**
 * ==========================================================
 * GET BOOKINGS
 * ==========================================================
 */
router.get(
    '/',
    auth,
    permit('BOOKING_VIEW'),
    bookingController.getBookings
);


/**
 * ==========================================================
 * CHECK AVAILABILITY
 * ==========================================================
 */
router.get(
    '/availability',
    auth,
    permit('BOOKING_VIEW'),
    bookingController.getAvailability
);


/**
 * ==========================================================
 * BULK UPDATE BOOKINGS
 * ==========================================================
 */
router.patch(
    '/bulk',
    auth,
    permit('BOOKING_UPDATE'),
    bookingController.bulkUpdateBookings
);


/**
 * ==========================================================
 * UPDATE SINGLE BOOKING
 * ==========================================================
 */
router.patch(
    '/:id',
    auth,
    permit('BOOKING_UPDATE'),
    bookingController.updateBooking
);


module.exports = router;