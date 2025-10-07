const db = require('../config/db');
const { ValidationError, DatabaseError } = require('../utils/errors');
const InventoryItem = require('./InventoryItem');
const InventoryTransaction = require('./InventoryTransaction');

class ProcurementItem {
  constructor(data) {
    this.id = data.id;
    this.procurementId = data.procurement_id;
    this.stoneId = data.stone_id;
    this.hsnCodeId = data.hsn_code_id;
    this.lengthMm = data.length_mm;
    this.widthMm = data.width_mm;
    this.thicknessMm = data.thickness_mm;
    this.isCalibrated = data.is_calibrated;
    this.edgesTypeId = data.edges_type_id;
    this.finishingTypeId = data.finishing_type_id;
    this.stageId = data.stage_id;
    this.quantity = data.quantity;
    this.units = data.units;
    this.rate = data.rate;
    this.rateUnit = data.rate_unit;
    this.itemAmount = data.item_amount;
    this.comments = data.comments;
    this.inventoryItemId = data.inventory_item_id;
    this.createdAt = data.created_at;
    
    // Joined data
    this.stoneName = data.stone_name;
    this.stoneType = data.stone_type;
    this.stageName = data.stage_name;
    this.edgesTypeName = data.edges_type_name;
    this.finishingTypeName = data.finishing_type_name;
    this.hsnCode = data.hsn_code;
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