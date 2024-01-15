const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  name: String,
  seatNumber: String,
  time: String
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
