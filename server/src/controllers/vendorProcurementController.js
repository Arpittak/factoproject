const Vendor = require('../models/Vendor');
const Stone = require('../models/Stone');
const ProcurementItem = require('../models/ProcurementItem');
const asyncHandler = require('../middleware/asyncHandler');
const { ValidationError } = require('../utils/errors');

class VendorProcurementController {
  
  // GET /api/vendor-procurement/vendors
  static getVendorsList = asyncHandler(async (req, res) => {
    const { search = '' } = req.query;
    
    const vendors = await Vendor.getVendorsList(search);
    
    res.json({
      success: true,
      data: vendors,
      message: `Found ${vendors.length} vendors`
    });
  });

  // GET /api/vendor-procurement/vendors/:id
  static getVendorDetails = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      throw new ValidationError('Valid vendor ID is required');
    }

    const vendor = await Vendor.findById(parseInt(id));
    
    res.json({
      success: true,
      data: vendor,
      message: 'Vendor details retrieved successfully'
    });
  });

  // GET /api/vendor-procurement/vendors/:id/items
  static getVendorProcurementItems = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { startDate, endDate, stoneType, stoneName, page, limit } = req.query;
    
    if (!id || isNaN(id)) {
      throw new ValidationError('Valid vendor ID is required');
    }

    const vendorId = parseInt(id);

    // Verify vendor exists
    await Vendor.findById(vendorId);

    // Build filters
    const filters = {};
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    if (stoneType) filters.stoneType = stoneType;
    if (stoneName) filters.stoneName = stoneName;

    // Pagination parameters
    const pagination = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10
    };

    // Get procurement items with pagination and stats
    const [result, stats] = await Promise.all([
      ProcurementItem.findByVendorId(vendorId, filters, pagination),
      ProcurementItem.getStatsByVendorId(vendorId, filters)
    ]);
    
    res.json({
      success: true,
      data: {
        items: result.items,
        stats,
        pagination: result.pagination,
        filters: {
          vendorId,
          startDate: startDate || null,
          endDate: endDate || null,
          stoneType: stoneType || null,
          stoneName: stoneName || null
        }
      },
      message: `Found ${result.pagination.totalItems} procurement items`
    });
  });

  // GET /api/vendor-procurement/filter-options
  static getFilterOptions = asyncHandler(async (req, res) => {
    const [stoneTypes, stones] = await Promise.all([
      Stone.getStoneTypes(),
      Stone.findAll()
    ]);

    // Group stones by type for easier frontend consumption
    const stonesByType = {};
    stones.forEach(stone => {
      if (!stonesByType[stone.stoneType]) {
        stonesByType[stone.stoneType] = [];
      }
      stonesByType[stone.stoneType].push(stone.stoneName);
    });

    res.json({
      success: true,
      data: {
        stoneTypes,
        stonesByType,
        allStones: stones
      },
      message: 'Filter options retrieved successfully'
    });
  });

  // GET /api/vendor-procurement/stones/names
  static getStoneNames = asyncHandler(async (req, res) => {
    const { stoneType } = req.query;
    
    const stoneNames = await Stone.getStoneNamesByType(stoneType);
    
    res.json({
      success: true,
      data: stoneNames,
      message: `Found ${stoneNames.length} stone names`
    });
  });
}

module.exports = VendorProcurementController;