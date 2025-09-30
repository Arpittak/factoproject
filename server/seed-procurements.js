// seed-procurements.js
// Complete seeder script with 34 procurements from 2023-2025
// Run with: node seed-procurements.js
// IMPORTANT: Make sure your server is running on http://localhost:5000 before running this!


//Steps to follow to insert fake data  
// open new terminal
// cd server
// npm install node-fetch@2

// open again new terminal  skip your backend server is already running
// cd server
// node app.js

// again in new terminal 
// cd server
// node seed-procurements.js

const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:5000/api';

const procurements = [
  // 2023 - 12 Procurements
  {
    vendor_id: 1,
    invoice_date: '2023-01-15',
    supplier_invoice: 'INV-2023-001',
    vehicle_number: 'RJ14AB1234',
    gst_type: 'IGST',
    tax_percentage: 18.00,
    freight_charges: 2500.00,
    additional_taxable_amount: 0.00,
    grand_total: 125000.00,
    comments: 'First procurement of 2023',
    items: [
      { stone_id: 1, hsn_code_id: 1, length_mm: 600, width_mm: 600, thickness_mm: 20, is_calibrated: false, edges_type_id: 1, finishing_type_id: 1, stage_id: 1, quantity: 50.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 850.00, item_amount: 42500.00 },
      { stone_id: 3, hsn_code_id: 1, length_mm: 600, width_mm: 400, thickness_mm: 15, is_calibrated: false, edges_type_id: 1, finishing_type_id: 2, stage_id: 1, quantity: 35.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 920.00, item_amount: 32200.00 },
      { stone_id: 5, hsn_code_id: 2, length_mm: 300, width_mm: 300, thickness_mm: 10, is_calibrated: true, edges_type_id: 3, finishing_type_id: 3, stage_id: 2, quantity: 25.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1250.00, item_amount: 31250.00 }
    ]
  },
  {
    vendor_id: 2,
    invoice_date: '2023-02-10',
    supplier_invoice: 'INV-2023-002',
    vehicle_number: 'RJ10CD5678',
    gst_type: 'CGST',
    tax_percentage: 9.00,
    freight_charges: 1800.00,
    additional_taxable_amount: 0.00,
    grand_total: 89500.00,
    items: [
      { stone_id: 9, hsn_code_id: 2, length_mm: 600, width_mm: 600, thickness_mm: 25, is_calibrated: false, edges_type_id: 2, finishing_type_id: 4, stage_id: 1, quantity: 40.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1100.00, item_amount: 44000.00 },
      { stone_id: 11, hsn_code_id: 2, length_mm: 600, width_mm: 300, thickness_mm: 20, is_calibrated: false, edges_type_id: 1, finishing_type_id: 1, stage_id: 1, quantity: 30.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 980.00, item_amount: 29400.00 }
    ]
  },
  {
    vendor_id: 3,
    invoice_date: '2023-03-22',
    supplier_invoice: 'INV-2023-003',
    vehicle_number: 'RJ05EF9012',
    gst_type: 'IGST',
    tax_percentage: 18.00,
    freight_charges: 3200.00,
    additional_taxable_amount: 500.00,
    grand_total: 165000.00,
    items: [
      { stone_id: 15, hsn_code_id: 2, length_mm: 600, width_mm: 600, thickness_mm: 20, is_calibrated: false, edges_type_id: 1, finishing_type_id: 2, stage_id: 1, quantity: 45.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1050.00, item_amount: 47250.00 },
      { stone_id: 18, hsn_code_id: 2, length_mm: 900, width_mm: 600, thickness_mm: 30, is_calibrated: false, edges_type_id: 4, finishing_type_id: 5, stage_id: 3, quantity: 28.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1580.00, item_amount: 44240.00 },
      { stone_id: 20, hsn_code_id: 1, length_mm: 400, width_mm: 400, thickness_mm: 15, is_calibrated: true, edges_type_id: 3, finishing_type_id: 3, stage_id: 2, quantity: 35.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1120.00, item_amount: 39200.00 },
      { stone_id: 22, hsn_code_id: 2, length_mm: 300, width_mm: 300, thickness_mm: 10, is_calibrated: false, edges_type_id: 1, finishing_type_id: 1, stage_id: 1, quantity: 20.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 890.00, item_amount: 17800.00 }
    ]
  },
  {
    vendor_id: 4,
    invoice_date: '2023-04-18',
    supplier_invoice: 'INV-2023-004',
    vehicle_number: 'MP09GH3456',
    gst_type: 'CGST',
    tax_percentage: 9.00,
    freight_charges: 2100.00,
    additional_taxable_amount: 0.00,
    grand_total: 98000.00,
    items: [
      { stone_id: 27, hsn_code_id: 3, length_mm: 600, width_mm: 600, thickness_mm: 18, is_calibrated: false, edges_type_id: 2, finishing_type_id: 5, stage_id: 1, quantity: 38.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1320.00, item_amount: 50160.00 },
      { stone_id: 30, hsn_code_id: 3, length_mm: 600, width_mm: 400, thickness_mm: 20, is_calibrated: false, edges_type_id: 1, finishing_type_id: 6, stage_id: 2, quantity: 28.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1450.00, item_amount: 40600.00 }
    ]
  },
  {
    vendor_id: 1,
    invoice_date: '2023-05-25',
    supplier_invoice: 'INV-2023-005',
    vehicle_number: 'RJ14IJ7890',
    gst_type: 'IGST',
    tax_percentage: 18.00,
    freight_charges: 2800.00,
    additional_taxable_amount: 0.00,
    grand_total: 142000.00,
    items: [
      { stone_id: 33, hsn_code_id: 3, length_mm: 600, width_mm: 600, thickness_mm: 25, is_calibrated: true, edges_type_id: 3, finishing_type_id: 6, stage_id: 4, quantity: 42.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1680.00, item_amount: 70560.00 },
      { stone_id: 35, hsn_code_id: 3, length_mm: 900, width_mm: 600, thickness_mm: 20, is_calibrated: false, edges_type_id: 2, finishing_type_id: 5, stage_id: 2, quantity: 32.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1520.00, item_amount: 48640.00 },
      { stone_id: 38, hsn_code_id: 2, length_mm: 300, width_mm: 300, thickness_mm: 12, is_calibrated: false, edges_type_id: 1, finishing_type_id: 2, stage_id: 1, quantity: 18.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 980.00, item_amount: 17640.00 }
    ]
  },
  {
    vendor_id: 5,
    invoice_date: '2023-06-12',
    supplier_invoice: 'INV-2023-006',
    vehicle_number: 'MP12KL2345',
    gst_type: 'CGST',
    tax_percentage: 9.00,
    freight_charges: 1900.00,
    additional_taxable_amount: 0.00,
    grand_total: 76500.00,
    items: [
      { stone_id: 40, hsn_code_id: 2, length_mm: 600, width_mm: 600, thickness_mm: 15, is_calibrated: false, edges_type_id: 1, finishing_type_id: 1, stage_id: 1, quantity: 32.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 950.00, item_amount: 30400.00 },
      { stone_id: 42, hsn_code_id: 2, length_mm: 600, width_mm: 400, thickness_mm: 18, is_calibrated: false, edges_type_id: 2, finishing_type_id: 3, stage_id: 1, quantity: 26.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1080.00, item_amount: 28080.00 },
      { stone_id: 45, hsn_code_id: 1, length_mm: 400, width_mm: 400, thickness_mm: 20, is_calibrated: false, edges_type_id: 1, finishing_type_id: 2, stage_id: 1, quantity: 15.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 890.00, item_amount: 13350.00 }
    ]
  },
  {
    vendor_id: 2,
    invoice_date: '2023-07-08',
    supplier_invoice: 'INV-2023-007',
    vehicle_number: 'RJ10MN6789',
    gst_type: 'IGST',
    tax_percentage: 18.00,
    freight_charges: 3500.00,
    additional_taxable_amount: 750.00,
    grand_total: 188000.00,
    items: [
      { stone_id: 48, hsn_code_id: 2, length_mm: 600, width_mm: 600, thickness_mm: 22, is_calibrated: false, edges_type_id: 3, finishing_type_id: 4, stage_id: 2, quantity: 48.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1180.00, item_amount: 56640.00 },
      { stone_id: 50, hsn_code_id: 2, length_mm: 600, width_mm: 300, thickness_mm: 18, is_calibrated: true, edges_type_id: 3, finishing_type_id: 5, stage_id: 3, quantity: 35.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1350.00, item_amount: 47250.00 },
      { stone_id: 52, hsn_code_id: 3, length_mm: 900, width_mm: 600, thickness_mm: 25, is_calibrated: false, edges_type_id: 2, finishing_type_id: 6, stage_id: 2, quantity: 38.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1620.00, item_amount: 61560.00 },
      { stone_id: 55, hsn_code_id: 1, length_mm: 300, width_mm: 300, thickness_mm: 10, is_calibrated: false, edges_type_id: 1, finishing_type_id: 1, stage_id: 1, quantity: 12.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 780.00, item_amount: 9360.00 }
    ]
  },
  {
    vendor_id: 6,
    invoice_date: '2023-08-20',
    supplier_invoice: 'INV-2023-008',
    vehicle_number: 'MP15OP4567',
    gst_type: 'CGST',
    tax_percentage: 9.00,
    freight_charges: 2200.00,
    additional_taxable_amount: 0.00,
    grand_total: 112000.00,
    items: [
      { stone_id: 58, hsn_code_id: 2, length_mm: 600, width_mm: 600, thickness_mm: 20, is_calibrated: false, edges_type_id: 1, finishing_type_id: 2, stage_id: 1, quantity: 42.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1120.00, item_amount: 47040.00 },
      { stone_id: 60, hsn_code_id: 2, length_mm: 600, width_mm: 400, thickness_mm: 15, is_calibrated: false, edges_type_id: 2, finishing_type_id: 3, stage_id: 1, quantity: 30.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1050.00, item_amount: 31500.00 },
      { stone_id: 62, hsn_code_id: 1, length_mm: 400, width_mm: 400, thickness_mm: 18, is_calibrated: true, edges_type_id: 3, finishing_type_id: 4, stage_id: 2, quantity: 24.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1280.00, item_amount: 30720.00 }
    ]
  },
  {
    vendor_id: 3,
    invoice_date: '2023-09-14',
    supplier_invoice: 'INV-2023-009',
    vehicle_number: 'RJ05QR8901',
    gst_type: 'IGST',
    tax_percentage: 18.00,
    freight_charges: 2600.00,
    additional_taxable_amount: 0.00,
    grand_total: 135000.00,
    items: [
      { stone_id: 1, hsn_code_id: 1, length_mm: 600, width_mm: 600, thickness_mm: 20, is_calibrated: false, edges_type_id: 1, finishing_type_id: 1, stage_id: 1, quantity: 45.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 880.00, item_amount: 39600.00 },
      { stone_id: 9, hsn_code_id: 2, length_mm: 600, width_mm: 600, thickness_mm: 25, is_calibrated: false, edges_type_id: 2, finishing_type_id: 4, stage_id: 1, quantity: 38.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1150.00, item_amount: 43700.00 },
      { stone_id: 15, hsn_code_id: 2, length_mm: 900, width_mm: 600, thickness_mm: 30, is_calibrated: false, edges_type_id: 4, finishing_type_id: 5, stage_id: 3, quantity: 28.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1620.00, item_amount: 45360.00 }
    ]
  },
  {
    vendor_id: 7,
    invoice_date: '2023-10-05',
    supplier_invoice: 'INV-2023-010',
    vehicle_number: 'CA01ST2468',
    gst_type: 'IGST',
    tax_percentage: 18.00,
    freight_charges: 4500.00,
    additional_taxable_amount: 1200.00,
    grand_total: 225000.00,
    items: [
      { stone_id: 27, hsn_code_id: 3, length_mm: 600, width_mm: 600, thickness_mm: 18, is_calibrated: true, edges_type_id: 3, finishing_type_id: 6, stage_id: 4, quantity: 52.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1720.00, item_amount: 89440.00 },
      { stone_id: 33, hsn_code_id: 3, length_mm: 900, width_mm: 600, thickness_mm: 20, is_calibrated: false, edges_type_id: 2, finishing_type_id: 5, stage_id: 2, quantity: 40.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1580.00, item_amount: 63200.00 },
      { stone_id: 40, hsn_code_id: 2, length_mm: 600, width_mm: 400, thickness_mm: 15, is_calibrated: false, edges_type_id: 1, finishing_type_id: 2, stage_id: 1, quantity: 35.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1020.00, item_amount: 35700.00 },
      { stone_id: 48, hsn_code_id: 2, length_mm: 300, width_mm: 300, thickness_mm: 12, is_calibrated: false, edges_type_id: 1, finishing_type_id: 1, stage_id: 1, quantity: 22.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 920.00, item_amount: 20240.00 }
    ]
  },
  {
    vendor_id: 8,
    invoice_date: '2023-11-18',
    supplier_invoice: 'INV-2023-011',
    vehicle_number: 'RJ08UV1357',
    gst_type: 'CGST',
    tax_percentage: 9.00,
    freight_charges: 2300.00,
    additional_taxable_amount: 0.00,
    grand_total: 95000.00,
    items: [
      { stone_id: 3, hsn_code_id: 1, length_mm: 600, width_mm: 600, thickness_mm: 20, is_calibrated: false, edges_type_id: 1, finishing_type_id: 2, stage_id: 1, quantity: 38.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 940.00, item_amount: 35720.00 },
      { stone_id: 11, hsn_code_id: 2, length_mm: 600, width_mm: 300, thickness_mm: 20, is_calibrated: false, edges_type_id: 1, finishing_type_id: 1, stage_id: 1, quantity: 32.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1000.00, item_amount: 32000.00 },
      { stone_id: 18, hsn_code_id: 2, length_mm: 600, width_mm: 600, thickness_mm: 25, is_calibrated: false, edges_type_id: 2, finishing_type_id: 3, stage_id: 1, quantity: 24.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1080.00, item_amount: 25920.00 }
    ]
  },
  {
    vendor_id: 1,
    invoice_date: '2023-12-22',
    supplier_invoice: 'INV-2023-012',
    vehicle_number: 'RJ14WX3690',
    gst_type: 'IGST',
    tax_percentage: 18.00,
    freight_charges: 3100.00,
    additional_taxable_amount: 500.00,
    grand_total: 168000.00,
    items: [
      { stone_id: 22, hsn_code_id: 2, length_mm: 600, width_mm: 600, thickness_mm: 20, is_calibrated: false, edges_type_id: 1, finishing_type_id: 2, stage_id: 1, quantity: 46.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1100.00, item_amount: 50600.00 },
      { stone_id: 30, hsn_code_id: 3, length_mm: 600, width_mm: 400, thickness_mm: 20, is_calibrated: true, edges_type_id: 3, finishing_type_id: 6, stage_id: 4, quantity: 36.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1560.00, item_amount: 56160.00 },
      { stone_id: 35, hsn_code_id: 3, length_mm: 900, width_mm: 600, thickness_mm: 20, is_calibrated: false, edges_type_id: 2, finishing_type_id: 5, stage_id: 2, quantity: 30.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1480.00, item_amount: 44400.00 },
      { stone_id: 42, hsn_code_id: 2, length_mm: 400, width_mm: 400, thickness_mm: 15, is_calibrated: false, edges_type_id: 1, finishing_type_id: 1, stage_id: 1, quantity: 18.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 860.00, item_amount: 15480.00 }
    ]
  },

  // 2024 - 12 Procurements
  {
    vendor_id: 2,
    invoice_date: '2024-01-10',
    supplier_invoice: 'INV-2024-001',
    vehicle_number: 'RJ10YZ7412',
    gst_type: 'CGST',
    tax_percentage: 9.00,
    freight_charges: 2400.00,
    additional_taxable_amount: 0.00,
    grand_total: 105000.00,
    items: [
      { stone_id: 5, hsn_code_id: 2, length_mm: 600, width_mm: 600, thickness_mm: 20, is_calibrated: false, edges_type_id: 1, finishing_type_id: 3, stage_id: 1, quantity: 40.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1180.00, item_amount: 47200.00 },
      { stone_id: 15, hsn_code_id: 2, length_mm: 600, width_mm: 600, thickness_mm: 25, is_calibrated: false, edges_type_id: 2, finishing_type_id: 4, stage_id: 1, quantity: 34.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1220.00, item_amount: 41480.00 },
      { stone_id: 20, hsn_code_id: 1, length_mm: 300, width_mm: 300, thickness_mm: 12, is_calibrated: false, edges_type_id: 1, finishing_type_id: 1, stage_id: 1, quantity: 16.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 890.00, item_amount: 14240.00 }
    ]
  },
  {
    vendor_id: 4,
    invoice_date: '2024-02-15',
    supplier_invoice: 'INV-2024-002',
    vehicle_number: 'MP09AB8523',
    gst_type: 'IGST',
    tax_percentage: 18.00,
    freight_charges: 2700.00,
    additional_taxable_amount: 0.00,
    grand_total: 148000.00,
    items: [
      { stone_id: 27, hsn_code_id: 3, length_mm: 600, width_mm: 600, thickness_mm: 18, is_calibrated: false, edges_type_id: 2, finishing_type_id: 5, stage_id: 1, quantity: 44.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1340.00, item_amount: 58960.00 },
      { stone_id: 33, hsn_code_id: 3, length_mm: 900, width_mm: 600, thickness_mm: 20, is_calibrated: true, edges_type_id: 3, finishing_type_id: 6, stage_id: 4, quantity: 38.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1690.00, item_amount: 64220.00 },
      { stone_id: 38, hsn_code_id: 2, length_mm: 600, width_mm: 400, thickness_mm: 15, is_calibrated: false, edges_type_id: 1, finishing_type_id: 2, stage_id: 1, quantity: 20.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 980.00, item_amount: 19600.00 }
    ]
  },
  {
    vendor_id: 5,
    invoice_date: '2024-03-20',
    supplier_invoice: 'INV-2024-003',
    vehicle_number: 'MP12CD9634',
    gst_type: 'CGST',
    tax_percentage: 9.00,
    freight_charges: 1950.00,
    additional_taxable_amount: 0.00,
    grand_total: 82000.00,
    items: [
      { stone_id: 40, hsn_code_id: 2, length_mm: 600, width_mm: 600, thickness_mm: 15, is_calibrated: false, edges_type_id: 1, finishing_type_id: 1, stage_id: 1, quantity: 36.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 970.00, item_amount: 34920.00 },
      { stone_id: 45, hsn_code_id: 1, length_mm: 600, width_mm: 400, thickness_mm: 18, is_calibrated: false, edges_type_id: 2, finishing_type_id: 3, stage_id: 1, quantity: 28.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1120.00, item_amount: 31360.00 },
      { stone_id: 50, hsn_code_id: 2, length_mm: 400, width_mm: 400, thickness_mm: 20, is_calibrated: false, edges_type_id: 1, finishing_type_id: 2, stage_id: 1, quantity: 14.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 910.00, item_amount: 12740.00 }
    ]
  },
  {
    vendor_id: 3,
    invoice_date: '2024-04-12',
    supplier_invoice: 'INV-2024-004',
    vehicle_number: 'RJ05EF7745',
    gst_type: 'IGST',
    tax_percentage: 18.00,
    freight_charges: 3300.00,
    additional_taxable_amount: 800.00,
    grand_total: 195000.00,
    items: [
      { stone_id: 52, hsn_code_id: 3, length_mm: 600, width_mm: 600, thickness_mm: 22, is_calibrated: false, edges_type_id: 3, finishing_type_id: 4, stage_id: 2, quantity: 50.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1250.00, item_amount: 62500.00 },
      { stone_id: 55, hsn_code_id: 1, length_mm: 600, width_mm: 300, thickness_mm: 18, is_calibrated: true, edges_type_id: 3, finishing_type_id: 5, stage_id: 3, quantity: 38.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1420.00, item_amount: 53960.00 },
      { stone_id: 58, hsn_code_id: 2, length_mm: 900, width_mm: 600, thickness_mm: 25, is_calibrated: false, edges_type_id: 2, finishing_type_id: 6, stage_id: 2, quantity: 42.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1680.00, item_amount: 70560.00 },
      { stone_id: 60, hsn_code_id: 2, length_mm: 300, width_mm: 300, thickness_mm: 10, is_calibrated: false, edges_type_id: 1, finishing_type_id: 1, stage_id: 1, quantity: 10.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 720.00, item_amount: 7200.00 }
    ]
  },
  {
    vendor_id: 6,
    invoice_date: '2024-05-08',
    supplier_invoice: 'INV-2024-005',
    vehicle_number: 'MP15GH8856',
    gst_type: 'CGST',
    tax_percentage: 9.00,
    freight_charges: 2150.00,
    additional_taxable_amount: 0.00,
    grand_total: 98500.00,
    items: [
      { stone_id: 62, hsn_code_id: 1, length_mm: 600, width_mm: 600, thickness_mm: 20, is_calibrated: false, edges_type_id: 1, finishing_type_id: 2, stage_id: 1, quantity: 40.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1140.00, item_amount: 45600.00 },
      { stone_id: 1, hsn_code_id: 1, length_mm: 600, width_mm: 400, thickness_mm: 15, is_calibrated: false, edges_type_id: 2, finishing_type_id: 3, stage_id: 1, quantity: 32.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1070.00, item_amount: 34240.00 },
      { stone_id: 9, hsn_code_id: 2, length_mm: 400, width_mm: 400, thickness_mm: 18, is_calibrated: false, edges_type_id: 1, finishing_type_id: 1, stage_id: 1, quantity: 16.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 920.00, item_amount: 14720.00 }
    ]
  },
  {
    vendor_id: 7,
    invoice_date: '2024-06-25',
    supplier_invoice: 'INV-2024-006',
    vehicle_number: 'CA01IJ9967',
    gst_type: 'IGST',
    tax_percentage: 18.00,
    freight_charges: 4200.00,
    additional_taxable_amount: 1000.00,
    grand_total: 215000.00,
    items: [
      { stone_id: 11, hsn_code_id: 2, length_mm: 600, width_mm: 600, thickness_mm: 25, is_calibrated: false, edges_type_id: 2, finishing_type_id: 4, stage_id: 1, quantity: 48.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1200.00, item_amount: 57600.00 },
      { stone_id: 18, hsn_code_id: 2, length_mm: 900, width_mm: 600, thickness_mm: 30, is_calibrated: true, edges_type_id: 4, finishing_type_id: 5, stage_id: 3, quantity: 36.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1650.00, item_amount: 59400.00 },
      { stone_id: 22, hsn_code_id: 2, length_mm: 600, width_mm: 400, thickness_mm: 15, is_calibrated: false, edges_type_id: 1, finishing_type_id: 2, stage_id: 1, quantity: 32.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1040.00, item_amount: 33280.00 },
      { stone_id: 27, hsn_code_id: 3, length_mm: 600, width_mm: 600, thickness_mm: 20, is_calibrated: false, edges_type_id: 3, finishing_type_id: 6, stage_id: 4, quantity: 28.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1780.00, item_amount: 49840.00 },
      { stone_id: 30, hsn_code_id: 3, length_mm: 300, width_mm: 300, thickness_mm: 12, is_calibrated: false, edges_type_id: 1, finishing_type_id: 1, stage_id: 1, quantity: 14.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 840.00, item_amount: 11760.00 }
    ]
  },
  {
    vendor_id: 8,
    invoice_date: '2024-07-14',
    supplier_invoice: 'INV-2024-007',
    vehicle_number: 'RJ08KL1078',
    gst_type: 'CGST',
    tax_percentage: 9.00,
    freight_charges: 2500.00,
    additional_taxable_amount: 0.00,
    grand_total: 118000.00,
    items: [
      { stone_id: 33, hsn_code_id: 3, length_mm: 600, width_mm: 600, thickness_mm: 18, is_calibrated: false, edges_type_id: 2, finishing_type_id: 5, stage_id: 1, quantity: 45.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1360.00, item_amount: 61200.00 },
      { stone_id: 35, hsn_code_id: 3, length_mm: 600, width_mm: 300, thickness_mm: 20, is_calibrated: true, edges_type_id: 3, finishing_type_id: 6, stage_id: 4, quantity: 34.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1580.00, item_amount: 53720.00 }
    ]
  },
  {
    vendor_id: 1,
    invoice_date: '2024-08-19',
    supplier_invoice: 'INV-2024-008',
    vehicle_number: 'RJ14MN2189',
    gst_type: 'IGST',
    tax_percentage: 18.00,
    freight_charges: 2850.00,
    additional_taxable_amount: 0.00,
    grand_total: 152000.00,
    items: [
      { stone_id: 38, hsn_code_id: 2, length_mm: 600, width_mm: 600, thickness_mm: 20, is_calibrated: false, edges_type_id: 1, finishing_type_id: 2, stage_id: 1, quantity: 46.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1120.00, item_amount: 51520.00 },
      { stone_id: 40, hsn_code_id: 2, length_mm: 900, width_mm: 600, thickness_mm: 25, is_calibrated: false, edges_type_id: 2, finishing_type_id: 3, stage_id: 1, quantity: 38.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1280.00, item_amount: 48640.00 },
      { stone_id: 42, hsn_code_id: 2, length_mm: 600, width_mm: 400, thickness_mm: 15, is_calibrated: false, edges_type_id: 1, finishing_type_id: 1, stage_id: 1, quantity: 30.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1020.00, item_amount: 30600.00 },
      { stone_id: 45, hsn_code_id: 1, length_mm: 400, width_mm: 400, thickness_mm: 18, is_calibrated: false, edges_type_id: 1, finishing_type_id: 2, stage_id: 1, quantity: 20.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 940.00, item_amount: 18800.00 }
    ]
  },
  {
    vendor_id: 2,
    invoice_date: '2024-09-10',
    supplier_invoice: 'INV-2024-009',
    vehicle_number: 'RJ10OP3290',
    gst_type: 'CGST',
    tax_percentage: 9.00,
    freight_charges: 2100.00,
    additional_taxable_amount: 0.00,
    grand_total: 89000.00,
    items: [
      { stone_id: 48, hsn_code_id: 2, length_mm: 600, width_mm: 600, thickness_mm: 20, is_calibrated: false, edges_type_id: 1, finishing_type_id: 3, stage_id: 1, quantity: 37.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1080.00, item_amount: 39960.00 },
      { stone_id: 50, hsn_code_id: 2, length_mm: 600, width_mm: 300, thickness_mm: 18, is_calibrated: false, edges_type_id: 2, finishing_type_id: 4, stage_id: 1, quantity: 28.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1020.00, item_amount: 28560.00 },
      { stone_id: 52, hsn_code_id: 3, length_mm: 400, width_mm: 400, thickness_mm: 15, is_calibrated: false, edges_type_id: 1, finishing_type_id: 1, stage_id: 1, quantity: 18.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 880.00, item_amount: 15840.00 }
    ]
  },
  {
    vendor_id: 4,
    invoice_date: '2024-10-05',
    supplier_invoice: 'INV-2024-010',
    vehicle_number: 'MP09QR4401',
    gst_type: 'IGST',
    tax_percentage: 18.00,
    freight_charges: 3400.00,
    additional_taxable_amount: 600.00,
    grand_total: 178000.00,
    items: [
      { stone_id: 55, hsn_code_id: 1, length_mm: 600, width_mm: 600, thickness_mm: 22, is_calibrated: false, edges_type_id: 3, finishing_type_id: 4, stage_id: 2, quantity: 52.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1290.00, item_amount: 67080.00 },
      { stone_id: 58, hsn_code_id: 2, length_mm: 900, width_mm: 600, thickness_mm: 25, is_calibrated: true, edges_type_id: 4, finishing_type_id: 5, stage_id: 3, quantity: 40.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1720.00, item_amount: 68800.00 },
      { stone_id: 60, hsn_code_id: 2, length_mm: 600, width_mm: 400, thickness_mm: 15, is_calibrated: false, edges_type_id: 1, finishing_type_id: 2, stage_id: 1, quantity: 28.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1060.00, item_amount: 29680.00 }
    ]
  },
  {
    vendor_id: 5,
    invoice_date: '2024-11-22',
    supplier_invoice: 'INV-2024-011',
    vehicle_number: 'MP12ST5512',
    gst_type: 'CGST',
    tax_percentage: 9.00,
    freight_charges: 2350.00,
    additional_taxable_amount: 0.00,
    grand_total: 104000.00,
    items: [
      { stone_id: 62, hsn_code_id: 1, length_mm: 600, width_mm: 600, thickness_mm: 20, is_calibrated: false, edges_type_id: 1, finishing_type_id: 2, stage_id: 1, quantity: 42.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1160.00, item_amount: 48720.00 },
      { stone_id: 1, hsn_code_id: 1, length_mm: 600, width_mm: 400, thickness_mm: 15, is_calibrated: false, edges_type_id: 2, finishing_type_id: 3, stage_id: 1, quantity: 34.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1090.00, item_amount: 37060.00 },
      { stone_id: 3, hsn_code_id: 1, length_mm: 400, width_mm: 400, thickness_mm: 18, is_calibrated: false, edges_type_id: 1, finishing_type_id: 1, stage_id: 1, quantity: 16.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 900.00, item_amount: 14400.00 }
    ]
  },
  {
    vendor_id: 3,
    invoice_date: '2024-12-18',
    supplier_invoice: 'INV-2024-012',
    vehicle_number: 'RJ05UV6623',
    gst_type: 'IGST',
    tax_percentage: 18.00,
    freight_charges: 3800.00,
    additional_taxable_amount: 1200.00,
    grand_total: 205000.00,
    items: [
      { stone_id: 5, hsn_code_id: 2, length_mm: 600, width_mm: 600, thickness_mm: 20, is_calibrated: false, edges_type_id: 1, finishing_type_id: 3, stage_id: 1, quantity: 48.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1190.00, item_amount: 57120.00 },
      { stone_id: 9, hsn_code_id: 2, length_mm: 900, width_mm: 600, thickness_mm: 25, is_calibrated: true, edges_type_id: 3, finishing_type_id: 6, stage_id: 4, quantity: 42.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1820.00, item_amount: 76440.00 },
      { stone_id: 11, hsn_code_id: 2, length_mm: 600, width_mm: 400, thickness_mm: 15, is_calibrated: false, edges_type_id: 1, finishing_type_id: 2, stage_id: 1, quantity: 34.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1050.00, item_amount: 35700.00 },
      { stone_id: 15, hsn_code_id: 2, length_mm: 600, width_mm: 300, thickness_mm: 20, is_calibrated: false, edges_type_id: 2, finishing_type_id: 4, stage_id: 1, quantity: 26.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1100.00, item_amount: 28600.00 },
      { stone_id: 18, hsn_code_id: 2, length_mm: 300, width_mm: 300, thickness_mm: 10, is_calibrated: false, edges_type_id: 1, finishing_type_id: 1, stage_id: 1, quantity: 12.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 760.00, item_amount: 9120.00 }
    ]
  },

  // 2025 - 10 Procurements
  {
    vendor_id: 6,
    invoice_date: '2025-01-12',
    supplier_invoice: 'INV-2025-001',
    vehicle_number: 'MP15WX7734',
    gst_type: 'CGST',
    tax_percentage: 9.00,
    freight_charges: 2450.00,
    additional_taxable_amount: 0.00,
    grand_total: 112000.00,
    items: [
      { stone_id: 20, hsn_code_id: 1, length_mm: 600, width_mm: 600, thickness_mm: 18, is_calibrated: false, edges_type_id: 2, finishing_type_id: 5, stage_id: 1, quantity: 44.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1220.00, item_amount: 53680.00 },
      { stone_id: 22, hsn_code_id: 2, length_mm: 600, width_mm: 400, thickness_mm: 20, is_calibrated: false, edges_type_id: 1, finishing_type_id: 2, stage_id: 1, quantity: 36.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1140.00, item_amount: 41040.00 },
      { stone_id: 27, hsn_code_id: 3, length_mm: 400, width_mm: 400, thickness_mm: 15, is_calibrated: false, edges_type_id: 1, finishing_type_id: 1, stage_id: 1, quantity: 14.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 920.00, item_amount: 12880.00 }
    ]
  },
  {
    vendor_id: 7,
    invoice_date: '2025-02-20',
    supplier_invoice: 'INV-2025-002',
    vehicle_number: 'CA01YZ8845',
    gst_type: 'IGST',
    tax_percentage: 18.00,
    freight_charges: 4100.00,
    additional_taxable_amount: 900.00,
    grand_total: 198000.00,
    items: [
      { stone_id: 30, hsn_code_id: 3, length_mm: 600, width_mm: 600, thickness_mm: 22, is_calibrated: false, edges_type_id: 3, finishing_type_id: 4, stage_id: 2, quantity: 50.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1310.00, item_amount: 65500.00 },
      { stone_id: 33, hsn_code_id: 3, length_mm: 600, width_mm: 300, thickness_mm: 18, is_calibrated: true, edges_type_id: 3, finishing_type_id: 5, stage_id: 3, quantity: 38.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1450.00, item_amount: 55100.00 },
      { stone_id: 35, hsn_code_id: 3, length_mm: 900, width_mm: 600, thickness_mm: 25, is_calibrated: false, edges_type_id: 2, finishing_type_id: 6, stage_id: 2, quantity: 40.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1620.00, item_amount: 64800.00 }
    ]
  },
  {
    vendor_id: 8,
    invoice_date: '2025-03-15',
    supplier_invoice: 'INV-2025-003',
    vehicle_number: 'RJ08AB9956',
    gst_type: 'CGST',
    tax_percentage: 9.00,
    freight_charges: 2200.00,
    additional_taxable_amount: 0.00,
    grand_total: 95500.00,
    items: [
      { stone_id: 38, hsn_code_id: 2, length_mm: 600, width_mm: 600, thickness_mm: 20, is_calibrated: false, edges_type_id: 1, finishing_type_id: 2, stage_id: 1, quantity: 40.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1100.00, item_amount: 44000.00 },
      { stone_id: 40, hsn_code_id: 2, length_mm: 600, width_mm: 400, thickness_mm: 15, is_calibrated: false, edges_type_id: 2, finishing_type_id: 3, stage_id: 1, quantity: 32.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1040.00, item_amount: 33280.00 },
      { stone_id: 42, hsn_code_id: 2, length_mm: 400, width_mm: 400, thickness_mm: 18, is_calibrated: false, edges_type_id: 1, finishing_type_id: 1, stage_id: 1, quantity: 16.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 900.00, item_amount: 14400.00 }
    ]
  },
  {
    vendor_id: 1,
    invoice_date: '2025-04-08',
    supplier_invoice: 'INV-2025-004',
    vehicle_number: 'RJ14CD1067',
    gst_type: 'IGST',
    tax_percentage: 18.00,
    freight_charges: 3200.00,
    additional_taxable_amount: 700.00,
    grand_total: 172000.00,
    items: [
      { stone_id: 45, hsn_code_id: 1, length_mm: 600, width_mm: 600, thickness_mm: 22, is_calibrated: false, edges_type_id: 3, finishing_type_id: 4, stage_id: 2, quantity: 48.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1250.00, item_amount: 60000.00 },
      { stone_id: 48, hsn_code_id: 2, length_mm: 900, width_mm: 600, thickness_mm: 25, is_calibrated: true, edges_type_id: 4, finishing_type_id: 5, stage_id: 3, quantity: 36.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1680.00, item_amount: 60480.00 },
      { stone_id: 50, hsn_code_id: 2, length_mm: 600, width_mm: 400, thickness_mm: 15, is_calibrated: false, edges_type_id: 1, finishing_type_id: 2, stage_id: 1, quantity: 30.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1060.00, item_amount: 31800.00 },
      { stone_id: 52, hsn_code_id: 3, length_mm: 600, width_mm: 300, thickness_mm: 20, is_calibrated: false, edges_type_id: 2, finishing_type_id: 4, stage_id: 1, quantity: 24.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1120.00, item_amount: 26880.00 }
    ]
  },
  {
    vendor_id: 2,
    invoice_date: '2025-05-18',
    supplier_invoice: 'INV-2025-005',
    vehicle_number: 'RJ10EF2178',
    gst_type: 'CGST',
    tax_percentage: 9.00,
    freight_charges: 2550.00,
    additional_taxable_amount: 0.00,
    grand_total: 118000.00,
    items: [
      { stone_id: 55, hsn_code_id: 1, length_mm: 600, width_mm: 600, thickness_mm: 20, is_calibrated: false, edges_type_id: 1, finishing_type_id: 2, stage_id: 1, quantity: 46.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1180.00, item_amount: 54280.00 },
      { stone_id: 58, hsn_code_id: 2, length_mm: 600, width_mm: 400, thickness_mm: 15, is_calibrated: false, edges_type_id: 2, finishing_type_id: 3, stage_id: 1, quantity: 36.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1110.00, item_amount: 39960.00 },
      { stone_id: 60, hsn_code_id: 2, length_mm: 400, width_mm: 400, thickness_mm: 18, is_calibrated: false, edges_type_id: 1, finishing_type_id: 1, stage_id: 1, quantity: 20.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 940.00, item_amount: 18800.00 }
    ]
  },
  {
    vendor_id: 4,
    invoice_date: '2025-06-10',
    supplier_invoice: 'INV-2025-006',
    vehicle_number: 'MP09GH3289',
    gst_type: 'IGST',
    tax_percentage: 18.00,
    freight_charges: 3600.00,
    additional_taxable_amount: 800.00,
    grand_total: 185000.00,
    items: [
      { stone_id: 62, hsn_code_id: 1, length_mm: 600, width_mm: 600, thickness_mm: 25, is_calibrated: false, edges_type_id: 2, finishing_type_id: 4, stage_id: 1, quantity: 52.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1280.00, item_amount: 66560.00 },
      { stone_id: 1, hsn_code_id: 1, length_mm: 900, width_mm: 600, thickness_mm: 30, is_calibrated: true, edges_type_id: 4, finishing_type_id: 5, stage_id: 3, quantity: 40.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1750.00, item_amount: 70000.00 },
      { stone_id: 3, hsn_code_id: 1, length_mm: 600, width_mm: 400, thickness_mm: 15, is_calibrated: false, edges_type_id: 1, finishing_type_id: 2, stage_id: 1, quantity: 32.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1080.00, item_amount: 34560.00 },
      { stone_id: 5, hsn_code_id: 2, length_mm: 600, width_mm: 300, thickness_mm: 20, is_calibrated: false, edges_type_id: 2, finishing_type_id: 3, stage_id: 1, quantity: 26.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1100.00, item_amount: 28600.00 }
    ]
  },
  {
    vendor_id: 5,
    invoice_date: '2025-07-22',
    supplier_invoice: 'INV-2025-007',
    vehicle_number: 'MP12IJ4390',
    gst_type: 'CGST',
    tax_percentage: 9.00,
    freight_charges: 2300.00,
    additional_taxable_amount: 0.00,
    grand_total: 102000.00,
    items: [
      { stone_id: 9, hsn_code_id: 2, length_mm: 600, width_mm: 600, thickness_mm: 20, is_calibrated: false, edges_type_id: 1, finishing_type_id: 3, stage_id: 1, quantity: 42.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1150.00, item_amount: 48300.00 },
      { stone_id: 11, hsn_code_id: 2, length_mm: 600, width_mm: 400, thickness_mm: 15, is_calibrated: false, edges_type_id: 2, finishing_type_id: 4, stage_id: 1, quantity: 34.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1080.00, item_amount: 36720.00 },
      { stone_id: 15, hsn_code_id: 2, length_mm: 400, width_mm: 400, thickness_mm: 18, is_calibrated: false, edges_type_id: 1, finishing_type_id: 1, stage_id: 1, quantity: 14.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 910.00, item_amount: 12740.00 }
    ]
  },
  {
    vendor_id: 3,
    invoice_date: '2025-08-14',
    supplier_invoice: 'INV-2025-008',
    vehicle_number: 'RJ05KL5501',
    gst_type: 'IGST',
    tax_percentage: 18.00,
    freight_charges: 3100.00,
    additional_taxable_amount: 550.00,
    grand_total: 168000.00,
    items: [
      { stone_id: 18, hsn_code_id: 2, length_mm: 600, width_mm: 600, thickness_mm: 22, is_calibrated: false, edges_type_id: 3, finishing_type_id: 4, stage_id: 2, quantity: 48.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1260.00, item_amount: 60480.00 },
      { stone_id: 20, hsn_code_id: 1, length_mm: 600, width_mm: 300, thickness_mm: 18, is_calibrated: true, edges_type_id: 3, finishing_type_id: 5, stage_id: 3, quantity: 36.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1420.00, item_amount: 51120.00 },
      { stone_id: 22, hsn_code_id: 2, length_mm: 900, width_mm: 600, thickness_mm: 25, is_calibrated: false, edges_type_id: 2, finishing_type_id: 6, stage_id: 2, quantity: 38.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1640.00, item_amount: 62320.00 }
    ]
  },
  {
    vendor_id: 6,
    invoice_date: '2025-09-05',
    supplier_invoice: 'INV-2025-009',
    vehicle_number: 'MP15MN6612',
    gst_type: 'CGST',
    tax_percentage: 9.00,
    freight_charges: 2400.00,
    additional_taxable_amount: 0.00,
    grand_total: 108000.00,
    items: [
      { stone_id: 27, hsn_code_id: 3, length_mm: 600, width_mm: 600, thickness_mm: 18, is_calibrated: false, edges_type_id: 2, finishing_type_id: 5, stage_id: 1, quantity: 44.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1340.00, item_amount: 58960.00 },
      { stone_id: 30, hsn_code_id: 3, length_mm: 600, width_mm: 400, thickness_mm: 20, is_calibrated: true, edges_type_id: 3, finishing_type_id: 6, stage_id: 4, quantity: 36.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1590.00, item_amount: 57240.00 }
    ]
  },
  {
    vendor_id: 7,
    invoice_date: '2025-09-20',
    supplier_invoice: 'INV-2025-010',
    vehicle_number: 'CA01OP7723',
    gst_type: 'IGST',
    tax_percentage: 18.00,
    freight_charges: 4300.00,
    additional_taxable_amount: 1100.00,
    grand_total: 220000.00,
    items: [
      { stone_id: 33, hsn_code_id: 3, length_mm: 600, width_mm: 600, thickness_mm: 25, is_calibrated: false, edges_type_id: 2, finishing_type_id: 4, stage_id: 1, quantity: 54.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1380.00, item_amount: 74520.00 },
      { stone_id: 35, hsn_code_id: 3, length_mm: 900, width_mm: 600, thickness_mm: 30, is_calibrated: true, edges_type_id: 4, finishing_type_id: 5, stage_id: 3, quantity: 44.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1850.00, item_amount: 81400.00 },
      { stone_id: 38, hsn_code_id: 2, length_mm: 600, width_mm: 400, thickness_mm: 15, is_calibrated: false, edges_type_id: 1, finishing_type_id: 2, stage_id: 1, quantity: 34.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1090.00, item_amount: 37060.00 },
      { stone_id: 40, hsn_code_id: 2, length_mm: 600, width_mm: 300, thickness_mm: 20, is_calibrated: false, edges_type_id: 2, finishing_type_id: 3, stage_id: 1, quantity: 28.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 1140.00, item_amount: 31920.00 },
      { stone_id: 42, hsn_code_id: 2, length_mm: 300, width_mm: 300, thickness_mm: 10, is_calibrated: false, edges_type_id: 1, finishing_type_id: 1, stage_id: 1, quantity: 10.00, units: 'Sq Meter', rate_unit: 'Sq Meter', rate: 780.00, item_amount: 7800.00 }
    ]
  }
];

async function createProcurement(procurement) {
  try {
    const response = await fetch(`${API_BASE_URL}/procurements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(procurement)
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ Created: ${procurement.supplier_invoice} (${procurement.items.length} items)`);
      return data;
    } else {
      console.error(`❌ Failed: ${procurement.supplier_invoice}`, data.message);
      return null;
    }
  } catch (error) {
    console.error(`❌ Error: ${procurement.supplier_invoice}`, error.message);
    return null;
  }
}

async function seedData() {
  console.log('🌱 Starting data seeding...');
  console.log(`📦 Total procurements to create: ${procurements.length}\n`);
  
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < procurements.length; i++) {
    const procurement = procurements[i];
    console.log(`\n[${i + 1}/${procurements.length}] Processing: ${procurement.supplier_invoice}`);
    
    const result = await createProcurement(procurement);
    if (result) {
      successCount++;
    } else {
      failCount++;
    }
    
    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 Seeding Complete!');
  console.log('='.repeat(50));
  console.log(`✅ Successfully created: ${successCount} procurements`);
  console.log(`❌ Failed: ${failCount} procurements`);
  console.log('\n💡 Next steps:');
  console.log('   1. Check your inventory in the application');
  console.log('   2. Verify inventory_items and inventory_transactions tables');
  console.log('   3. All procurement items should now be linked to inventory!');
}

// Run the seeder
seedData().catch(console.error);