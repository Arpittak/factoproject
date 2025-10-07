import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AddProcurementForm.css';

const baseItem = {
    stone_type: '', stone_id: '', length_mm: '', width_mm: '', thickness_mm: '', is_calibrated: false,
    edges_type_id: '1', finishing_type_id: '1', stage_id: '1',
    quantity: '', unit: 'Sq Meter', reason: '',
};

function ManualAddForm({ onItemAdded, onCancel }) {
  const [formData, setFormData] = useState(baseItem);
  const [errors, setErrors] = useState({});

  // State for dropdown options
  const [allStones, setAllStones] = useState([]);
  const [stoneTypes, setStoneTypes] = useState([]);
  const [filteredStones, setFilteredStones] = useState([]);
  const [stages, setStages] = useState([]);
  const [edges, setEdges] = useState([]);
  const [finishes, setFinishes] = useState([]);

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [stonesRes, stagesRes, edgesRes, finishesRes] = await Promise.all([
          axios.get('/api/master/stones'),
          axios.get('/api/master/stages'),
          axios.get('/api/master/edges'),
          axios.get('/api/master/finishes'),
        ]);
        setAllStones(stonesRes.data);
        setStoneTypes([...new Set(stonesRes.data.map(s => s.stone_type))]);
        setStages(stagesRes.data);
        setEdges(edgesRes.data);
        setFinishes(finishesRes.data);
      } catch (error) { console.error("Failed to fetch master data", error); }
    };
    fetchMasterData();
  }, []);

  // Handle integer-only input for dimensions
  const handleIntegerInput = (e, fieldName) => {
    const value = e.target.value;
    
    // Allow only digits, no decimal points or negative numbers
    if (value === '' || /^\d+$/.test(value)) {
      const newFormData = { ...formData, [fieldName]: value };
      
      if (fieldName === 'stone_type') {
        newFormData.stone_id = '';
        setFilteredStones(allStones.filter(s => s.stone_type === value));
      }
      
      setFormData(newFormData);
      
      if (errors[fieldName]) {
        setErrors({ ...errors, [fieldName]: null });
      }
    }
  };

  // Prevent decimal input on keypress
  const handleKeyPress = (e) => {
    // Block decimal point, minus sign, plus sign, and 'e' (scientific notation)
    if (['.', '-', '+', 'e', 'E'].includes(e.key)) {
      e.preventDefault();
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle dimension fields with integer validation
    if (name === 'length_mm' || name === 'width_mm' || name === 'thickness_mm') {
      handleIntegerInput(e, name);
      return;
    }
    
    const newFormData = { ...formData, [name]: type === 'checkbox' ? checked : value };
    
    if (name === 'stone_type') {
      newFormData.stone_id = '';
      setFilteredStones(allStones.filter(s => s.stone_type === value));
    }
    setFormData(newFormData);
    if (errors[name]) {
        setErrors({ ...errors, [name]: null });
    }
  };

  // Calculate equivalent unit for display
  const calculateEquivalent = () => {
    if (!formData.quantity || !formData.length_mm || !formData.width_mm) return '';
    
    const qty = parseFloat(formData.quantity);
    const areaOfOnePiece = (parseFloat(formData.length_mm) * parseFloat(formData.width_mm)) / 1000000;
    
    if (formData.unit === 'Pieces') {
      const sqMeter = (qty * areaOfOnePiece).toFixed(4);
      return `≈ ${sqMeter} Sq Meter`;
    } else {
      const pieces = Math.ceil(qty / areaOfOnePiece);
      return `≈ ${pieces} Pieces (rounded up)`;
    }
  };

  const validate = () => {
    let tempErrors = {};
    if (!formData.stone_type) tempErrors.stone_type = "Stone Type is required.";
    if (!formData.stone_id) tempErrors.stone_id = "Stone Name is required.";
    if (!formData.length_mm) tempErrors.length_mm = "Length is required.";
    if (!formData.width_mm) tempErrors.width_mm = "Width is required.";
    if (formData.quantity === '') {
        tempErrors.quantity = "Quantity is required.";
    } else if (parseFloat(formData.quantity) <= 0) {
        tempErrors.quantity = "Quantity must be greater than 0.";
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      try {
        await axios.post('/api/inventory/manual-add', formData);
        onItemAdded();
      } catch (error) {
        alert('Failed to add inventory item.');
        console.error(error);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="procurement-form" style={{maxHeight: 'none'}}>
      <h3>Add New Inventory Item</h3>
      
      <div className="form-section">
        <div className="fields-row">
            <div className="field-container half-width">
                <label>Stone Type *</label>
                <select className="form-input" name="stone_type" value={formData.stone_type} onChange={handleChange}>
                    <option value="">Select Type</option>
                    {stoneTypes.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
                {errors.stone_type && <p style={{color: 'red', fontSize: '12px', margin: '5px 0 0'}}>{errors.stone_type}</p>}
            </div>
            <div className="field-container half-width">
                <label>Stone Name *</label>
                <select className="form-input" name="stone_id" value={formData.stone_id} onChange={handleChange}>
                    <option value="">Select Name</option>
                    {filteredStones.map(s => <option key={s.id} value={s.id}>{s.stone_name}</option>)}
                </select>
                {errors.stone_id && <p style={{color: 'red', fontSize: '12px', margin: '5px 0 0'}}>{errors.stone_id}</p>}
            </div>
            
            <div className="field-container third-width">
                <label>Length (mm) *</label>
                <input 
                    className="form-input" 
                    type="number" 
                    name="length_mm" 
                    value={formData.length_mm} 
                    onChange={handleChange}
                    onKeyPress={handleKeyPress}
                    placeholder="Length" 
                    min="1"
                    step="1"
                />
                {errors.length_mm && <p style={{color: 'red', fontSize: '12px', margin: '5px 0 0'}}>{errors.length_mm}</p>}
            </div>
            <div className="field-container third-width">
                <label>Width (mm) *</label>
                <input 
                    className="form-input" 
                    type="number" 
                    name="width_mm" 
                    value={formData.width_mm} 
                    onChange={handleChange}
                    onKeyPress={handleKeyPress}
                    placeholder="Width" 
                    min="1"
                    step="1"
                />
                {errors.width_mm && <p style={{color: 'red', fontSize: '12px', margin: '5px 0 0'}}>{errors.width_mm}</p>}
            </div>
            <div className="field-container third-width">
                <label>Thickness (mm)</label>
                <input 
                    className="form-input" 
                    type="number" 
                    name="thickness_mm" 
                    value={formData.thickness_mm} 
                    onChange={handleChange}
                    onKeyPress={handleKeyPress}
                    placeholder="Thickness" 
                    min="1"
                    step="1"
                />
            </div>

            <div className="field-container third-width">
                <label>Stage *</label>
                <select className="form-input" name="stage_id" value={formData.stage_id} onChange={handleChange}>
                    {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
            </div>
            <div className="field-container third-width">
                <label>Edges Type *</label>
                <select className="form-input" name="edges_type_id" value={formData.edges_type_id} onChange={handleChange}>
                    {edges.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
            </div>
            <div className="field-container third-width">
                <label>Finishing Type *</label>
                <select className="form-input" name="finishing_type_id" value={formData.finishing_type_id} onChange={handleChange}>
                    {finishes.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
            </div>

            <div className="field-container full-width">
                <label style={{ display: 'flex', alignItems: 'center' }}>
                    <input type="checkbox" name="is_calibrated" checked={formData.is_calibrated} onChange={handleChange} style={{ marginRight: '10px' }} /> Calibrated
                </label>
            </div>

            <div className="field-container half-width">
                <label>Quantity *</label>
                <div style={{display: 'flex', gap: '10px'}}>
                  <input 
                    className="form-input" 
                    type="number" 
                    step={formData.unit === 'Sq Meter' ? "0.0001" : "1"}
                    name="quantity" 
                    value={formData.quantity} 
                    onChange={handleChange} 
                    placeholder={`Enter ${formData.unit.toLowerCase()}`}
                    style={{flex: 2}}
                  />
                  <select 
                    className="form-input" 
                    name="unit" 
                    value={formData.unit} 
                    onChange={handleChange}
                    style={{flex: 1}}
                  >
                      <option value="Pieces">Pieces</option>
                      <option value="Sq Meter">Sq Meter</option>
                  </select>
                </div>
                {errors.quantity && <p style={{color: 'red', fontSize: '12px', margin: '5px 0 0'}}>{errors.quantity}</p>}
                {/* Show conversion */}
                {formData.length_mm && formData.width_mm && formData.quantity && (
                  <small style={{color: '#666', fontSize: '12px', marginTop: '4px', display: 'block'}}>
                    {calculateEquivalent()}
                  </small>
                )}
            </div>

            <div className="field-container full-width">
                <label>Comments</label>
                <textarea className="form-input" name="reason" value={formData.reason} onChange={handleChange} placeholder="Enter any comments..." />
            </div>
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="form-button btn-primary">Add Item</button>
        <button type="button" className="form-button btn-secondary" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

export default ManualAddForm;