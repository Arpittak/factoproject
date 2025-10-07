const InventoryItem = require('../models/InventoryItem');
const InventoryTransaction = require('../models/InventoryTransaction');

class InventoryController {

  // @desc    Get all inventory items with their calculated quantities
  // @route   GET /api/inventory
  static async getAllInventoryItems(req, res, next) {
    try {
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
        data: result.items,
        pagination: result.pagination,
        message: `Found ${result.pagination.totalItems} inventory items`
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Create a new inventory item from the manual add form
  // @route   POST /api/inventory/manual-add
  static async manualAddTransaction(req, res, next) {
    try {
      const result = await InventoryTransaction.createManualAdd(req.body);

      res.status(201).json({
        success: true,
        message: 'Inventory added successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Adjust quantity of an existing inventory item
  // @route   POST /api/inventory/manual-adjust
  static async manualAdjustTransaction(req, res, next) {
    try {
      const result = await InventoryTransaction.createManualAdjust(req.body);

      res.status(201).json({
        success: true,
        message: 'Inventory adjusted successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Delete inventory item permanently
  // @route   DELETE /api/inventory/:id
  static async deleteInventoryItem(req, res, next) {
    try {
      const { id } = req.params;
      
      await InventoryItem.delete(id);

      res.status(200).json({ 
        success: true,
        message: 'Inventory item and all its history have been permanently deleted.' 
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Get transaction history for a single inventory item
  // @route   GET /api/inventory/:id/transactions
  static async getTransactionsForItem(req, res, next) {
    try {
      const { id } = req.params;
      
      const result = await InventoryTransaction.findByItemId(id);

      res.status(200).json({
        success: true,
        data: result,
        message: 'Transaction history retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Get inventory analytics
  // @route   GET /api/inventory/analytics
  static async getInventoryAnalytics(req, res, next) {
    try {
      const analytics = await InventoryItem.getAnalytics();

      res.status(200).json({
        success: true,
        data: analytics,
        message: 'Inventory analytics retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = InventoryController;