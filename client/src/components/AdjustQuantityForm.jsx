import React, { useState, useEffect } from 'react';
import './AdjustQuantityForm.css';

function AdjustQuantityForm({ item, action, onAdjust, onCancel }) {
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('Pieces');
  const [reason, setReason] = useState('');
  const [equivalent, setEquivalent] = useState('');
  const [error, setError] = useState('');

  // Helper functions matching backend logic
  const calculatePiecesFromSqMeter = (sqMeter, length_mm, width_mm) => {
    const areaOfOnePiece = (length_mm * width_mm) / 1000000;
    if (areaOfOnePiece <= 0) return 0;
    return Math.ceil(sqMeter / areaOfOnePiece);
  };

  const calculateSqMeterFromPieces = (pieces, length_mm, width_mm) => {
    const areaOfOnePiece = (length_mm * width_mm) / 1000000;
    return pieces * areaOfOnePiece;
  };

  // Calculate equivalent quantity in real-time
  useEffect(() => {
    if (!item) return;
    const qty = parseFloat(quantity) || 0;
    
    if (unit === 'Pieces') {
        const sqMeter = calculateSqMeterFromPieces(qty, item.length_mm, item.width_mm);
        setEquivalent(`${sqMeter.toFixed(4)} Sq Meter`);
    } else { // unit is 'Sq Meter'
        const pieces = calculatePiecesFromSqMeter(qty, item.length_mm, item.width_mm);
        setEquivalent(`${pieces} Pieces (rounded up)`);
    }
  }, [quantity, unit, item]);

  // Real-time validation matching backend logic
  const handleQuantityChange = (newQuantity) => {
    setQuantity(newQuantity);
    setError('');

    if (action === 'remove') {
        const requestedAmount = parseFloat(newQuantity) || 0;
        
        // Calculate what will actually be removed using backend logic
        let actualPiecesToRemove;
        let actualSqMeterToRemove;

        let masterSqMeterToRemove;
        if (unit === 'Pieces') {
            masterSqMeterToRemove = calculateSqMeterFromPieces(Math.floor(requestedAmount), item.length_mm, item.width_mm);
        } else {
          masterSqMeterToRemove = requestedAmount;
        }

actualSqMeterToRemove = masterSqMeterToRemove;
actualPiecesToRemove = calculatePiecesFromSqMeter(masterSqMeterToRemove, item.length_mm, item.width_mm);

        // Check against both piece and sq meter limits
        if (actualPiecesToRemove > item.quantity_pieces) {
            setError(`Cannot remove ${actualPiecesToRemove} pieces. Only ${item.quantity_pieces} pieces available.`);
        } else if (actualSqMeterToRemove > parseFloat(item.quantity_sq_meter)) {
            setError(`Cannot remove ${actualSqMeterToRemove.toFixed(4)} sq meters. Only ${parseFloat(item.quantity_sq_meter).toFixed(4)} sq meters available.`);
        }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (error) return;

    // Check for "remove all" scenario
    if (action === 'remove') {
        let masterSqMeterToRemove = unit === 'Pieces' ? 
        calculateSqMeterFromPieces(Math.floor(parseFloat(quantity)), item.length_mm, item.width_mm) : 
        parseFloat(quantity);
        let actualPiecesToRemove = calculatePiecesFromSqMeter(masterSqMeterToRemove, item.length_mm, item.width_mm);
          
        if (actualPiecesToRemove === item.quantity_pieces) {
            if (!window.confirm("This will remove all remaining stock for this item. Proceed?")) {
                return;
            }
        }
    }
    onAdjust(quantity, unit, reason);
  };

  return (
    <form onSubmit={handleSubmit} className="adjust-form">
      <h3>{action === 'add' ? 'Add Quantity to' : 'Remove Quantity from'} {item.stone_name}</h3>
      <p>Current Stock: <strong>{item.quantity_pieces} Pieces</strong> / {parseFloat(item.quantity_sq_meter).toFixed(4)} Sq Meter</p>
      <hr />
      
      <div className="adjust-section">
        <div className="field-container">
            <label>Quantity to {action === 'add' ? 'Add' : 'Remove'}</label>
            <div style={{ display: 'flex', gap: '10px' }}>
                <input
                    style={{ flex: 2 }}
                    className="form-input"
                    type="number"
                    step={unit === 'Sq Meter' ? "0.0001" : "1"}
                    value={quantity}
                    onChange={(e) => handleQuantityChange(e.target.value)}
                    placeholder={`Enter ${unit.toLowerCase()}`}
                    required
                />
                <select 
                    style={{ flex: 1 }}
                    className="form-input" 
                    value={unit} 
                    onChange={(e) => setUnit(e.target.value)}
                >
                    <option value="Pieces">Pieces</option>
                    <option value="Sq Meter">Sq Meter</option>
                </select>
            </div>
            {error && <p style={{ color: 'red', marginTop: '5px', fontSize: '12px' }}>{error}</p>}
        </div>
        
        <div style={{ margin: '15px 0', padding: '12px', backgroundColor: '#e7f3ff', borderRadius: '5px' }}>
            <p style={{ margin: 0, fontSize: '14px' }}>
              <strong>Equivalent:</strong> {equivalent}
            </p>
            <p style={{ margin: '5px 0 0', fontSize: '12px', color: '#666' }}>
              {unit === 'Sq Meter' ? 
                'Pieces are calculated using Math.ceil() - always rounded up' :
                'Square meters calculated as pieces × area per piece'
              }
            </p>
        </div>
        
        <div className="field-container">
            <label>Reason for Adjustment</label>
            <textarea
                className="form-input"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g., Stock correction, wastage, quality issue, etc."
                required
            />
        </div>
      </div>
      
      <div className="form-actions">
        <button 
          type="submit" 
          className="form-button btn-primary" 
          disabled={!!error}
          style={{
            backgroundColor: error ? '#ccc' : (action === 'remove' ? '#dc3545' : '#007bff'),
            cursor: error ? 'not-allowed' : 'pointer'
          }}
        >
            {action === 'add' ? 'Add Stock' : 'Remove Stock'}
        </button>
        <button type="button" className="form-button btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

export default AdjustQuantityForm;