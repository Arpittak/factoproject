const express = require('express');
const router = express.Router();
const {
  createVendor,
  getAllVendors,
  getVendorById,
  updateVendor,
  checkCompanyNameAvailability,
  checkGstAvailability,
  getVendorAnalytics  // Add this import
} = require('../controllers/vendorsController');

// Static routes FIRST (most specific)
router.get('/analytics', getVendorAnalytics);
router.get('/check-company-name/:name', checkCompanyNameAvailability);
router.get('/check-gst/:gst', checkGstAvailability);

// Dynamic routes LAST (less specific)
router.post('/', createVendor);
router.get('/', getAllVendors);
router.get('/:id', getVendorById);
router.put('/:id', updateVendor);

module.exports = router;