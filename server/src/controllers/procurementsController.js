const db = require('../config/db');

// Helper functions for consistent calculations
const calculatePiecesFromSqMeter = (sqMeter, length_mm, width_mm) => {
  const areaOfOnePiece = (length_mm * width_mm) / 1000000;
  if (areaOfOnePiece <= 0) return 0;
  return Math.ceil(sqMeter / areaOfOnePiece); // Use ceiling for rounding up
};

const calculateSqMeterFromPieces = (pieces, length_mm, width_mm) => {
  const areaOfOnePiece = (length_mm * width_mm) / 1000000;
  return pieces * areaOfOnePiece;
};

exports.getAllProcurements = async (req, res) => {
  try {
    const {
      vendor_id, supplier_invoice, date_received,
      stone_type, stone_name, stage_id,
      page = 1, limit = 10
    } = req.query;
    const offset = (page - 1) * limit;

    let whereClauses = ["1=1"];
    let params = [];

    // Filters for the main procurement record
    if (vendor_id) { whereClauses.push("p.vendor_id = ?"); params.push(vendor_id); }
    if (supplier_invoice) { whereClauses.push("p.supplier_invoice LIKE ?"); params.push(`%${supplier_invoice}%`); }
    if (date_received) { whereClauses.push("p.invoice_date = ?"); params.push(date_received); }

    // Advanced Filters for items within the procurement
    if (stone_type || stone_name || stage_id) {
      let subQuery = "SELECT 1 FROM procurement_items pi JOIN stones s ON pi.stone_id = s.id WHERE pi.procurement_id = p.id";
      if (stone_type) { subQuery += " AND s.stone_type = ?"; params.push(stone_type); }
      if (stone_name) { subQuery += " AND s.stone_name LIKE ?"; params.push(`%${stone_name}%`); }

      if (stage_id) {
        subQuery += " AND pi.stage_id = ?";
        params.push(stage_id);
      }
      whereClauses.push(`EXISTS (${subQuery})`);
    }

    const whereString = `WHERE ${whereClauses.join(' AND ')}`;

    const countSql = `SELECT COUNT(*) as total FROM procurements p ${whereString}`;
    const [countRows] = await db.query(countSql, params);
    const totalItems = countRows[0].total;

    const dataSql = `
      SELECT p.*, v.company_name as vendor_name,
        (SELECT COUNT(*) FROM procurement_items pi WHERE pi.procurement_id = p.id) AS total_items
      FROM procurements p
      JOIN vendors v ON p.vendor_id = v.id
      ${whereString}
      ORDER BY p.updated_at DESC
      LIMIT ? OFFSET ?;
    `;
    const [procurements] = await db.query(dataSql, [...params, parseInt(limit), parseInt(offset)]);

    res.status(200).json({
      procurements,
      pagination: { currentPage: parseInt(page), itemsPerPage: parseInt(limit), totalItems, totalPages: Math.ceil(totalItems / limit) }
    });
  } catch (error) {
    console.error('Error fetching procurements:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createProcurement = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const {
      vendor_id,
      invoice_date,
      supplier_invoice,
      vehicle_number,
      grand_total,
      gst_type,
      tax_percentage,
      additional_taxable_amount,
      freight_charges,
      comments,
      items
    } = req.body;

    const validGstTypes = ['IGST', 'CGST', 'SGST'];
    if (gst_type && !validGstTypes.includes(gst_type)) {
      return res.status(400).json({
        message: 'Invalid GST type. Must be one of: IGST, CGST, SGST'
      });
    }

    await connection.beginTransaction();

    // Step 1: Create the main procurement record with GST details
    const procurementSql = `
      INSERT INTO procurements (
        vendor_id, 
        invoice_date, 
        supplier_invoice, 
        vehicle_number, 
        grand_total, 
        gst_type, 
        tax_percentage, 
        freight_charges,
        additional_taxable_amount,
        comments
      ) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [procResult] = await connection.query(procurementSql, [
      vendor_id,
      invoice_date,
      supplier_invoice,
      vehicle_number || null,
      grand_total,
      gst_type || 'IGST',
      tax_percentage || 0,
      freight_charges || 0,
      additional_taxable_amount || 0,
      comments || null
    ]);
    const procurementId = procResult.insertId;

    // Step 2: Process each item in the procurement
    for (const item of items) {
      // Validate required fields
      if (!item.stone_id || !item.length_mm || !item.width_mm || !item.quantity || !item.rate) {
        throw new Error(`Missing required fields in procurement item`);
      }

      // Sanitize dimensions - ensure they are integers
      const finalLength = Math.floor(parseFloat(item.length_mm));
      const finalWidth = Math.floor(parseFloat(item.width_mm));
      const finalThickness = item.thickness_mm ? Math.floor(parseFloat(item.thickness_mm)) : null;

      // Calculate item amount if not provided
      const calculatedItemAmount = parseFloat(item.quantity) * parseFloat(item.rate);

      // Find or create inventory item with source = 'procurement'
      let inventoryItemId;
      let transaction_type;

      const findSql = `
        SELECT id FROM inventory_items 
        WHERE stone_id = ? AND length_mm = ? AND width_mm = ? 
        AND (thickness_mm = ? OR (thickness_mm IS NULL AND ? IS NULL))
        AND is_calibrated = ? AND edges_type_id = ? AND finishing_type_id = ? AND stage_id = ?
        AND source = 'procurement'
      `;
      const [existing] = await connection.query(findSql, [
        item.stone_id, finalLength, finalWidth, finalThickness, finalThickness,
        item.is_calibrated, item.edges_type_id, item.finishing_type_id, item.stage_id
      ]);

      if (existing.length > 0) {
        inventoryItemId = existing[0].id;
        transaction_type = 'procurement_quantity_added';
      } else {
        const createSql = `
          INSERT INTO inventory_items 
          (stone_id, length_mm, width_mm, thickness_mm, is_calibrated, edges_type_id, finishing_type_id, stage_id, source) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'procurement')
        `;
        const [createResult] = await connection.query(createSql, [
          item.stone_id, finalLength, finalWidth, finalThickness,
          item.is_calibrated, item.edges_type_id, item.finishing_type_id, item.stage_id
        ]);
        inventoryItemId = createResult.insertId;
        transaction_type = 'procurement_initial_stock';
      }

      // Insert procurement item record WITH inventory_item_id link
      // Add created_at to the INSERT statement
      const procItemSql = `
  INSERT INTO procurement_items 
  (procurement_id, stone_id, hsn_code_id, length_mm, width_mm, thickness_mm, 
   is_calibrated, edges_type_id, finishing_type_id, stage_id,
   quantity, units, rate, rate_unit, item_amount, comments, inventory_item_id, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

      await connection.query(procItemSql, [
        procurementId,
        item.stone_id,
        item.hsn_code_id || null,
        finalLength,
        finalWidth,
        finalThickness,
        item.is_calibrated || false,
        item.edges_type_id || null,
        item.finishing_type_id || null,
        item.stage_id || null,
        parseFloat(item.quantity),
        item.units,
        parseFloat(item.rate),
        item.rate_unit,
        calculatedItemAmount,
        item.comments || null,
        inventoryItemId,  // LINK TO INVENTORY
        invoice_date
      ]);

      // Calculate quantities using corrected logic
      let master_sq_meter;
      let change_in_pieces;

      if (item.units === 'Pieces') {
        const inputPieces = parseInt(item.quantity);
        master_sq_meter = calculateSqMeterFromPieces(inputPieces, finalLength, finalWidth);
      } else {
        master_sq_meter = parseFloat(item.quantity);
      }

      // Always recalculate pieces from master sq_meter value
      change_in_pieces = calculatePiecesFromSqMeter(master_sq_meter, finalLength, finalWidth);
      const change_in_sq_meter = master_sq_meter;

      // Get current balance
      const balanceSql = 'SELECT balance_after_pieces, balance_after_sq_meter FROM inventory_transactions WHERE inventory_item_id = ? ORDER BY id DESC LIMIT 1';
      const [lastTx] = await connection.query(balanceSql, [inventoryItemId]);
      const currentBalancePieces = lastTx.length > 0 ? parseFloat(lastTx[0].balance_after_pieces) : 0;
      const currentBalanceSqMeter = lastTx.length > 0 ? parseFloat(lastTx[0].balance_after_sq_meter) : 0;

      const newBalancePieces = currentBalancePieces + change_in_pieces;
      const newBalanceSqMeter = currentBalanceSqMeter + change_in_sq_meter;

      // Insert inventory transaction
      const transactionSql = `
        INSERT INTO inventory_transactions 
        (inventory_item_id, transaction_type, change_in_sq_meter, change_in_pieces, 
         balance_after_sq_meter, balance_after_pieces, source_details, performed_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await connection.query(transactionSql, [
        inventoryItemId,
        transaction_type,
        change_in_sq_meter,
        change_in_pieces,
        newBalanceSqMeter,
        newBalancePieces,
        `Procurement Invoice: ${supplier_invoice}`,
        'System'
      ]);
    }

    await connection.commit();
    res.status(201).json({ message: 'Procurement created successfully', id: procurementId });

  } catch (error) {
    await connection.rollback();
    console.error('Error creating procurement:', error);
    res.status(500).json({ message: 'Failed to create procurement', error: error.message });
  } finally {
    connection.release();
  }
};

exports.getProcurementAnalytics = async (req, res) => {
  try {
    const [analyticsRows] = await db.query(`
      SELECT
        COUNT(*) AS totalProcurements,
        SUM(p.grand_total) AS totalValue,
        COUNT(DISTINCT p.vendor_id) AS uniqueVendors,
        (SELECT COUNT(*) FROM procurement_items) AS totalStones
      FROM procurements p
    `);

    res.status(200).json(analyticsRows[0]);

  } catch (error) {
    console.error('Error fetching procurement analytics:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getProcurementById = async (req, res) => {
  try {
    const { id } = req.params;

    // Get procurement details with vendor information
    const procurementSql = `
      SELECT 
        p.*,
        v.company_name,
        v.contact_person,
        v.phone_number,
        v.email_address,
        v.city,
        v.state,
        v.state_code,
        v.complete_address,
        v.gst_number,
        v.bank_details
      FROM procurements p
      JOIN vendors v ON p.vendor_id = v.id
      WHERE p.id = ?
    `;

    const [procurementRows] = await db.query(procurementSql, [id]);

    if (procurementRows.length === 0) {
      return res.status(404).json({ message: 'Procurement not found' });
    }

    const procurement = procurementRows[0];

    // Get procurement items with stone details
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

    const [items] = await db.query(itemsSql, [id]);

    // Calculate summary data
    // CHANGE TO (CORRECT):
    const currentItemsAmount = items.reduce((sum, item) => sum + parseFloat(item.item_amount), 0);

    res.status(200).json({
      procurement,
      items,
      summary: {
        totalItems: items.length,
        // Use original stored values, not recalculated ones
        totalProcurementAmount: parseFloat(procurement.grand_total) - parseFloat(procurement.freight_charges || 0),
        taxAmount: ((parseFloat(procurement.grand_total) - parseFloat(procurement.freight_charges || 0)) * parseFloat(procurement.tax_percentage)) / 100,
        grandTotal: parseFloat(procurement.grand_total), // Always use original
        currentItemsTotal: currentItemsAmount // Optional: show current items total separately
      }
    });

  } catch (error) {
    console.error('Error fetching procurement details:', error);
    res.status(500).json({ message: 'Server error' });
  }
};



exports.deleteProcurementItem = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { procurementItemId } = req.params;

    await connection.beginTransaction();

    // Get procurement item details with inventory_item_id
    const itemSql = `
      SELECT pi.*, p.supplier_invoice 
      FROM procurement_items pi 
      JOIN procurements p ON pi.procurement_id = p.id 
      WHERE pi.id = ?
    `;
    const [itemRows] = await connection.query(itemSql, [procurementItemId]);

    if (itemRows.length === 0) {
      return res.status(404).json({ message: 'Procurement item not found' });
    }

    const item = itemRows[0];

    // Check if inventory_item_id exists and inventory item still exists
    if (item.inventory_item_id) {
      const [inventoryCheck] = await connection.query(
        'SELECT id FROM inventory_items WHERE id = ?',
        [item.inventory_item_id]
      );

      if (inventoryCheck.length > 0) {
        // Inventory item exists, so reduce its quantity
        const inventoryItemId = item.inventory_item_id;

        // Calculate reduction amounts (same logic as procurement creation but negative)
        let master_sq_meter;
        if (item.units === 'Pieces') {
          master_sq_meter = calculateSqMeterFromPieces(parseInt(item.quantity), item.length_mm, item.width_mm);
        } else {
          master_sq_meter = parseFloat(item.quantity);
        }

        const change_in_pieces = -calculatePiecesFromSqMeter(master_sq_meter, item.length_mm, item.width_mm);
        const change_in_sq_meter = -master_sq_meter;

        // Get current balance
        const balanceSql = 'SELECT balance_after_pieces, balance_after_sq_meter FROM inventory_transactions WHERE inventory_item_id = ? ORDER BY id DESC LIMIT 1';
        const [lastTx] = await connection.query(balanceSql, [inventoryItemId]);
        const currentBalancePieces = lastTx.length > 0 ? parseFloat(lastTx[0].balance_after_pieces) : 0;
        const currentBalanceSqMeter = lastTx.length > 0 ? parseFloat(lastTx[0].balance_after_sq_meter) : 0;

        const newBalancePieces = currentBalancePieces + change_in_pieces;
        const newBalanceSqMeter = currentBalanceSqMeter + change_in_sq_meter;

        // Check if removing this item would result in zero or negative balance
        if (newBalancePieces <= 0 || newBalanceSqMeter <= 0) {
          // Check if this is the only procurement item linked to this inventory item
          const [linkedItemsCount] = await connection.query(
            'SELECT COUNT(*) as count FROM procurement_items WHERE inventory_item_id = ? AND id != ?',
            [inventoryItemId, procurementItemId]
          );

          if (linkedItemsCount[0].count === 0) {
            // This is the only procurement item linked, delete entire inventory item
            await connection.query('DELETE FROM inventory_items WHERE id = ?', [inventoryItemId]);
          } else {
            // Other procurement items still linked, add negative transaction
            const transactionSql = `
              INSERT INTO inventory_transactions 
              (inventory_item_id, transaction_type, change_in_sq_meter, change_in_pieces, 
               balance_after_sq_meter, balance_after_pieces, source_details, performed_by)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;
            await connection.query(transactionSql, [
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
          await connection.query(transactionSql, [
            inventoryItemId, 'procurement_item_deleted', change_in_sq_meter, change_in_pieces,
            newBalanceSqMeter, newBalancePieces,
            `Deleted from procurement: ${item.supplier_invoice}`, 'System'
          ]);
        }
      }
      // If inventory item doesn't exist (was deleted), we just delete procurement item
    }
    // If no inventory_item_id, we just delete procurement item

    // Delete procurement item
    await connection.query('DELETE FROM procurement_items WHERE id = ?', [procurementItemId]);

    await connection.commit();
    res.status(200).json({ message: 'Procurement item deleted successfully' });

  } catch (error) {
    await connection.rollback();
    console.error('Error deleting procurement item:', error);
    res.status(500).json({ message: 'Failed to delete procurement item' });
  } finally {
    connection.release();
  }
};



exports.addProcurementItem = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { procurementId } = req.params;
    const item = req.body;

    await connection.beginTransaction();

    // Get procurement info
    const procSql = 'SELECT supplier_invoice FROM procurements WHERE id = ?';
    const [procRows] = await connection.query(procSql, [procurementId]);

    if (procRows.length === 0) {
      return res.status(404).json({ message: 'Procurement not found' });
    }

    // Sanitize dimensions
    const finalLength = Math.floor(parseFloat(item.length_mm));
    const finalWidth = Math.floor(parseFloat(item.width_mm));
    const finalThickness = item.thickness_mm ? Math.floor(parseFloat(item.thickness_mm)) : null;

    // Calculate item amount
    const calculatedItemAmount = parseFloat(item.quantity) * parseFloat(item.rate);

    // Find or create inventory item with source = 'procurement'
    let inventoryItemId;
    let transaction_type;

    const findSql = `
      SELECT id FROM inventory_items 
      WHERE stone_id = ? AND length_mm = ? AND width_mm = ? 
      AND (thickness_mm = ? OR (thickness_mm IS NULL AND ? IS NULL))
      AND is_calibrated = ? AND edges_type_id = ? AND finishing_type_id = ? AND stage_id = ?
      AND source = 'procurement'
    `;
    const [existing] = await connection.query(findSql, [
      item.stone_id, finalLength, finalWidth, finalThickness, finalThickness,
      item.is_calibrated, item.edges_type_id, item.finishing_type_id, item.stage_id
    ]);

    if (existing.length > 0) {
      inventoryItemId = existing[0].id;
      transaction_type = 'procurement_quantity_added';
    } else {
      const createSql = `
        INSERT INTO inventory_items 
        (stone_id, length_mm, width_mm, thickness_mm, is_calibrated, edges_type_id, finishing_type_id, stage_id, source) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'procurement')
      `;
      const [createResult] = await connection.query(createSql, [
        item.stone_id, finalLength, finalWidth, finalThickness,
        item.is_calibrated, item.edges_type_id, item.finishing_type_id, item.stage_id
      ]);
      inventoryItemId = createResult.insertId;
      transaction_type = 'procurement_initial_stock';
    }

    const procItemSql = `
  INSERT INTO procurement_items 
  (procurement_id, stone_id, hsn_code_id, length_mm, width_mm, thickness_mm, 
   is_calibrated, edges_type_id, finishing_type_id, stage_id,
   quantity, units, rate, rate_unit, item_amount, comments, inventory_item_id, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
`;

    await connection.query(procItemSql, [
      procurementId, item.stone_id, item.hsn_code_id || null,
      finalLength, finalWidth, finalThickness,
      item.is_calibrated || false, item.edges_type_id || null,
      item.finishing_type_id || null, item.stage_id || null,
      parseFloat(item.quantity), item.units, parseFloat(item.rate),
      item.rate_unit, calculatedItemAmount, item.comments || null,
      inventoryItemId  // LINK TO INVENTORY
    ]);

    // Calculate quantities using "Sq Meter First" logic
    let master_sq_meter;
    if (item.units === 'Pieces') {
      master_sq_meter = calculateSqMeterFromPieces(parseInt(item.quantity), finalLength, finalWidth);
    } else {
      master_sq_meter = parseFloat(item.quantity);
    }

    const change_in_pieces = calculatePiecesFromSqMeter(master_sq_meter, finalLength, finalWidth);
    const change_in_sq_meter = master_sq_meter;

    // Get current balance
    const balanceSql = 'SELECT balance_after_pieces, balance_after_sq_meter FROM inventory_transactions WHERE inventory_item_id = ? ORDER BY id DESC LIMIT 1';
    const [lastTx] = await connection.query(balanceSql, [inventoryItemId]);
    const currentBalancePieces = lastTx.length > 0 ? parseFloat(lastTx[0].balance_after_pieces) : 0;
    const currentBalanceSqMeter = lastTx.length > 0 ? parseFloat(lastTx[0].balance_after_sq_meter) : 0;

    const newBalancePieces = currentBalancePieces + change_in_pieces;
    const newBalanceSqMeter = currentBalanceSqMeter + change_in_sq_meter;

    // Insert inventory transaction
    const transactionSql = `
      INSERT INTO inventory_transactions 
      (inventory_item_id, transaction_type, change_in_sq_meter, change_in_pieces, 
       balance_after_sq_meter, balance_after_pieces, source_details, performed_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await connection.query(transactionSql, [
      inventoryItemId, transaction_type, change_in_sq_meter, change_in_pieces,
      newBalanceSqMeter, newBalancePieces,
      `Added to procurement: ${procRows[0].supplier_invoice}`, 'System'
    ]);

    await connection.commit();
    res.status(201).json({ message: 'Procurement item added successfully' });

  } catch (error) {
    await connection.rollback();
    console.error('Error adding procurement item:', error);
    res.status(500).json({ message: 'Failed to add procurement item' });
  } finally {
    connection.release();
  }
};