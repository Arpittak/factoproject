import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AddProcurementForm.css';

function StoneItemForm({ 
  item = {
    stone_type: "", stone_id: "", hsn_code_id: "", length_mm: "", width_mm: "", thickness_mm: "",
    is_calibrated: false, stage_id: "1", edges_type_id: "1", finishing_type_id: "1",
    quantity: "", units: "Sq Meter", rate: "", rate_unit: "Sq Meter", comments: ""
  },
  onChange,
  errors = {},
  clearError,
  showRemove = false,
  onRemove,
  index = 0
}) {
  const [allStones, setAllStones] = useState([]);
  const [stoneTypes, setStoneTypes] = useState([]);
  const [filteredStones, setFilteredStones] = useState([]);
  const [hsnCodes, setHsnCodes] = useState([]);
  const [stages, setStages] = useState([]);
  const [edges, setEdges] = useState([]);
  const [finishes, setFinishes] = useState([]);

  useEffect(() => {
    fetchMasterData();
  }, []);

  const fetchMasterData = async () => {
    try {
      const [s, h, st, ed, fi] = await Promise.all([
        axios.get('/api/master/stones'),
        axios.get('/api/master/hsn-codes'),
        axios.get('/api/master/stages'),
        axios.get('/api/master/edges'),
        axios.get('/api/master/finishes')
      ]);
      setAllStones(s.data);
      setHsnCodes(h.data);
      setStages(st.data);
      setEdges(ed.data);
      setFinishes(fi.data);
      setStoneTypes([...new Set(s.data.map(stone => stone.stone_type))]);
    } catch (error) {
      console.error("Failed to fetch master data", error);
    }
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    
    // Handle dimension fields with integer validation
    if (name === 'length_mm' || name === 'width_mm' || name === 'thickness_mm') {
      if (value === '' || /^\d+$/.test(value)) {
        onChange(name, value);
        clearError && clearError(name, index);
      }
      return;
    }
    
    const newValue = type === 'checkbox' ? checked : value;
    onChange(name, newValue);
    clearError && clearError(name, index);
    
    if (name === 'stone_type') {
      onChange('stone_id', '');
      setFilteredStones(allStones.filter(s => s.stone_type === value));
    }
  };

  const handleKeyPress = (e) => {
    if (['.', '-', '+', 'e', 'E'].includes(e.key)) {
      e.preventDefault();
    }
  };

  const calculateEquivalent = () => {
    if (!item.quantity || !item.length_mm || !item.width_mm) return '';
    
    const qty = parseFloat(item.quantity);
    const areaOfOnePiece = (parseFloat(item.length_mm) * parseFloat(item.width_mm)) / 1000000;
    
    if (item.units === 'Pieces') {
      const sqMeter = (qty * areaOfOnePiece).toFixed(4);
      return `≈ ${sqMeter} Sq Meter`;
    } else {
      const pieces = Math.ceil(qty / areaOfOnePiece);
      return `≈ ${pieces} Pieces (rounded up)`;
    }
  };

  const ErrorMessage = ({ message }) => (
    <div style={{ color: 'red', fontSize: '12px', marginTop: '4px', fontWeight: '500' }}>
      {message}
    </div>
  );

  return (
    <div className="form-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4>Stone Information</h4>
        {showRemove && (
          <button type="button" className="form-button btn-remove" onClick={onRemove}>
            Remove
          </button>
        )}
      </div>

      <div className="stone-sub-section">
        <h5>Stone Details</h5>
        <div className="fields-row">
          <div className="field-container half-width">
            <label>Stone Type *</label>
            <select
              className={`form-input ${errors.stone_type ? 'error-input' : ''}`}
              name="stone_type"
              value={item.stone_type}
              onChange={handleChange}
            >
              <option value="">Select Stone Type</option>
              {stoneTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.stone_type && <ErrorMessage message={errors.stone_type} />}
          </div>

          <div className="field-container half-width">
            <label>Stone Name *</label>
            <select
              className={`form-input ${errors.stone_id ? 'error-input' : ''}`}
              name="stone_id"
              value={item.stone_id}
              onChange={handleChange}
            >
              <option value="">Select Stone Name</option>
              {filteredStones.map(s => (
                <option key={s.id} value={s.id}>{s.stone_name}</option>
              ))}
            </select>
            {errors.stone_id && <ErrorMessage message={errors.stone_id} />}
          </div>

          <div className="field-container full-width">
            <label>HSN Code *</label>
            <select
              className={`form-input ${errors.hsn_code_id ? 'error-input' : ''}`}
              name="hsn_code_id"
              value={item.hsn_code_id}
              onChange={handleChange}
            >
              <option value="">Select HSN Code</option>
              {hsnCodes.map(h => (
                <option key={h.id} value={h.id}>{h.code}</option>
              ))}
            </select>
            {errors.hsn_code_id && <ErrorMessage message={errors.hsn_code_id} />}
          </div>

          <div className="field-container third-width">
            <label>Length (mm) *</label>
            <input
              className={`form-input ${errors.length_mm ? 'error-input' : ''}`}
              type="number"
              name="length_mm"
              value={item.length_mm}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              placeholder="Length"
              min="1"
              step="1"
            />
            {errors.length_mm && <ErrorMessage message={errors.length_mm} />}
          </div>

          <div className="field-container third-width">
            <label>Width (mm) *</label>
            <input
              className={`form-input ${errors.width_mm ? 'error-input' : ''}`}
              type="number"
              name="width_mm"
              value={item.width_mm}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              placeholder="Width"
              min="1"
              step="1"
            />
            {errors.width_mm && <ErrorMessage message={errors.width_mm} />}
          </div>

          <div className="field-container third-width">
            <label>Thickness (mm)</label>
            <input
              className="form-input"
              type="number"
              name="thickness_mm"
              value={item.thickness_mm}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              placeholder="Thickness"
              min="1"
              step="1"
            />
          </div>

          {/* Stage, Edges, Finishing selects */}
          <div className="field-container third-width">
            <label>Stage *</label>
            <select className="form-input" name="stage_id" value={item.stage_id} onChange={handleChange}>
              {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div className="field-container third-width">
            <label>Edges *</label>
            <select className="form-input" name="edges_type_id" value={item.edges_type_id} onChange={handleChange}>
              {edges.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>

          <div className="field-container third-width">
            <label>Finishing *</label>
            <select className="form-input" name="finishing_type_id" value={item.finishing_type_id} onChange={handleChange}>
              {finishes.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>

          <div className="field-container full-width">
            <label style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                name="is_calibrated"
                checked={item.is_calibrated}
                onChange={handleChange}
                style={{ marginRight: '10px' }}
              />
              Calibrated
            </label>
          </div>
        </div>
      </div>

      <div className="stone-sub-section">
        <h5>Quantity & Pricing</h5>
        <div className="fields-row">
          <div className="field-container half-width">
            <label>Quantity * (Primary unit: Sq Meter)</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                className={`form-input ${errors.quantity ? 'error-input' : ''}`}
                type="number"
                step={item.units === 'Sq Meter' ? '0.0001' : '1'}
                name="quantity"
                value={item.quantity}
                onChange={handleChange}
                placeholder={`Enter ${item.units.toLowerCase()}`}
                min="0.0001"
                style={{ flex: 2 }}
              />
              <select
                className="form-input"
                name="units"
                value={item.units}
                onChange={handleChange}
                style={{ flex: 1 }}
              >
                <option value="Sq Meter">Sq Meter</option>
                <option value="Pieces">Pieces</option>
              </select>
            </div>
            {errors.quantity && <ErrorMessage message={errors.quantity} />}
            {item.length_mm && item.width_mm && item.quantity && (
              <small style={{ color: '#666', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                {calculateEquivalent()}
              </small>
            )}
          </div>

          <div className="field-container half-width">
            <label>Rate (₹) *</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                className={`form-input ${errors.rate ? 'error-input' : ''}`}
                type="number"
                step="0.01"
                name="rate"
                value={item.rate}
                onChange={handleChange}
                placeholder="e.g., 250"
                min="0.01"
                style={{ flex: 2 }}
              />
              <select
                className="form-input"
                name="rate_unit"
                value={item.rate_unit}
                onChange={handleChange}
                style={{ flex: 1 }}
              >
                <option value="Sq Meter">Per Sq Meter</option>
                <option value="Pieces">Per Piece</option>
              </select>
            </div>
            {errors.rate && <ErrorMessage message={errors.rate} />}
          </div>

          <div className="field-container full-width" style={{ background: '#f8f9fa', padding: '10px', borderRadius: '5px', marginTop: '10px' }}>
            <strong>
              Item Total: ₹{((parseFloat(item.quantity) || 0) * (parseFloat(item.rate) || 0)).toFixed(2)}
            </strong>
            <br/>
            <small style={{ color: '#666' }}>
              {item.quantity && item.rate ? 
                `${item.quantity} ${item.units} × ₹${item.rate} per ${item.rate_unit}` : 
                'Enter quantity and rate to see total'
              }
            </small>
          </div>
        </div>
      </div>

      <div className="field-container full-width">
        <label>Comments</label>
        <textarea
          className="form-input"
          name="comments"
          value={item.comments}
          onChange={handleChange}
          placeholder="Comments for this stone..."
        />
      </div>
    </div>
  );
}

export default StoneItemForm;