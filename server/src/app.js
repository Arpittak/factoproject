const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import routes
const vendorRoutes = require('./routes/vendors');
const inventoryRoutes = require('./routes/inventory');
const masterDataRoutes = require('./routes/masterData'); 
const procurementRoutes = require('./routes/procurements');
const vendorProcurementRoutes = require('./routes/vendorProcurementRoutes');
const { CustomError } = require('./utils/errors');

const app = express();

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (Postman, server-to-server, etc.)
    if (!origin) {
      return callback(null, true);
    }
    
    // Allow localhost and ngrok domains
    if (origin.includes('localhost') || origin.includes('ngrok.io')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// A simple test route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Facto Clone API!' });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Facto Clone API is running',
    uptime: process.uptime()
  });
});

// Use the routes
app.use('/api/vendors', vendorRoutes); 
app.use('/api/inventory', inventoryRoutes);
app.use('/api/master', masterDataRoutes);
app.use('/api/procurements', procurementRoutes);
app.use('/api/vendor-procurement', vendorProcurementRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);

  // Handle custom errors
  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message
    });
  }

  // Handle CORS errors
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      error: 'CORS policy: Origin not allowed'
    });
  }

  // Handle other errors
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

module.exports = app;