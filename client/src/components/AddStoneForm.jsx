import React, { useState } from 'react';
import axios from 'axios';
import StoneItemForm from './StoneItemForm';

function AddStoneForm({ procurementId, onStoneAdded, onCancel }) {
  const [item, setItem] = useState({
    stone_type: "", stone_id: "", hsn_code_id: "", length_mm: "", width_mm: "", thickness_mm: "",
    is_calibrated: false, stage_id: "1", edges_type_id: "1", finishing_type_id: "1",
    quantity: "", units: "Sq Meter", rate: "", rate_unit: "Sq Meter", comments: ""
  });
  const [errors, setErrors] = useState({});

  const handleItemChange = (fieldName, value) => {
    setItem(prev => ({ ...prev, [fieldName]: value }));
    if (fieldName === 'quantity' || fieldName === 'rate') {
      const qty = fieldName === 'quantity' ? parseFloat(value) || 0 : parseFloat(item.quantity) || 0;
      const rate = fieldName === 'rate' ? parseFloat(value) || 0 : parseFloat(item.rate) || 0;
      setItem(prev => ({ ...prev, item_amount: qty * rate }));
    }
  };

  const clearError = (fieldName) => {
    setErrors(prev => ({ ...prev, [fieldName]: null }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!item.stone_type) newErrors.stone_type = "Stone type is required";
    if (!item.stone_id) newErrors.stone_id = "Stone name is required";
    if (!item.hsn_code_id) newErrors.hsn_code_id = "HSN code is required";
    if (!item.length_mm || parseInt(item.length_mm) <= 0) newErrors.length_mm = "Length must be greater than 0";
    if (!item.width_mm || parseInt(item.width_mm) <= 0) newErrors.width_mm = "Width must be greater than 0";
    if (!item.quantity || parseFloat(item.quantity) <= 0) newErrors.quantity = "Quantity cannot be zero or negative";
    if (!item.rate || parseFloat(item.rate) <= 0) newErrors.rate = "Rate cannot be zero or negative";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await axios.post(`/api/procurements/${procurementId}/items`, {
        ...item,
        quantity: parseFloat(item.quantity),
        rate: parseFloat(item.rate),
        length_mm: parseInt(item.length_mm),
        width_mm: parseInt(item.width_mm),
        thickness_mm: item.thickness_mm ? parseInt(item.thickness_mm) : null
      });
      onStoneAdded();
    } catch (error) {
      alert('Failed to add stone item');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="procurement-form" noValidate>
      <h3>Add New Stone Item</h3>
      <StoneItemForm
        item={item}
        onChange={handleItemChange}
        errors={errors}
        clearError={clearError}
      />
      <div className="form-actions">
        <button type="submit" className="form-button btn-primary">Add Stone</button>
        <button type="button" className="form-button btn-secondary" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

export default AddStoneForm;