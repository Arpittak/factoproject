const express = require('express');
const VendorsController = require('../controllers/vendorsController');
const { validateVendor } = require('../middleware/validation');

const router = express.Router();

// Static routes FIRST (most specific)
router.get('/analytics', VendorsController.getVendorAnalytics);
router.get('/check-company-name/:name', VendorsController.checkCompanyNameAvailability);
router.get('/check-gst/:gst', VendorsController.checkGstAvailability);

// Dynamic routes LAST (less specific)
router.post('/', validateVendor, VendorsController.createVendor);
router.get('/', VendorsController.getAllVendors);
router.get('/:id', VendorsController.getVendorById);
router.put('/:id', validateVendor, VendorsController.updateVendor);

module.exports = router;