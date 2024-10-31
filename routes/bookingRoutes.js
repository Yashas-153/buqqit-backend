const express = require('express');
const {
  createBooking,
  getBookings
} = require('../controllers/bookingController');
const {isUser} = require("../middleware/authMiddleware")
const router = express.Router();

router.post('/', isUser,createBooking); // Create a booking
router.get('/', getBookings);     // Get bookings by booking_id, user_id, or studio_id

module.exports = router;
