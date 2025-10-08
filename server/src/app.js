const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import routes
const vendorRoutes = require('./routes/vendors');
const inventoryRoutes = require('./routes/inventory');
const masterDataRoutes = require('./routes/masterData'); 
const procurementRoutes = require('./routes/procurements');
const vendorProcurementRoutes = require('./routes/vendorProcurementRoutes');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

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
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
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
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/vendors', vendorRoutes); 
app.use('/api/inventory', inventoryRoutes);
app.use('/api/master', masterDataRoutes);
app.use('/api/procurements', procurementRoutes);
app.use('/api/vendor-procurement', vendorProcurementRoutes);

// 404 Handler - Must be after all routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Cannot ${req.method} ${req.path}`
  });
});

// Global Error Handler - Must be last
app.use(errorHandler);

module.exports = app;
