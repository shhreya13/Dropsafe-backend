const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const orderRoutes = require('./routes/orderRoutes');

const app = express();

app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb://127.0.0.1:27017/dropsafe')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

app.use(orderRoutes);

const authRoutes = require('./routes/authRoutes');
app.use(authRoutes);


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ DropSafe backend running on http://localhost:${PORT}`);
});
