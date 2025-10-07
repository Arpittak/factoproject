const { ValidationError } = require('../utils/errors');

/**
 * Vendor Validation Middleware
 */
const validateVendor = (req, res, next) => {
  const { company_name, email_address, gst_number, phone_number } = req.body;

  // Company name validation
  if (!company_name || company_name.trim().length === 0) {
    throw new ValidationError('Company name is required');
  }

  if (company_name.length > 255) {
    throw new ValidationError('Company name must be less than 255 characters');
  }

  // Email validation
  if (email_address) {
    if (email_address.length > 255) {
      throw new ValidationError('Email must be less than 255 characters');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email_address)) {
      throw new ValidationError('Invalid email format');
    }
  }

  // GST validation
  if (gst_number && gst_number.length !== 15) {
    throw new ValidationError('GST number must be exactly 15 characters');
  }

  // Phone validation
  if (phone_number && phone_number.length > 20) {
    throw new ValidationError('Phone number must be less than 20 characters');
  }

  next();
};

/**
 * Procurement Validation Middleware
 */
const validateProcurement = (req, res, next) => {
  const { vendor_id, invoice_date, grand_total, items } = req.body;

  if (!vendor_id || isNaN(vendor_id)) {
    throw new ValidationError('Valid vendor ID is required');
  }

  if (!invoice_date) {
    throw new ValidationError('Invoice date is required');
  }

  if (!grand_total || isNaN(grand_total) || grand_total <= 0) {
    throw new ValidationError('Valid grand total is required');
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new ValidationError('At least one procurement item is required');
  }

  next();
};

/**
 * Inventory Item Validation Middleware
 */
const validateInventoryItem = (req, res, next) => {
  const { stone_id, length_mm, width_mm, quantity, unit } = req.body;

  if (!stone_id || isNaN(stone_id)) {
    throw new ValidationError('Valid stone ID is required');
  }

  if (!length_mm || isNaN(length_mm) || length_mm <= 0) {
    throw new ValidationError('Valid length is required');
  }

  if (!width_mm || isNaN(width_mm) || width_mm <= 0) {
    throw new ValidationError('Valid width is required');
  }

  if (!quantity || isNaN(quantity) || quantity <= 0) {
    throw new ValidationError('Valid quantity is required');
  }

  if (!unit || !['Pieces', 'Sq Meter'].includes(unit)) {
    throw new ValidationError('Unit must be either "Pieces" or "Sq Meter"');
  }

  next();
};

module.exports = {
  validateVendor,
  validateProcurement,
  validateInventoryItem
};