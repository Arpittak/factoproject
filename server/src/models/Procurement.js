const db = require('../config/db');
const { ValidationError, NotFoundError, DatabaseError } = require('../utils/errors');

class Procurement {
  constructor(data) {
  this.id = data.id;
  this.vendor_id = data.vendor_id;
  this.invoice_date = data.invoice_date;
  this.supplier_invoice = data.supplier_invoice;
  this.vehicle_number = data.vehicle_number;
  this.gst_type = data.gst_type;
  this.tax_percentage = data.tax_percentage;
  this.freight_charges = data.freight_charges;
  this.additional_taxable_amount = data.additional_taxable_amount;
  this.grand_total = data.grand_total;
  this.comments = data.comments;
  this.created_at = data.created_at;
  this.updated_at = data.updated_at;
  
  // Joined data
  this.vendor_name = data.vendor_name;
  this.company_name = data.company_name;
  this.contact_person = data.contact_person;
  this.phone_number = data.phone_number;
  this.email_address = data.email_address;
  this.city = data.city;
  this.state = data.state;
  this.state_code = data.state_code;
  this.complete_address = data.complete_address;
  this.gst_number = data.gst_number;
  this.bank_details = data.bank_details;
  this.total_items = data.total_items;
}

  // Find all procurements with filters and pagination
  static async findAll(filters = {}, pagination = { page: 1, limit: 10 }) {
    try {
      const {
        vendor_id, supplier_invoice, date_received,
        stone_type, stone_name, stage_id
      } = filters;
      const { page, limit } = pagination;
      const offset = (page - 1) * limit;

      let whereClauses = ["1=1"];
      let params = [];

      // Filters for the main procurement record
      if (vendor_id) { 
        whereClauses.push("p.vendor_id = ?"); 
        params.push(vendor_id); 
      }
      if (supplier_invoice) { 
        whereClauses.push("p.supplier_invoice LIKE ?"); 
        params.push(`%${supplier_invoice}%`); 
      }
      if (date_received) { 
        whereClauses.push("p.invoice_date = ?"); 
        params.push(date_received); 
      }

      // Advanced Filters for items within the procurement
      if (stone_type || stone_name || stage_id) {
        let subQuery = "SELECT 1 FROM procurement_items pi JOIN stones s ON pi.stone_id = s.id WHERE pi.procurement_id = p.id";
        if (stone_type) { 
          subQuery += " AND s.stone_type = ?"; 
          params.push(stone_type); 
        }
        if (stone_name) { 
          subQuery += " AND s.stone_name LIKE ?"; 
          params.push(`%${stone_name}%`); 
        }
        if (stage_id) {
          subQuery += " AND pi.stage_id = ?";
          params.push(stage_id);
        }
        whereClauses.push(`EXISTS (${subQuery})`);
      }

      const whereString = `WHERE ${whereClauses.join(' AND ')}`;

      // Count query
      const countSql = `SELECT COUNT(*) as total FROM procurements p ${whereString}`;
      const [countRows] = await db.execute(countSql, params);
      const totalItems = countRows[0].total;

      // Data query
      const dataSql = `
  SELECT p.*, v.company_name as vendor_name,
    (SELECT COUNT(*) FROM procurement_items pi WHERE pi.procurement_id = p.id) AS total_items
  FROM procurements p
  JOIN vendors v ON p.vendor_id = v.id
  ${whereString}
  ORDER BY p.updated_at DESC
  LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
`;

const [rows] = await db.execute(dataSql, params);

      return {
        procurements: rows.map(row => new Procurement(row)),
        pagination: {
          currentPage: parseInt(page),
          itemsPerPage: parseInt(limit),
          totalItems,
          totalPages: Math.ceil(totalItems / limit)
        }
      };
    } catch (error) {
      throw new DatabaseError(`Failed to fetch procurements: ${error.message}`);
    }
  }

  // Find procurement by ID with full details
  static async findById(id) {
    try {
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

      const [procurementRows] = await db.execute(procurementSql, [id]);

      if (procurementRows.length === 0) {
        throw new NotFoundError('Procurement not found');
      }

      return new Procurement(procurementRows[0]);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError(`Failed to fetch procurement: ${error.message}`);
    }
  }

  // Create new procurement
  static async create(procurementData) {
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
        comments
      } = procurementData;

      // Validate GST type
      const validGstTypes = ['IGST', 'CGST', 'SGST'];
      if (gst_type && !validGstTypes.includes(gst_type)) {
        throw new ValidationError('Invalid GST type. Must be one of: IGST, CGST, SGST');
      }

      await connection.beginTransaction();

      // Create the main procurement record
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
      const [procResult] = await connection.execute(procurementSql, [
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

      await connection.commit();
      return procResult.insertId;

    } catch (error) {
      await connection.rollback();
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new DatabaseError(`Failed to create procurement: ${error.message}`);
    } finally {
      connection.release();
    }
  }

  // Get analytics
  static async getAnalytics() {
    try {
      const [analyticsRows] = await db.execute(`
        SELECT
          COUNT(*) AS totalProcurements,
          SUM(p.grand_total) AS totalValue,
          COUNT(DISTINCT p.vendor_id) AS uniqueVendors,
          (SELECT COUNT(*) FROM procurement_items) AS totalStones
        FROM procurements p
      `);

      return analyticsRows[0];
    } catch (error) {
      throw new DatabaseError(`Failed to fetch procurement analytics: ${error.message}`);
    }
  }
}

module.exports = Procurement;