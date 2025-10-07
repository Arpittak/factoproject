import React from 'react';
import './InventoryList.css';

function InventoryList({ items, onShowHistory, onAdjust, onDelete }) {
  if (!items || items.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📦</div>
        <h3>No inventory items found</h3>
        <p>Start by adding some inventory items to track your stone materials.</p>
      </div>
    );
  }

  const handleRowClick = (itemId, event) => {
    // Don't trigger row click if clicking on action buttons
    if (event.target.closest('.action-buttons') || event.target.closest('.action-btn')) {
      return;
    }
    onShowHistory(itemId);
  };

  return (
    <div className="inventory-table-container">
      {/* Mobile Card View */}
      <div className="mobile-view">
  {items.map((item) => (
    <div 
      key={item.id} 
      className="inventory-card clickable-card"
      onClick={(e) => handleRowClick(item.id, e)}
    >
      <div className="card-header">
        <div className="stone-info">
          <div className="stone-name-display">{item.stone_name}</div>
          <span className="stone-type">{item.stone_type}</span>
        </div>
        <div className="stage-badge">{item.stage}</div>
      </div>
      
      <div className="card-details">
        <div className="detail-row">
          <span className="detail-label">Dimensions:</span>
          <span className="detail-value">{item.length_mm} × {item.width_mm} × {item.thickness_mm || '-'} mm</span>
        </div>
        
        <div className="detail-row">
          <span className="detail-label">Calibrated:</span>
          <span className={`detail-value status-badge ${item.is_calibrated ? 'calibrated' : 'not-calibrated'}`}>
            {item.is_calibrated ? 'Yes' : 'No'}
          </span>
        </div>
        
        <div className="detail-row">
          <span className="detail-label">Edges/Finishing:</span>
          <span className="detail-value">{item.edges_type} / {item.finishing_type}</span>
        </div>
        
        <div className="detail-row">
          <span className="detail-label">Quantity:</span>
          <div className="quantity-info">
            <strong>{item.quantity_pieces || 0} Pieces</strong>
            <small>{parseFloat(item.quantity_sq_meter || 0).toFixed(2)} Sq Meter</small>
          </div>
        </div>
        
        <div className="detail-row">
          <span className="detail-label">Last Updated:</span>
          <span className="detail-value">
            {item.last_activity_date ? new Date(item.last_activity_date).toLocaleDateString() : '-'}
          </span>
        </div>
      </div>
      
      <div className="card-actions">
        <button className="action-btn add-btn" onClick={(e) => { e.stopPropagation(); onAdjust(item, 'add'); }} title="Add Stock">
          +
        </button>
        <button className="action-btn remove-btn" onClick={(e) => { e.stopPropagation(); onAdjust(item, 'remove'); }} title="Remove Stock">
          -
        </button>
        <button className="action-btn delete-btn" onClick={(e) => { e.stopPropagation(); onDelete(item); }} title="Delete Item">
          Delete
        </button>
      </div>
    </div>
  ))}
</div>

      {/* Desktop Table View */}
      <div className="desktop-view">
        <div className="table-responsive">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Stone Details</th>
                <th>L × W × T (mm)</th>
                <th>Calibrated</th>
                <th>Edges</th>
                <th>Finishing</th>
                <th>Stage</th>
                <th>Quantity</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr 
                  key={item.id} 
                  className="table-row clickable-row" 
                  onClick={(e) => handleRowClick(item.id, e)}
                >
                  <td className="stone-details">
                    <div className="stone-name-display">{item.stone_name}</div>
                    <div className="stone-type">{item.stone_type}</div>
                  </td>
                  <td className="dimensions">
                    {`${item.length_mm} × ${item.width_mm} × ${item.thickness_mm || '-'}`}
                  </td>
                  <td className="calibrated">
                    <span className={`status-badge ${item.is_calibrated ? 'calibrated' : 'not-calibrated'}`}>
                      {item.is_calibrated ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td>{item.edges_type}</td>
                  <td>{item.finishing_type}</td>
                  <td>
                    <span className="stage-badge">{item.stage}</span>
                  </td>
                  <td className="quantity">
                    <div className="quantity-primary">{item.quantity_pieces || 0} Pieces</div>
                    <div className="quantity-secondary">{parseFloat(item.quantity_sq_meter || 0).toFixed(2)} Sq Meter</div>
                  </td>
                  <td className="last-updated">
                    {item.last_activity_date ? new Date(item.last_activity_date).toLocaleDateString() : '-'}
                  </td>
                  <td className="actions">
                    <div className="action-buttons">
                      <button className="action-btn add-btn" onClick={(e) => { e.stopPropagation(); onAdjust(item, 'add'); }} title="Add Stock">+</button>
                      <button className="action-btn remove-btn" onClick={(e) => { e.stopPropagation(); onAdjust(item, 'remove'); }} title="Remove Stock">-</button>
                      <button className="action-btn delete-btn" onClick={(e) => { e.stopPropagation(); onDelete(item); }} title="Delete Item">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default InventoryList;