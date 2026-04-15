const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  name: { type: String },
  password: { type: String }, // hashed password stored temporarily
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300, // Auto delete after 5 minutes (TTL index)
  },
});

module.exports = mongoose.model('OTP', otpSchema);
