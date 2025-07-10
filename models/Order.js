// models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  proxyName: { type: String, required: true },
  proxyPhone: { type: String, required: true },
  maskedAddress: { type: String, required: true },
  realAddress: { type: String, required: true },
  unlocked: { type: Boolean, default: false },

  otp: String,
  otpExpiry: Date,
  breachCount: { type: Number, default: 0 },

  courierLocation: {
    lat: String,
    long: String,
    lastUpdated: String
  },

  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Order', orderSchema);
