const InventoryItem = require('../models/InventoryItem');
const InventoryTransaction = require('../models/InventoryTransaction');
const asyncHandler = require('../middleware/asyncHandler');

class InventoryController {

  // @desc    Get all inventory items with their calculated quantities
  // @route   GET /api/inventory
  static getAllInventoryItems = asyncHandler(async (req, res) => {
    const { stone_type, stone_name, stage_id, edges_type_id, finishing_type_id, source, page = 1, limit = 10 } = req.query;

    const filters = {
      stone_type,
      stone_name,
      stage_id,
      edges_type_id,
      finishing_type_id,
      source
    };

    const result = await InventoryItem.findAll(filters, { page, limit });

    res.status(200).json({
      success: true,
      items: result.items,
      pagination: result.pagination,
      message: `Found ${result.pagination.totalItems} inventory items`
    });
  });

  // @desc    Create a new inventory item from the manual add form
  // @route   POST /api/inventory/manual-add
  static manualAddTransaction = asyncHandler(async (req, res) => {
    const result = await InventoryTransaction.createManualAdd(req.body);

    res.status(201).json({
      success: true,
      message: 'Inventory added successfully',
      data: result
    });
  });

  // @desc    Adjust quantity of an existing inventory item
  // @route   POST /api/inventory/manual-adjust
  static manualAdjustTransaction = asyncHandler(async (req, res) => {
    const result = await InventoryTransaction.createManualAdjust(req.body);

    res.status(201).json({
      success: true,
      message: 'Inventory adjusted successfully',
      data: result
    });
  });

  // @desc    Delete inventory item permanently
  // @route   DELETE /api/inventory/:id
  static deleteInventoryItem = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    await InventoryItem.delete(id);

    res.status(200).json({ 
      success: true,
      message: 'Inventory item and all its history have been permanently deleted.' 
    });
  });

  // @desc    Get transaction history for a single inventory item
  // @route   GET /api/inventory/:id/transactions
  static getTransactionsForItem = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const result = await InventoryTransaction.findByItemId(id);

    res.status(200).json({
      success: true,
      item: result.item,      // Return item directly
  history: result.history, // Return history directly  
      message: 'Transaction history retrieved successfully'
    });
  });

  // @desc    Get inventory analytics
  // @route   GET /api/inventory/analytics
  static getInventoryAnalytics = asyncHandler(async (req, res) => {
    const analytics = await InventoryItem.getAnalytics();

    res.status(200).json({
      success: true,
      ...analytics,
      message: 'Inventory analytics retrieved successfully'
    });
  });
}

module.exports = InventoryController;