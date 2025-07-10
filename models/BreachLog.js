// models/BreachLog.js
const mongoose = require('mongoose');

const breachLogSchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  attemptTime: { type: Date, default: Date.now },
  reason: { type: String, required: true }
});

module.exports = mongoose.model('BreachLog', breachLogSchema);
