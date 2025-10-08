const db = require('../config/db');
const { ValidationError, DatabaseError } = require('../utils/errors');
const InventoryItem = require('./InventoryItem');

class InventoryTransaction {
  constructor(data) {
  this.id = data.id;
  this.inventory_item_id = data.inventory_item_id;
  this.transaction_type = data.transaction_type;
  this.change_in_sq_meter = data.change_in_sq_meter;
  this.change_in_pieces = data.change_in_pieces;
  this.balance_after_sq_meter = data.balance_after_sq_meter;
  this.balance_after_pieces = data.balance_after_pieces;
  this.reason = data.reason;
  this.source_details = data.source_details;
  this.performed_by = data.performed_by;
  this.created_at = data.created_at;
}

  // Get last balance for an inventory item
  static async getLastBalance(inventoryItemId, connection = null) {
    try {
      const dbConnection = connection || db;
      const balanceSql = 'SELECT balance_after_pieces, balance_after_sq_meter FROM inventory_transactions WHERE inventory_item_id = ? ORDER BY id DESC LIMIT 1';
      const [lastTx] = await dbConnection.execute(balanceSql, [inventoryItemId]);

      if (lastTx.length === 0) {
        return { pieces: 0, sqMeter: 0 };
      }

      return {
        pieces: parseInt(lastTx[0].balance_after_pieces) || 0,
        sqMeter: parseFloat(lastTx[0].balance_after_sq_meter) || 0
      };
    } catch (error) {
      throw new DatabaseError(`Failed to get last balance: ${error.message}`);
    }
  }

  // Create transaction for manual add
  static async createManualAdd(data) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const {
        stone_id, length_mm, width_mm, thickness_mm, is_calibrated,
        edges_type_id, finishing_type_id, stage_id,
        quantity, unit, reason
      } = data;

      const finalLength = Math.floor(parseFloat(length_mm));
      const finalWidth = Math.floor(parseFloat(width_mm));
      const finalThickness = thickness_mm ? Math.floor(parseFloat(thickness_mm)) : null;

      // Find or create inventory item
      const { id: inventoryItemId } = await InventoryItem.findOrCreate({
        stone_id, length_mm: finalLength, width_mm: finalWidth, thickness_mm: finalThickness,
        is_calibrated, edges_type_id, finishing_type_id, stage_id
      }, 'manual');

      // Calculate quantities
      let master_sq_meter;
      if (unit === 'Pieces') {
        const inputPieces = parseInt(quantity);
        master_sq_meter = InventoryItem.calculateSqMeterFromPieces(inputPieces, finalLength, finalWidth);
      } else {
        master_sq_meter = parseFloat(quantity);
      }

      const change_in_pieces = InventoryItem.calculatePiecesFromSqMeter(master_sq_meter, finalLength, finalWidth);
      const change_in_sq_meter = master_sq_meter;

      // Get current balance
      const currentBalance = await this.getLastBalance(inventoryItemId, connection);
      const newBalancePieces = currentBalance.pieces + change_in_pieces;
      const newBalanceSqMeter = currentBalance.sqMeter + change_in_sq_meter;

      // Insert transaction
      const transactionSql = `
        INSERT INTO inventory_transactions 
        (inventory_item_id, transaction_type, change_in_sq_meter, change_in_pieces, balance_after_sq_meter, balance_after_pieces, reason, performed_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await connection.execute(transactionSql, [
        inventoryItemId, 'manual_add', change_in_sq_meter, change_in_pieces,
        newBalanceSqMeter, newBalancePieces, reason, 'System User'
      ]);

      await connection.commit();

      return {
        added_sq_meter: change_in_sq_meter,
        added_pieces: change_in_pieces,
        new_balance_sq_meter: newBalanceSqMeter,
        new_balance_pieces: newBalancePieces
      };

    } catch (error) {
      await connection.rollback();
      throw new DatabaseError(`Failed to create manual add transaction: ${error.message}`);
    } finally {
      connection.release();
    }
  }

  // Create transaction for manual adjust
  static async createManualAdjust(data) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const { inventory_item_id, quantity, unit, reason } = data;

      // Get inventory item details
      const itemSql = 'SELECT length_mm, width_mm FROM inventory_items WHERE id = ?';
      const [items] = await connection.execute(itemSql, [inventory_item_id]);
      if (items.length === 0) throw new ValidationError('Inventory item not found');

      const { length_mm, width_mm } = items[0];

      // Get current balance
      const currentBalance = await this.getLastBalance(inventory_item_id, connection);

      // Calculate changes
      let master_sq_meter;
      if (unit === 'Pieces') {
        const inputPieces = parseFloat(quantity);
        const absPieces = Math.abs(inputPieces);
        master_sq_meter = inputPieces >= 0 ?
          InventoryItem.calculateSqMeterFromPieces(absPieces, length_mm, width_mm) :
          -InventoryItem.calculateSqMeterFromPieces(absPieces, length_mm, width_mm);
      } else {
        master_sq_meter = parseFloat(quantity);
      }

      const absSqMeter = Math.abs(master_sq_meter);
      const piecesFromSqMeter = InventoryItem.calculatePiecesFromSqMeter(absSqMeter, length_mm, width_mm);
      const change_in_pieces = master_sq_meter >= 0 ? piecesFromSqMeter : -piecesFromSqMeter;
      const change_in_sq_meter = master_sq_meter;

      // Validation for removal
      if (change_in_sq_meter < 0) {
        if ((currentBalance.sqMeter + change_in_sq_meter) < 0) {
          throw new ValidationError(
            `Cannot remove ${Math.abs(change_in_sq_meter).toFixed(4)} sq meters. Only ${currentBalance.sqMeter.toFixed(4)} sq meters available.`
          );
        }
        if ((currentBalance.pieces + change_in_pieces) < 0) {
          throw new ValidationError(
            `Cannot remove ${Math.abs(change_in_pieces)} pieces. Only ${currentBalance.pieces} pieces available.`
          );
        }
      }

      const transaction_type = change_in_sq_meter > 0 ? 'manual_add' : 'manual_remove';
      const newBalancePieces = currentBalance.pieces + change_in_pieces;
      const newBalanceSqMeter = currentBalance.sqMeter + change_in_sq_meter;

      const transactionSql = `
        INSERT INTO inventory_transactions 
        (inventory_item_id, transaction_type, change_in_sq_meter, change_in_pieces, balance_after_sq_meter, balance_after_pieces, reason, performed_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      await connection.execute(transactionSql, [
        inventory_item_id, transaction_type, change_in_sq_meter, change_in_pieces,
        newBalanceSqMeter, newBalancePieces, reason, 'System User'
      ]);

      await connection.commit();

      return {
        changed_sq_meter: change_in_sq_meter,
        changed_pieces: change_in_pieces,
        new_balance_sq_meter: newBalanceSqMeter,
        new_balance_pieces: newBalancePieces
      };

    } catch (error) {
      await connection.rollback();
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new DatabaseError(`Failed to create manual adjust transaction: ${error.message}`);
    } finally {
      connection.release();
    }
  }

  // Get transaction history for an item
  static async findByItemId(inventoryItemId) {
    try {
      const itemDetailsSql = `
        SELECT 
          ii.id, ii.length_mm, ii.width_mm, ii.thickness_mm,
          s.stone_name, s.stone_type, st.name as stage
        FROM inventory_items ii
        JOIN stones s ON ii.stone_id = s.id
        LEFT JOIN stages st ON ii.stage_id = st.id
        WHERE ii.id = ?
      `;
      const [itemDetails] = await db.execute(itemDetailsSql, [inventoryItemId]);

      if (itemDetails.length === 0) {
        throw new ValidationError('Inventory item not found');
      }

      const transactionsSql = `
        SELECT * FROM inventory_transactions 
        WHERE inventory_item_id = ? 
        ORDER BY created_at DESC, id DESC
      `;
      const [transactions] = await db.execute(transactionsSql, [inventoryItemId]);

      return {
        item: itemDetails[0],
        history: transactions.map(tx => new InventoryTransaction(tx))
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new DatabaseError(`Failed to fetch transaction history: ${error.message}`);
    }
  }
}

module.exports = InventoryTransaction;