// @desc    Create a new vendor
// @route   POST /api/vendors
exports.createVendor = async (req, res) => {
  try {
    const {
      company_name,
      contact_person,
      phone_number,
      email_address,
      city,
      state,
      state_code,
      complete_address,
      gst_number,
      bank_details,
    } = req.body;

    // Validate required fields
    if (!company_name || company_name.trim() === '') {
      return res.status(400).json({ 
        message: 'Company name is required',
        field: 'company_name'
      });
    }

    // Clean data - convert empty strings to NULL for optional fields
    const cleanGstNumber = gst_number && gst_number.trim() !== '' ? gst_number.trim() : null;
    const cleanContactPerson = contact_person && contact_person.trim() !== '' ? contact_person.trim() : null;
    const cleanEmail = email_address && email_address.trim() !== '' ? email_address.trim() : null;
    const cleanPhone = phone_number && phone_number.trim() !== '' ? phone_number.trim() : null;

    // SQL query to insert a new vendor
    const sql = `
      INSERT INTO vendors (
        company_name, contact_person, phone_number, email_address, 
        city, state, state_code, complete_address, gst_number, bank_details
      ) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
      company_name.trim(),
      cleanContactPerson,
      cleanPhone,
      cleanEmail,
      city || null,
      state || null,
      state_code || null,
      complete_address || null,
      cleanGstNumber,
      bank_details || null
    ];

    const [result] = await db.query(sql, values);
    
    // Fetch the created vendor
    const [newVendor] = await db.query('SELECT * FROM vendors WHERE id = ?', [result.insertId]);
    
    res.status(201).json({
      message: 'Vendor created successfully',
      vendor: newVendor[0]
    });

  } catch (error) {
    console.error('Error creating vendor:', error);
    
    // Handle MySQL duplicate entry errors
    if (error.code === 'ER_DUP_ENTRY') {
      if (error.message.includes('company_name')) {
        return res.status(409).json({ 
          message: 'Company name already exists. Please choose a different name.',
          field: 'company_name',
          error: 'DUPLICATE_COMPANY_NAME'
        });
      }
      if (error.message.includes('gst_number')) {
        return res.status(409).json({ 
          message: 'GST number already exists. Please check the GST number.',
          field: 'gst_number',
          error: 'DUPLICATE_GST_NUMBER'
        });
      }
    }
    
    res.status(500).json({ 
      message: 'Server error while creating vendor',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
};

// @desc    Check if company name is available
// @route   GET /api/vendors/check-company-name/:name
exports.checkCompanyNameAvailability = async (req, res) => {
  try {
    const { name } = req.params;
    const excludeId = req.query.excludeId; // For edit operations
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Company name is required' });
    }

    let sql = 'SELECT id FROM vendors WHERE company_name = ?';
    let params = [name.trim()];

    // Exclude current vendor when editing
    if (excludeId) {
      sql += ' AND id != ?';
      params.push(excludeId);
    }

    const [result] = await db.query(sql, params);
    
    res.json({
      available: result.length === 0,
      message: result.length === 0 
        ? 'Company name is available' 
        : 'Company name is already taken'
    });

  } catch (error) {
    console.error('Error checking company name availability:', error);
    res.status(500).json({ message: 'Server error while checking availability' });
  }
};

// @desc    Check if GST number is available
// @route   GET /api/vendors/check-gst/:gst
exports.checkGstAvailability = async (req, res) => {
  try {
    const { gst } = req.params;
    const excludeId = req.query.excludeId;
    
    if (!gst || gst.trim() === '') {
      return res.json({
        available: true,
        message: 'GST number not provided (optional)'
      });
    }

    let sql = 'SELECT id FROM vendors WHERE gst_number = ?';
    let params = [gst.trim()];

    if (excludeId) {
      sql += ' AND id != ?';
      params.push(excludeId);
    }

    const [result] = await db.query(sql, params);
    
    res.json({
      available: result.length === 0,
      message: result.length === 0 
        ? 'GST number is available' 
        : 'GST number is already registered'
    });

  } catch (error) {
    console.error('Error checking GST availability:', error);
    res.status(500).json({ message: 'Server error while checking availability' });
  }
};

// @desc    Get all vendors
// @route   GET /api/vendors
// @desc    Get all vendors with pagination
// @route   GET /api/vendors
exports.getAllVendors = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Get total count
    const [countResult] = await db.query('SELECT COUNT(*) as total FROM vendors');
    const totalItems = countResult[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    // Get paginated vendors
    const sql = `
      SELECT 
        id, company_name, contact_person, phone_number, email_address,
        city, state, state_code, gst_number, created_at, updated_at
      FROM vendors 
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    const [vendors] = await db.query(sql, [parseInt(limit), parseInt(offset)]);
    
    res.status(200).json({
      vendors: vendors,
      pagination: {
        currentPage: parseInt(page),
        totalPages: totalPages,
        totalItems: totalItems
      }
    });
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({ message: 'Server error while fetching vendors' });
  }
};
// @desc    Get vendor by ID
// @route   GET /api/vendors/:id
exports.getVendorById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [vendor] = await db.query('SELECT * FROM vendors WHERE id = ?', [id]);
    
    if (vendor.length === 0) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    
    res.status(200).json({ vendor: vendor[0] });
  } catch (error) {
    console.error('Error fetching vendor:', error);
    res.status(500).json({ message: 'Server error while fetching vendor' });
  }
};

// @desc    Update vendor
// @route   PUT /api/vendors/:id
exports.updateVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      company_name,
      contact_person,
      phone_number,
      email_address,
      city,
      state,
      state_code,
      complete_address,
      gst_number,
      bank_details,
    } = req.body;

    // Check if vendor exists
    const [existingVendor] = await db.query('SELECT id FROM vendors WHERE id = ?', [id]);
    if (existingVendor.length === 0) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Validate required fields
    if (!company_name || company_name.trim() === '') {
      return res.status(400).json({ 
        message: 'Company name is required',
        field: 'company_name'
      });
    }

    // Clean data
    const cleanGstNumber = gst_number && gst_number.trim() !== '' ? gst_number.trim() : null;
    const cleanContactPerson = contact_person && contact_person.trim() !== '' ? contact_person.trim() : null;
    const cleanEmail = email_address && email_address.trim() !== '' ? email_address.trim() : null;
    const cleanPhone = phone_number && phone_number.trim() !== '' ? phone_number.trim() : null;

    const sql = `
      UPDATE vendors SET 
        company_name = ?, contact_person = ?, phone_number = ?, email_address = ?,
        city = ?, state = ?, state_code = ?, complete_address = ?, 
        gst_number = ?, bank_details = ?
      WHERE id = ?
    `;
    
    const values = [
      company_name.trim(),
      cleanContactPerson,
      cleanPhone,
      cleanEmail,
      city || null,
      state || null,
      state_code || null,
      complete_address || null,
      cleanGstNumber,
      bank_details || null,
      id
    ];

    await db.query(sql, values);
    
    // Fetch updated vendor
    const [updatedVendor] = await db.query('SELECT * FROM vendors WHERE id = ?', [id]);
    
    res.status(200).json({
      message: 'Vendor updated successfully',
      vendor: updatedVendor[0]
    });

  } catch (error) {
    console.error('Error updating vendor:', error);
    
    // Handle MySQL duplicate entry errors
    if (error.code === 'ER_DUP_ENTRY') {
      if (error.message.includes('company_name')) {
        return res.status(409).json({ 
          message: 'Company name already exists. Please choose a different name.',
          field: 'company_name',
          error: 'DUPLICATE_COMPANY_NAME'
        });
      }
      if (error.message.includes('gst_number')) {
        return res.status(409).json({ 
          message: 'GST number already exists. Please check the GST number.',
          field: 'gst_number',
          error: 'DUPLICATE_GST_NUMBER'
        });
      }
    }
    
    res.status(500).json({ 
      message: 'Server error while updating vendor',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
};



// @desc    Get vendor analytics
// @route   GET /api/vendors/analytics  
exports.getVendorAnalytics = async (req, res) => {
  try {
    const [totalVendors] = await db.query('SELECT COUNT(*) as count FROM vendors');
    const [activeVendors] = await db.query('SELECT COUNT(*) as count FROM vendors WHERE phone_number IS NOT NULL OR email_address IS NOT NULL');
    const [states] = await db.query('SELECT COUNT(DISTINCT state) as count FROM vendors WHERE state IS NOT NULL');
    const [gstRegistered] = await db.query('SELECT COUNT(*) as count FROM vendors WHERE gst_number IS NOT NULL');

    res.json({
      totalVendors: totalVendors[0].count,
      activeVendors: activeVendors[0].count,
      stateCount: states[0].count,
      gstRegistered: gstRegistered[0].count
    });
  } catch (error) {
    console.error('Error fetching vendor analytics:', error);
    res.status(500).json({ message: 'Server error while fetching analytics' });
  }
};

// @desc    Delete vendor (Not exposed in routes - kept for CRUD completeness)
// @route   DELETE /api/vendors/:id (not implemented in routes)
exports.deleteVendor = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if vendor exists
    const [existingVendor] = await db.query('SELECT id FROM vendors WHERE id = ?', [id]);
    if (existingVendor.length === 0) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Check if vendor has associated procurements
    const [procurements] = await db.query('SELECT id FROM procurements WHERE vendor_id = ?', [id]);
    if (procurements.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete vendor with existing procurement records',
        error: 'VENDOR_HAS_PROCUREMENTS'
      });
    }

    await db.query('DELETE FROM vendors WHERE id = ?', [id]);
    
    res.status(200).json({ message: 'Vendor deleted successfully' });

  } catch (error) {
    console.error('Error deleting vendor:', error);
    res.status(500).json({ 
      message: 'Server error while deleting vendor',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
};const db = require('../config/db');