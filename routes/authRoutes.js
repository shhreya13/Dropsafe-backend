// routes/authRoutes.js
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const SECRET_KEY = 'dropsafe_secret_123'; // You can move to .env

// Dummy courier account
const courierUser = {
  username: 'courier001',
  password: 'pass123'
};

// POST /api/courier/login
router.post('/api/courier/login', (req, res) => {
  const { username, password } = req.body;

  if (username === courierUser.username && password === courierUser.password) {
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
    return res.json({ token });
  }

  res.status(401).json({ message: 'Invalid credentials' });
});

module.exports = router;








