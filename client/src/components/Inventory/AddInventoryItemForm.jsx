import React, { useState } from 'react';
import axios from 'axios';

const inputStyle = { display: 'block', margin: '10px 0', padding: '8px', width: '95%' };
const halfInputStyle = { ...inputStyle, display: 'inline-block', width: '45%', marginRight: '5%' };

function AddInventoryItemForm({ onItemAdded, onCancel }) {
  const [formData, setFormData] = useState({
    stone_type: '', stone_name: '', length_mm: '', width_mm: '', thickness_mm: '',
    is_calibrated: false, edges_type: 'Raw', finishing_type: 'Raw', stage: 'Raw Material',
    quantity: '', units: 'Pieces', comments: '',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.quantity || formData.quantity <= 0) {
      alert('Quantity must be greater than 0.');
      return;
    }
    try {
      const response = await axios.post('http://localhost:5000/api/inventory', formData);
      onItemAdded(response.data);
    } catch (error) {
      console.error('Failed to add inventory item:', error);
      alert('Failed to add inventory item.');
    }
  };

  return (
    <div>
      <h3>Add New Inventory Item</h3>
      <form onSubmit={handleSubmit}>
        <input style={inputStyle} type="text" name="stone_type" value={formData.stone_type} onChange={handleChange} placeholder="Type of Stone (e.g., Sandstone)" required />
        <input style={inputStyle} type="text" name="stone_name" value={formData.stone_name} onChange={handleChange} placeholder="Name of Stone (e.g., Yellow Mint)" required />
        
        <input style={halfInputStyle} type="number" name="length_mm" value={formData.length_mm} onChange={handleChange} placeholder="Length (mm)" required />
        <input style={halfInputStyle} type="number" name="width_mm" value={formData.width_mm} onChange={handleChange} placeholder="Width (mm)" required />
        
        <input style={inputStyle} type="number" name="thickness_mm" value={formData.thickness_mm} onChange={handleChange} placeholder="Thickness (mm) - Optional" />
        <label>
          <input type="checkbox" name="is_calibrated" checked={formData.is_calibrated} onChange={handleChange} />
          Calibrated
        </label>

        <select style={inputStyle} name="stage" value={formData.stage} onChange={handleChange}>
          <option value="Raw Material">Raw Material</option>
          <option value="In Progress">In Progress</option>
          <option value="Finished">Finished</option>
        </select>

        <input style={halfInputStyle} type="number" name="quantity" value={formData.quantity} onChange={handleChange} placeholder="Quantity" required />
        <select style={halfInputStyle} name="units" value={formData.units} onChange={handleChange}>
          <option value="Pieces">Pieces</option>
          <option value="Sq Meter">Sq Meter</option>
        </select>

        <textarea style={inputStyle} name="comments" value={formData.comments} onChange={handleChange} placeholder="Comments" />

        <div style={{ marginTop: '20px' }}>
          <button type="submit">Add Item</button>
          <button type="button" onClick={onCancel} style={{ marginLeft: '10px' }}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

export default AddInventoryItemForm;