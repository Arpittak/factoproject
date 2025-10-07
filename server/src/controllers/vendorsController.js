const Vendor = require('../models/Vendor');

class VendorsController {

  // @desc    Create a new vendor
  // @route   POST /api/vendors
  static async createVendor(req, res, next) {
    try {
      const vendor = await Vendor.create(req.body);
      
      res.status(201).json({
        success: true,
        message: 'Vendor created successfully',
        data: vendor
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Get all vendors with pagination
  // @route   GET /api/vendors
  static async getAllVendors(req, res, next) {
    try {
      const { page = 1, limit = 10 } = req.query;
      
      const result = await Vendor.findAll({ page, limit });
      
      res.status(200).json({
        success: true,
        data: result.vendors,
        pagination: result.pagination,
        message: `Found ${result.pagination.totalItems} vendors`
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Get vendor by ID
  // @route   GET /api/vendors/:id
  static async getVendorById(req, res, next) {
    try {
      const { id } = req.params;
      
      const vendor = await Vendor.findById(id);
      
      res.status(200).json({
        success: true,
        data: vendor,
        message: 'Vendor details retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Update vendor
  // @route   PUT /api/vendors/:id
  static async updateVendor(req, res, next) {
    try {
      const { id } = req.params;
      
      const vendor = await Vendor.update(id, req.body);
      
      res.status(200).json({
        success: true,
        message: 'Vendor updated successfully',
        data: vendor
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Check if company name is available
  // @route   GET /api/vendors/check-company-name/:name
  static async checkCompanyNameAvailability(req, res, next) {
    try {
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
    } catch (error) {
      next(error);
    }
  }

  // @desc    Check if GST number is available
  // @route   GET /api/vendors/check-gst/:gst
  static async checkGstAvailability(req, res, next) {
    try {
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
    } catch (error) {
      next(error);
    }
  }

  // @desc    Get vendor analytics
  // @route   GET /api/vendors/analytics  
  static async getVendorAnalytics(req, res, next) {
    try {
      const analytics = await Vendor.getAnalytics();
      
      res.json({
        success: true,
        data: analytics,
        message: 'Vendor analytics retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = VendorsController;