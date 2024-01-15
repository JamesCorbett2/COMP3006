const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  seatNumber: { type: String, required: true },
  time: { type: String, required: true },
 
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
