// controllers/orderController.js
const mongoose = require('mongoose');
const Order = require('../models/Order');
const BreachLog = require('../models/BreachLog');
const { generateMaskedName, generateProxyPhone, logEvent } = require('../utils/proxyUtils');

// Validate MongoDB ObjectId
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id.trim());
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// 📦 Place Order
exports.placeOrder = async (req, res) => {
  const { name, phone, address } = req.body;
  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  const order = new Order({
    proxyName: generateMaskedName(name),
    proxyPhone: generateProxyPhone(phone),
    maskedAddress: "Delivery Address Hidden",
    realAddress: address,
    unlocked: false,
    otp,
    otpExpiry
  });

  await order.save();
  logEvent(`🆕 Order placed for ${name} → OTP: ${otp}`);

  res.json({
    message: "Order placed with masked data",
    orderId: order._id,
    maskedData: {
      proxyName: order.proxyName,
      proxyPhone: order.proxyPhone,
      maskedAddress: order.maskedAddress
    }
  });
};

// 🚪 Unlock Address
exports.unlockAddress = async (req, res) => {
  const id = req.params.id.trim();
  const { location } = req.body;

  if (!isValidId(id)) return res.status(400).json({ message: "Invalid Order ID" });

  const order = await Order.findById(id);
  if (!order) return res.status(404).json({ message: "Order not found" });

  if (location?.lat && location?.long) {
    order.unlocked = true;
    await order.save();
    logEvent(`✅ Address unlocked via GPS for Order ${id}`);
    return res.json({ address: order.realAddress });
  }

  logEvent(`❌ Access denied: Courier not nearby for Order ${id}`);
  res.status(403).json({ message: "Access denied: Courier not nearby" });
};

// 🔐 Verify OTP
exports.verifyOTP = async (req, res) => {
  const id = req.params.id.trim();
  const { otp } = req.body;

  if (!isValidId(id)) return res.status(400).json({ message: "Invalid Order ID" });

  const order = await Order.findById(id);
  if (!order) return res.status(404).json({ message: "Order not found" });

  if (new Date() > order.otpExpiry) {
    await BreachLog.create({ orderId: id, reason: "OTP expired" });
    return res.status(403).json({ message: "OTP expired" });
  }

  if (otp !== order.otp) {
    await BreachLog.create({ orderId: id, reason: "Invalid OTP" });
    order.breachCount += 1;
    await order.save();
    return res.status(403).json({ message: "Invalid OTP" });
  }

  order.unlocked = true;
  order.otp = null;
  await order.save();

  logEvent(`✅ OTP verified for Order ${id}`);
  res.json({ status: "OTP verified. Delivery confirmed." });
};

// 📍 Update Courier Location
exports.updateCourierLocation = async (req, res) => {
  const id = req.params.id.trim();
  const { lat, long } = req.body;

  if (!isValidId(id)) return res.status(400).json({ message: "Invalid Order ID" });

  const order = await Order.findById(id);
  if (!order) return res.status(404).json({ message: "Order not found" });

  order.courierLocation = { lat, long, lastUpdated: new Date().toISOString() };
  await order.save();

  logEvent(`📍 Location updated for Order ${id}: ${lat}, ${long}`);
  res.json({ message: "Location updated" });
};

// 👀 Get Courier Location
exports.getCourierLocation = async (req, res) => {
  const id = req.params.id.trim();

  if (!isValidId(id)) return res.status(400).json({ message: "Invalid Order ID" });

  const order = await Order.findById(id);
  if (!order || !order.courierLocation) {
    return res.status(404).json({ message: "Location not available yet" });
  }

  logEvent(`📦 Location checked for Order ${id}`);
  res.json(order.courierLocation);
};

// 🚨 Fake Courier Attempt
exports.fakeCourierAttempt = async (req, res) => {
  const id = req.params.id.trim();

  if (!isValidId(id)) return res.status(400).json({ message: "Invalid Order ID" });

  const order = await Order.findById(id);
  if (!order) return res.status(404).json({ message: "Order not found" });

  if (!order.unlocked) {
    await BreachLog.create({
      orderId: id,
      reason: "Unauthorized access before unlock"
    });

    logEvent(`🚨 Breach attempt blocked for Order ${id}`);
    return res.status(403).json({ message: "❌ Unauthorized access blocked." });
  }

  logEvent(`⚠️ Courier accessed real data for Order ${id}`);
  res.json({ address: order.realAddress });
};

// 📜 Get Breach Logs
exports.getBreaches = async (req, res) => {
  const orderId = req.params.id.trim();
  const logs = await BreachLog.find({ orderId }).sort({ attemptTime: -1 });

  res.json({ breaches: logs });
};
