const express = require('express');
const cors = require('cors');
require('dotenv').config();


// Import routes
const vendorRoutes = require('./src/routes/vendors');
const inventoryRoutes = require('./src/routes/inventory');
const masterDataRoutes = require('./src/routes/masterData'); 
const procurementRoutes = require('./src/routes/procurements');

const app = express();

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow localhost and ngrok domains
    if (!origin || origin.includes('localhost') || origin.includes('ngrok.io')) {
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

// Use the vendor routes
app.use('/api/vendors', vendorRoutes); 
app.use('/api/inventory', inventoryRoutes);
app.use('/api/master', masterDataRoutes);
app.use('/api/procurements', procurementRoutes);   

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});