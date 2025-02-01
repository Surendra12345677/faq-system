const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const faqRoutes = require('./src/routes/faq.routes');

// Middleware
app.use(express.json());

// Routes
app.use('/api/faqs', faqRoutes);

// Database connection
mongoose.connect('mongodb://localhost:27017/faqdb')
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Ensure you're listening on 0.0.0.0 to accept external connections
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;