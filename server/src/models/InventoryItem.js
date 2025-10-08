const db = require('../config/db');
const { ValidationError, NotFoundError, DatabaseError } = require('../utils/errors');

class InventoryItem {
  constructor(data) {
    this.id = data.id;
    this.stoneId = data.stone_id;
    this.lengthMm = data.length_mm;
    this.widthMm = data.width_mm;
    this.thicknessMm = data.thickness_mm;
    this.isCalibrated = data.is_calibrated;
    this.edgesTypeId = data.edges_type_id;
    this.finishingTypeId = data.finishing_type_id;
    this.stageId = data.stage_id;
    this.source = data.source; // 'procurement' or 'manual'
    
    // Joined data
    this.stoneName = data.stone_name;
    this.stoneType = data.stone_type;
    this.stage = data.stage;
    this.edgesType = data.edges_type;
    this.finishingType = data.finishing_type;
    this.quantityPieces = data.quantity_pieces || 0;
    this.quantitySqMeter = data.quantity_sq_meter || 0;
    this.lastActivityDate = data.last_activity_date;
  }

  // Helper: Calculate pieces from sq_meter (CEILING)
  static calculatePiecesFromSqMeter(sqMeter, lengthMm, widthMm) {
    const areaOfOnePiece = (lengthMm * widthMm) / 1000000;
    if (areaOfOnePiece <= 0) return 0;
    return Math.ceil(sqMeter / areaOfOnePiece);
  }

  // Helper: Calculate sq_meter from pieces
  static calculateSqMeterFromPieces(pieces, lengthMm, widthMm) {
    const areaOfOnePiece = (lengthMm * widthMm) / 1000000;
    return pieces * areaOfOnePiece;
  }

  // Find all with filters and pagination
  static async findAll(filters = {}, pagination = { page: 1, limit: 10 }) {
    try {
      const { stone_type, stone_name, stage_id, edges_type_id, finishing_type_id, source } = filters;
      const { page, limit } = pagination;
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

      // Count query
      const countSql = `SELECT COUNT(DISTINCT ii.id) as total FROM inventory_items ii JOIN stones s ON ii.stone_id = s.id ${whereString}`;
      const [countRows] = await db.execute(countSql, params);
      const totalItems = countRows[0].total;

      // Data query
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
  LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
`;

const [rows] = await db.execute(dataSql, params);

      return {
        items: rows.map(row => new InventoryItem(row)),
        pagination: {
          currentPage: parseInt(page),
          itemsPerPage: parseInt(limit),
          totalItems,
          totalPages: Math.ceil(totalItems / limit),
        }
      };
    } catch (error) {
      throw new DatabaseError(`Failed to fetch inventory items: ${error.message}`);
    }
  }

  // Find or create inventory item
  static async findOrCreate(itemData, source = 'manual') {
    const connection = await db.getConnection();
    try {
      const finalLength = Math.floor(parseFloat(itemData.length_mm));
      const finalWidth = Math.floor(parseFloat(itemData.width_mm));
      const finalThickness = itemData.thickness_mm ? Math.floor(parseFloat(itemData.thickness_mm)) : null;

      const findSql = `
        SELECT id FROM inventory_items 
        WHERE stone_id = ? AND length_mm = ? AND width_mm = ? 
        AND (thickness_mm = ? OR (thickness_mm IS NULL AND ? IS NULL))
        AND is_calibrated = ? AND edges_type_id = ? AND finishing_type_id = ? AND stage_id = ?
        AND source = ?
      `;
      const [existingItems] = await connection.execute(findSql, [
        itemData.stone_id, finalLength, finalWidth, finalThickness, finalThickness,
        itemData.is_calibrated, itemData.edges_type_id, itemData.finishing_type_id, itemData.stage_id,
        source
      ]);

      if (existingItems.length > 0) {
        return { id: existingItems[0].id, isNew: false };
      } else {
        const createSql = `
          INSERT INTO inventory_items (stone_id, length_mm, width_mm, thickness_mm, is_calibrated, edges_type_id, finishing_type_id, stage_id, source)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const [createResult] = await connection.execute(createSql, [
          itemData.stone_id, finalLength, finalWidth, finalThickness, itemData.is_calibrated, 
          itemData.edges_type_id, itemData.finishing_type_id, itemData.stage_id, source
        ]);
        return { id: createResult.insertId, isNew: true };
      }
    } finally {
      connection.release();
    }
  }

  // Delete inventory item
  static async delete(id) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const deleteSql = 'DELETE FROM inventory_items WHERE id = ?';
      const [result] = await connection.execute(deleteSql, [id]);

      if (result.affectedRows === 0) {
        throw new NotFoundError('Inventory item not found');
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError(`Failed to delete inventory item: ${error.message}`);
    } finally {
      connection.release();
    }
  }

  // Get analytics
  static async getAnalytics() {
    try {
      const [totalItemsRows] = await db.execute(`
        SELECT COUNT(*) as total
        FROM inventory_items ii
        WHERE (SELECT SUM(it.change_in_pieces) FROM inventory_transactions it WHERE it.inventory_item_id = ii.id) > 0
      `);

      const [rawMaterialsRows] = await db.execute(`
        SELECT COUNT(*) as total
        FROM inventory_items ii
        WHERE ii.stage_id = 1 AND (SELECT SUM(it.change_in_pieces) FROM inventory_transactions it WHERE it.inventory_item_id = ii.id) > 0
      `);

      const [packagingCompleteRows] = await db.execute(`
        SELECT COUNT(*) as total
        FROM inventory_items ii
        WHERE ii.stage_id = 6 AND (SELECT SUM(it.change_in_pieces) FROM inventory_transactions it WHERE it.inventory_item_id = ii.id) > 0
      `);

      const [totalQuantityRows] = await db.execute(`
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

      return {
        totalItems: totalItemsRows[0].total,
        rawMaterials: rawMaterialsRows[0].total,
        packagingComplete: packagingCompleteRows[0].total,
        totalQuantity: {
          pieces: totalQuantityRows[0].totalPieces || 0,
          sqMeter: totalQuantityRows[0].totalSqMeter || 0,
        }
      };
    } catch (error) {
      throw new DatabaseError(`Failed to fetch analytics: ${error.message}`);
    }
  }
}

module.exports = InventoryItem;