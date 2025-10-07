const Procurement = require('../models/Procurement');
const ProcurementItem = require('../models/ProcurementItem');

class ProcurementsController {

  // @desc    Get all procurements with filters and pagination
  // @route   GET /api/procurements
  static async getAllProcurements(req, res, next) {
    try {
      const {
        vendor_id, supplier_invoice, date_received,
        stone_type, stone_name, stage_id,
        page = 1, limit = 10
      } = req.query;

      const filters = {
        vendor_id,
        supplier_invoice,
        date_received,
        stone_type,
        stone_name,
        stage_id
      };

      const result = await Procurement.findAll(filters, { page, limit });

      res.status(200).json({
        success: true,
        data: result.procurements,
        pagination: result.pagination,
        message: `Found ${result.pagination.totalItems} procurements`
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Create new procurement with items
  // @route   POST /api/procurements
  static async createProcurement(req, res, next) {
    try {
      const { items, ...procurementData } = req.body;

      // Create main procurement record
      const procurementId = await Procurement.create(procurementData);

      // Process each item
      if (items && items.length > 0) {
        for (const item of items) {
          await ProcurementItem.create(procurementId, item, procurementData.invoice_date);
        }
      }

      res.status(201).json({
        success: true,
        message: 'Procurement created successfully',
        data: { id: procurementId }
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Get procurement analytics
  // @route   GET /api/procurements/analytics
  static async getProcurementAnalytics(req, res, next) {
    try {
      const analytics = await Procurement.getAnalytics();

      res.status(200).json({
        success: true,
        data: analytics,
        message: 'Procurement analytics retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Get procurement by ID with items
  // @route   GET /api/procurements/:id
  static async getProcurementById(req, res, next) {
    try {
      const { id } = req.params;

      const procurement = await Procurement.findById(id);
      const items = await ProcurementItem.findByProcurementId(id);

      // Calculate summary data
      const currentItemsAmount = items.reduce((sum, item) => sum + parseFloat(item.itemAmount), 0);

      res.status(200).json({
        success: true,
        data: {
          procurement,
          items,
          summary: {
            totalItems: items.length,
            totalProcurementAmount: parseFloat(procurement.grandTotal) - parseFloat(procurement.freightCharges || 0),
            taxAmount: ((parseFloat(procurement.grandTotal) - parseFloat(procurement.freightCharges || 0)) * parseFloat(procurement.taxPercentage)) / 100,
            grandTotal: parseFloat(procurement.grandTotal),
            currentItemsTotal: currentItemsAmount
          }
        },
        message: 'Procurement details retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Delete procurement item
  // @route   DELETE /api/procurements/items/:procurementItemId
  static async deleteProcurementItem(req, res, next) {
    try {
      const { procurementItemId } = req.params;

      await ProcurementItem.delete(procurementItemId);

      res.status(200).json({
        success: true,
        message: 'Procurement item deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Add item to existing procurement
  // @route   POST /api/procurements/:procurementId/items
  static async addProcurementItem(req, res, next) {
    try {
      const { procurementId } = req.params;
      const itemData = req.body;

      // Get procurement to get invoice date
      const procurement = await Procurement.findById(procurementId);

      await ProcurementItem.create(procurementId, itemData, procurement.invoiceDate);

      res.status(201).json({
        success: true,
        message: 'Procurement item added successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ProcurementsController;