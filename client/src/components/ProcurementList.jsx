import React from 'react';
import './InventoryList.css'; // Reusing the same CSS file as InventoryList

function ProcurementList({ procurements,onShowDetails }) {
  if (!procurements || procurements.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📋</div>
        <h3>No procurement records found</h3>
        <p>Start by adding procurement records to track your material sourcing.</p>
      </div>
    );
  }

  const handleRowClick = (procurementId, event) => {
    console.log('Row clicked with ID:', procurementId);
    if (onShowDetails) {
      onShowDetails(procurementId);
    }
  };

  return (
    <div className="inventory-table-container">
      {/* Mobile Card View */}
      <div className="mobile-view">
        {procurements.map((proc) => (
          <div 
            key={proc.id} 
            className="inventory-card clickable-card"
            onClick={(e) => handleRowClick(proc.id, e)}
          >
            <div className="card-header">
              <div className="stone-info">
                <div className="stone-name-display">{proc.supplier_invoice}</div>
                <span className="stone-type">{proc.vendor_name}</span>
              </div>
              <div className="stage-badge">₹{parseFloat(proc.grand_total).toLocaleString('en-IN')}</div>
            </div>
            
            <div className="card-details">
              <div className="detail-row">
                <span className="detail-label">Date Received:</span>
                <span className="detail-value">{new Date(proc.invoice_date).toLocaleDateString()}</span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Vehicle Number:</span>
                <span className="detail-value">{proc.vehicle_number || '-'}</span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Total Items:</span>
                <span className="detail-value">{proc.total_items} items</span>
              </div>
              
              {proc.remarks && (
                <div className="detail-row">
                  <span className="detail-label">Remarks:</span>
                  <span className="detail-value">{proc.remarks}</span>
                </div>
              )}
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
                <th>Date Received</th>
                <th>Supplier Invoice</th>
                <th>Vendor</th>
                <th>Vehicle Number</th>
                <th>Total Amount</th>
                <th>Total Items</th>
              </tr>
            </thead>
            <tbody>
              {procurements.map((proc) => (
                <tr 
                  key={proc.id} 
                  className="table-row clickable-row" 
                  onClick={(e) => handleRowClick(proc.id, e)}
                >
                  <td className="stone-details">
                    <div className="stone-name-display">{new Date(proc.invoice_date).toLocaleDateString()}</div>
                  </td>
                  <td className="dimensions">
                    <div className="stone-name-display">{proc.supplier_invoice}</div>
                    {proc.remarks && <div className="stone-type">{proc.remarks}</div>}
                  </td>
                  <td className="calibrated">
                    <span className="stone-type">{proc.vendor_name}</span>
                  </td>
                  <td>{proc.vehicle_number || '-'}</td>
                  <td className="quantity">
                    <div className="quantity-primary">₹{parseFloat(proc.grand_total).toLocaleString('en-IN')}</div>
                  </td>
                  <td className="last-updated">
                    {proc.total_items} items
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

export default ProcurementList;