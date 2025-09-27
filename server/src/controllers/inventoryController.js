const db = require('../config/db');

// Helper function to calculate pieces from sq_meter (CEILING)
const calculatePiecesFromSqMeter = (sqMeter, length_mm, width_mm) => {
  const areaOfOnePiece = (length_mm * width_mm) / 1000000;
  if (areaOfOnePiece <= 0) return 0;
  return Math.ceil(sqMeter / areaOfOnePiece);
};

// Helper function to calculate sq_meter from pieces
const calculateSqMeterFromPieces = (pieces, length_mm, width_mm) => {
  const areaOfOnePiece = (length_mm * width_mm) / 1000000;
  return pieces * areaOfOnePiece;
};

// @desc    Get all inventory items with their calculated quantities
exports.getAllInventoryItems = async (req, res) => {
  try {
    const { stone_type, stone_name, stage_id, edges_type_id, finishing_type_id, source, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let whereClauses = [];
    let params = [];

    if (stone_type) {
      whereClauses.push("s.stone_type = ?");
      params.push(stone_type);
    }
    if (stone_name) {
      whereClauses.push("s.stone_name LIKE ?");
      params.push(`%${stone_name}%`);
    }
    if (stage_id) {
      whereClauses.push("ii.stage_id = ?");
      params.push(stage_id);
    }
    if (edges_type_id) {
      whereClauses.push("ii.edges_type_id = ?");
      params.push(edges_type_id);
    }
    if (finishing_type_id) {
      whereClauses.push("ii.finishing_type_id = ?");
      params.push(finishing_type_id);
    }
    if (source) {
      whereClauses.push("ii.source = ?");
      params.push(source);
    }

    const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(DISTINCT ii.id) as total FROM inventory_items ii JOIN stones s ON ii.stone_id = s.id ${whereString}`;
    const [countRows] = await db.query(countSql, params);
    const totalItems = countRows[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    const dataSql = `
      SELECT
        ii.id, ii.length_mm, ii.width_mm, ii.thickness_mm, ii.is_calibrated, ii.source,
        s.stone_name, s.stone_type,
        st.name AS stage, et.name AS edges_type, ft.name AS finishing_type,
        COALESCE((SELECT SUM(it.change_in_pieces) FROM inventory_transactions it WHERE it.inventory_item_id = ii.id), 0) AS quantity_pieces,
        COALESCE((SELECT SUM(it.change_in_sq_meter) FROM inventory_transactions it WHERE it.inventory_item_id = ii.id), 0) AS quantity_sq_meter,
        (SELECT MAX(it.created_at) FROM inventory_transactions it WHERE it.inventory_item_id = ii.id) as last_activity_date
      FROM inventory_items ii
      JOIN stones s ON ii.stone_id = s.id
      LEFT JOIN stages st ON ii.stage_id = st.id
      LEFT JOIN edges_types et ON ii.edges_type_id = et.id
      LEFT JOIN finishing_types ft ON ii.finishing_type_id = ft.id
      ${whereString}
      ORDER BY last_activity_date DESC
      LIMIT ?
      OFFSET ?;
    `;
    const [items] = await db.query(dataSql, [...params, parseInt(limit), parseInt(offset)]);

    res.status(200).json({
      items,
      pagination: {
        currentPage: parseInt(page),
        itemsPerPage: parseInt(limit),
        totalItems,
        totalPages,
      }
    });

  } catch (error) {
    console.error('Error fetching inventory items:', error);
    res.status(500).json({ message: 'Server error while fetching inventory items' });
  }
};

// @desc    Create a new inventory item from the manual add form
// @desc    Create a new inventory item from the manual add form
exports.manualAddTransaction = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const {
      stone_id, length_mm, width_mm, thickness_mm, is_calibrated,
      edges_type_id, finishing_type_id, stage_id,
      quantity, unit, reason
    } = req.body;

    const finalLength = Math.floor(parseFloat(length_mm));
    const finalWidth = Math.floor(parseFloat(width_mm));
    const finalThickness = thickness_mm ? Math.floor(parseFloat(thickness_mm)) : null;

    await connection.beginTransaction();

    // Find or create inventory item with source = 'manual'
    let inventoryItemId;
    const findSql = `
      SELECT id FROM inventory_items 
      WHERE stone_id = ? AND length_mm = ? AND width_mm = ? 
      AND (thickness_mm = ? OR (thickness_mm IS NULL AND ? IS NULL))
      AND is_calibrated = ? AND edges_type_id = ? AND finishing_type_id = ? AND stage_id = ?
      AND source = 'manual'
    `;
    const [existingItems] = await connection.query(findSql, [
      stone_id, finalLength, finalWidth, finalThickness, finalThickness,
      is_calibrated, edges_type_id, finishing_type_id, stage_id
    ]);

    if (existingItems.length > 0) {
      inventoryItemId = existingItems[0].id;
    } else {
      const createSql = `
        INSERT INTO inventory_items (stone_id, length_mm, width_mm, thickness_mm, is_calibrated, edges_type_id, finishing_type_id, stage_id, source)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'manual')
      `;
      const [createResult] = await connection.query(createSql, [
        stone_id, finalLength, finalWidth, finalThickness, is_calibrated, edges_type_id, finishing_type_id, stage_id
      ]);
      inventoryItemId = createResult.insertId;
    }

    // Handle both input types but store sq_meter as master
    let master_sq_meter;
    if (unit === 'Pieces') {
      const inputPieces = parseInt(quantity);
      master_sq_meter = calculateSqMeterFromPieces(inputPieces, finalLength, finalWidth);
    } else {
      master_sq_meter = parseFloat(quantity);
    }

    const change_in_pieces = calculatePiecesFromSqMeter(master_sq_meter, finalLength, finalWidth);
    const change_in_sq_meter = master_sq_meter;

    // Get current balance
    const balanceSql = 'SELECT balance_after_pieces, balance_after_sq_meter FROM inventory_transactions WHERE inventory_item_id = ? ORDER BY id DESC LIMIT 1';
    const [lastTransaction] = await connection.query(balanceSql, [inventoryItemId]);

    const currentBalancePieces = lastTransaction.length > 0 ? parseInt(lastTransaction[0].balance_after_pieces) : 0;
    const currentBalanceSqMeter = lastTransaction.length > 0 ? parseFloat(lastTransaction[0].balance_after_sq_meter) : 0;

    const newBalancePieces = currentBalancePieces + change_in_pieces;
    const newBalanceSqMeter = currentBalanceSqMeter + change_in_sq_meter;

    const transactionSql = `
      INSERT INTO inventory_transactions 
      (inventory_item_id, transaction_type, change_in_sq_meter, change_in_pieces, balance_after_sq_meter, balance_after_pieces, reason, performed_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await connection.query(transactionSql, [
      inventoryItemId, 'manual_add', change_in_sq_meter, change_in_pieces,
      newBalanceSqMeter, newBalancePieces, reason, 'System User'
    ]);

    await connection.commit();
    res.status(201).json({
      message: 'Inventory added successfully',
      details: {
        added_sq_meter: change_in_sq_meter,
        added_pieces: change_in_pieces,
        new_balance_sq_meter: newBalanceSqMeter,
        new_balance_pieces: newBalancePieces
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error in manual add transaction:', error);
    res.status(500).json({ message: 'Failed to add inventory' });
  } finally {
    connection.release();
  }
};

// @desc    Adjust quantity of an existing inventory item
// @desc    Adjust quantity of an existing inventory item
// @desc    Adjust quantity of an existing inventory item
exports.manualAdjustTransaction = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { inventory_item_id, quantity, unit, reason } = req.body;
    await connection.beginTransaction();

    // Get inventory item details - REMOVED source check
    const itemSql = 'SELECT length_mm, width_mm FROM inventory_items WHERE id = ?';
    const [items] = await connection.query(itemSql, [inventory_item_id]);
    if (items.length === 0) throw new Error('Item not found');
    
    const { length_mm, width_mm } = items[0];

    // Get current balance
    const balanceSql = 'SELECT balance_after_pieces, balance_after_sq_meter FROM inventory_transactions WHERE inventory_item_id = ? ORDER BY id DESC LIMIT 1';
    const [lastTx] = await connection.query(balanceSql, [inventory_item_id]);
    const currentBalancePieces = lastTx.length > 0 ? parseInt(lastTx[0].balance_after_pieces) : 0;
    const currentBalanceSqMeter = lastTx.length > 0 ? parseFloat(lastTx[0].balance_after_sq_meter) : 0;

    // Handle input conversion - quantity can be positive (add) or negative (remove)
    let master_sq_meter;
    if (unit === 'Pieces') {
      const inputPieces = parseFloat(quantity); // Keep sign (+ or -)
      const absPieces = Math.abs(inputPieces);
      master_sq_meter = inputPieces >= 0 ?
        calculateSqMeterFromPieces(absPieces, length_mm, width_mm) :
        -calculateSqMeterFromPieces(absPieces, length_mm, width_mm);
    } else {
      master_sq_meter = parseFloat(quantity); // Keep sign
    }

    const absSqMeter = Math.abs(master_sq_meter);
    const piecesFromSqMeter = calculatePiecesFromSqMeter(absSqMeter, length_mm, width_mm);
    const change_in_pieces = master_sq_meter >= 0 ? piecesFromSqMeter : -piecesFromSqMeter;
    const change_in_sq_meter = master_sq_meter;

    // Validation for removal
    if (change_in_sq_meter < 0) {
      if ((currentBalanceSqMeter + change_in_sq_meter) < 0) {
        await connection.rollback();
        return res.status(400).json({
          message: `Cannot remove ${Math.abs(change_in_sq_meter).toFixed(4)} sq meters. Only ${currentBalanceSqMeter.toFixed(4)} sq meters available.`
        });
      }
      if ((currentBalancePieces + change_in_pieces) < 0) {
        await connection.rollback();
        return res.status(400).json({
          message: `Cannot remove ${Math.abs(change_in_pieces)} pieces. Only ${currentBalancePieces} pieces available.`
        });
      }
    }

    const transaction_type = change_in_sq_meter > 0 ? 'manual_add' : 'manual_remove';
    const newBalancePieces = currentBalancePieces + change_in_pieces;
    const newBalanceSqMeter = currentBalanceSqMeter + change_in_sq_meter;

    const transactionSql = `
      INSERT INTO inventory_transactions 
      (inventory_item_id, transaction_type, change_in_sq_meter, change_in_pieces, balance_after_sq_meter, balance_after_pieces, reason, performed_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await connection.query(transactionSql, [
      inventory_item_id, transaction_type, change_in_sq_meter, change_in_pieces,
      newBalanceSqMeter, newBalancePieces, reason, 'System User'
    ]);

    await connection.commit();
    res.status(201).json({
      message: 'Inventory adjusted successfully',
      details: {
        changed_sq_meter: change_in_sq_meter,
        changed_pieces: change_in_pieces,
        new_balance_sq_meter: newBalanceSqMeter,
        new_balance_pieces: newBalancePieces
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error in manual adjust transaction:', error);
    res.status(500).json({ message: 'Failed to adjust inventory' });
  } finally {
    connection.release();
  }
};

// @desc    This function permanently deletes an inventory item
exports.deleteInventoryItem = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { id } = req.params;
    await connection.beginTransaction();

    const deleteSql = 'DELETE FROM inventory_items WHERE id = ?';
    const [result] = await connection.query(deleteSql, [id]);

    if (result.affectedRows === 0) {
      throw new Error('Item not found or already deleted.');
    }

    await connection.commit();
    res.status(200).json({ message: 'Inventory item and all its history have been permanently deleted.' });

  } catch (error) {
    await connection.rollback();
    console.error("Error deleting inventory item:", error);
    res.status(500).json({ message: 'Failed to delete inventory item.' });
  } finally {
    connection.release();
  }
};

// @desc    Get transaction history for a single inventory item
exports.getTransactionsForItem = async (req, res) => {
  try {
    const { id } = req.params;
    const itemDetailsSql = `
      SELECT 
        ii.id, ii.length_mm, ii.width_mm, ii.thickness_mm,
        s.stone_name, s.stone_type, st.name as stage
      FROM inventory_items ii
      JOIN stones s ON ii.stone_id = s.id
      LEFT JOIN stages st ON ii.stage_id = st.id
      WHERE ii.id = ?
    `;
    const [itemDetails] = await db.query(itemDetailsSql, [id]);

    if (itemDetails.length === 0) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    const transactionsSql = `
      SELECT * FROM inventory_transactions 
      WHERE inventory_item_id = ? 
      ORDER BY created_at DESC, id DESC
    `;
    const [transactions] = await db.query(transactionsSql, [id]);

    res.status(200).json({
      item: itemDetails[0],
      history: transactions
    });
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getInventoryAnalytics = async (req, res) => {
  try {
    const [totalItemsRows] = await db.query(`
        SELECT COUNT(*) as total
        FROM inventory_items ii
        WHERE (SELECT SUM(it.change_in_pieces) FROM inventory_transactions it WHERE it.inventory_item_id = ii.id) > 0
    `);

    const [rawMaterialsRows] = await db.query(`
        SELECT COUNT(*) as total
        FROM inventory_items ii
        WHERE ii.stage_id = 1 AND (SELECT SUM(it.change_in_pieces) FROM inventory_transactions it WHERE it.inventory_item_id = ii.id) > 0
    `);

    // REPLACE:
    const [finishedItemsRows] = await db.query(`
    SELECT COUNT(*) as total
    FROM inventory_items ii
    WHERE ii.stage_id = 5 AND (SELECT SUM(it.change_in_pieces) FROM inventory_transactions it WHERE it.inventory_item_id = ii.id) > 0
`);

    // WITH: (use the correct stage_id for packaging complete)
    const [packagingCompleteRows] = await db.query(`
    SELECT COUNT(*) as total
    FROM inventory_items ii
    WHERE ii.stage_id = 6 AND (SELECT SUM(it.change_in_pieces) FROM inventory_transactions it WHERE it.inventory_item_id = ii.id) > 0
`);

    const [totalQuantityRows] = await db.query(`
        SELECT 
            SUM(balance_after_pieces) as totalPieces, 
            SUM(balance_after_sq_meter) as totalSqMeter 
        FROM (
            SELECT 
                it.*, 
                ROW_NUMBER() OVER(PARTITION BY inventory_item_id ORDER BY created_at DESC, id DESC) as rn 
            FROM inventory_transactions it
        ) as subquery 
        WHERE rn = 1
    `);

    res.status(200).json({
      totalItems: totalItemsRows[0].total,
      rawMaterials: rawMaterialsRows[0].total,
      packagingComplete: packagingCompleteRows[0].total,
      totalQuantity: {
        pieces: totalQuantityRows[0].totalPieces || 0,
        sqMeter: totalQuantityRows[0].totalSqMeter || 0,
      }
    });
  } catch (error) {
    console.error('Error fetching inventory analytics:', error);
    res.status(500).json({ message: 'Server error' });
  }
};