const mongoose = require('mongoose');

/**
 * OTP Schema for temporary storage of verification codes and registration data
 */
const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
  },
  otp: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  lastSentAt: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300, // Code expires after 5 minutes
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('OTP', otpSchema);
