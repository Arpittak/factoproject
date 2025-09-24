const db = require('../config/db');

// @desc    Create a new vendor
// @route   POST /api/vendors
exports.createVendor = async (req, res) => {
  try {
    // Get vendor data from the request body
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

    // SQL query to insert a new vendor
    const sql = `
      INSERT INTO vendors (company_name, contact_person, phone_number, email_address, city, state, state_code, complete_address, gst_number, bank_details) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
      company_name, contact_person, phone_number, email_address, city, state, state_code, complete_address, gst_number, bank_details
    ];

    const [result] = await db.query(sql, values);
    
    res.status(201).json({ id: result.insertId, ...req.body });

  } catch (error) {
    console.error('Error creating vendor:', error);
    res.status(500).json({ message: 'Server error while creating vendor' });
  }
};


// @desc    Get all vendors
// @route   GET /api/vendors
exports.getAllVendors = async (req, res) => {
  try {
    const sql = 'SELECT * FROM vendors ORDER BY created_at DESC';
    const [vendors] = await db.query(sql);
    res.status(200).json(vendors);
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({ message: 'Server error while fetching vendors' });
  }
};