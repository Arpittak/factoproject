const Vendor = require('../models/Vendor');
const asyncHandler = require('../middleware/asyncHandler');

class VendorsController {

  // @desc    Create a new vendor
  // @route   POST /api/vendors
  static createVendor = asyncHandler(async (req, res) => {
    const vendor = await Vendor.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Vendor created successfully',
      data: vendor
    });
  });

  // @desc    Get all vendors with pagination
  // @route   GET /api/vendors
  static getAllVendors = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    
    const result = await Vendor.findAll({ page, limit });
    
    res.status(200).json({
      success: true,
      data: result.vendors,
      pagination: result.pagination,
      message: `Found ${result.pagination.totalItems} vendors`
    });
  });

  // @desc    Get vendor by ID
  // @route   GET /api/vendors/:id
  static getVendorById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const vendor = await Vendor.findById(id);
    
    res.status(200).json({
      success: true,
      data: vendor,
      message: 'Vendor details retrieved successfully'
    });
  });

  // @desc    Update vendor
  // @route   PUT /api/vendors/:id
  static updateVendor = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const vendor = await Vendor.update(id, req.body);
    
    res.status(200).json({
      success: true,
      message: 'Vendor updated successfully',
      data: vendor
    });
  });

  // @desc    Check if company name is available
  // @route   GET /api/vendors/check-company-name/:name
  static checkCompanyNameAvailability = asyncHandler(async (req, res) => {
    const { name } = req.params;
    const { excludeId } = req.query;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ 
        success: false,
        message: 'Company name is required' 
      });
    }

    const available = await Vendor.checkCompanyNameAvailability(name, excludeId);
    
    res.json({
      success: true,
      available: available,
      message: available 
        ? 'Company name is available' 
        : 'Company name is already taken'
    });
  });

  // @desc    Check if GST number is available
  // @route   GET /api/vendors/check-gst/:gst
  static checkGstAvailability = asyncHandler(async (req, res) => {
    const { gst } = req.params;
    const { excludeId } = req.query;
    
    const available = await Vendor.checkGstAvailability(gst, excludeId);
    
    res.json({
      success: true,
      available: available,
      message: available 
        ? 'GST number is available' 
        : 'GST number is already registered'
    });
  });

  // @desc    Get vendor analytics
  // @route   GET /api/vendors/analytics  
  static getVendorAnalytics = asyncHandler(async (req, res) => {
    const analytics = await Vendor.getAnalytics();
    
    res.json({
      success: true,
      data: analytics,
      message: 'Vendor analytics retrieved successfully'
    });
  });
}

module.exports = VendorsController;