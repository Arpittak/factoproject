const db = require('../config/db');
const { ValidationError, DatabaseError } = require('../utils/errors');
const InventoryItem = require('./InventoryItem');
const InventoryTransaction = require('./InventoryTransaction');

class ProcurementItem {
  constructor(data) {
  this.id = data.id;
  this.procurement_id = data.procurement_id;
  this.stone_id = data.stone_id;
  this.hsn_code_id = data.hsn_code_id;
  this.length_mm = data.length_mm;
  this.width_mm = data.width_mm;
  this.thickness_mm = data.thickness_mm;
  this.is_calibrated = data.is_calibrated;
  this.edges_type_id = data.edges_type_id;
  this.finishing_type_id = data.finishing_type_id;
  this.stage_id = data.stage_id;
  this.quantity = data.quantity;
  this.units = data.units;
  this.rate = data.rate;
  this.rate_unit = data.rate_unit;
  this.item_amount = data.item_amount;
  this.comments = data.comments;
  this.inventory_item_id = data.inventory_item_id;
  this.created_at = data.created_at;
  
  // Joined data
  this.stone_name = data.stone_name;
  this.stone_type = data.stone_type;
  this.stage_name = data.stage_name;
  this.edges_type_name = data.edges_type_name;
  this.finishing_type_name = data.finishing_type_name;
  this.hsn_code = data.hsn_code;
}

  // Find all items for a procurement
  static async findByProcurementId(procurementId) {
    try {
      const itemsSql = `
        SELECT 
          pi.*,
          s.stone_name,
          s.stone_type,
          st.name as stage_name,
          et.name as edges_type_name,
          ft.name as finishing_type_name,
          hc.code as hsn_code
        FROM procurement_items pi
        JOIN stones s ON pi.stone_id = s.id
        LEFT JOIN stages st ON pi.stage_id = st.id
        LEFT JOIN edges_types et ON pi.edges_type_id = et.id
        LEFT JOIN finishing_types ft ON pi.finishing_type_id = ft.id
        LEFT JOIN hsn_codes hc ON pi.hsn_code_id = hc.id
        WHERE pi.procurement_id = ?
        ORDER BY pi.id
      `;

      const [rows] = await db.execute(itemsSql, [procurementId]);
      return rows.map(row => new ProcurementItem(row));
    } catch (error) {
      throw new DatabaseError(`Failed to fetch procurement items: ${error.message}`);
    }
  }


  // Add after the findByProcurementId method

/**
 * Find procurement items by vendor ID with filters and pagination
 */
static async findByVendorId(vendorId, filters = {}, pagination = { page: 1, limit: 10 }) {
  try {
    const { startDate, endDate, stoneType, stoneName } = filters;
    const { page, limit } = pagination;
    const offset = (page - 1) * limit;

    let whereClauses = ['p.vendor_id = ?'];
    let params = [vendorId];

    // Date filters
    if (startDate) {
      whereClauses.push('pi.created_at >= ?');
      params.push(startDate);
    }
    if (endDate) {
      whereClauses.push('pi.created_at <= ?');
      params.push(endDate);
    }

    // Stone filters
    if (stoneType) {
      whereClauses.push('s.stone_type = ?');
      params.push(stoneType);
    }
    if (stoneName) {
      whereClauses.push('s.stone_name LIKE ?');
      params.push(`%${stoneName}%`);
    }

    const whereString = `WHERE ${whereClauses.join(' AND ')}`;

    // Count total items
    const countSql = `
      SELECT COUNT(*) as total
      FROM procurement_items pi
      JOIN procurements p ON pi.procurement_id = p.id
      JOIN stones s ON pi.stone_id = s.id
      ${whereString}
    `;
    const [countRows] = await db.execute(countSql, params);
    const totalItems = countRows[0].total;

    // Fetch paginated items
    const itemsSql = `
      SELECT 
        pi.*,
        s.stone_name as stoneName,
        s.stone_type as stoneType,
        st.name as stageName,
        et.name as edgesTypeName,
        ft.name as finishingTypeName,
        hc.code as hsnCode,
        p.supplier_invoice,
        p.invoice_date,
        p.tax_percentage as taxPercentage
      FROM procurement_items pi
      JOIN procurements p ON pi.procurement_id = p.id
      JOIN stones s ON pi.stone_id = s.id
      LEFT JOIN stages st ON pi.stage_id = st.id
      LEFT JOIN edges_types et ON pi.edges_type_id = et.id
      LEFT JOIN finishing_types ft ON pi.finishing_type_id = ft.id
      LEFT JOIN hsn_codes hc ON pi.hsn_code_id = hc.id
      ${whereString}
      ORDER BY pi.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await db.execute(itemsSql, [...params, parseInt(limit), parseInt(offset)]);

    return {
      items: rows.map(row => new ProcurementItem(row)),
      pagination: {
        currentPage: parseInt(page),
        itemsPerPage: parseInt(limit),
        totalItems,
        totalPages: Math.ceil(totalItems / limit)
      }
    };
  } catch (error) {
    throw new DatabaseError(`Failed to fetch vendor procurement items: ${error.message}`);
  }
}

/**
 * Get procurement statistics by vendor ID
 */
static async getStatsByVendorId(vendorId, filters = {}) {
  try {
    const { startDate, endDate, stoneType, stoneName } = filters;

    let whereClauses = ['p.vendor_id = ?'];
    let params = [vendorId];

    // Date filters
    if (startDate) {
      whereClauses.push('pi.created_at >= ?');
      params.push(startDate);
    }
    if (endDate) {
      whereClauses.push('pi.created_at <= ?');
      params.push(endDate);
    }

    // Stone filters
    if (stoneType) {
      whereClauses.push('s.stone_type = ?');
      params.push(stoneType);
    }
    if (stoneName) {
      whereClauses.push('s.stone_name LIKE ?');
      params.push(`%${stoneName}%`);
    }

    const whereString = `WHERE ${whereClauses.join(' AND ')}`;

    const statsSql = `
      SELECT 
        COUNT(pi.id) as total_items,
        SUM(pi.quantity) as total_quantity,
        SUM(pi.item_amount) as total_amount,
        AVG(p.tax_percentage) as avg_tax_percentage
      FROM procurement_items pi
      JOIN procurements p ON pi.procurement_id = p.id
      JOIN stones s ON pi.stone_id = s.id
      ${whereString}
    `;

    const [rows] = await db.execute(statsSql, params);

    return {
      totalItems: parseInt(rows[0].total_items) || 0,
      totalQuantity: parseFloat(rows[0].total_quantity) || 0,
      totalAmount: parseFloat(rows[0].total_amount) || 0,
      avgTaxPercentage: parseFloat(rows[0].avg_tax_percentage) || 0
    };
  } catch (error) {
    throw new DatabaseError(`Failed to fetch vendor procurement stats: ${error.message}`);
  }
}

  // Create procurement item with inventory update
  static async create(procurementId, itemData, invoiceDate) {
    const connection = await db.getConnection();
    try {
      // Validate required fields
      if (!itemData.stone_id || !itemData.length_mm || !itemData.width_mm || !itemData.quantity || !itemData.rate) {
        throw new ValidationError('Missing required fields in procurement item');
      }

      await connection.beginTransaction();

      // Sanitize dimensions
      const finalLength = Math.floor(parseFloat(itemData.length_mm));
      const finalWidth = Math.floor(parseFloat(itemData.width_mm));
      const finalThickness = itemData.thickness_mm ? Math.floor(parseFloat(itemData.thickness_mm)) : null;

      // Calculate item amount
      const calculatedItemAmount = parseFloat(itemData.quantity) * parseFloat(itemData.rate);

      // Find or create inventory item with source = 'procurement'
      const { id: inventoryItemId, isNew } = await InventoryItem.findOrCreate({
        stone_id: itemData.stone_id,
        length_mm: finalLength,
        width_mm: finalWidth,
        thickness_mm: finalThickness,
        is_calibrated: itemData.is_calibrated,
        edges_type_id: itemData.edges_type_id,
        finishing_type_id: itemData.finishing_type_id,
        stage_id: itemData.stage_id
      }, 'procurement');

      const transaction_type = isNew ? 'procurement_initial_stock' : 'procurement_quantity_added';

      // Insert procurement item record
      const procItemSql = `
        INSERT INTO procurement_items 
        (procurement_id, stone_id, hsn_code_id, length_mm, width_mm, thickness_mm, 
         is_calibrated, edges_type_id, finishing_type_id, stage_id,
         quantity, units, rate, rate_unit, item_amount, comments, inventory_item_id, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await connection.execute(procItemSql, [
        procurementId,
        itemData.stone_id,
        itemData.hsn_code_id || null,
        finalLength,
        finalWidth,
        finalThickness,
        itemData.is_calibrated || false,
        itemData.edges_type_id || null,
        itemData.finishing_type_id || null,
        itemData.stage_id || null,
        parseFloat(itemData.quantity),
        itemData.units,
        parseFloat(itemData.rate),
        itemData.rate_unit,
        calculatedItemAmount,
        itemData.comments || null,
        inventoryItemId,
        invoiceDate
      ]);

      // Calculate quantities
      let master_sq_meter;
      if (itemData.units === 'Pieces') {
        const inputPieces = parseInt(itemData.quantity);
        master_sq_meter = InventoryItem.calculateSqMeterFromPieces(inputPieces, finalLength, finalWidth);
      } else {
        master_sq_meter = parseFloat(itemData.quantity);
      }

      const change_in_pieces = InventoryItem.calculatePiecesFromSqMeter(master_sq_meter, finalLength, finalWidth);
      const change_in_sq_meter = master_sq_meter;

      // Get current balance
      const currentBalance = await InventoryTransaction.getLastBalance(inventoryItemId, connection);
      const newBalancePieces = currentBalance.pieces + change_in_pieces;
      const newBalanceSqMeter = currentBalance.sqMeter + change_in_sq_meter;

      // Get supplier invoice for source details
      const [procRows] = await connection.execute('SELECT supplier_invoice FROM procurements WHERE id = ?', [procurementId]);
      const supplierInvoice = procRows[0]?.supplier_invoice || 'Unknown';

      // Insert inventory transaction
      const transactionSql = `
        INSERT INTO inventory_transactions 
        (inventory_item_id, transaction_type, change_in_sq_meter, change_in_pieces, 
         balance_after_sq_meter, balance_after_pieces, source_details, performed_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await connection.execute(transactionSql, [
        inventoryItemId,
        transaction_type,
        change_in_sq_meter,
        change_in_pieces,
        newBalanceSqMeter,
        newBalancePieces,
        `Procurement Invoice: ${supplierInvoice}`,
        'System'
      ]);

      await connection.commit();

    } catch (error) {
      await connection.rollback();
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new DatabaseError(`Failed to create procurement item: ${error.message}`);
    } finally {
      connection.release();
    }
  }

  // Delete procurement item with inventory update
  static async delete(procurementItemId) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Get procurement item details
      const itemSql = `
        SELECT pi.*, p.supplier_invoice 
        FROM procurement_items pi 
        JOIN procurements p ON pi.procurement_id = p.id 
        WHERE pi.id = ?
      `;
      const [itemRows] = await connection.execute(itemSql, [procurementItemId]);

      if (itemRows.length === 0) {
        throw new ValidationError('Procurement item not found');
      }

      const item = itemRows[0];

      // Check if inventory item exists
      if (item.inventory_item_id) {
        const [inventoryCheck] = await connection.execute(
          'SELECT id FROM inventory_items WHERE id = ?',
          [item.inventory_item_id]
        );

        if (inventoryCheck.length > 0) {
          const inventoryItemId = item.inventory_item_id;

          // Calculate reduction amounts
          let master_sq_meter;
          if (item.units === 'Pieces') {
            master_sq_meter = InventoryItem.calculateSqMeterFromPieces(parseInt(item.quantity), item.length_mm, item.width_mm);
          } else {
            master_sq_meter = parseFloat(item.quantity);
          }

          const change_in_pieces = -InventoryItem.calculatePiecesFromSqMeter(master_sq_meter, item.length_mm, item.width_mm);
          const change_in_sq_meter = -master_sq_meter;

          // Get current balance
          const currentBalance = await InventoryTransaction.getLastBalance(inventoryItemId, connection);
          const newBalancePieces = currentBalance.pieces + change_in_pieces;
          const newBalanceSqMeter = currentBalance.sqMeter + change_in_sq_meter;

          // Check if this would result in zero or negative balance
          if (newBalancePieces <= 0 || newBalanceSqMeter <= 0) {
            // Check if this is the only procurement item linked
            const [linkedItemsCount] = await connection.execute(
              'SELECT COUNT(*) as count FROM procurement_items WHERE inventory_item_id = ? AND id != ?',
              [inventoryItemId, procurementItemId]
            );

            if (linkedItemsCount[0].count === 0) {
              // Delete entire inventory item
              await connection.execute('DELETE FROM inventory_items WHERE id = ?', [inventoryItemId]);
            } else {
              // Add negative transaction
              const transactionSql = `
                INSERT INTO inventory_transactions 
                (inventory_item_id, transaction_type, change_in_sq_meter, change_in_pieces, 
                 balance_after_sq_meter, balance_after_pieces, source_details, performed_by)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
              `;
              await connection.execute(transactionSql, [
                inventoryItemId, 'procurement_item_deleted', change_in_sq_meter, change_in_pieces,
                newBalanceSqMeter, newBalancePieces,
                `Deleted from procurement: ${item.supplier_invoice}`, 'System'
              ]);
            }
          } else {
            // Normal case: reduce inventory quantity
            const transactionSql = `
              INSERT INTO inventory_transactions 
              (inventory_item_id, transaction_type, change_in_sq_meter, change_in_pieces, 
               balance_after_sq_meter, balance_after_pieces, source_details, performed_by)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;
            await connection.execute(transactionSql, [
              inventoryItemId, 'procurement_item_deleted', change_in_sq_meter, change_in_pieces,
              newBalanceSqMeter, newBalancePieces,
              `Deleted from procurement: ${item.supplier_invoice}`, 'System'
            ]);
          }
        }
      }

      // Delete procurement item
      await connection.execute('DELETE FROM procurement_items WHERE id = ?', [procurementItemId]);

      await connection.commit();

    } catch (error) {
      await connection.rollback();
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new DatabaseError(`Failed to delete procurement item: ${error.message}`);
    } finally {
      connection.release();
    }
  }
}

module.exports = ProcurementItem;