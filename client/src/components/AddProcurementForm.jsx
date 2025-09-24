import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AddProcurementForm.css";
import StoneItemForm from './StoneItemForm';

// Base state for a new item, with corrected defaults
const baseItem = {
  stone_type: "",
  stone_id: "",
  hsn_code_id: "",
  length_mm: "",
  width_mm: "",
  thickness_mm: "",
  is_calibrated: false,
  stage_id: "1",
  edges_type_id: "1",
  finishing_type_id: "1",
  quantity: "",
  units: "Sq Meter",
  rate: "",
  rate_unit: "Sq Meter",
  item_amount: 0,
  comments: "",
};

function AddProcurementForm({ onProcurementAdded, onCancel }) {
  // State for main procurement details
  const [procurementData, setProcurementData] = useState({
    vendor_id: "",
    invoice_date: new Date().toISOString().slice(0, 10),
    supplier_invoice: "",
    vehicle_number: "",
    gst_type: "IGST",
    tax_percentage: 18,
    additional_taxable_amount: 0,
    freight_charges: 0,
    comments: "",
  });
  const [vendorDetails, setVendorDetails] = useState({
    contact_person: "",
    city: "",
  });
  const [items, setItems] = useState([{ ...baseItem }]);

  // Validation errors state
  const [errors, setErrors] = useState({});

  // State for dropdown options
  const [vendors, setVendors] = useState([]);
  const [allStones, setAllStones] = useState([]);
  const [stoneTypes, setStoneTypes] = useState([]);
  const [filteredStones, setFilteredStones] = useState([]);
  const [hsnCodes, setHsnCodes] = useState([]);
  const [stages, setStages] = useState([]);
  const [edges, setEdges] = useState([]);
  const [finishes, setFinishes] = useState([]);

  // State for calculated totals
  const [summary, setSummary] = useState({
    subtotal: 0,
    taxAmount: 0,
    grandTotal: 0,
  });

  // Fetch all master data on component load
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [v, s, h, st, ed, fi] = await Promise.all([
          axios.get("/api/vendors"),
          axios.get("/api/master/stones"),
          axios.get("/api/master/hsn-codes"),
          axios.get("/api/master/stages"),
          axios.get("/api/master/edges"),
          axios.get("/api/master/finishes"),
        ]);
        setVendors(v.data);
        setAllStones(s.data);
        setHsnCodes(h.data);
        setStages(st.data);
        setEdges(ed.data);
        setFinishes(fi.data);
        setStoneTypes([...new Set(s.data.map((stone) => stone.stone_type))]);
      } catch (error) {
        console.error("Failed to fetch master data", error);
      }
    };
    fetchMasterData();
  }, []);

  // Recalculate totals whenever items or tax details change
  useEffect(() => {
    const subtotal = items.reduce(
      (acc, item) => acc + (parseFloat(item.item_amount) || 0),
      0
    );
    const taxableAmount =
      subtotal + (parseFloat(procurementData.additional_taxable_amount) || 0);
    const taxAmount =
      (taxableAmount * (parseFloat(procurementData.tax_percentage) || 0)) / 100;
    const freight = parseFloat(procurementData.freight_charges) || 0;
    const grandTotal = taxableAmount + taxAmount + freight;
    setSummary({ subtotal, taxAmount, grandTotal });
  }, [items, procurementData]);

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    // Main procurement validation
    if (!procurementData.vendor_id) {
      newErrors.vendor_id = "Vendor is required";
    }
    if (!procurementData.supplier_invoice.trim()) {
      newErrors.supplier_invoice = "Supplier invoice number is required";
    }

    // Items validation
    items.forEach((item, index) => {
      const itemErrors = {};

      if (!item.stone_type) itemErrors.stone_type = "Stone type is required";
      if (!item.stone_id) itemErrors.stone_id = "Stone name is required";
      if (!item.hsn_code_id) itemErrors.hsn_code_id = "HSN code is required";
      if (!item.length_mm || parseInt(item.length_mm) <= 0)
        itemErrors.length_mm = "Length must be greater than 0";
      if (!item.width_mm || parseInt(item.width_mm) <= 0)
        itemErrors.width_mm = "Width must be greater than 0";

      // Enhanced quantity validation
      if (!item.quantity) {
        itemErrors.quantity = "Quantity is required";
      } else if (parseFloat(item.quantity) <= 0) {
        itemErrors.quantity = "Quantity cannot be zero or negative";
      }

      // Enhanced rate validation
      if (!item.rate) {
        itemErrors.rate = "Rate is required";
      } else if (parseFloat(item.rate) <= 0) {
        itemErrors.rate = "Rate cannot be zero or negative";
      }

      if (Object.keys(itemErrors).length > 0) {
        newErrors[`item_${index}`] = itemErrors;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Clear specific error when user starts typing
  const clearError = (fieldName, itemIndex = null) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      if (itemIndex !== null) {
        if (newErrors[`item_${itemIndex}`]) {
          delete newErrors[`item_${itemIndex}`][fieldName];
          if (Object.keys(newErrors[`item_${itemIndex}`]).length === 0) {
            delete newErrors[`item_${itemIndex}`];
          }
        }
      } else {
        delete newErrors[fieldName];
      }
      return newErrors;
    });
  };

  // Handlers for form changes
  const handleMainChange = (e) => {
    const { name, value } = e.target;
    setProcurementData({ ...procurementData, [name]: value });
    clearError(name);
  };

  const handleVendorChange = (e) => {
    const selectedVendorId = e.target.value;
    setProcurementData({ ...procurementData, vendor_id: selectedVendorId });
    clearError("vendor_id");
    const v = vendors.find((vend) => vend.id === parseInt(selectedVendorId));
    setVendorDetails(
      v
        ? { contact_person: v.contact_person, city: v.city }
        : { contact_person: "", city: "" }
    );
  };

  // Handle integer-only input for dimensions
  const handleIntegerInput = (index, fieldName, value) => {
    // Allow only digits, no decimal points or negative numbers
    if (value === "" || /^\d+$/.test(value)) {
      const newItems = [...items];
      newItems[index][fieldName] = value;
      setItems(newItems);
      clearError(fieldName, index);
    }
  };

  // Prevent decimal input on keypress
  const handleKeyPress = (e) => {
    // Block decimal point, minus sign, plus sign, and 'e' (scientific notation)
    if ([".", "-", "+", "e", "E"].includes(e.key)) {
      e.preventDefault();
    }
  };

  const handleItemChange = (index, event) => {
    const { name, value, type, checked } = event.target;
    const newItems = [...items];
    const currentItem = newItems[index];

    // Handle dimension fields with integer validation
    if (
      name === "length_mm" ||
      name === "width_mm" ||
      name === "thickness_mm"
    ) {
      handleIntegerInput(index, name, value);
      return;
    }

    currentItem[name] = type === "checkbox" ? checked : value;
    clearError(name, index);

    if (name === "stone_type") {
      currentItem.stone_id = "";
      setFilteredStones(allStones.filter((s) => s.stone_type === value));
    }
    if (name === "quantity" || name === "rate") {
      clearError("quantity", index);
      clearError("rate", index);
    }

    const qty = parseFloat(currentItem.quantity) || 0;
    const rate = parseFloat(currentItem.rate) || 0;
    currentItem.item_amount = qty * rate;
    setItems(newItems);
  };

  // Calculate equivalent unit for display
  const calculateEquivalent = (item) => {
    if (!item.quantity || !item.length_mm || !item.width_mm) return "";

    const qty = parseFloat(item.quantity);
    const areaOfOnePiece =
      (parseFloat(item.length_mm) * parseFloat(item.width_mm)) / 1000000;

    if (item.units === "Pieces") {
      const sqMeter = (qty * areaOfOnePiece).toFixed(4);
      return `≈ ${sqMeter} Sq Meter`;
    } else {
      const pieces = Math.ceil(qty / areaOfOnePiece);
      return `≈ ${pieces} Pieces (rounded up)`;
    }
  };

  const handleAddItem = () => setItems([...items, { ...baseItem }]);
  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
    // Clear errors for removed item
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`item_${index}`];
      return newErrors;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      alert("Please fix all errors before submitting");
      return;
    }

    // Convert string values to numbers for items
    const processedItems = items.map((item) => ({
      ...item,
      quantity: parseFloat(item.quantity) || 0,
      rate: parseFloat(item.rate) || 0,
      length_mm: parseInt(item.length_mm) || 0,
      width_mm: parseInt(item.width_mm) || 0,
      thickness_mm: item.thickness_mm ? parseInt(item.thickness_mm) : null,
      item_amount:
        (parseFloat(item.quantity) || 0) * (parseFloat(item.rate) || 0),
    }));

    const finalData = {
      ...procurementData,
      grand_total: summary.grandTotal,
      items: processedItems, // Use processed items with numbers
    };

    try {
      await axios.post("/api/procurements", finalData);
      onProcurementAdded();
    } catch (error) {
      alert("Failed to create procurement.");
      console.error(error);
    }
  };

  // Error message component
  const ErrorMessage = ({ message }) => (
    <div
      style={{
        color: "red",
        fontSize: "12px",
        marginTop: "4px",
        fontWeight: "500",
      }}
    >
      {message}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="procurement-form" noValidate>
      <h3>Add New Procurement</h3>

      <div className="form-section">
        <h4>Vendor Information</h4>
        <div className="fields-row">
          <div className="field-container full-width">
            <label>Vendor Company *</label>
            <select
              className={`form-input ${errors.vendor_id ? "error-input" : ""}`}
              value={procurementData.vendor_id}
              onChange={handleVendorChange}
            >
              <option value="">Select Vendor</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.company_name}
                </option>
              ))}
            </select>
            {errors.vendor_id && <ErrorMessage message={errors.vendor_id} />}
          </div>
          <div className="field-container half-width">
            <label>Contact Person</label>
            <input
              className="form-input read-only-input"
              type="text"
              value={vendorDetails.contact_person}
              placeholder="Auto-filled from vendor"
              readOnly
            />
          </div>
          <div className="field-container half-width">
            <label>City</label>
            <input
              className="form-input read-only-input"
              type="text"
              value={vendorDetails.city}
              placeholder="Auto-filled from vendor"
              readOnly
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h4>Procurement Details</h4>
        <div className="fields-row">
          <div className="field-container half-width">
            <label>Supplier Invoice Number *</label>
            <input
              className={`form-input ${
                errors.supplier_invoice ? "error-input" : ""
              }`}
              type="text"
              name="supplier_invoice"
              value={procurementData.supplier_invoice}
              onChange={handleMainChange}
              placeholder="Enter supplier invoice #"
              
            />
            {errors.supplier_invoice && (
              <ErrorMessage message={errors.supplier_invoice} />
            )}
          </div>
          <div className="field-container half-width">
            <label>Vehicle Number</label>
            <input
              className="form-input"
              type="text"
              name="vehicle_number"
              value={procurementData.vehicle_number}
              onChange={handleMainChange}
              placeholder="Enter vehicle number"
            />
          </div>
          <div className="field-container half-width">
            <label>Invoice Date *</label>
            <input
              className="form-input"
              type="date"
              name="invoice_date"
              value={procurementData.invoice_date}
              onChange={handleMainChange}
             
              
            />
          </div>
        </div>
      </div>

      
{items.map((item, index) => (
  <StoneItemForm
    key={index}
    item={item}
    onChange={(fieldName, value) => {
      const newItems = [...items];
      newItems[index][fieldName] = value;
      
      if (fieldName === 'quantity' || fieldName === 'rate') {
        const qty = fieldName === 'quantity' ? parseFloat(value) || 0 : parseFloat(item.quantity) || 0;
        const rate = fieldName === 'rate' ? parseFloat(value) || 0 : parseFloat(item.rate) || 0;
        newItems[index].item_amount = qty * rate;
      }
      
      setItems(newItems);
    }}
    errors={errors[`item_${index}`] || {}}
    clearError={clearError}
    showRemove={items.length > 1}
    onRemove={() => handleRemoveItem(index)}
    index={index}
  />
))}

      <div className="add-stone-container">
        <button
          type="button"
          className="form-button btn-secondary"
          onClick={handleAddItem}
        >
          + Add Another Stone
        </button>
      </div>

      <div className="form-section">
        <h4>GST Details</h4>
        <div className="fields-row">
          <div className="field-container third-width">
            <label>Type of GST *</label>
            <select
              className="form-input"
              name="gst_type"
              value={procurementData.gst_type}
              onChange={handleMainChange}
            >
              <option value="IGST">IGST</option>
              <option value="CGST">CGST</option>
              <option value="SGST">SGST</option>
            </select>
          </div>
          <div className="field-container third-width">
            <label>Tax % (e.g., 18, 28)</label>
            <input
              className="form-input"
              type="number"
              step="any"
              name="tax_percentage"
              value={procurementData.tax_percentage}
              onChange={handleMainChange}
              placeholder="Enter tax percentage"
            />
          </div>
          <div className="field-container third-width">
            <label>Additional Amount (₹)</label>
            <input
              className="form-input"
              type="number"
              step="any"
              name="additional_taxable_amount"
              value={procurementData.additional_taxable_amount}
              onChange={handleMainChange}
              placeholder="Amount to include in tax"
            />
          </div>
          <div className="field-container full-width">
            <label>Freight Charges (₹) - Non-taxable</label>
            <input
              className="form-input"
              type="number"
              step="any"
              name="freight_charges"
              value={procurementData.freight_charges}
              onChange={handleMainChange}
              placeholder="Freight charges (not included in tax)"
            />
            <small>
              Note: Freight charges are not included in tax calculation for any
              GST type
            </small>
          </div>
        </div>
      </div>

      <div className="form-section summary-box">
        <h4>Total Procurement Summary</h4>
        <p>
          <span>Total Procurement Amount:</span>{" "}
          <strong>₹{summary.subtotal.toFixed(2)}</strong>
        </p>
        <p>
          <span>Total Tax Amount:</span>{" "}
          <strong>₹{summary.taxAmount.toFixed(2)}</strong>
        </p>
        <p>
          <span>Grand Total (Tax + Freight):</span>{" "}
          <strong>₹{summary.grandTotal.toFixed(2)}</strong>
        </p>
      </div>

      <div className="field-container full-width">
        <label>Additional Comments</label>
        <textarea
          className="form-input"
          name="comments"
          value={procurementData.comments}
          onChange={handleMainChange}
          placeholder="Enter any final comments for the procurement..."
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="form-button btn-primary">
          Create Procurement
        </button>
        <button
          type="button"
          className="form-button btn-secondary"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default AddProcurementForm;
