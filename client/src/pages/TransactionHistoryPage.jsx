import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TransactionFilters from '../components/TransactionFilters';
// --- Reusable styles for this page ---
import './TransactionHistoryPage.css';


function TransactionHistoryPage({ itemId, onBack }) {
  const [itemDetails, setItemDetails] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [currentFilters, setCurrentFilters] = useState({});

  // Function to format transaction type for display
  const formatTransactionType = (transactionType) => {
    const typeMap = {
      'procurement_initial_stock': 'Initial Stock',
      'procurement_quantity_added': 'Added Stock',
      'procurement_item_deleted': 'Deleted Item',
      'manual_add': 'Manual Add',
      'manual_remove': 'Manual Remove',
      'sale': 'Sale',
      'wastage': 'Wastage'
    };
    return typeMap[transactionType] || transactionType;
  };

  // Function to get transaction type badge color
  const getTransactionTypeBadge = (transactionType) => {
    const colorMap = {
      'procurement_initial_stock': '#007bff',
      'procurement_quantity_added': '#007bff', 
      'procurement_item_deleted': '#dc3545',
      'manual_add': '#28a745',
      'manual_remove': '#ffc107',
      'sale': '#6f42c1',
      'wastage': '#fd7e14'
    };
    
    const color = colorMap[transactionType] || '#6c757d';
    
    return (
      <span style={{
        padding: '2px 6px',
        borderRadius: '12px',
        fontSize: '10px',
        fontWeight: '500',
        color: 'white',
        backgroundColor: color,
        display: 'inline-block',
        marginBottom: '4px'
      }}>
        {formatTransactionType(transactionType)}
      </span>
    );
  };

  const handleFilterChange = (filters) => {
    setCurrentFilters(filters);
    let filtered = [...history];

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(tx => 
        (tx.reason && tx.reason.toLowerCase().includes(filters.search.toLowerCase())) ||
        (tx.source_details && tx.source_details.toLowerCase().includes(filters.search.toLowerCase())) ||
        tx.performed_by.toLowerCase().includes(filters.search.toLowerCase()) ||
        formatTransactionType(tx.transaction_type).toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Transaction type filter
    if (filters.transactionType) {
      filtered = filtered.filter(tx => 
        filters.transactionType === 'add' ? tx.change_in_pieces > 0 : tx.change_in_pieces < 0
      );
    }

    // User filter
    if (filters.user) {
      filtered = filtered.filter(tx => tx.performed_by === filters.user);
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      if (filters.sortBy === 'date') {
        comparison = new Date(a.created_at) - new Date(b.created_at);
      } else if (filters.sortBy === 'amount') {
        comparison = Math.abs(a.change_in_pieces) - Math.abs(b.change_in_pieces);
      }
      return filters.order === 'newest' ? -comparison : comparison;
    });

    setFilteredHistory(filtered);
  };

  useEffect(() => {
    const fetchHistory = async () => {
      if (!itemId) return;
      try {
        setLoading(true);
        // Using fetch instead of axios for artifact compatibility
        const response = await fetch(`/api/inventory/${itemId}/transactions`);
        const data = await response.json();
        setItemDetails(data.item);
        setHistory(data.history);
        setFilteredHistory(data.history);
      } catch (err) {
        setError('Failed to fetch transaction history.');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [itemId]);

  if (loading) return <p>Loading history...</p>;
  if (error) return <p>{error}</p>;
  if (!itemDetails) return <p>Item not found.</p>;

 return (
  <div>
    {/* Page Header - use className instead of inline style */}
    <div className="transaction-page-header">
      <div>
        <button className="btn-secondary back-button" onClick={onBack}>
          ← Back
        </button>
        <h2 style={{ display: 'inline-block', marginLeft: '20px' }}>
          Transaction History
        </h2>
        <p style={{ color: '#6b7280', margin: '0 0 0 22px' }}>
          {itemDetails.stone_type} - {itemDetails.stone_name}
        </p>
      </div>
    </div>

    {/* Item Details Box - use className */}
    <div className="transaction-details-box">
      <div className="transaction-detail-item">
        <strong>Dimensions</strong>
        <p>{`${itemDetails.length_mm} × ${itemDetails.width_mm} × ${itemDetails.thickness_mm || 'N/A'} mm`}</p>
      </div>
      <div className="transaction-detail-item">
        <strong>Stage</strong>
        <p>{itemDetails.stage}</p>
      </div>
      <div className="transaction-detail-item">
        <strong>Current Quantity</strong>
        <p>
          <strong>{history.length > 0 ? `${parseFloat(history[0].balance_after_sq_meter).toFixed(2)} Sq Meter` : '0.00 Sq Meter'}</strong><br/>
          <small>{history.length > 0 ? `${history[0].balance_after_pieces} Pieces` : '0 Pieces'}</small>
        </p>
      </div>
      <div className="transaction-detail-item">
        <strong>Total Transactions</strong>
        <p>{history.length}</p>
      </div>
    </div>

    <TransactionFilters onFilterChange={handleFilterChange} />

    {/* Desktop Table View */}
    <div className="transaction-table-container desktop-view">
      <table className="transaction-table">
        <thead>
          <tr>
            <th>Date & Time</th>
            <th>Quantity (in/out)</th>
            <th>Change (Pieces/Sq Meter)</th>
            <th>Balance After</th>
            <th>Reason</th>
            <th>Performed By</th>
          </tr>
        </thead>
        <tbody>
          {filteredHistory.map((tx) => (
            <tr key={tx.id}>
              <td>{new Date(tx.created_at).toLocaleString()}</td>
              <td>
                <span style={{ 
                  color: tx.change_in_pieces > 0 ? '#28a745' : '#dc3545', 
                  backgroundColor: tx.change_in_pieces > 0 ? '#e9f7eb' : '#fbe9eb',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontWeight: 'bold' 
                }}>
                  {tx.change_in_pieces > 0 ? `+${tx.change_in_pieces}` : tx.change_in_pieces} Pieces
                </span>
              </td>
              <td>
                <strong>{Math.abs(tx.change_in_pieces)} Pieces</strong><br/>
                <small>{parseFloat(Math.abs(tx.change_in_sq_meter)).toFixed(2)} Sq Meter</small>
              </td>
              <td>
                <strong>{tx.balance_after_pieces} Pieces</strong><br/>
                <small>{parseFloat(tx.balance_after_sq_meter).toFixed(2)} Sq Meter</small>
              </td>
              <td>
                <div style={{ fontSize: '13px' }}>
                  <div style={{ fontWeight: 'bold', color: '#333', marginBottom: '6px' }}>
                    {formatTransactionType(tx.transaction_type)}
                  </div>
                  {(tx.reason || tx.source_details) && (
                    <div style={{ fontSize: '11px', color: '#666', fontWeight: '500', marginBottom: '4px' }}>
                      System Comment
                    </div>
                  )}
                  {tx.reason && (
                    <div style={{ marginBottom: '2px', color: '#333' }}>
                      {tx.reason}
                    </div>
                  )}
                  {tx.source_details && (
                    <div style={{ color: '#666' }}>
                      {tx.source_details}
                    </div>
                  )}
                </div>
              </td>
              <td>{tx.performed_by}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Mobile Card View - NEW ADDITION */}
    <div className="transaction-cards-container mobile-view">
      {filteredHistory.map((tx) => (
        <div key={tx.id} className="transaction-card">
          <div className="transaction-card-header">
            <div className="transaction-card-date">
              {new Date(tx.created_at).toLocaleString()}
            </div>
            <span style={{ 
              color: tx.change_in_pieces > 0 ? '#28a745' : '#dc3545', 
              backgroundColor: tx.change_in_pieces > 0 ? '#e9f7eb' : '#fbe9eb',
              padding: '4px 8px',
              borderRadius: '4px',
              fontWeight: 'bold',
              fontSize: '12px'
            }}>
              {tx.change_in_pieces > 0 ? `+${tx.change_in_pieces}` : tx.change_in_pieces} Pieces
            </span>
          </div>
          <div className="transaction-card-details">
            <div className="transaction-detail-row">
              <span className="transaction-detail-label">Type:</span>
              <span className="transaction-detail-value">
                {formatTransactionType(tx.transaction_type)}
              </span>
            </div>
            <div className="transaction-detail-row">
              <span className="transaction-detail-label">Change:</span>
              <span className="transaction-detail-value">
                {Math.abs(tx.change_in_pieces)} Pieces / {parseFloat(Math.abs(tx.change_in_sq_meter)).toFixed(2)} Sq M
              </span>
            </div>
            <div className="transaction-detail-row">
              <span className="transaction-detail-label">Balance After:</span>
              <span className="transaction-detail-value">
                {tx.balance_after_pieces} Pieces / {parseFloat(tx.balance_after_sq_meter).toFixed(2)} Sq M
              </span>
            </div>
            {(tx.reason || tx.source_details) && (
              <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #eee' }}>
                <div style={{ fontSize: '11px', color: '#666', fontWeight: '500', marginBottom: '4px' }}>
                  System Comment
                </div>
                <div style={{ fontSize: '12px', color: '#333' }}>
                  {tx.reason || tx.source_details}
                </div>
              </div>
            )}
            <div className="transaction-detail-row" style={{ marginTop: '8px' }}>
              <span className="transaction-detail-label">Performed By:</span>
              <span className="transaction-detail-value">{tx.performed_by}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);
}
export default TransactionHistoryPage;