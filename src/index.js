require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const logsRoutes = require('./routes/logs');
const errorHandler = require('./middleware/errorHandler');
const productsRoutes = require('./routes/products');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/logs', logsRoutes);
app.use('/products', productsRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handling middleware (must be at the end)
app.use(errorHandler);

// Start server
connectDB().then(() => {
  app.listen(PORT, () => {
    // Server started successfully
  });
}).catch(err => {
  console.error('❌ Failed to connect to database:', err.message);
  process.exit(1);
});