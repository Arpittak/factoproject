const db = require('../config/db');
const { ValidationError, NotFoundError, DatabaseError, DuplicateError } = require('../utils/errors');

class Vendor {
  constructor(data) {
    this.id = data.id;
    this.companyName = data.company_name;
    this.contactPerson = data.contact_person;
    this.phoneNumber = data.phone_number;
    this.emailAddress = data.email_address;
    this.city = data.city;
    this.state = data.state;
    this.stateCode = data.state_code;
    this.completeAddress = data.complete_address;
    this.gstNumber = data.gst_number;
    this.bankDetails = data.bank_details;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  // Validation methods
  static validateCompanyName(companyName) {
    if (!companyName || companyName.trim().length === 0) {
      throw new ValidationError('Company name is required');
    }
    if (companyName.length > 255) {
      throw new ValidationError('Company name must be less than 255 characters');
    }
  }

  static validateEmail(email) {
    if (email && email.length > 255) {
      throw new ValidationError('Email must be less than 255 characters');
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new ValidationError('Invalid email format');
    }
  }

  static validateGstNumber(gstNumber) {
    if (gstNumber && gstNumber.length !== 15) {
      throw new ValidationError('GST number must be 15 characters');
    }
  }

  // Clean data helper
  static cleanVendorData(data) {
    return {
      company_name: data.company_name?.trim(),
      contact_person: data.contact_person?.trim() || null,
      phone_number: data.phone_number?.trim() || null,
      email_address: data.email_address?.trim() || null,
      city: data.city?.trim() || null,
      state: data.state?.trim() || null,
      state_code: data.state_code?.trim() || null,
      complete_address: data.complete_address?.trim() || null,
      gst_number: data.gst_number?.trim() || null,
      bank_details: data.bank_details?.trim() || null
    };
  }

  // Data access methods
  static async findAll(pagination = { page: 1, limit: 10 }) {
    try {
      const { page, limit } = pagination;
      const offset = (page - 1) * limit;

      // Get total count
      const [countResult] = await db.execute('SELECT COUNT(*) as total FROM vendors');
      const totalItems = countResult[0].total;

      // Get paginated vendors
      const sql = `
        SELECT 
          id, company_name, contact_person, phone_number, email_address,
          city, state, state_code, gst_number, created_at, updated_at
        FROM vendors 
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `;
      const [rows] = await db.execute(sql, [parseInt(limit), parseInt(offset)]);
      
      return {
        vendors: rows.map(row => new Vendor(row)),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalItems / limit),
          totalItems: totalItems,
          itemsPerPage: parseInt(limit)
        }
      };
    } catch (error) {
      throw new DatabaseError(`Failed to fetch vendors: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const [rows] = await db.execute('SELECT * FROM vendors WHERE id = ?', [id]);

      if (rows.length === 0) {
        throw new NotFoundError(`Vendor with id ${id} not found`);
      }

      return new Vendor(rows[0]);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError(`Failed to fetch vendor: ${error.message}`);
    }
  }

  static async create(vendorData) {
    try {
      // Validate
      this.validateCompanyName(vendorData.company_name);
      this.validateEmail(vendorData.email_address);
      this.validateGstNumber(vendorData.gst_number);

      // Clean data
      const cleanData = this.cleanVendorData(vendorData);

      const sql = `
        INSERT INTO vendors (
          company_name, contact_person, phone_number, email_address, 
          city, state, state_code, complete_address, gst_number, bank_details
        ) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const values = [
        cleanData.company_name,
        cleanData.contact_person,
        cleanData.phone_number,
        cleanData.email_address,
        cleanData.city,
        cleanData.state,
        cleanData.state_code,
        cleanData.complete_address,
        cleanData.gst_number,
        cleanData.bank_details
      ];

      const [result] = await db.execute(sql, values);
      
      // Fetch the created vendor
      return await this.findById(result.insertId);

    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      
      // Handle MySQL duplicate entry errors
      if (error.code === 'ER_DUP_ENTRY') {
        if (error.message.includes('company_name')) {
          throw new DuplicateError('Company name already exists');
        }
        if (error.message.includes('gst_number')) {
          throw new DuplicateError('GST number already exists');
        }
      }
      
      throw new DatabaseError(`Failed to create vendor: ${error.message}`);
    }
  }

  static async update(id, vendorData) {
    try {
      // Check if vendor exists
      await this.findById(id);

      // Validate
      this.validateCompanyName(vendorData.company_name);
      this.validateEmail(vendorData.email_address);
      this.validateGstNumber(vendorData.gst_number);

      // Clean data
      const cleanData = this.cleanVendorData(vendorData);

      const sql = `
        UPDATE vendors SET 
          company_name = ?, contact_person = ?, phone_number = ?, email_address = ?,
          city = ?, state = ?, state_code = ?, complete_address = ?, 
          gst_number = ?, bank_details = ?
        WHERE id = ?
      `;
      
      const values = [
        cleanData.company_name,
        cleanData.contact_person,
        cleanData.phone_number,
        cleanData.email_address,
        cleanData.city,
        cleanData.state,
        cleanData.state_code,
        cleanData.complete_address,
        cleanData.gst_number,
        cleanData.bank_details,
        id
      ];

      await db.execute(sql, values);
      
      // Fetch updated vendor
      return await this.findById(id);

    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error;
      }
      
      // Handle MySQL duplicate entry errors
      if (error.code === 'ER_DUP_ENTRY') {
        if (error.message.includes('company_name')) {
          throw new DuplicateError('Company name already exists');
        }
        if (error.message.includes('gst_number')) {
          throw new DuplicateError('GST number already exists');
        }
      }
      
      throw new DatabaseError(`Failed to update vendor: ${error.message}`);
    }
  }

  static async checkCompanyNameAvailability(companyName, excludeId = null) {
    try {
      let sql = 'SELECT id FROM vendors WHERE company_name = ?';
      let params = [companyName.trim()];

      if (excludeId) {
        sql += ' AND id != ?';
        params.push(excludeId);
      }

      const [result] = await db.execute(sql, params);
      return result.length === 0;

    } catch (error) {
      throw new DatabaseError(`Failed to check company name availability: ${error.message}`);
    }
  }

  static async checkGstAvailability(gstNumber, excludeId = null) {
    try {
      if (!gstNumber || gstNumber.trim() === '') {
        return true; // GST is optional
      }

      let sql = 'SELECT id FROM vendors WHERE gst_number = ?';
      let params = [gstNumber.trim()];

      if (excludeId) {
        sql += ' AND id != ?';
        params.push(excludeId);
      }

      const [result] = await db.execute(sql, params);
      return result.length === 0;

    } catch (error) {
      throw new DatabaseError(`Failed to check GST availability: ${error.message}`);
    }
  }

  static async getAnalytics() {
    try {
      const [totalVendors] = await db.execute('SELECT COUNT(*) as count FROM vendors');
      const [activeVendors] = await db.execute('SELECT COUNT(*) as count FROM vendors WHERE phone_number IS NOT NULL OR email_address IS NOT NULL');
      const [states] = await db.execute('SELECT COUNT(DISTINCT state) as count FROM vendors WHERE state IS NOT NULL');
      const [gstRegistered] = await db.execute('SELECT COUNT(*) as count FROM vendors WHERE gst_number IS NOT NULL');

      return {
        totalVendors: totalVendors[0].count,
        activeVendors: activeVendors[0].count,
        stateCount: states[0].count,
        gstRegistered: gstRegistered[0].count
      };
    } catch (error) {
      throw new DatabaseError(`Failed to fetch vendor analytics: ${error.message}`);
    }
  }

  // Check if vendor has any procurements
  async hasProcurements() {
    try {
      const [rows] = await db.execute(
        'SELECT COUNT(*) as count FROM procurements WHERE vendor_id = ?',
        [this.id]
      );
      return rows[0].count > 0;
    } catch (error) {
      throw new DatabaseError(`Failed to check vendor procurements: ${error.message}`);
    }
  }
}

module.exports = Vendor;