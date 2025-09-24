const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorsController');

// Route to get all vendors
router.get('/', vendorController.getAllVendors);

// Route to create a new vendor
router.post('/', vendorController.createVendor);

module.exports = router;