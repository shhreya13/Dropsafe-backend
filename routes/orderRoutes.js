// routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const {
  placeOrder,
  unlockAddress,
  verifyOTP,
  updateCourierLocation,
  getCourierLocation,
  fakeCourierAttempt,
  getBreaches
} = require('../controllers/orderController');

// 🔐 JWT Auth Middleware
const { verifyToken } = require('../middleware/authMiddleware');

// ✅ Place new order (no auth needed)
router.post('/api/orders', placeOrder);

// 🔐 Protected Routes (Courier login required)
router.post('/api/orders/unlock/:id', verifyToken, unlockAddress);        // Unlock address via GPS
router.post('/api/orders/verify/:id', verifyToken, verifyOTP);            // OTP verification
router.post('/api/orders/location/:id', verifyToken, updateCourierLocation); // Update courier location
router.get('/api/orders/location/:id', verifyToken, getCourierLocation);     // Get courier location

// 🚨 Fake Courier Attempt Simulation (open route)
router.get('/api/scam/attempt/:id', fakeCourierAttempt);

// 📜 Breach Log Retrieval
router.get('/api/breaches/:id', verifyToken, getBreaches);                // Get breach logs (optional: can protect)

module.exports = router;
