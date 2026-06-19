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
 * GET BOOKING BY ID
 * ==========================================================
 * NOTE: This MUST be declared BEFORE the `/:id` PATCH route
 * to avoid the PATCH handler swallowing single-segment paths
 * (Express matches routes in order).
 */
router.get(
    '/:id',
    auth,
    permit('BOOKING_VIEW'),
    bookingController.getBookingById
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