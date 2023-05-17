const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  otp: String,
  otpGeneratedAt: Date,
  otpAttempts: { type: Number, default: 0 },
  otpBlockedUntil: Date,
});

const User = mongoose.model('UserOtp', userSchema);

module.exports = User;
