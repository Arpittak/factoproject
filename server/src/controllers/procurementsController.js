const Procurement = require('../models/Procurement');
const ProcurementItem = require('../models/ProcurementItem');
const asyncHandler = require('../middleware/asyncHandler');

class ProcurementsController {

  // @desc    Get all procurements with filters and pagination
  // @route   GET /api/procurements
  static getAllProcurements = asyncHandler(async (req, res) => {
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
      procurements: result.procurements,
      pagination: result.pagination,
      message: `Found ${result.pagination.totalItems} procurements`
    });
  });

  // @desc    Create new procurement with items
  // @route   POST /api/procurements
  static createProcurement = asyncHandler(async (req, res) => {
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
  });

  // @desc    Get procurement analytics
  // @route   GET /api/procurements/analytics
  static getProcurementAnalytics = asyncHandler(async (req, res) => {
    const analytics = await Procurement.getAnalytics();

    res.status(200).json({
      success: true,
      ...analytics,
      message: 'Procurement analytics retrieved successfully'
    });
  });

  // @desc    Get procurement by ID with items
  // @route   GET /api/procurements/:id
  static getProcurementById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const procurement = await Procurement.findById(id);
    const items = await ProcurementItem.findByProcurementId(id);

    // Calculate summary data
    const currentItemsAmount = items.reduce((sum, item) => sum + parseFloat(item.itemAmount), 0);

    res.status(200).json({
  success: true,
  procurement,
  items,
  summary: {
    totalItems: items.length,
    totalProcurementAmount: parseFloat(procurement.grand_total) - parseFloat(procurement.freight_charges || 0),
    taxAmount: ((parseFloat(procurement.grand_total) - parseFloat(procurement.freight_charges || 0)) * parseFloat(procurement.tax_percentage)) / 100,
    grandTotal: parseFloat(procurement.grand_total),
    currentItemsTotal: currentItemsAmount
  },
  message: 'Procurement details retrieved successfully'
});
  });

  // @desc    Delete procurement item
  // @route   DELETE /api/procurements/items/:procurementItemId
  static deleteProcurementItem = asyncHandler(async (req, res) => {
    const { procurementItemId } = req.params;

    await ProcurementItem.delete(procurementItemId);

    res.status(200).json({
      success: true,
      message: 'Procurement item deleted successfully'
    });
  });

  // @desc    Add item to existing procurement
  // @route   POST /api/procurements/:procurementId/items
  static addProcurementItem = asyncHandler(async (req, res) => {
    const { procurementId } = req.params;
    const itemData = req.body;

    // Get procurement to get invoice date
    const procurement = await Procurement.findById(procurementId);

    await ProcurementItem.create(procurementId, itemData, procurement.invoiceDate);

    res.status(201).json({
      success: true,
      message: 'Procurement item added successfully'
    });
  });
}

module.exports = ProcurementsController;